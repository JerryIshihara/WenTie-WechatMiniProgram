// pages/user/user.js
import Toast from '../../UI/dist/toast/toast';
const app = getApp()
const db = app.globalData.dataBase;
const _ = db.command

Page({
    /**
     * Page initial data
     */
    data: {
        userInfo: null,
        authorizeShow: false,
        themeColor: app.globalData.themeColour,
        active: 0,
        // category: ['发帖', '卖出', '收藏', '买到'],
        category: ['发帖', '收藏', '卖出'],
        title: '发帖',
        loading: true,
        items: null,
        sumSold: '0.00',
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function () {
        console.log('用户页面onLoad: ')
        console.log(app.globalData.userInfo)
        wx.setNavigationBarTitle({ title: '我的' })
        // wx.setNavigationBarColor({
        //     frontColor: "#ffffff",
        //     backgroundColor: '#ff6d78'
        // })
        this.setData({
          userInfo: app.globalData.userInfo,
          gps: app.globalData.gps
        })
        db.collection('item_transaction').where({
          _openid: app.globalData.openid,
        }).get({
          success: function (res) {
            console.log(res);
            var item_list = []
            var sum = 0
            for (var i = 0; i < res.data.length; i++) {
              sum = sum + parseFloat(res.data[i].item.price_offer)
            }
            console.log(item_list);
            if (res.data.length > 0) {
              _this.setData({ sumSold: sum.toFixed(2) })
            }
          }
        })
        const _this = this;
        this.updateData(this.data.title)
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

    },

    /**
     * Page event handler function--Called when user drop down
     */
    onPullDownRefresh: function () {
      this.updateData(this.data.title);
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

    onChangeTab(e) {
      this.updateData(e.detail.title)
    },

    updateData: function(title) {
      this.setData({ loading: true, items: null, title: title, gps: app.globalData.gps})
      const _this = this;
      if (title == this.data.category[0]) {
        db.collection('items').where({
          _openid: app.globalData.openid,
          status: 'post',
        }).get({
          success: function (res) {
            _this.setData({ loading: false, items: res.data.reverse() })
          }
        })
      }
      if (title == this.data.category[2]) {
        // db.collection('item_transaction').where({
        //   'item._openid': app.globalData.openid,
        // }).get({
        //   success: function (res) {
        //     _this.setData({ loading: false, items: res.data.reverse() })
        //   }
        // })
        db.collection('items').where({
          status: 'sold',
          _openid: app.globalData.openid,
        }).get({
          success: function (res) {
            _this.setData({ loading: false, items: res.data.reverse() })
          }
        })
      }
      if (title == this.data.category[1]) {
        console.log('收藏');
        db.collection('collections').where({
          _openid: app.globalData.openid,
        }).get({
          success: function (res) {
            console.log(res);
            var that = _this
            if (res.data.length > 0) {
              var item_list = []
              for (var i = 0; i < res.data.length; i++) {
                item_list.push(res.data[i].item_id)
              }
              console.log(item_list);
              db.collection('items').where({
                _id: _.in(item_list),
              }).get({
                success: function (res) {
                  console.log(res);
                  that.setData({ items: res.data.reverse(), loading: false })
                }
              })
            } else {
                that.setData({ loading: false, items: res.data}) 
            }
          }
        })
      }
      // if ( title == this.data.category[3]) {
      //   console.log('摘到');
      //   db.collection('item_transaction').where({
      //     buyer_id: app.globalData.openid,
      //   }).get({
      //     success: function (res) {
      //       console.log(res);
      //       var item_list = []
      //       for (var i = 0; i < res.data.length; i++) {
      //         item_list.push(res.data[i].item)
      //       }
      //       console.log(item_list);
      //       if (res.data.length > 0) {
      //         _this.setData({ loading: false, items: item_list.reverse() })
      //       } else {
      //         _this.setData({ loading: false, items: null })
      //       }
      //     }
      //   })
      // }
    },

    navToItems: function(e) {
        if (!app.globalData.hasUserInfo) {
            Toast.fail({
                message: '请先登录',
                duration: 1000,
                selector: '#login'
            })
        } else {
            var viewId = e.target.id
            wx.navigateTo({
                url: '../items/items?title=' + viewId,
            })
        }
    },

    authorizeAgain: function() {
        this.setData({
            authorizeShow: true,
        })
    },

    bindSuccess: function() {
        this.setData({
          authorizeShow: false,
        })
        this.onLoad();
    },

    onCancel: function() {
        this.setData({
            authorizeShow: false,
        })
    },
})