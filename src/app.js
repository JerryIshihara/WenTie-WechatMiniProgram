//app.js
App({
    onLaunch: function () {
        wx.cloud.init({ env: 'dev-mv1xd' })
        const DB = wx.cloud.database({ env: 'dev-mv1xd' })
        this.globalData.dataBase = DB
        var that = this
        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                var appid = 'wx94fcd5d0f94febc6' //填写微信小程序appid
                var secret = '6e379650ff0b19689a67600e1d4fed27' //填写微信小程序secret
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
                    data: { url: url },
                    success: function (res) {
                        const result = JSON.parse(res.result)
                        console.log(result.openid)
                        that.globalData.openid = result.openid;
                    },
                    fail: console.error
                })
                // wx.request({
                //     url: url,
                //     // url: "https://6465-dev-mv1xd-1300090476.tcb.qcloud.la",
                //     header: {
                //         'content-type': 'application/json;'
                //     },
                //     method:'POST',
                //     data: {
                //       code: code,
                //     },
                //     success: function (res) {
                //         console.log(res) //获取openid
                //         that.globalData.openid = res.data.openid
                //     },
                //     fail: function (res) {
                //         console.log(res)
                //     }
                // })
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
    },

    globalData: {
        userInfo: null,
        openid: null,
        dataBase: null,
        gps: null,
        // themeColour: "#FF6D78",
        themeColour: '#FFC773',
        outMargin: "10prx",
        titlePadding: "40rpx",
        inactiveGrey: "#c9c9c9",
        category: ['推荐', '电器', '数码', '图书课件', '美妆个护', '居家日用', '服装鞋帽', '珠宝配饰', '二手车', '其他'],
        tmplIds: [
            'lCGrw_TKDvUfH7hoTu0kfGUhlcSS7gSKU53JGDAGcjo',
            'sNjrgS4VpnOm28vMIucdym36NK0-xE96ZRlyrNMYg2c'
        ],
    },

    subscribe: function () {
        wx.requestSubscribeMessage({
            tmplIds: this.globalData.tmplIds,
            success(res) {
                console.log(res)
            }
        })
    }
})