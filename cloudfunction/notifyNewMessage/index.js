// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    console.log(event)
    return await cloud.openapi.subscribeMessage.send({
      touser: event.openid,
      page: 'pages/message/message',
      miniprogramState: 'developer',
      templateId: event.templateId,
      data: {
        name1: {
          value: event.nickName
        },
        date3: {
          value: event.time
        },
        thing2: {
          value: event.title
        }
      },
    })
  } catch (e) {
    console.log(e)
  }
}