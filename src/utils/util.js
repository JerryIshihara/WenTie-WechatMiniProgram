const app = getApp()
const db = app.globalData.dataBase;
const _ = db.command

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


const wxuuid = function () {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid
}

async function generate_topcode_wrapper(_num_code, _expire_length, _call_back) {
  var generated_code_list = []

  for (let index = 0; index < _num_code; index++) {
    // generate new code if it is duplicated
    while(true){
      let new_code_promise = generate_topcode(_expire_length);
      let new_code = await new_code_promise;
      console.log(new_code);
      if(new_code != "duplicated") {
        generated_code_list.push(new_code);
        break;
      }
    }
  }

  _call_back(generated_code_list);
}


// return a unique topcode in db. Form: 3 alphabets following 3 digits (e.g. AAA000, XYZ789)
// total code: 26^3 * 10^3 = 17576000
async function generate_topcode (_expire_length) {
  const alphabet_list = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const number_list = "0123456789";
  
  var new_code_list = [];

  for (let index = 0; index < 3; index++) {
    new_code_list[index] = alphabet_list.substr(Math.floor(Math.random() * 26), 1);
    new_code_list[index+3] = number_list.substr(Math.floor(Math.random() * 10), 1);
  }

  var new_code = new_code_list.join("");
  console.log(new_code)

  // return new Promise((resolve, reject) => {
  //   db.collection('top_code').where({
  //     top_code: new_code,
  //   }).get().then((res) => {
  //     resolve(res);
  //   })
  // })

  return new Promise((resolve, reject) => {
    db.collection('top_code').where({
      top_code: new_code,
    }).get({
      success: function (res) {
        // new top_code
        if(res.data.length == 0) {
          // insert new top_code to db
          db.collection('top_code').add({
            data: {
              expire_length: _expire_length,
              is_activated: false,
              item_id: "_",
              start_date: new Date("1970-01-01"),
              top_code: new_code
            },
            success: function(res) {
              console.log(res)
              return resolve(new_code);
            }
          })
        } else {
          resolve("duplicated");
        }
      }
    })
  })
  // check whether new_code already exists in db
  // db.collection('top_code').where({
  //   top_code: new_code,
  // }).get({
  //   success: function (res) {
  //     // new top_code
  //     if(res.data.length == 0) {
  //       // insert new top_code to db
  //       db.collection('top_code').add({
  //         data: {
  //           expire_length: _expire_length,
  //           is_activated: false,
  //           item_id: "_",
  //           start_date: new Date("1970-01-01"),
  //           top_code: new_code
  //         },
  //         success: function(res) {
  //           console.log(res)
  //           return new_code;
  //         }
  //       })
  //     } else {
  //       return "duplicated";
  //     }
  //   }
  // })
}

const getDistance = function (gps1, gps2) {
  var lat1 = gps1.latitude
  var lng1 = gps1.longitude
  var lat2 = gps2.latitude
  var lng2 = gps2.longitude

  lat1 = lat1 || 0;
  lng1 = lng1 || 0;
  lat2 = lat2 || 0;
  lng2 = lng2 || 0;

  var rad1 = lat1 * Math.PI / 180.0;
  var rad2 = lat2 * Math.PI / 180.0;
  var a = rad1 - rad2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var r = 6378137;
  var distance = r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)));

  console.log(distance)
  return distance;
}

const compressImage = function(path) {

  const ctx = wx.createCanvasContext('compress');  //创建画布对象  
  ctx.drawImage(path, 0, 0, 200, 200);  //添加图片
  ctx.draw();
  wx.canvasToTempFilePath({     //将canvas生成图片
    canvasId: 'gameCanvas',
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    destWidth: 200,     //截取canvas的宽度
    destHeight: 200,   //截取canvas的高度
    success: function (res) {
      let result = res.tempFilePath
    }
  })
  return result;
}

module.exports = {
  generate_topcode_wrapper: generate_topcode_wrapper,
  wxuuid: wxuuid,
  formatTime: formatTime,
  getDistance: getDistance
}