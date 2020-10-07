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
  const { type, request_from, keyword } = event;
  const where = type ? { status: 'post', tag: type } : { status: 'post' }

  if (request_from == "home") {
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
          .skip(skip)
          .limit(MAX_LIMIT)
          .get()
        tasks.push(promise)
      }
      // 等待所有
      const all_items = (await Promise.all(tasks)).reduce((acc, cur) => {
        console.log(cur.data)
        return {
          data: acc.data.concat(cur.data),
          errMsg: acc.errMsg,
        }
      })
      return (await Promise.resolve(all_items).then((value) => {
        return (order_items(value))
      })
      )
    } catch (e) {
      console.log(e)
    }
  } else if (request_from == "search") {
    const search_result = db.collection('items').where(
      _.or([
        {
          title: db.RegExp({
            regexp: keyword,
            options: 'i',
          }),
          status: 'post',
        },
        {
          description: db.RegExp({
            regexp: keyword,
            options: 'i',
          }),
          status: 'post',
        }
      ])
    ).get()
    return (await Promise.resolve(search_result).then((value) => {
      return (order_items(value))
    })
    )
  }
}

const order_items = function (item_list) {
  var timestamp_now = Date.parse(new Date()) / 1000;
  let items = item_list.data

  items.sort((a, b) => {
    if (!a["top_expire"] && b["top_expire"]) {
      // only b has top_code, b is priority
      return 1;
    } else if (a["top_expire"] && !b["top_expire"]) {
      // only a has top_code, a is priority
      return -1;
    } else {
      if (a["date"] != b["date"]) {
        return a["date"] > b["date"] ? -1 : 1
      } else {
        return a["_id"] > b["_id"] ? -1 : 1
      }
    }
  });

  // iterate through the list to find if any item has its top code expired
  items.forEach(function (element, index) {
    if (element["top_expire"] && element["top_expire"] < timestamp_now) {
      console.log("expired!")
      // if expired, erase the top_expire
      db.collection('todos').where({
        _id: element["_id"],
      }).update({
        data: {
          top_expire: _.remove()
        },
        success: function (res) {
          console.log("expired top_code removed, item id: " + element["_id"])
        }
      })
    } else if (element["top_expire"]) {
      element["code"] = "WENTIE_ZHIDING"
    } else {
      element["code"] = ""
    }
  })

  console.log(items)
  return (item_list)
}
