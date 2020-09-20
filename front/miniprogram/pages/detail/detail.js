// miniprogram/pages/detail/detail.js
const app=getApp();
const db=wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail:{},
    isFriend:false,
    notHidden:true,
    masterId:''
  },

  /**
   * 点击添加好友
   */
  addFriend(){
    //首先查看用户是否登录，未登录跳转到登录页面
    //已登录----更新或者添加数据库
    if(app.userInfo._id){
      db.collection('message').where({
          userId: this.data.detail._id
      }).get().then((res)=>{
        console.log(this.data.detail);
        //更新数据库----查看数据库中是否包含指定的用户_id
        if(res.data.length){
          console.log(res.data[0].list.includes(app.userInfo._id));
          //包含用户----提示用户已经申请过
            if(res.data.i){
               wx.showToast({
                 title: '已申请过!',
               })
            }
          //不包含用户----插入
          else{
             wx.cloud.callFunction({
               name:'update',
               data:{
                  collection:'message',
                  where:{
                    userId:this.data.detail._id
                  },
                  data: `{list : _.unshift('${app.userInfo._id}')}`
               }
             }).then((res)=>{
               console.log(res);
               wx.showToast({
                 title: '申请成功!',
               })
             })
          }
        }
        //添加数据库
        else{
          console.log("添加用户");
          db.collection('message').add({
            data:{
              userId:this.data.detail._id,
              list:[app.userInfo._id]
            }
          }).then((res)=>{
            wx.showToast({
              title: '申请成功'
            })
          })
        }
      })
    }
    //未登录----switchTab
    else{
      wx.showToast({
        title: '请先登录',
        duration: 2000,
        icon: 'none',
        success:()=>{
           setTimeout(() => {
              //跳转到登录页
              wx.switchTab({
                url: '../my/my',
              })
           }, 2000);
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userId=options.userId;
    db.collection('users').doc(userId).get().then((res)=>{
      this.setData({
        detail:res.data,
        masterId:app.userInfo._id
      })
      let friendList=res.data.friendList;
      console.log(this.data.masterId);
      console.log(friendList);
    //检查是否是当前的好友来修改可见元素的权限
    if(friendList.includes(this.data.masterId)){
      console.log("我们是好友了");
      this.setData({
        isFriend:true,
        notHidden:true
      })
    }
    //不是好友----需要排除掉自己
    else{
      console.log("我们不是好友");
      this.setData({
         isFriend:false,
         notHidden:true
      },()=>{
         if(this.data.detail._id == app.userInfo._id){
              console.log("处理自己");
              this.setData({
                isFriend:true,
                notHidden:false
              })
              console.log(this.data.notHidden);
         }
      })
    }
    });
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