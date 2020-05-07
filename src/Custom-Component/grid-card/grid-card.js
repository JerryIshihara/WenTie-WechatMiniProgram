// Custom-Component/grid-card/grid-card.js
const app = getApp()
const db = app.globalData.dataBase
const _ = db.command
const util = require('../../utils/util.js')


Component({
  /**
   * Component properties
   */
  properties: {
    items: {
      type: Array,
      value: []
    },
    bindPullDown: {
      type: Function,
      value: null,
    },
    type: {
      type: String,
      value: '',
    },
    userGps: {
      type: Object,
      value: null,
    }
  },

  /**
   * Component initial data
   */
  data: {
    themeColour: app.globalData.themeColour,
  },

  /**
   * Component methods
   */
  methods: {
    onTap(e) {
      const db = app.globalData.dataBase
      const _ = db.command
      console.log(this.data.gps)
      wx.cloud.callFunction({
        // 云函数名称
        name: 'incNumSeen',
        // 传给云函数的参数
        data: {
          id: e.currentTarget.dataset.item._id,
        },
        success: function (res) {
          console.log(res)
        },
        fail: console.error
      })
      const item = JSON.stringify(e.currentTarget.dataset.item)
      wx.navigateTo({
        url: "../item_page/item_page?item=" + encodeURIComponent(item),
      })
      app.subscribe()
    },

    removeCollect: function (e) {
      console.log(e)
      const that = this
      db.collection('collections').where({
        item_id: e.currentTarget.dataset.item._id,
      }).get({
        success: function (res) {
          console.log(res);
          // 删除收藏
          wx.cloud.callFunction({
            // 云函数名称
            name: 'deleteById',
            // 传给云函数的参数
            data: {
              collection: 'collections',
              id: res.data[0]._id,
            },
            success: function (res) {
              console.log(res)
            },
            fail: console.error
          })
          // 
          wx.cloud.callFunction({
            // 云函数名称
            name: 'updateCollect',
            // 传给云函数的参数
            data: {
              id: e.currentTarget.dataset.item._id,
              value: -1,
            },
            success: function (res) {
              console.log(res)
              that.triggerEvent('removeCollect', {}, {})
            },
            fail: console.error
          })
        }
      })

    },

    onPulling: function () {
      console.log("refresh")
    }
  }
})