//home.js
//获取应用实例
const app = getApp()
const db = app.globalData.dataBase

Page({
    data: {
        themeColour: app.globalData.themeColour,
        category: app.globalData.category,
        userInfo: null,
        searchShow: false,
        searchValue: null,
        loading: true,
        active: 0,
        tag: '问帖',
        
    },
    //事件处理函数
    bindViewTap: function() {
        // wx.navigateTo({
        //   url: '../home/home'
        // })
    },
    onShow: function() {
      this.onPullDownRefresh;
    },
    
    // 页面加载时触发
    onLoad: function() {
        const _this = this
        db.collection('items').where({
          status: 'post',
        }).get({
          success: function (res) {
            console.log(res)
            _this.setData({ loading: false, items: res.data.reverse() })
          }
        })
    },

    onReady: function() {
      this.setData({ userInfo: app.globalData.userInfo, gps: app.globalData.gps })
      db.collection('item_asked').where({
        'item._openid': app.globalData.openid,
      }).get({
        success: function (res) {
          console.log(res)
          if (res.data.length > 0) {
            wx.showTabBarRedDot({ index: 2 })
          } else {
            db.collection('item_asked').where({
              'item._openid': app.globalData.openid,
            }).get({
              success: function (res) {
                console.log(res)
                if (res.data.length > 0) {
                  wx.showTabBarRedDot({ index: 2 })
                } 
              }
            })
          }
        }
      })
      

    },

    onPullDownRefresh: function () {
        this.setData({ loading: true, items: null, gps: app.globalData.gps })
        const _this = this
        if (this.data.tag == '问帖') {
            this.onLoad();
        } else {
            db.collection('items').where({
              tag: _this.data.tag,
              status: 'post',
            }).get({
              success: function (res) {
                _this.setData({ loading: false, items: res.data.reverse() })
              }
            })
        }
        wx.stopPullDownRefresh();
    },

    // 使文本框进入可编辑状态
    search: function() {
        const searchValue = JSON.stringify(this.data.searchValue)
        wx.navigateTo({
          url: "../search_outcome/search_outcome?searchValue=" + encodeURIComponent(searchValue),
        })
    },

    showSearch: function() {
        this.setData({
            searchShow: true,
        })
    },

    closeSearch: function() {
        this.setData({
            searchShow: false,
            searchValue: null,
        })
    },

    onChangeSearch: function(e) {
      this.setData({
          searchValue: e.detail
      });
    },

    tab_change: function(e) {
        this.setData({ loading: true, items: null, tag: e.detail.title});
        const db = app.globalData.dataBase;
        const _this = this;
        if (e.detail.index == 0) {
            wx.setNavigationBarTitle({
              title: '问帖',
            })
            db.collection('items').where({
              status: 'post',
            }).get({
              success: function (res) {
                _this.setData({ loading: false, items: res.data.reverse(), tag: '问帖' })
              }
            })
        } else {
            wx.setNavigationBarTitle({
                title: e.detail.title,
            })
            
            db.collection('items').where({
                tag: e.detail.title,
                status: 'post',
            })
            .get({
              success: function (res) {
                _this.setData({ loading: false, items: res.data.reverse() })
              }
            })
        }
        console.log("首页-商品分类栏: " + e.detail.title)
    },
})

