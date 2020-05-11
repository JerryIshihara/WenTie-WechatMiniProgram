// Custom-Component/message/index.js
import Dialog from '../../UI/dist/dialog/dialog';

const app = getApp()
const db = app.globalData.dataBase
const _ = db.command

Component({
  /**
   * Component properties
   */
  properties: {
    messageList: {
      type: Array,
      value: []
    },
    type: {
      type: String,
      value: null
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

  },

  /**
   * Component methods
   */
  methods: {
    onTapItem: function (e) {
      db.collection('items').doc(e.currentTarget.dataset.item.item._id).get({
        success: function (res) {
          console.log(res)
          const item = JSON.stringify(res.data)
          wx.navigateTo({
            url: "../item_page/item_page?item=" + encodeURIComponent(item),
          })
        }
      })
      app.subscribe()
    },

    onAcceptTransaction: function (e) {
      var name = e.currentTarget.dataset.item.userInfo.nickName;
      var message = "确认已和 [" + name + "] 达成交易？"
      console.log(message)
      Dialog.confirm({
          selector: '#accept-item',
          title: "摘帖",
          message: message,
          asyncClose: true,
          closeOnClickOverlay: true,
        })
        .then(() => {
          this.acceptTransactionRequest(e)
          Dialog.close()
        })
        .catch(() => {
          Dialog.close();
        });
      app.subscribe()
    },

    acceptTransactionRequest: function (e) {
      const that = this
      console.log(e.currentTarget.dataset.item)
      // 将状态改为 售出
      db.collection('items').doc(e.currentTarget.dataset.item.item._id).update({
        data: {
          status: 'sold'
        },
        success: function (res) {
          console.log(res)
        }
      })
      // 增加交易记录
      var sold_item = e.currentTarget.dataset.item.item;
      sold_item.status = 'sold'
      db.collection('item_transaction').add({
        data: {
          userInfo: e.currentTarget.dataset.item.userInfo,
          buyer_id: e.currentTarget.dataset.item._openid,
          item: sold_item,
        },
        success: function (res) {
          wx.showToast({
            image: '../../img/trust-fill.png',
            title: '交帖成功',
          })
          console.log(res)
        }
      })
      wx.cloud.callFunction({
        // 云函数名称
        name: 'deleteReqAndAsk',
        // 传给云函数的参数
        data: {
          item: e.currentTarget.dataset.item.item,
        },
        success: function (res) {
          console.log(res)
          that.triggerEvent('update', {}, {})
          const {item = ''} = {item: e.currentTarget.dataset.item}
          that.triggerEvent("complete", {item});
        },
        fail: console.error
      })
      // wx.cloud.callFunction({
      //   // 云函数名称
      //   name: 'deleteById',
      //   // 传给云函数的参数
      //   data: {
      //     collection: 'item_request',
      //     id: e.currentTarget.dataset.item._id,
      //   },
      //   success: function (res) {
      //     console.log(res)
      //     that.triggerEvent('update', {}, {})
      //     const {item = ''} = {item: e.currentTarget.dataset.item}
      //     that.triggerEvent("complete", {item});
      //   },
      //   fail: console.error
      // })
      app.subscribe()
    },

    copyWXNumber: function (e) {
      console.log(e.currentTarget.dataset.item)
      // 复制到剪贴板
      wx.setClipboardData({
        data: e.currentTarget.dataset.item.WXNumber,
        success(res) {
          wx.getClipboardData({
            success(res) {
              console.log(res.data) // data
            }
          })
        }
      })
      app.subscribe()
      console.log(this.properties.userGps)
      console.log(e.currentTarget.dataset.item.gps)
    },

    deleteMessage: function (e) {
      const collection = this.properties.type == 'ask' ? 'item_asked' : 'item_request'
      const that = this
      console.log(e.currentTarget.dataset.item)
      wx.cloud.callFunction({
        // 云函数名称
        name: 'deleteById',
        // 传给云函数的参数
        data: {
          collection: collection,
          id: e.currentTarget.dataset.item._id,
        },
        success: function (res) {
          console.log(res)
          that.triggerEvent('update', {}, {})
        },
        fail: console.error
      })
      app.subscribe()
    },
  }
})