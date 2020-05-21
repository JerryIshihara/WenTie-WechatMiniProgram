// pages/item_page/item_page.js
import Dialog from '../../UI/dist/dialog/dialog';
import Toast from '../../UI/dist/toast/toast';

const app = getApp()
const db = app.globalData.dataBase
const _ = db.command
const util = require('../../utils/util.js');

Page({

  /**
   * Page initial data
   */
  data: {
    item: null,
    themeColor: app.globalData.themeColour,
    userGps: app.globalData.gps,
    userInfo: null,
    collected: false,
    WXNumber: null,
    messageText: null,
    rememberWXNumber: false,
    confirmTransaction: false,
    showConfirmTransaction: false,
    warnConfirmTransaction: false,
    item_asked_list: [],
    isBuyer: null,
    status: null,
    showInstruction: false,
    noInstruction: false,
    step_index: 0,
    modified: false,
    steps: [{
        text: '问帖',
      },
      {
        text: '线下交易',
      },
      // {
      //   text: '摘帖',
      // },
      // {
      //   text: '卖家确认',
      // }
    ]
  },

  getAskRecord: function () {
    // 查询问贴记录
    const that = this
    db.collection('item_asked_record').where({
      item_id: this.data.item._id,
    }).get({
      success: function (res) {
        console.log(res)
        if (res.data.length == 0) {
          console.log('未问贴')
        } else {
          const userList = res.data.map(u => u.avatarUrl);
          console.log('已问贴');
          console.log(Array.from(new Set(userList)));
          that.setData({
            item_asked_list: Array.from(new Set(userList))
          })
        }
      }
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    const that = this
    wx.setNavigationBarTitle({
      title: '商品详细'
    })
    if (options.item) {
      this.setData({
        item: JSON.parse(decodeURIComponent(options.item)),
        userInfo: wx.getStorageSync('userInfo'),
        showInstruction: wx.getStorageSync('showInstruction'),
        modified: false,
        userGps: wx.getStorageSync('gps'),
      })
    } else {
      this.onPullDownRefresh();
    }

    const _this = this;
    console.log("item_id " + this.data.item._id);
    // 查询收藏记录
    db.collection('collections').where({
      _openid: app.globalData.openid,
      item_id: _this.data.item._id,
    }).get({
      success: function (res) {
        console.log(res)
        if (res.data.length == 0) {
          console.log('未收藏')
          _this.setData({
            collected: false
          })
        } else {
          console.log('已收藏')
          _this.setData({
            collected: true
          })
        }
      }
    })
    this.getAskRecord();
    this.setData({
      isBuyer: this.data.item._openid !== app.globalData.openid,
      status: this.data.item.status
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

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
    if (this.data.modified) {
      let pages = getCurrentPages(); //页面栈
      let beforePage = pages[pages.length - 2];
      wx.switchTab({
          url:'/'+ beforePage.route,
          success:function(){
              if(beforePage.route == 'pages/home/home'){
                  beforePage.onPullDownRefresh()
              }
          }
      })
    }
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    const _this = this
    db.collection('items').doc(this.data.item._id).get({
      success: function (res) {
        console.log(res)
        _this.setData({
          item: res.data,
          status: res.data.status,
          loading: false,
        })
      }
    })

    this.getAskRecord();
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
    return {
      title: this.data.item.title,
      path: 'pages/item_page/item_page?item=' + JSON.stringify(this.data.item),
      imageUrl: this.data.item.images[0],
      success: function (res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
        var shareTickets = res.shareTickets;
        if (shareTickets.length == 0) {
          return false;
        }
        //可以获取群组信息
        wx.getShareInfo({
          shareTicket: shareTickets[0],
          success: function (res) {
            console.log(res)
          }
        })
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  },


  preview: function (e) {
    const index = e.target.dataset.idx
    wx.previewImage({
      current: this.data.item.images[index],
      urls: this.data.item.images,
    })
  },
  // onTapBottomIcon: function (e) {
  //   var viewId = e.target.id
  //   console.log("商品页面-底部按钮:" + viewId)
  //   if (viewId == "赞") {
  //     this.setData({
  //       thumbUp: !this.data.thumbUp
  //     })
  //   }
  //   if (viewId == "留言") {
  //     this.setData({
  //       messageInputFocus: true,
  //     })
  //   }
  // },

  onTapCollect: function (e) {
    var viewId = e.target.id
    var that = this
    // 未收藏
    if (!this.data.collected) {
      this.setData({
        collected: true,
      })
      wx.showToast({
        image: '../../img/star-fill-yellow.png',
        title: '收藏成功',
      })
      db.collection('collections').add({
        data: {
          userInfo: app.globalData.userInfo,
          item_id: that.data.item._id,
        },
        success: function (res) {
          console.log(res)
          wx.cloud.callFunction({
            // 云函数名称
            name: 'updateCollect',
            // 传给云函数的参数
            data: {
              id: that.data.item._id,
              value: 1,
            },
            success: function (res) {
              console.log(res)
            },
            fail: console.error
          })
          console.log(res);
        },
        fail: function (res) {
          console.log(res);
        }
      })
      // 已收藏
    } else {
      this.setData({
        collected: false,
      })
      wx.showToast({
        title: '取消收藏',
        icon: 'none'
      })
      // 调取
      db.collection('collections').where({
        _openid: app.globalData.openid,
        item_id: that.data.item._id,
      }).get().then(res => {
        // 删除
        console.log(res.data[0])
        db.collection('collections').doc(res.data[0]._id)
          .remove({
            success: function (res) {
              wx.cloud.callFunction({
                // 云函数名称
                name: 'updateCollect',
                // 传给云函数的参数
                data: {
                  id: that.data.item._id,
                  value: -1,
                },
                success: function (res) {
                  console.log(res)
                },
                fail: console.error
              })
              console.log(res);
            },
            fail: function (res) {
              console.log(res);
            }
          })
      })
    }
  },

  askItem: function () {
    const that = this
    var record_id = null
    // 查询是否有微信号
    db.collection('stored_WXNumber').where({
      _openid: app.globalData.openid,
    }).get().then(res => {
      console.log(res)
      if (res.data.length > 0) {
        that.setData({
          WXNumber: res.data[0].WXNumber,
          rememberWXNumber: true
        })
        record_id = res.data[0]._id
      }
    })
    // 打开窗口
    Dialog.confirm({
        selector: '#ask-item',
        title: '问贴',
        asyncClose: true,
        closeOnClickOverlay: true
      })
      .then(() => {
        wx.showLoading({
          title: '发送问帖',
        })
        if (that.data.rememberWXNumber) {
          console.log('记住微信号 : ' + that.data.WXNumber)
          if (record_id != null) {
            db.collection('stored_WXNumber').doc(record_id).update({
              data: {
                userInfo: app.globalData.userInfo,
                WXNumber: that.data.WXNumber,
              },
              success: function (res) {
                console.log(res)
              }
            })
          } else {
            db.collection('stored_WXNumber').add({
              data: {
                userInfo: app.globalData.userInfo,
                WXNumber: that.data.WXNumber,
              },
              success: function (res) {
                console.log(res);
              },
              fail: function (res) {
                console.log(res);
              }
            })
          }
        }
        // 记录问贴
        db.collection('item_asked').add({
          data: {
            item: this.data.item,
            userInfo: app.globalData.userInfo,
            WXNumber: this.data.WXNumber,
            message: this.data.messageText,
            gps: app.globalData.gps,
          },
          success: function (res) {
            console.log(res)
            console.log('发送消息')
            that.notifyMessage('问帖')
            wx.hideLoading({
              complete: (res) => {
                wx.showToast({
                  title: '问帖成功',
                })
                that.onPullDownRefresh();
              },
            })
          },
          fail: function (res) {
            console.log(res)
          }
        })
        Dialog.close();
        that.setData({
          WXNumber: null,
          rememberWXNumber: false
        })
        // 用于显示留言记录
        db.collection('item_asked_record').add({
          data: {
            item_id: this.data.item._id,
            avatarUrl: app.globalData.userInfo.avatarUrl,
          },
          success: function (res) {
            console.log(res)
          },
          fail: function (res) {
            console.log(res)
          }
        })
      })
      .catch(() => {
        Dialog.close();
        that.setData({
          WXNumber: null,
          rememberWXNumber: false
        })
      });
  },

  editItem: function () {
    this.setData({ modified: true })
    const item = JSON.stringify(this.data.item)
    wx.navigateTo({
      url: "../post/post?item=" + encodeURIComponent(item),
    })
  },

  getItem: function () {
    const that = this
    this.setData({
      confirmTransaction: false
    })
    // 打开窗口
    Dialog.confirm({
        selector: '#get-item',
        title: "交易确认",
        asyncClose: true,
        closeOnClickOverlay: true,
        showConfirmButton: false
      })
      .then(() => {
        Dialog.close();
      })
      .catch(() => {
        Dialog.close();
      });
    app.subscribe();
  },


  deleteItem: function () {
    const that = this
    Dialog.confirm({
        selector: '#delete-item',
        title: "删帖",
        message: '确认删除后将无法撤销',
        asyncClose: true,
        closeOnClickOverlay: true,
        showConfirmButton: true,
        confirmButtonText: '确认删除',
      })
      .then(() => {
        wx.cloud.callFunction({
          // 云函数名称
          name: 'deleteItem',
          // 传给云函数的参数
          data: {
            item: that.data.item,
          },
          success: function (res) {
            console.log(res)
            that.setData({ modified: true })
            Dialog.close({
              selector: '#delete-item'
            })
            Toast({
              duration: 1500,
              selector: "#delete-item-toast",
              type: 'success',
              message: '删除成功',
              onClose: () => {
                console.log('返回')
                wx.navigateBack()
              }
            });
          },
          fail: console.error
        })
      })
      .catch(() => {
        Dialog.close();
      });
  },

  onChangeRememberWXNUmber: function () {
    this.setData({
      rememberWXNumber: !this.data.rememberWXNumber
    })
    console.log("记住微信号：" + this.data.rememberWXNumber)
  },

  onChangeConfirmTransaction: function () {
    const that = this
    this.setData({
      confirmTransaction: !this.data.confirmTransaction
    })
    if (this.data.confirmTransaction) {
      this.setData({
        warnConfirmTransaction: false
      })
      console.log("确认交易")
      Dialog.confirm({
          selector: '#get-item',
          title: "交易确认",
          asyncClose: true,
          closeOnClickOverlay: true,
          showConfirmButton: true
        })
        .then(() => {
          wx.showLoading({
            title: '正在发送',
          })
          if (this.data.confirmTransaction) {
            wx.cloud.callFunction({
              // 云函数名称
              name: 'deleteDuplicateRequest',
              // 传给云函数的参数
              data: {
                openid: app.globalData.openid,
                item: that.data.item,
              },
              success: function (res) {
                console.log(res)
                // 记录摘贴
                db.collection('item_request').add({
                  data: {
                    userInfo: app.globalData.userInfo,
                    item: that.data.item,
                  },
                  success: function (res) {
                    console.log(res)
                    that.notifyMessage('摘帖')
                    wx.hideLoading({
                      complete: (res) => {
                        wx.showToast({
                          title: '发送成功',
                        })
                      },
                    })
                  },
                  fail: function (res) {
                    console.log(res)
                  }
                })
                Dialog.close();
              },
              fail: console.error
            })
          } else {
            that.setData({
              warnConfirmTransaction: true
            })
            Dialog.stopLoading({
              selector: '#get-item'
            });
            Dialog.resetDefaultOptions({
              selector: '#get-item'
            });
          }
        })
        .catch(() => {
          Dialog.close();
          that.setData({
            warnConfirmTransaction: false,
            confirmTransaction: false
          })
        });
    } else {
      Dialog.confirm({
          selector: '#get-item',
          title: "交易确认",
          asyncClose: true,
          closeOnClickOverlay: true,
          showConfirmButton: false
        })
        .then(() => {
          Dialog.close();
        })
        .catch(() => {
          Dialog.close();
        });
    }
  },

  onChangeWXNumberInput: function (e) {
    this.setData({
      WXNumber: e.detail
    })
  },

  notifyMessage: function (type) {
    const that = this
    wx.cloud.callFunction({
      // 云函数名称
      name: 'notifyNewMessage',
      // 传给云函数的参数
      data: {
        templateId: app.globalData.tmplIds[0],
        openid: that.data.item._openid,
        nickName: app.globalData.userInfo.nickName,
        time: util.formatTime(new Date()),
        title: that.data.item.title,
        type: type,
      },
      success: function (res) {
        console.log(res)
      },
      fail: console.error
    })
  },

  onClickHideInstruction: function () {
    this.setData({
      showInstruction: false
    })
    this.setData({
      step_index: 0
    })
  },

  onClickNoInstruction: function () {
    this.setData({
      noInstruction: !this.data.noInstruction
    });
    wx.setStorageSync('showInstruction', !this.data.noInstruction);
  },

  nextStep: function () {
    if (this.data.step_index == 1) {
      this.onClickHideInstruction();
    } else {
      this.setData({
        step_index: this.data.step_index + 1
      })
    }
  },

  onChangeMessageInput: function (e) {
    this.setData({
      messageText: e.detail
    })
  },

  completeTransaction: function (e) {
    wx.showLoading({
      title: '加载中',
    })
    const that = this
    // 将状态改为 售出
    db.collection('items').doc(this.data.item._id).update({
      data: {
        status: 'sold'
      },
      success: function (res) {
        console.log(res)
      }
    })
    // 增加交易记录
    var sold_item = this.data.item
    sold_item.status = 'sold'
    this.setData({ item: sold_item, status: 'sold' })
    // db.collection('item_transaction').add({
    //   data: {
    //     userInfo: e.currentTarget.dataset.item.userInfo,
    //     buyer_id: e.currentTarget.dataset.item._openid,
    //     item: sold_item,
    //   },
    //   success: function (res) {
        
    //     console.log(res)
    //   }
    // })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'deleteReqAndAsk',
      // 传给云函数的参数
      data: {
        item: that.data.item,
      },
      success: function (res) {
        console.log(res)
        wx.showToast({
          image: '../../img/trust-fill.png',
          title: '已卖出',
        })
        that.onPullDownRefresh;
      },
      fail: console.error
    })
  },

  onTapComplete: function() {
    const that = this
    Dialog.confirm({
      title: '已卖出',
      message: '确认卖出后将无法撤销',
      selector: '#complete-transaction'
    })
      .then(() => {
        that.completeTransaction()
        that.setData({ modified: true })
      })
      .catch(() => {
        // on cancel
      });
  }
})