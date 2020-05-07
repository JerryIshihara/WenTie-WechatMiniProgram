// Custom-Component/user-item/index.js
Component({
    /**
     * Component properties
     */
    properties: {
        type: {
            type: String,
            value: '我收藏的'
        },
        item: {
            type: Object,
            value: {
                avatarUrl: '',
                nickName: '十元',
                title: '商品标题',
                tag: "电器",
                price_offer: "9.99",
                price_origin: "8",
                imageUrls: [
                    '../../img/s0.jpg',
                    '../../img/s1.jpg',
                    '../../img/s2.jpg',
                    '../../img/s3.jpg',
                ],
                num_share: 2,
                num_thumbUp: 9,
                num_collected: 1,
                msg: []
            }
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
        onTapCancel: function() {
            this.triggerEvent('delete', {title: this.properties.type, id: this.properties.item._id})
        },
        preview: function (e) {
            const index = e.target.dataset.idx
            console.log("预览图片：" + index)
            wx.previewImage({
                current: this.properties.item.images[index],
                urls: this.properties.item.images,
            })
        },

        
    }
})
