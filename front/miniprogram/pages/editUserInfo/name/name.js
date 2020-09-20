// miniprogram/pages/editUserInfo/name/name.js
const db=wx.cloud.database();
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName:""
  },
  //使用微信昵称
  bindGetUserInfo(ev){
      console.log(ev);
      this.setData({
        nickName: ev.detail.userInfo.nickName
      })
      this.updataNickname();
  },
  //获取提交的自定义昵称
  handleText(ev){
     this.setData({
       nickName:ev.detail.value
     })
  },
  //使用自定义昵称
  handleBtn(){
     this.updataNickname();
  },
  updataNickname(){
    wx.showLoading({
      title: '更新中',
    })
    db.collection('users').doc(app.userInfo._id).update({
      data:{
        userName:this.data.nickName
      }
    }).then((res)=>{
      wx.hideLoading();
      wx.showToast({
        title: '更新成功'
      });
      wx.switchTab({
        url: '../../my/my',
      })
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        nickName:app.userInfo.userName
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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