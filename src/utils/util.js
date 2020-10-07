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
    while (true) {
      let new_code_promise = generate_topcode(_expire_length);
      let new_code = await new_code_promise;
      console.log(new_code);
      if (new_code != "duplicated") {
        generated_code_list.push(new_code);
        break;
      }
    }
  }

  _call_back(generated_code_list);
}


// return a unique topcode in db. Form: 3 alphabets following 3 digits (e.g. AAA000, XYZ789)
// total code: 26^3 * 10^3 = 17576000
async function generate_topcode(_expire_length) {
  const alphabet_list = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const number_list = "0123456789";

  var new_code_list = [];

  for (let index = 0; index < 3; index++) {
    new_code_list[index] = alphabet_list.substr(Math.floor(Math.random() * 26), 1);
    new_code_list[index + 3] = number_list.substr(Math.floor(Math.random() * 10), 1);
  }

  var new_code = new_code_list.join("");
  console.log(new_code)

  return new Promise((resolve, reject) => {
    db.collection('top_code').where({
      top_code: new_code,
    }).get({
      success: function (res) {
        // new top_code
        if (res.data.length == 0) {
          // insert new top_code to db
          db.collection('top_code').add({
            data: {
              expire_length: _expire_length,
              is_activated: false,
              item_id: "_",
              start_date: new Date("1970-01-01"),
              top_code: new_code
            },
            success: function (res) {
              console.log(res)
              resolve(new_code);
            }
          })
        } else {
          resolve("duplicated");
        }
      }
    })
  })
}

// this function is designed to be transaction consistent
/* return value: (through callback function)
 *  false: top_code invalid
 *  true: top_code valid and at the same time being activated
 * Notice: valid top_code can call this function only once, it will be activated and marked invalid after the function is called.
 */
const verify_and_use_topcode = function (user_top_code, _call_back) {
  if (user_top_code.length == 0) {
    // user doesn't enter top code, just skip!
    _call_back({ status: true, err_msg: "No top code used.", top_code: false });
    return;
  }

  if (user_top_code.length != 6) {
    _call_back({ status: false, err_msg: "置顶码无效" });
    return;
  }

  db.collection('top_code').where({
    top_code: user_top_code,
  }).get({
    success: function (res) {
      var topcode_detail = res.data[0]
      console.log(topcode_detail)
      if (topcode_detail["is_activated"]) {
        _call_back({ status: false, err_msg: "Top code has already been used." });
        return
      }

      // Delete top code from collection
      db.collection('top_code').where({
        top_code: user_top_code,
      }).remove({
        success: function (res) {
          var timestamp = Date.parse(new Date()) / 1000;
          var _expire_timestamp = timestamp + topcode_detail["expire_length"] * 24 * 60 * 60
          console.log(_expire_timestamp)
          _call_back({ status: true, err_msg: "OK", top_code: true, expire_timestamp: _expire_timestamp });
          return
        },
        fail: function (res) {
          _call_back({ status: false, err_msg: "Unknown Internal Error" });
        }
      })
    }
  })
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

const compressImage = function (path) {

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
  verify_and_use_topcode: verify_and_use_topcode,
  generate_topcode_wrapper: generate_topcode_wrapper,
  wxuuid: wxuuid,
  formatTime: formatTime,
  getDistance: getDistance
}