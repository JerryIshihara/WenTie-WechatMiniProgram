// 云函数入口文件
const cloud = require('wx-server-sdk')
var rp = require('request-promise');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  return await rp(event.url)
    .then(function (res) {
      console.log(res) //获取openid
      return res
    })
    .catch(function (res) {
      console.log(res)
    })
}