// pages/post/post.js
import Toast from '../../UI/dist/toast/toast';
import Dialog from '../../UI/dist/dialog/dialog';
const app = getApp()
const db = app.globalData.dataBase
const util = require('../../utils/util.js')


Page({
    /**
     * Page initial data
     */
    data: {
        userInfo: app.globalData.userInfo,
        authorizeShow: false,
        images: [],
        newAddImage: [],
        imageUrls: [],
        themeColor: '',
        categories: [],
        categoryPopupShow: false,
        pricePopupShow: false,
        itemTitle: '',
        itemDescription: '',
        categoryValue: '',
        priceValue: '',
        priceOffer: '',
        priceOrigin: '',
        confirmButton: '发布',
        id: null,
        code: '',
        deleteCandidateImage: [],
        maxPriceLength: app.globalData.maxPriceLength,
        gps: null,
        security: 0,
        cWidth: 0,
        cHeight: 0,
    },

    /**
        })
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        if (Object.keys(options).length !== 0) {
            const item = JSON.parse(decodeURIComponent(options.item))
            console.log(item)
            this.setData({
                id: item._id,
                itemTitle: item.title,
                itemDescription: item.description,
                categoryValue: item.tag,
                priceValue: '$' + item.price_offer,
                priceOffer: item.price_offer,
                priceOrigin: item.price_origin,
                confirmButton: '修改',
                images: item.images,
                imageUrls: item.images,
            })
        }
        wx.setNavigationBarTitle({
            title: '发帖'
        })
        var cat = app.globalData.category
        this.setData({
            userInfo: app.globalData.userInfo,
            authorizeShow: !app.globalData.hasUserInfo,
            categories: cat.slice(1, ),
            themeColor: app.globalData.themeColour
        })
    },

    /**
     * Lifecycle function--Called when page is initially rendered
     */
    onReady: function () {
        const that = this;
        wx.getStorage({
            key: 'gps',
            success(res) {
                console.log(res)
                that.setData({
                    gps: res.data
                })
            },
            fail(res) {
                console.log(res)
            }
        })
    },

    /**
     * Lifecycle function--Called when page show
     */
    onShow: function () {
        const that = this;
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                console.log(res)
                that.setData({
                    userInfo: res.data
                })
            },
            fail(res) {
                Dialog.alert({
                    title: '授权',
                    selector: '#authorize',
                    message: '请先在用户中心授权登录后发帖'
                }).then(() => {
                    wx.navigateBack()
                });
            }
        })
    },

    /**
     * Lifecycle function--Called when page hide
     */
    onHide: function () {

    },

    /**
     * Lifecycle function--Called when page unload
     */
    onUnload: function () {
        var that = this
        if (this.data.confirmButton === '发布') {
            wx.cloud.deleteFile({
                fileList: that.data.images
            }).then(res => {
                // handle success
                console.log(res.fileList)
            }).catch(error => {
                console.error
            })
        } else if (this.data.confirmButton === '修改') {
            var newImages = this.data.newAddImage.map(i => i.img)
            wx.cloud.deleteFile({
                fileList: newImages
            }).then(res => {
                // handle success
                console.log(res.fileList)
            }).catch(error => {
                console.error
            })
        }
        let pages = getCurrentPages(); //页面栈
        console.log(pages)
        let beforePage = pages[pages.length - 2];
        if (beforePage.route == 'pages/item_page/item_page') {
            beforePage.onPullDownRefresh()
        }
    },

    /**
     * Page event handler function--Called when user drop down
     */
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
    },

    /**
     * Called when page reach bottom
     */
    onReachBottom: function () {

    },

    /**
     * Called when user click on the top right corner to share
     */
    onShareAppMessage: function () {

    },

    inputTitle: function (e) {
        this.setData({
            itemTitle: e.detail
        })
    },
    inputCode: function (e) {
        this.setData({
            code: e.detail
        })
    },
    inputDescription: function (e) {
        this.setData({
            itemDescription: e.detail
        })
    },
    chooseImage(e) {
        let that = this
        wx.chooseImage({
            count: 9 - that.data.images.length, // 限制最多只能留下9张照片
            sizeType: ['original', 'compressed'], //可选择原图或压缩后的图片
            sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
            success: res => {
                Toast.loading({
                    duration: 0,
                    forbidClick: true,
                    message: "图片检测中...",
                    selector: '#loading'
                })
                // 云端上传
                let lastIndex = res.tempFilePaths.length - 1
                console.log(lastIndex)
                for (var i = 0; i < res.tempFilePaths.length; i++) {
                    let index = i
                    let time = new Date().getTime()
                    let img = res.tempFilePaths[i]
                    wx.getImageInfo({
                        src: img,
                        success: res => {
                            console.log(res)
                            // 压缩图片
                            const imgType = res.type;
                            const ctx = wx.createCanvasContext('compress', that); //创建画布对象  
                            that.setData({
                                cWidth: Math.round(res.width * 0.5),
                                cHeight: Math.round(res.height * 0.5)
                            })
                            ctx.drawImage(img, 0, 0, Math.round(res.width * 0.5), Math.round(res.height * 0.5)); //添加图片
                            ctx.draw(false, setTimeout(__ => {
                                wx.canvasToTempFilePath({ //将canvas生成图片
                                    canvasId: 'compress',
                                    x: 0,
                                    y: 0,
                                    // width: res.width,
                                    // height: res.height,
                                    destWidth: Math.round(res.width * 0.5), //截取canvas的宽度
                                    destHeight: Math.round(res.height * 0.5),
                                    fileType: 'jpg',
                                    quality: 0.1,
                                    success: res => {
                                        wx.getFileSystemManager().readFile({
                                            filePath: res.tempFilePath, //这里做示例，所以就选取第一张图片
                                            success: buffer => {
                                                //这里是 云函数调用方法
                                                wx.cloud.callFunction({
                                                    name: 'SecurityCheck',
                                                    data: {
                                                        contentType: 'image/' + imgType,
                                                        value: buffer.data
                                                    },
                                                    success: function (res) {
                                                        console.log(res);
                                                        //   var imgPass = res.result.imageR.errCode || 0
                                                        //   var txtPass = res.result.msgR.errCode || 0
                                                        // 内容警告
                                                        if (res.result.errCode == 87014) {
                                                            Toast.clear()
                                                            Toast.fail({
                                                                message: '包含敏感信息',
                                                                duration: 1500,
                                                                selector: '#post-fail'
                                                            })
                                                            db.collection('dangerous_usr').add({
                                                                data: {
                                                                    userInfo: that.data.userInfo,
                                                                },
                                                                success: function (res) {
                                                                    console.log(res)
                                                                },
                                                                fail: function (res) {
                                                                    console.log(res);
                                                                }
                                                            })
                                                        } else {
                                                            Toast.clear()
                                                            if (that.data.confirmButton === '发布') {
                                                                Toast.loading({
                                                                    duration: 0,
                                                                    forbidClick: true,
                                                                    message: "正在上传...",
                                                                    selector: '#loading'
                                                                })
                                                                wx.cloud.uploadFile({
                                                                    cloudPath: util.wxuuid(),
                                                                    filePath: img, // 文件路径
                                                                    success: res => {
                                                                        // get resource ID
                                                                        console.log("云端上传成功:" + res.fileID)
                                                                        that.setData({
                                                                            images: that.data.images.concat([res.fileID]),
                                                                            imageUrls: that.data.imageUrls.concat([img])
                                                                        })
                                                                        if (index == lastIndex) {
                                                                            Toast.clear()
                                                                        }
                                                                    },
                                                                    fail: err => {
                                                                        // handle error
                                                                        console.log(err)
                                                                        Toast.clear()
                                                                        Toast.fail({
                                                                            message: '上传失败',
                                                                            duration: 1500,
                                                                            selector: '#post-fail'
                                                                        })
                                                                    }
                                                                })
                                                            } else if (that.data.confirmButton === '修改') {
                                                                var len = that.data.images.length;
                                                                wx.cloud.uploadFile({
                                                                    cloudPath: util.wxuuid(),
                                                                    filePath: img, // 文件路径
                                                                    success: res => {
                                                                        // get resource ID
                                                                        console.log("云端上传成功:" + res.fileID)
                                                                        that.setData({
                                                                            images: that.data.images.concat([res.fileID]),
                                                                            imageUrls: that.data.imageUrls.concat([img]),
                                                                            newAddImage: that.data.newAddImage.concat([{
                                                                                img: img,
                                                                                index: len
                                                                            }]),
                                                                        })
                                                                        if (index == lastIndex) {
                                                                            Toast.clear()
                                                                        }
                                                                    },
                                                                    fail: err => {
                                                                        // handle error
                                                                        console.log(err)
                                                                        Toast.clear()
                                                                        Toast.fail({
                                                                            message: '上传失败',
                                                                            duration: 1500,
                                                                            selector: '#post-fail'
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    },
                                                    fail: function (res) {
                                                        Toast.clear()
                                                        Toast.fail({
                                                            message: '包含敏感信息',
                                                            duration: 1500,
                                                            selector: '#post-fail'
                                                        })
                                                        console.log(res)
                                                    }
                                                })
                                            }
                                        })
                                    },
                                    fail: res => {
                                        console.log(res)
                                    }
                                }, that)
                            }, 300));
                        }
                    })
                }
            }
        })
    },

    onTapCancelImage: function (e) {
        const viewId = e.currentTarget.dataset.idx
        var that = this
        if (this.data.confirmButton === '发布') {
            Toast.loading({
                duration: 0,
                forbidClick: true,
                message: "正在删除",
                selector: '#loading'
            })
            wx.cloud.deleteFile({
                fileList: [that.data.images[viewId]],
                success: res => {
                    // handle success
                    console.log("成功从云端删除:" + viewId)
                    var images = that.data.images;
                    var imageUrls = that.data.imageUrls;
                    images.splice(viewId, 1)
                    imageUrls.splice(viewId, 1)
                    Toast.clear()
                    that.setData({
                        images: images,
                        imageUrls: imageUrls
                    })
                },
                fail: err => {
                    // handle error
                    console.log("云端删除失败:" + err)
                }
            })
        } else if (this.data.confirmButton === '修改') {
            that.setData({
                deleteCandidateImage: that.data.deleteCandidateImage.concat([that.data.images[viewId]]),
                // newAddImage: that.data.newAddImage.filter(i => {i.index !== viewId}),
            })
            var images = that.data.images;
            var imageUrls = that.data.imageUrls;
            images.splice(viewId, 1)
            imageUrls.splice(viewId, 1)
            that.setData({
                images: images,
                imageUrls: imageUrls
            })
        }

    },

    preview: function (e) {
        const index = e.target.dataset.idx
        console.log("预览图片：" + index)
        wx.previewImage({
            current: this.data.images[index],
            urls: this.data.images,
        })
    },

    clearPhoto: function () {
        var that = this
        if (this.data.confirmButton === '发布') {
            Toast.loading({
                duration: 0,
                forbidClick: true,
                message: "正在删除",
                selector: '#loading'
            })
            wx.cloud.deleteFile({
                fileList: that.data.images,
                success: res => {
                    // handle success
                    console.log("成功从云端删除:")
                    console.log(res)
                    Toast.clear()
                    that.setData({
                        images: [],
                        imageUrls: []
                    })
                },
                fail: err => {
                    // handle error
                    console.log("云端删除失败:" + err)
                }
            })
        } else if (this.data.confirmButton === '修改') {
            that.setData({
                deleteCandidateImage: that.data.images,
                images: [],
                imageUrls: []
            })
        }


    },

    showCategory: function () {
        this.setData({
            categoryPopupShow: true
        })
    },
    closeCategory: function () {
        this.setData({
            categoryPopupShow: false
        })
    },

    showLocation: function () {
        this.setData({
            locationPopupShow: true
        })
    },
    closeLocation: function () {
        this.setData({
            locationPopupShow: false
        })
    },
    onConfirmLocation: function (event) {
        var {
            picker,
            value,
            index
        } = event.detail;
        this.setData({
            locationValue: value,
            locationPopupShow: false
        })
    },
    onConfirmCategory: function (event) {
        var {
            picker,
            value,
            index
        } = event.detail;
        this.setData({
            categoryValue: value,
            categoryPopupShow: false
        })
    },
    showPrice: function () {
        this.setData({
            pricePopupShow: true
        })
    },
    closePrice: function () {
        this.setData({
            pricePopupShow: false
        })
    },
    confirmPrice: function (e) {
        this.setData({
            priceOffer: e.detail.offer,
            priceOrigin: e.detail.origin
        })
        this.setData({
            priceValue: '$' + e.detail.offer,
            pricePopupShow: false
        })
    },

    onPost: function () {
        // this.getValidImageUrls()
        var that = this;
        if (!this.data.itemTitle) {
            Toast.fail({
                message: '请填物品名称',
                duration: 1500,
                selector: '#title'
            })
        } else if (this.data.itemDescription == '') {
            Toast.fail({
                message: '没有写描述哦',
                duration: 1500,
                selector: '#price'
            })
        } else if (this.data.categoryValue == '') {
            Toast.fail({
                message: '你忘了分类哦',
                duration: 1500,
                selector: '#tag'
            })
        } else if (this.data.priceOffer == '') {
            Toast.fail({
                message: '你忘了开价哦',
                duration: 1500,
                selector: '#price'
            })
        } else if (this.data.images.length == 0) {
            Toast.fail({
                message: '忘了放照片哦',
                duration: 1500,
                selector: '#price'
            })
        } else {
            Toast.loading({
                duration: 0,
                forbidClick: true,
                message: "检测信息...",
                selector: '#loading'
            });
            wx.cloud.callFunction({
                name: 'SecurityCheck',
                data: {
                    txt: that.data.itemTitle + that.data.itemDescription,
                },
                success: function (res) {
                    console.log(res);
                    Toast.clear();
                    // 内容警告
                    if (res.result.errCode == 87014) {
                        Toast.fail({
                            message: '包含敏感信息',
                            duration: 1500,
                            selector: '#post-fail'
                        })
                        db.collection('dangerous_usr').add({
                            data: {
                                userInfo: that.data.userInfo,
                            },
                            success: function (res) {
                                console.log(res)
                            },
                            fail: function (res) {
                                console.error;
                            }
                        })
                    } else {
                        Toast.clear();
                        that.postOrModify()
                    }
                },
                fail: console.error
            })
        }
    },

    postOrModify: function () {
        if (this.data.confirmButton === '发布') {
            Toast.loading({
                duration: 0,
                forbidClick: true,
                message: "正在发布",
                selector: '#loading'
            });

            var that = this
            db.collection('items').add({
                data: {
                    userInfo: this.data.userInfo,
                    title: this.data.itemTitle,
                    description: this.data.itemDescription,
                    status: 'post',
                    tag: this.data.categoryValue,
                    price_offer: this.data.priceOffer,
                    price_origin: this.data.priceOrigin,
                    images: this.data.images,
                    date: new Date().getTime(),
                    num_seen: 0,
                    num_share: 0,
                    num_collected: 0,
                    gps: JSON.stringify(this.data.gps),
                    code: that.data.code === 'WENTIE_ZHIDING' ? that.data.code : '',
                },
                success: function (res) {
                    Toast.clear()
                    console.log("物品上传成功:" + res)
                    that.setData({
                        images: [],
                        imageUrls: [],
                        itemTitle: '',
                        itemDescription: '',
                        categoryValue: '',
                        priceValue: '',
                        priceOffer: '',
                        priceOrigin: '',
                    })
                    console.log("清除缓存")
                    Toast.success({
                        message: '发布成功',
                        duration: 1500,
                        selector: '#post-success'
                    })
                    wx.navigateBack()
                },
                fail: function (res) {
                    Toast.fail({
                        message: '似乎遇到了问题',
                        duration: 1500,
                        selector: '#post-fail'
                    })
                    console.log(res);
                }
            })
        } else if (this.data.confirmButton === '修改') {
            const that = this
            Toast.loading({
                duration: 0,
                forbidClick: true,
                message: "正在修改",
                selector: '#loading'
            })
            wx.cloud.deleteFile({
                fileList: that.data.deleteCandidateImage,
                success: res => {
                    // handle success
                    console.log("成功从云端删除:")
                    console.log(res)
                },
                fail: err => {
                    // handle error
                    console.log("云端删除失败:" + err)
                }
            })
            var data = {
                userInfo: that.data.userInfo,
                title: that.data.itemTitle,
                description: that.data.itemDescription,
                tag: that.data.categoryValue,
                price_offer: that.data.priceOffer,
                price_origin: that.data.priceOrigin,
                images: that.data.images,
                date: new Date().getTime(),
                gps: JSON.stringify(that.data.gps),
                code: that.data.code === 'WENTIE_ZHIDING' ? that.data.code : '',
            }
            var that = this
            wx.cloud.callFunction({
                // 云函数名称
                name: 'updateById',
                // 传给云函数的参数
                data: {
                    collection: 'items',
                    id: that.data.id,
                    data: data,
                },
                success: function (res) {
                    Toast.clear()
                    console.log("物品修改成功:" + res)
                    that.setData({
                        images: [],
                        imageUrls: [],
                        itemTitle: '',
                        itemDescription: '',
                        categoryValue: '',
                        priceValue: '',
                        priceOffer: '',
                        priceOrigin: '',
                    })
                    console.log("清除缓存")
                    Toast.success({
                        message: '修改成功',
                        duration: 1500,
                        selector: '#post-success'
                    })
                    wx.navigateBack()
                },
                fail: console.error
            })
        }
    },
})