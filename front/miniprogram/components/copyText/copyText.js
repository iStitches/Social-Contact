// components/copyText/copyText.js
Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  /**
   * 组件的属性列表
   */
  properties: {
    weixinNumber: String
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
    copyweixinNumber(){
      wx.setClipboardData({
        data: this.data.weixinNumber,
        success (res) {
          wx.getClipboardData({
            success (res) {
              wx.showToast({
                title: '复制成功',
              })
            }
          })
        }
      })
    }
  }
})
