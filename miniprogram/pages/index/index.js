//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    messages: [],
    inputValue: '',
    isLoggin: false
  },

  onLoad: function() {

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
          console.log('已经授权')
          this.setData({isLoggin: true})
        }
      }
    })

    const db = wx.cloud.database()
    app.globalData.watcher = db.collection('chat')
      .orderBy('createdAt', 'desc')
      .watch({
        onChange: snapshot => {
          console.log('hello')
          console.log(snapshot)
          if(snapshot.docChanges.length > 0) {
            snapshot.docChanges.filter(docChange => docChange.dataType === 'add').forEach(docChange => {
              this.data.messages.unshift(docChange.doc)
              this.setData({messages: this.data.messages})
            })
          }
        },
        onError: (err) => {
          console.err('watch error', err)
        }
      })

      wx.cloud.callFunction({    ///
        // 云函数名称
        name: 'getChats',
      })
        .then(res => {
          console.log(res.result) 
          this.setData({
            messages: res.result.data
          })
        })
        .catch(console.error)
  
    },

    bindGetUserInfo: function(e) {
      console.log('get info', e)
        this.setData({
          avatarUrl: e.detail.userInfo.avatarUrl,
          userInfo: e.detail.userInfo,
          isLoggin: true
        })
        
    },

    handleSend: function() {
      if(this.data.inputValue.trim() === '') {
        return wx.showToast({
          icon: 'none',
          title: '消息不能为空',
        })
      }
      wx.cloud.callFunction({    /// 
        name: 'chat',
        data: {
          nickname: this.data.userInfo.nickName,
          avatarUrl: this.data.userInfo.avatarUrl,
          message: this.data.inputValue
        }
      }).then(res => {
        console.log(res)
        this.setData({inputValue: ''})
      }).catch(console.error)
    },

    onInput: function(e) {
      this.setData({
        inputValue: e.detail.value
      })
    },

    onShow: function() {

    },

    onHide: function() {
      app.globalData.watcher && app.globalData.watcher.close()
        .then(() => {
          app.globalData.watcher = null
        })
    }

})
