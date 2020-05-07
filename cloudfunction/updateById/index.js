// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event.id)
  try {
    return await db.collection(event.collection).doc(event.id)
      .update({
        data: event.data,
        success: function(res) {
          console.log(res)
        }
      })
  } catch (e) {
    console.log(e)
  }
}