// Custom-Component/keyboard/index.js

Component({
    /**
     * Component properties
     */
    properties: {
        themeColor: {
            type: String,
            value: '#fff'
        }
    },

    /**
     * Component initial data
     */
    data: {
        KeyboardKeys: [1, 2, 3, 4, 5, 6, 7, 8, 9, '·', 0, '<'],
        keyShow: true,
        offering: '',
        offeringShow: true,
        original:'',
        originalShow: false,
    },

    /**
     * Component methods
     */
    methods: {
        keyTap(e) {
            wx.vibrateShort()
            var content = ''
            if (this.data.offeringShow) {
                content = this.data.offering
            } else {
                content = this.data.original
            }

            let keys = e.currentTarget.dataset.keys
            let len = content.length
            let dot = content.indexOf('.')
            console.log(dot)
            if (((dot == -1 && len >= 5) || dot >= 5) && keys != '<') {
                null
            }
            else {
              switch (keys) {
                case '·': //点击小数点，（注意输入字符串里的是小数点，但是我界面显示的点不是小数点，是居中的点，在中文输入法下按键盘最左边从上往下数的第二个键，也就是数字键1左边的键可以打出居中的点）
                  if (len < 11 && content.indexOf('.') == -1) { //如果字符串里有小数点了，则不能继续输入小数点，且控制最多可输入10个字符串
                    if (content.length < 1) { //如果小数点是第一个输入，那么在字符串前面补上一个0，让其变成0.
                      content = '0.';
                    } else { //如果不是第一个输入小数点，那么直接在字符串里加上小数点
                      content += '.';
                    }
                  }
                  break;
                case '<': //如果点击删除键就删除字符串里的最后一个
                  content = content.substr(0, content.length - 1);
                  break;
                case 0:
                  if (len == 0) {
                    content = '0.';
                  }
                  else if (dot != - 1 && len - dot >= 3) {
                    null
                  }
                  else {
                    content += '0';
                  }
                  break;
                default:
                  let Index = content.indexOf('.'); //小数点在字符串中的位置
                  if (Index == -1 || len - Index != 3) { //这里控制小数点只保留两位
                    if (len < 11) { //控制最多可输入10个字符串
                      content += keys;
                    }
                  }
                  break
              }
            }

            

            if (this.data.offeringShow) {
                this.setData({
                    offering: content
                });
            } else {
                this.setData({
                    original: content
                });
            }
        },

        pressed: function(e) {
            var viewId = e.target.id
            if (viewId === 'id_original') {
                this.setData({
                    originalShow: true,
                    offeringShow: false
                });
            } else {
                this.setData({
                    offeringShow: true,
                    originalShow: false
                });
            }
        },

        confirmPrice: function() {
            const { offer = '', origin = '' } = { 
                offer: this.rectifyPrice(this.data.offering), 
                origin: this.rectifyPrice(this.data.original)
            }
            this.triggerEvent("confirm", {offer, origin});
        },

        closePrice: function() {
            this.triggerEvent("cancel", {}, {});
        },

        rectifyPrice: function(price) {
            let len = price.length
            let dot = price.indexOf('.')
            if (price == '') {
                return price;
            }
            if (dot == -1) {
              var new_price = price + '.00'
              return new_price
            }
            if (len - dot < 3) {
              var new_price = price + '0'
              return new_price
            }
            return  price;
        },

    }
})