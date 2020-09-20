// miniprogram/pages/near/near.js
const app=getApp()
const db=wx.cloud.database()
const _=db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    logitude:'',
    altitude:'',
    addr:'',
    marks:[],       //地图上的标记点
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
    this.getUserLocation();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
        //每次切换到此页面重新加载地理位置
        this.getUserLocation();
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
   * 获取登录用户的位置信息
   */
  getUserLocation(){
    wx.getLocation({
      type: 'gcj02',
      success :(res)=> {
        this.setData({
          logitude:res.longitude,
          altitude:res.latitude,
          age:'sdfa'
        })
        //查询附近人的信息
        this.getNearLocation();
      }
     })
  },

  /**
   * 获取登录用户附近的用户信息
   */
  getNearLocation(){
    db.collection('users').where({
      location: _.geoNear({
        geometry: db.Geo.Point(this.data.logitude,this.data.altitude),
        minDistance: 0,
        maxDistance: 5000,
      }),
      isLocation:true           //允许共享的才能查询
    }).field({
      userPhoto:true,
      userName:true,
      _id:true,
      logitude:true,
      altitude:true
    }).get().then((res)=>{
        //获取成功，过滤掉用户的图片，全部更改为真实URL
        let array=[];
        let mdata=res.data;
        if(mdata.length){
          for(let i=0;i<mdata.length;i++){
              //  //开始过滤
               if(mdata[i].userPhoto.includes('cloud://'))
               {
                   wx.cloud.getTempFileURL({
                     fileList: [ mdata[i].userPhoto ],
                     success: res =>{
                          array.push({
                            iconPath: res.fileList[0].tempFileURL,
                            id: mdata[i]._id,
                            latitude: mdata[i].altitude,
                            longitude: mdata[i].logitude,
                            width: 30,
                            height: 30
                        });
                        this.setData({           //此处需要渲染，不然最后还是打印不出来
                          marks:array
                        })
                     }
                   })
               }
               //不需要过滤直接添加
               else{
                 array.push({
                    iconPath: mdata[i].userPhoto,
                    id: mdata[i]._id,
                    latitude: mdata[i].altitude,
                    longitude: mdata[i].logitude,
                    width: 40,
                    height: 40
                 })
               }
          }
        }
        console.log(array);
        this.setData({
          marks:array
        })
    })
  },

  /**
   * 点击图标跳转到详情页
   */
  markertap(ev){
    console.log(ev);
    wx.navigateTo({
      url: '../detail/detail?userId='+ev.markerId,
    })
  }
})