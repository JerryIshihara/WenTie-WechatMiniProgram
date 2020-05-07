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
      showAuth: true,
  },

  /**
   * Component methods
   */
  methods: {
    subscribeMessage: function () {
      this.setData({ showAuth: false })
      wx.getSetting({
        withSubscriptions: true,
        success (res) {
          console.log(res.subscriptionsSetting)
          // res.subscriptionsSetting = {
          //   mainSwitch: true, // 订阅消息总开关
          //   itemSettings: {   // 每一项开关
          //     SYS_MSG_TYPE_INTERACTIVE: 'accept', // 小游戏系统订阅消息
          //     SYS_MSG_TYPE_RANK: 'accept'
          //     zun-LzcQyW-edafCVvzPkK4de2Rllr1fFpw2A_x0oXE: 'reject', // 普通一次性订阅消息
          //     ke_OZC_66gZxALLcsuI7ilCJSP2OJ2vWo2ooUPpkWrw: 'ban',
          //   }
          // }
        }
      })
      wx.showLoading({
        mask: true,
        title: '正在订阅',
      })
      wx.requestSubscribeMessage({
        tmplIds: app.globalData.tmplIds,
        success(res) {
          console.log(res)
          wx.hideLoading({
            complete: (res) => {
              wx.showToast({
                title: '订阅成功',
              })
            },
          })
        }
      })
    },

    onCancel: function () {
      return null
    },
  }
})