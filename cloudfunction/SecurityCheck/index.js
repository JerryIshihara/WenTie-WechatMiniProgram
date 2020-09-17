// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 云函数入口函数
exports.main = async (event, context) => {
  const { value, txt, contentType } = event;
    try {
        let msgR = false;
        let imageR = false;
        //检查 文字内容是否违规
        if (txt) {
            msgR = await cloud.openapi.security.msgSecCheck({
                content: txt
            })
        }
        //检查 图片内容是否违规
        if (value) {
            console.log(Buffer.from(value))
            imageR = await cloud.openapi.security.imgSecCheck({
                media: {
                    header: { 'Content-Type': 'application/octet-stream' },
                    contentType: contentType,
                    value: Buffer.from(value)
                }
            })
        }
        console.log(imageR)
        return {
            msgR,   //内容检查返回值
            imageR   //图片检查返回值
        };
    } catch (err) {
        // 错误处理
        console.log('ERROR: ' + err)
        return err
    }
}

