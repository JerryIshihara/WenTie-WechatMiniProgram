// pages/search_outcome/search_outcome.js
const app = getApp()
const db = app.globalData.dataBase
const _ = db.command

Page({
  /**
   * Page initial data
   */
  data: {
    priceShow: false,
    areaShow: false,
    timeShow: false,
    allShow: false,
    priceColumn: ["默认", "从高到低", "从低到高"],
    areaColumn: ["全部", "Downtown", "Mississauga", "Scarborough", "Hamilton", "North York"],
    timeColumn: ["默认", "最新发布", "最早发布"],
    allColumn: ["默认", "默认1", "默认2"],
    searchValue: null,
    items: null,
    loading: true,
    gps: app.globalData.gps
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '搜索',
    })
    this.setData({
      searchValue: JSON.parse(decodeURIComponent(options.searchValue)),
      gps: app.globalData.gps
    })
    console.log(this.data.searchValue)
    this.search(this.data.searchValue)
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
    this.onSearch(this.data.searchValue);
    wx.stopPullDownRefresh()
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


  onChangeSearch: function (e) {
    this.setData({
      searchValue: e.detail
    });
  },

  closeSearch: function () {
    this.setData({
      searchValue: null
    })
  },

  onSearch: function () {
    this.search(this.data.searchValue);
  },

  // onTapFilter: function(e) {
  //     var viewId = e.target.id
  //     if (viewId == "价格") {
  //         this.setData({
  //             priceShow: !this.data.priceShow,
  //             areaShow: false,
  //             timeShow: false,
  //             allShow: false,
  //         })
  //     }
  //     if (viewId == "地区") {
  //         this.setData({
  //             priceShow: false,
  //             areaShow: !this.data.areaShow,
  //             timeShow: false,
  //             allShow: false,
  //         })
  //     }
  //     if (viewId == "发布时间") {
  //         this.setData({
  //             priceShow: false,
  //             areaShow: false,
  //             timeShow: !this.data.timeShow,
  //             allShow: false,
  //         })
  //     }
  //     if (viewId == "综合") {
  //         this.setData({
  //             priceShow: false,
  //             areaShow: false,
  //             timeShow: false,
  //             allShow: !this.data.allShow,
  //         })
  //     }
  // },
  // close: function() {
  //     this.setData({
  //         priceShow: false,
  //         areaShow: false,
  //         timeShow: false,
  //         allShow: false,
  //     })
  // },
  // noMove: function() {
  // }
  search: function (keyWord) {
    const _this = this
    this.setData({
      loading: true,
      items: null,
      gps: app.globalData.gps,
    })
    keyWord = keyWord === null ? '' : keyWord
    db.collection('items').where({
      title: db.RegExp({
        regexp: keyWord,
        options: 'i',
      }),
      status: 'post',
    }).get({
      success: function (res) {
        console.log(res)
        _this.setData({
          items: res.data,
          loading: false
        })
      }
    })
  }
})