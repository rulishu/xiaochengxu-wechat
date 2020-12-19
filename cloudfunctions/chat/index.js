// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return db.collection('chat').add({
    data: {
      avatarUrl: event.avatarUrl,
      nickname: event.nickname,
      message: event.message,
      createdAt: new Date()
    }
  }).then(res => {
    console.log(res)
    console.log('创建成功')
  })
}