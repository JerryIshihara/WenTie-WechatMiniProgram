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
      // TODO: message
      // this.setData({ showAuth: false })
      // wx.getSetting({
      //   withSubscriptions: true,
      //   success (res) {
      //     console.log(res.subscriptionsSetting)
      //   }
      // })
      // wx.showLoading({
      //   mask: true,
      //   title: '正在订阅',
      // })
      // wx.requestSubscribeMessage({
      //   tmplIds: app.globalData.tmplIds,
      //   success(res) {
      //     console.log(res)
      //     wx.hideLoading({
      //       complete: (res) => {
      //         wx.showToast({
      //           title: '订阅成功',
      //         })
      //       },
      //     })
      //   }
      // })
    },

    onCancel: function () {
      return null
    },
  }
})