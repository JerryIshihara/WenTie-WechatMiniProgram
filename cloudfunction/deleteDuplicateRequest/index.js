// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // 删除重复确认
  try {
    const del_item_request = await db.collection('item_request').where({
      'item._id': event.item._id,
      _openid: event.openid
    }).remove({
      success: function (res) {
        console.log(res)
      }
    })
  } catch (e) {
    console.log(e)
  }
}