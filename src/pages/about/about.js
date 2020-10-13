// src/pages/about/about.js
Page({

  /**
   * Page initial data
   */
  data: {
    qr_images: ["../../img/about/qrcode_for_gh.jpg"]
  },

  preview: function (e) {
    const index = e.target.dataset.idx
    wx.previewImage({
      current: "../../img/about/qrcode_for_gh.jpg", //this.data.qr_images[0],
      urls: this.data.qr_images,
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

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

  }
})