//app.js
// const ENV = 'dev-mv1xd';
const ENV = 'release-q0qg4';
// const ENV_TYPE = 'dev'
const ENV_TYPE = 'release'

App({
    onLaunch: function () {
        // 数据库初始化
        wx.cloud.init({
            env: ENV
        })
        const DB = wx.cloud.database({
            env: ENV
        })
        this.globalData.dataBase = DB
        // 版本迭代
        if (wx.canIUse('getUpdateManager')) {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate(function (res) {
                console.log('onCheckForUpdate====', res)
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    console.log('res.hasUpdate====')
                    updateManager.onUpdateReady(function () {
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好，是否重启应用？',
                            success: function (res) {
                                console.log('success====', res)
                                // res: {errMsg: "showModal: ok", cancel: false, confirm: true}
                                if (res.confirm) {
                                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    updateManager.applyUpdate()
                                }
                            }
                        })
                    })
                    updateManager.onUpdateFailed(function () {
                        // 新的版本下载失败
                        wx.showModal({
                            title: '已经有新版本了哟~',
                            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
                        })
                    })
                }
            })
        }

        var that = this
        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                var appid = 'wx907da2553d0d10af' //填写微信小程序appid
                var secret = '8aa9bc46f42d06cd35f8b6cdf0540733' //填写微信小程序secret
                var code = res.code
                var url = 'https://api.weixin.qq.com/sns/jscode2session' +
                    '?appid=' + appid +
                    '&secret=' + secret +
                    '& grant_type=authorization_code' +
                    '&js_code=' + code
                //调用request请求api转换登录凭证
                wx.cloud.callFunction({
                    // 云函数名称
                    name: 'getOpenId',
                    data: {
                        url: url
                    },
                    success: function (res) {
                        console.log(res)
                        // const result = ENV_TYPE === 'dev' ? JSON.parse(res.result) : res.result;
                        const result = JSON.parse(res.result);
                        console.log(result.openid)
                        that.globalData.openid = result.openid;
                    },
                    fail: console.error
                })
            }
        })
        // 用户引导设置
        wx.getStorage({
            key: 'showInstruction',
            success(res) {
                console.log(res)
            },
            fail(res) {
                wx.setStorageSync('showInstruction', true)
            }
        })
        // 搜索用户数据
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                console.log(res)
                that.globalData.userInfo = res.data;
            }
        })
    },

    globalData: {
        userInfo: null,
        openid: null,
        dataBase: null,
        gps: null,
        themeColour: "#FF6D78",
        outMargin: "10prx",
        titlePadding: "40rpx",
        inactiveGrey: "#c9c9c9",
        category: ['推荐', '家用电器', '电子数码', '图书课件', '美妆个护', '居家日用', '服饰珠宝', '母婴用品', '宠物用品', '二手车', '租房', '其他'],
        maxPriceLength: 7,
        tmplIds: [
            // 'lCGrw_TKDvUfH7hoTu0kfGUhlcSS7gSKU53JGDAGcjo',
            // 'sNjrgS4VpnOm28vMIucdym36NK0-xE96ZRlyrNMYg2c'
        ],
    },

    subscribe: function () {
        // TODO: message
        // wx.requestSubscribeMessage({
        //     tmplIds: this.globalData.tmplIds,
        //     success(res) {
        //         console.log(res)
        //     }
        // })
    }
})