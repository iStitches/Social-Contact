//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {}
    //全局用户信息  usreInfo变量
    this.userInfo={}
    //全局请求消息
    this.requestList=[]
  },

    //获取用户地理位置权限
  getUserPermission:function(obj){
     //用户选择地图位置
     wx.chooseLocation({
       success:(res)=>{
            obj.setData({
              addr:res.address
            })
       },
       //失败就需要获取用户授权信息来检查是否对地理位置授权
       fail:(res)=>{
           wx.getSetting({
             success:(res)=>{
                 var statu=res.authSetting;
                 if(!statu['scope.userLocation.userLocation']){
                    //如果未授权，提示用户授权
                    wx.showModal({
                      title:'是否授权当前位置',
                      content:'需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
                      success:(res)=>{
                         //如果允许授权-----调出授权页面
                         if(res.confirm){
                              wx.openSetting({
                                  success:(res)=>{
                                    //用户成功授权
                                    if(res.authSetting['scope.userLocation']){
                                        wx.showToast({
                                          title: '授权成功',
                                          icon:'success',
                                          duration:1000
                                        })
                                        //调用chooseLocation选择地方
                                        wx.chooseLocation({
                                            success:(res)=>{
                                                obj.setData({
                                                   addr:res.address
                                                })
                                            }
                                        })
                                    }
                                    else{
                                      wx.showToast({
                                        title: '授权失败',
                                        icon: 'success',
                                        duration: 1000
                                      })
                                    }
                                  }
                              })
                         }
                      }
                    })
                 }
             },
             fail: function (res) {
                 wx.showToast({
                     title: '调用授权窗口失败',
                     icon: 'success',
                     duration: 1000
                 })
             }
           })
       }
     })
  }
})
