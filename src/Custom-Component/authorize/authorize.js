// Custom-Component/authorize/authorize.js
import Toast from '../../UI/dist/toast/toast';
const app = getApp()

Component({
  /**
   * Component properties
   */
  properties: {
    show: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * Component initial data
   */
  data: {

  },

  /**
   * Component methods
   */
  methods: {
    syncGlobal: function () {
      wx.showLoading({
        mask: true,
        title: '正在授权',
      })
      var that = this
      
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            wx.getUserInfo({
              success: function (res) {
                app.globalData.userInfo = res.userInfo,
                wx.setStorageSync('userInfo', res.userInfo);
                that.triggerEvent('success', {}, {})
                if (app.globalData.userInfo != null) {
                  console.log("成功同步'globalData'用户信息")
                  console.log(res.userInfo)
                  wx.hideLoading({
                    complete: (res) => {
                      wx.showToast({
                        title: '授权成功',
                      })
                    },
                  })
                }
              }
            })
          }
        }
      })
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          const GPS = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          app.globalData.gps = GPS
          wx.setStorageSync('gps', GPS);
          console.log(app.globalData.gps)
        }
      })
    },

    onCancel: function () {
      return null
    },
  }
})