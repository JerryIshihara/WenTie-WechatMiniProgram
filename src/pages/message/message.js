// pages/message/message.js
const app = getApp()
const db = app.globalData.dataBase
const _ = db.command
const util = require('../../utils/util.js')


Page({

    /**
     * Page initial data
     */
    data: {
        active: 0,
        items: null,
        loading: true,
        title: ['问帖', '交易确认'],
        type: ['ask', 'give'],
        themeColor: app.globalData.themeColour,
        gps: null,
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        const _this = this
        db.collection('item_asked').where({
          item: {
            _openid: app.globalData.openid
          }
        })
        .get({
          success: function (res) {
            console.log(res)
            _this.setData({ loading: false, items: res.data.reverse() })
          }
        })
    },

    /**
     * Lifecycle function--Called when page is initially rendered
     */
    onReady: function () {
      this.setData({ gps: app.globalData.gps })
    },

    /**
     * Lifecycle function--Called when page show
     */
    onShow: function () {
        wx.setNavigationBarTitle({ title: '消息' })
        // 未读消息提示
        wx.hideTabBarRedDot({
            index: 2,
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

    },

    /**
     * Page event handler function--Called when user drop down
     */
    onPullDownRefresh: function () {
        this.updateData(this.data.active);
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

    onChangeTab: function(e) {
        this.setData({ active: e.detail.index,  })
        this.updateData(e.detail.index);
    },

    updateData: function(index) {
      this.setData({ loading: true, items: null, active: index })
      if (index == 0) {
        this.onLoad()
      } else {
        const _this = this
        db.collection('item_request').where({
          'item._openid': app.globalData.openid,
        }).get({
          success: function (res) {
            console.log(res)
            _this.setData({ loading: false, items: res.data.reverse() })
          }
        })
      }
    },

    bindUpdate: function() {
        this.updateData(this.data.active);
    },

    notifyComplete: function (e) {
      console.log('交易完成消息')
      wx.cloud.callFunction({
        // 云函数名称
        name: 'notifyTransactionComplete',
        // 传给云函数的参数
        data: {
          openid: e.detail.item._openid,
          time: util.formatTime(new Date()),
          title: e.detail.item.item.title,
        },
        success: function (res) {
          console.log(res)
        },
        fail: console.error
      })
    }

})