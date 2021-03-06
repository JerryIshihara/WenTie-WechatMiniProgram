//home.js
//获取应用实例
const app = getApp()
const db = app.globalData.dataBase
const top = 'WENTIE_ZHIDING'

Page({
  data: {
    themeColour: app.globalData.themeColour,
    category: app.globalData.category,
    userInfo: null,
    gps: null,
    searchShow: false,
    searchValue: null,
    loading: true,
    active: 0,
    showAuth: false,
    tag: '问帖',

  },
  //事件处理函数
  bindViewTap: function () {
    // wx.navigateTo({
    //   url: '../home/home'
    // })
  },
  onShow: function () {
    this.onPullDownRefresh;
  },

  // 页面加载时触发
  onLoad: function () {
    this.loadItems()

  },

  loadItems: function (type) {
    const _this = this
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getItems',
      data: {
        type: type,
        request_from: "home"
      },
      success: function (res) {
        _this.setData({
          items: res.result.data,
          loading: false
        });
      },
      fail: function () {
        _this.setData({
          items: [],
          loading: false
        });
        console.error
      }
    })
  },

  onReady: function () {
    const that = this
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        console.log(res)
        that.setData({
          userInfo: res.data
        })
      },
      fail(res) {
        that.setData({
          showAuth: true
        })
      }
    })
    wx.getStorage({
      key: 'gps',
      success(res) {
        console.log(res)
        that.setData({
          gps: res.data
        })
      },
      fail(res) {
        that.setData({
          showAuth: true
        })
      }
    })
    db.collection('item_asked').where({
      'item._openid': app.globalData.openid,
    }).get({
      success: function (res) {
        console.log(res)
        if (res.data.length > 0) {
          wx.showTabBarRedDot({
            index: 2
          })
        } else {
          db.collection('item_asked').where({
            'item._openid': app.globalData.openid,
          }).get({
            success: function (res) {
              console.log(res)
              if (res.data.length > 0) {
                wx.showTabBarRedDot({
                  index: 2
                })
              }
            }
          })
        }
      }
    })


  },

  onPullDownRefresh: function () {
    this.setData({
      loading: true,
      items: null
    })
    const _this = this
    if (this.data.tag == '问帖') {
      this.onLoad();
    } else {
      this.loadItems(this.data.tag);
    }
    wx.stopPullDownRefresh();
  },

  // 使文本框进入可编辑状态
  search: function () {
    const searchValue = JSON.stringify(this.data.searchValue)
    wx.navigateTo({
      url: "../search_outcome/search_outcome?searchValue=" + encodeURIComponent(searchValue),
    })
  },

  showSearch: function () {
    this.setData({
      searchShow: true,
    })
  },

  closeSearch: function () {
    this.setData({
      searchShow: false,
      searchValue: null,
    })
  },

  onChangeSearch: function (e) {
    this.setData({
      searchValue: e.detail
    });
  },

  tab_change: function (e) {
    this.setData({
      loading: true,
      items: null,
      tag: e.detail.title
    });
    const _this = this;
    if (e.detail.index == 0) {
      wx.setNavigationBarTitle({
        title: '问帖',
      })
      this.loadItems()
    } else {
      wx.setNavigationBarTitle({
        title: e.detail.title,
      })
      this.loadItems(e.detail.title)
    }
    console.log("首页-商品分类栏: " + e.detail.title)
  },
})