// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const { type } = event;
  const where = type ? {status: 'post', tag: type} : {status: 'post'}
  try {
    // 先取出集合记录总数
    const countResult = await db.collection('items').where(where).count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const skip = Math.max(i * MAX_LIMIT, 0)
      console.log(skip)
      const promise = db.collection('items')
        .where(where)
        // .sort({'date': -1})
        .orderBy('code', 'desc')
        .orderBy('date', 'desc')
        .skip(skip)
        .limit(MAX_LIMIT)
        .get()
      tasks.push(promise)
    }
    // 等待所有
    return (await Promise.all(tasks)).reduce((acc, cur) => {
      console.log(cur.data)
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    })
    // const db_total = await db.collection('items').where({ status: 'post'}).count({
    //   success: function (res) {
    //     var total =res.total;
    //     db.collection('items')
    //         .where({
    //           status: 'post'
    //         })
    //         .orderBy('code', 'desc')
    //         .skip(total - 100)
    //         .get({
    //           success: function (res) {
    //             console.log(res.data.length)
    //             _this.setData({
    //               loaded: _this.data.loaded + res.data.length,
    //               items: _this.data.items.concat(res.data.reverse())
    //             })
    //           }
    //         })

    // }});
  } catch (e) {
    console.log(e)
  }
}