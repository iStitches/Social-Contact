# Social-Contact
微信小程序大赛---Social Contact 社交小程序

### 一、Social Contact介绍：

#### 1.1 小程序介绍：

Social Contact是一款用于社交交友的小程序，它能够根据用户的登录情况来展示不同的界面特性，其中包含了给心仪用户点赞、获取附近用户的信息进行社交、主动添加对方为好友、查看自己的消息邮箱、好友列表、自己以及好友的信息等等功能。



#### 1.2 目标用户：

面向各个年龄段、各种职业的用户，希望通过app来找到趣味相投的人，同时结交更多的朋友。



#### 1.3 应用场景：

利用微信小程序这个平台，方便快捷地搭建起日常生活中人与人之间的社交网络，丰富人们的生活。



### 二、小程序架构思路：

> **就整体而言，小程序主要分为首页+附近的人+消息+我的 四个主要模块来进行构造**

![image-20200920000900672](https://github.com/iStitches/Social-Contact/blob/master/introduce.assets/image-20200920000900672.png)



### 三、小程序的实现及效果图：

#### 3.1 效果截图：

![img](https://github.com/iStitches/Social-Contact/blob/master/introduce.assets/5EC3E7436061F7B5D0BEF426528587B8.png)

![img](https://github.com/iStitches/Social-Contact/blob/master/introduce.assets/C0E170BF0FC00652C09A3C57CCDCB7DF.png)

![img](https://github.com/iStitches/Social-Contact/blob/master/introduce.assets/D17FC5D09EA413E83D62B837FD2C2990.png)

![img](https://github.com/iStitches/Social-Contact/blob/master/introduce.assets/830FA5AFCB5E83AA24CC4E5BA7313136.png)

![img](https://github.com/iStitches/Social-Contact/blob/master/introduce.assets/30CBF684FC2794BDE6976E49288E0A36.png)

#### 3.2 部分功能代码：

> 自动登录：

```js
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
```



> 通过好友申请与消息列表的处理和清空：

```js
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
```

> 地图模块获取周围用户的信息

```js
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
```



### 四、预览使用

体验二维码：

![orN3s4lDPJrro_mgZ7za4J2wuuEk](https://github.com/iStitches/Social-Contact/blob/master/introduce.assets/orN3s4lDPJrro_mgZ7za4J2wuuEk.jpg)

### 五、开发者

**iStitches   Github个人主页：  https://github.com/iStitches**

**wulidurant  Github个人主页：https://github.com/wulidurant**
