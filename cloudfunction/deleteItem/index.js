// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(cloud.DYNAMIC_CURRENT_ENV)
  // 删除图片
  const deleteImages = await cloud.deleteFile({
    fileList: event.item.images
  }).then(res => {
    // handle success
    console.log(res.fileList)
  }).catch(error => {
    console.error
  })
  // 删除item
  try {
    const del_items = await db.collection('items').doc(event.item._id).remove({
      success: function (res) {
        console.log(res)
      }
    })
    const del_item_asked = await db.collection('item_asked').where({
      'item._id': event.item._id,
    }).remove({
      success: function (res) {
        console.log(res)
      }
    })
    const del_item_request = await db.collection('item_request').where({
      'item._id': event.item._id,
    }).remove({
      success: function (res) {
        console.log(res)
      }
    })
    const del_collections = await db.collection('collections').where({
      item_id: event.item._id,
    }).remove({
      success: function (res) {
        console.log(res)
      }
    })
  } catch (e) {
    console.log(e)
  }
}