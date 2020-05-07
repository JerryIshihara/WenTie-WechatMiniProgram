// Custom-Component/item-listing/index.js
Component({
    /**
     * Component properties
     */
    properties: {
      items:{
        type: Array,
        value: []
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
      onTap (e) {
        const item = JSON.stringify(e.currentTarget.dataset.item)
        console.log(item)
        wx.navigateTo({
          url: "../item_page/item_page?item=" + encodeURIComponent(item),
        })
      }

    }
}) 


// function () {
//   const DB = app.globalData.dataBase
//   var items = DB.collection('items').get({
//     success: function (res) {
//       console.log(res.data)
//       return res.data
//     }
//   })
//   this.setData(
//     { cards: items }