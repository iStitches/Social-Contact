// miniprogram/pages/my/my.js
//获取云数据库对象db
const db=wx.cloud.database();
//获取全局变量 app---可操作app.json中的数据
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
     userPhoto: "../../images/user/user.png",
     userName: "小喵喵",
     isLogin: false,   //用户是否登录
     userId:"",           //用户_id
     disabled: true,     //登录按钮是否可以点击
     logitude:'',
     latitude:'',
     canTap:false
  },
  /**
   * 获取登录用户数据，绑定并存储
   */
  bindGetUserInfo(ev){
    //点击登录后立刻设置为不可点击
     this.setData({
      canTap:true
     })
     const info=ev.detail.userInfo;
     //如果用户未登录，则存储用户数据进云数据库同时绑定用户数据到user
     if(!this.data.isLogin && info)
     {
       db.collection("users").add({
         data:{
           userName: info.nickName,
           userPhoto: info.avatarUrl,
           gender: info.gender,
           city: info.city,
           country: info.country,
           phoneNumber: '',
           signature: '',
           links: 0,
           isLocation:true,
           time: new Date(),
           friendList:[],
           logitude:this.data.logitude,
           altitude:this.data.altitude,
           location: db.Geo.Point(this.data.logitude,this.data.altitude)   //同时需要插入经纬度对应的点的信息
          }
       }).then((res)=>{
         //成功后再次根据返回的数据id 查询来渲染页面中的变量
          db.collection('users').doc(res._id).get().then(one=>{
            app.userInfo=Object.assign(app.userInfo,one.data);
            this.setData({
              userName: app.userInfo.userName,
              userPhoto: app.userInfo.userPhoto,
              isLogin: true,
              disabled:true
            });
            this.watchDbChange();
          })
       })
     }
  },

  /**
   * 登陆后监听数据库变化，随时接收添加好友的请求
   */
  watchDbChange(){
    db.collection('message').where({
      userId:app.userInfo._id
    }).watch({
      onChange: function(snapshot) {
        console.log(snapshot.docChanges.length);
        //如果请求消息集合list不为空----消息模块显示红点，并且存储list到全局App
        if(snapshot.docChanges.length && snapshot.docChanges[0].doc.list.length!=0){
              console.log("有消息");
              app.requestList=snapshot.docChanges[0].doc.list;
              wx.showTabBarRedDot({
                index: 2,
              })
        }
        //如果没有消息集合----清除红点，然后清空全局App消息集合
        else{
          console.log("没消息");
          wx.hideTabBarRedDot({
            index: 2,
          })
          app.requestList=[];
        }
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
  },
  /**
   * 获取登录用户的位置
   */
  getUserLocation(){
    wx.getLocation({
      type: 'gcj02',
      success: (res)=> {
        const latitude = res.latitude
        const longitude = res.longitude
        this.setData({
          logitude:res.longitude,
          altitude:res.latitude
        })
      }
     })
  },

  /**
   * 自动登录
   */
  autoLogin(){
    this.getUserLocation();
    //用户自动登录功能的实现----调用云函数 login
    wx.cloud.callFunction({
      name: 'login',
      data:{}
    }).then((res)=>{
       //此时会返回登录用户的openid，根据这个id去数据库中查询用户进行数据渲染,注意通过where查询出的data是数组
       db.collection('users').where({
         _openid: res.result.openid
       }).get().then((one)=>{
         //如果查询出没有数据，则需要先登录,并且此时按钮可用
         if(one.data.length){
           app.userInfo=Object.assign(app.userInfo,one.data[0]);
           this.setData({
             userName:app.userInfo.userName,
             userPhoto:app.userInfo.userPhoto,
             isLogin:true,
             disabled:true,
             _id:app.userInfo._id
           });
           //监听用户数据变化
           this.watchDbChange();
         }
         else{
            this.setData({
             disabled:false
            })
         }
       })
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
 
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
       this.autoLogin();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.autoLogin();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})