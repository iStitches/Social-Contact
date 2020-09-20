// miniprogram/pages/message/message.js
const app=getApp()
const db=wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userMessage:[],
    isLogging:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成，整个页面只会触发一次
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示---每次到该页面都会触发
   */
  onShow: function () {
       //用户未登录就跳转到登录页面
       if(!app.userInfo._id){
           wx.showToast({
             title: '未登录，请先登录！',
             icon:'none',
             duration:2000,
             success:()=>{
               setTimeout(() => {
                  wx.switchTab({
                    url: '../my/my',
                  })
               }, 2000);
             }
           })
       }
       //用户已经登录----获取全局消息值并打印显示
       else{
         this.setData({
           isLogging:true,
           userMessage:app.requestList
         });
       }
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

  },

  /**
   * 子组件removeList向父组件 message发送消息时触发
   */
  onMyEvent(ev){
       this.setData({
         userMessage:ev.detail
       })
  }
})