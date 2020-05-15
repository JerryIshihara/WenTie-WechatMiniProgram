//app.js
// const ENV = 'dev-mv1xd';
const ENV = 'release-x8nh1';
// const ENV_TYPE = 'dev'
const ENV_TYPE = 'release'

App({
    onLaunch: function () {
        wx.cloud.init({ env: ENV })
        const DB = wx.cloud.database({ env: ENV })
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