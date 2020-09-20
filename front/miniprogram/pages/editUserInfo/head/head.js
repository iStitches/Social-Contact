// miniprogram/pages/editUserInfo/head/head.js
const app=getApp();
const db=wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userPhoto:''
  },
  /**
   * 选择自定义微信头像
   */
  handleBtn(){
    console.log(app.userInfo);
     this.handleUploadImage();
  },
  /**
   * 修复没有改头像点击会出现的bug
   */
  bindGetUserInfo(ev){
    console.log(ev);
    this.setData({
      userPhoto:ev.detail.userInfo.avatarUrl
    })
    this.updateUserPhoto();
},

  /**
   * 从本地文件中获取图片
   */
  handleUploadImage(){
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success :(res)=> {
            const tempFilePaths=res.tempFilePaths[0];
            this.setData({
              userPhoto:tempFilePaths
            });
        }
      })
  },
  /**
   * 上传图片到云存储
   */
  handleBtn(){
     wx.showLoading({
       title: '正在上传中',
     })
     //定义上传到数据库的位置---注意命名规范
     let cloudPath="userPhoto/"+app.userInfo._openid+Date.now()+".jpg";
     wx.cloud.uploadFile({
       cloudPath:  cloudPath,
       filePath: this.data.userPhoto,  //上传资源地址
     }).then((res)=>{
      const fileID=res.fileID;
      console.log(res);
      //更新数据库中的图片地址-----采用fileID的形式,如果采用真实的URL路径在其它页面中会显示不出来
       this.setData({
        userPhoto:fileID
       })
       this.updateUserPhoto();
       //更新全局的图片地址
       app.userInfo.userPhoto=this.data.userPhoto;
       console.log(app.userInfo.userPhoto);
       wx.hideLoading();
       wx.showToast({
         title: '上传成功',
       });
     })
  },
  /**
   * 更新数据库
   */
  updateUserPhoto(){
    wx.showLoading({
      title: '更新中',
    })
    db.collection('users').doc(app.userInfo._id).update({
      data:{
        userPhoto:this.data.userPhoto
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
        userPhoto: app.userInfo.userPhoto
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