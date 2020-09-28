// src/pages/top_code/top_code.js
const app = getApp()
const util = require('../../utils/util.js')
const db = app.globalData.dataBase;
const _ = db.command
import Toast from '../../UI/dist/toast/toast';

Page({

  /**
   * Page initial data
   */
  data: {
    num_code: 1,
    expire_length: 7,
    num_error: false,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      themeColor: app.globalData.themeColour
    })
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
    this.get_all_topcode()
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

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
    this.get_all_topcode();
  },

  num_code_change: function (event) {
    this.setData({
      num_code: event.detail
    })

    if(event.detail < 1 || event.detail > 10) {
      this.setData({
        num_error: true
      })
    }else{
      this.setData({
        num_error: false
      })
    }
  },

  expire_length_change: function (event) {
    this.setData({
      expire_length: event.detail
    })
  },

  onPost: function () {
    Toast.loading({
      duration: 0,
      forbidClick: true,
      message: "生成中...",
      selector: '#loading'
    })
    util.generate_topcode_wrapper(this.data.num_code, this.data.expire_length, this.onPost_callback);
  },

  onPost_callback: function (new_code_list) {
    this.get_all_topcode()
    Toast.clear()
    Toast.success({
      message: '生成成功',
      duration: 1500,
      selector: '#post-success'
    })
  },

  get_all_topcode: function () {
    var that = this;
    Toast.loading({
      forbidClick: true,
      loadingType: 'spinner',
      selector: '#updating'
    });
    
    db.collection('top_code').where({
      is_activated: false
    }).get({
      success: function (res) {
        that.setData({
          top_codes: res.data
        })
        Toast.clear();
        wx.stopPullDownRefresh();
      }
    })
  }
})