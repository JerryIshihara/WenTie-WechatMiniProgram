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
      page: 'pages/user/user',
      miniprogramState: 'developer',
      templateId: 'sNjrgS4VpnOm28vMIucdym36NK0-xE96ZRlyrNMYg2c',
      data: {
        thing1: {
          value: event.title
        },
        time3: {
          value: event.time
        },
      },
    })
  } catch (e) {
    console.log(e)
  }
}