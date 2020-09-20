// components/search/search.js
const app=getApp()
const db=wx.cloud.database()

Component({
  /**
   * 组件的属性列表
   */
  /**
   * 设置该组件样式受到app.wxss影响
   */
  options: {
    styleIsolation: 'apply-shared'
  },

  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    isFocus:false,
    historyList:[],
    searchResult:[],
    isClear:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //点击搜索框时触发---只有 input能够触发
    handleFocus(ev){
      console.log("点击了搜索");
      //1.获取缓存数据进行渲染
        wx.getStorage({
          key: 'userHistoryKey',
          success:(res)=>{
            this.setData({
              historyList:res.data,
              isFocus:true
            })
          },
          fail:(res)=>{
            this.setData({
                isFocus:true
            })
          }
        })
    },
    //点击取消时回到主页
    handleCancel(){
       this.setData({
         isFocus:false,
         isClear:''
       })
    },
    //按下回车键/点击确认 后自动提交------需要去除重复的
    handleConfirm(ev){
        //1.先获取历史缓存
        wx.getStorage({
          key: 'userHistoryKey',
          success:(res)=>{
              this.setData({
                 historyList:res.data
              })
          }
        })
        //2.克隆去重
        let clone=[...this.data.historyList];
        clone.unshift(ev.detail.value);
        console.log(clone);
        //3.插入数据
        wx.setStorage({
          data: [...new Set(clone)],
          key: 'userHistoryKey',
        })
        //4.发送数据去数据库查询对应用户
        this.handleSendParam(ev.detail.value);
        //5.重新渲染历史记录
        this.setData({
          historyList: [...new Set(clone)]
        })
    },
    //清空所有缓存
    handleClear(){
       console.log("点击了删除");
       wx.removeStorage({
         key: 'userHistoryKey',
         success:(res)=>{
           this.setData({
            historyList:[],
            searchResult:[]
           })
         }
       })
    },
    //接收用户数据在数据库中查询
    handleSendParam(param){
         console.log(param);
         db.collection('users').where({
            userName: db.RegExp({
              regexp: param,
              options: 'i',
            })
         }).field({
           userPhoto:true,
           userName:true,
           _id:true
         }).get().then((res)=>{
           this.setData({
               searchResult:res.data
           })
         })
    },

    //点击历史记录重新查找-----通过data-xxx属性来传递数据然后用 ev.target.dataset.xxx来获取
    handleHistory(ev){
         //重新调用查询方法
        let param=ev.target.dataset.text;
        this.handleSendParam(param);
        this.setData({
           isClear:param
        })
    }
  }
})
