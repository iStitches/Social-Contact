// components/removeList/removeList.js
const db=wx.cloud.database()
const app=getApp()
const _ =db.command

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    messageId:String  //父组件传递数据给子组件------消息列表中的请求者的_id----循环迭代每人一个
  },

  /**
   * 组件的初始数据
   */
  data: {
     userInformation:{}
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
     // 在组件实例进入页面节点树时执行
    attached: function() {
         //到数据库中去查找请求用户，获取请求用户的信息并渲染
         db.collection('users').doc(this.data.messageId).field({
           _id:true,
           userPhoto:true,
           userName:true
         }).get().then((res)=>{
           this.setData({
               userInformation:res.data
           })
         })
    }},
  /**
   * 组件的方法列表
   */
  methods: {
    //删除申请消息
    removeMessage(){
       wx.showModal({
         title:'提示',
         content:'删除消息',
         confirmText:'删除',
         success:(res)=>{
           //删除消息-----数据库查找集合删除，同时更新message中的数据
             if(res.confirm){
                 this.deleteAndUpdate();
             }
             else if(res.cancel){
               console.log('取消')
             }
         }
       })
    },
    /**
     * 删除指定用户请求并更新数据库(方法提炼)
     */
    deleteAndUpdate(){
      console.log("开始前清数据了");
        //先查找后更新---不能直接更新
        db.collection('message').where({
          userId:app.userInfo._id
        }).get().then((res)=>{
          console.log(res);
          var list=res.data[0].list;
          //过滤list数组，将对应的_id过滤掉
          list=list.filter((val,i)=>{
            return val != this.data.messageId
          });
          //重新赋值----更新数据库
          wx.cloud.callFunction({
            name:'update',
            data:{
              collection:'message',
              where:{
                userId:app.userInfo._id
              },
              data:{
                list
              }
            }
          }).then((res)=>{
            //更新成功，由子组件removeList向父组件 message发送消息
            this.triggerEvent('myevent',list);
          })
        })
    },

    //同意添加好友
    addFriend(){
      wx.showModal({
        title:'通知消息',
        content:'是否添加?',
        confirmText:'同意',
        cancelText:'拒绝',
        success:(res)=>{
          //同意添加-----清楚消息、更新自己数据库、更新朋友的数据库(只能用云函数)
          if(res.confirm){
               //1.更新自己数据库
               db.collection('users').doc(app.userInfo._id).update({
                 data:{
                   friendList: _.unshift(this.data.messageId)
                 }
               }).then((res)=>{
                 console.log("自己添加"+res);
               });
               //2.更新朋友数据库
               wx.cloud.callFunction({
                 name:'update',
                 data:{
                   collection:'users',
                   doc:this.data.messageId,
                   data:`{friendList: _.unshift('${app.userInfo._id}')}`
                 }
               }).then((res)=>{
                 console.log("朋友添加"+res);
               });
               //3.向父组件发送请求清除消息
                 this.deleteAndUpdate();
          }
        }
      })
    }
  }
})
