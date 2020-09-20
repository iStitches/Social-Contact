// miniprogram/pages/index/index.js
//引入云数据库
const db=wx.cloud.database();
//引入全局app
const app=getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    imageUrl:[],
    listData:[],
    current:'links',
    indicatorColor:'#ff0',  //轮播点默认颜色
    indicatorActiveColor: '#90ee90', //轮播点选中的颜色
  },
  /**
   * 获取轮播图图片
   */
  getSwiperImage(){
      db.collection('swiperImages').get()
      .then((res)=>{
        console.log(res);
        this.setData({
          imageUrl:[
            res.data[0].swiperUrl,
            res.data[1].swiperUrl,
            res.data[2].swiperUrl
          ]
        });
      })
  },

  /**
   * 获取数据库中的展示内容---添加了按某个属性进行排序
   */
  getListData(){
    console.log(this.data.userId);
     db.collection('users').field({
       userPhoto:true,
       userName:true,
       links:true,
       _id:true
     }).orderBy(this.data.current,'desc').get().then((res)=>{
          this.setData({
             listData:res.data
          })
     }) 
  },

  /**
   * 点赞功能的实现
   */
  handlelinks(ev){
      //获取绑定的用户ID
      var id=ev.target.dataset.id;
      //调用update云函数
      wx.cloud.callFunction({
        name: 'update',
        data:{
          collection: 'users',
          doc: id,
          data:'{links: _.inc(1)}'     // .inc 自增1
        }
      }).then((res)=>{
        //更新成功-----更改listData中对应用户的links，然后重新显示
        if(res.result.stats.updated){
            //拷贝listData数据
            console.log("sdfs");
            var clonelist=[...this.data.listData];
            //遍历list找到对应用户
            for(var i=0;i<clonelist.length;i++){
              console.log(clonelist[i]);
              if(clonelist[i]._id==id)
                 clonelist[i].links++;
            }
            //设置listData
            this.setData({
               listData:clonelist
            })
        }
      })
  },

  //点击tab栏切换
  clickTab(ev){
    //点击的是自己
    var current=ev.target.dataset.current;
     if(current==this.data.current){
          return false;
     }
     this.setData({
       current: current
     },()=>{
       this.getListData();
     })
  },

 //点击查看个人信息
  handleDetail(ev){
    let id= ev.target.dataset.id;
    console.log("查看个人信息"+id);
    wx.navigateTo({
      url: '/pages/detail/detail?userId='+id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getSwiperImage();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getListData();
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