// pages/post_blank/post_blank.js

const app = getApp()

Page({

    /**
     * Page initial data
     */
    data: {
        showCounter: false,
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function () {
        wx.setNavigationBarTitle({
            title: '发帖',
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
        // 如果不显示授权，则已授权，可跳转
        this.setData({ 'showCounter': !this.data.showCounter })
        if (this.data.showCounter) {
            wx.navigateTo({
                url: "../post/post",
            })
        }
        else {
            wx.switchTab({
                url: '../home/home',
            })
        }
        
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