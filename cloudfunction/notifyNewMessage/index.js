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
    const thing7 = event.type == '问帖' ? event.type : '确认交易';
    // TODO: message
    // return await cloud.openapi.subscribeMessage.send({
    //   touser: event.openid,
    //   page: 'pages/message/message',
    //   miniprogramState: 'developer',
    //   templateId: 'lCGrw_TKDvUfH7hoTu0kfGUhlcSS7gSKU53JGDAGcjo',
    //   data: {
    //     thing4: {
    //       value: event.nickName
    //     },
    //     time3: {
    //       value: event.time
    //     },
    //     thing2: {
    //       value: event.title
    //     },
    //     thing7: {
    //       value: thing7
    //     }
    //   },
    // })
  } catch (e) {
    console.log(e)
  }
}