// components/callPhone/callPhone.js
Component({
  /**
   * 组件样式隔离----使得app.wxss中的样式能够影响组件的wxss
   */
  options: {
    styleIsolation: 'apply-shared'
  },

  /**
   * 组件的属性列表
   */
  properties: {
    phoneNumber: String
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //点击打电话
    callPhone(){
      console.log(this.data.phoneNumber);
      wx.makePhoneCall({
        phoneNumber: this.data.phoneNumber
      })
    }
  }
})
