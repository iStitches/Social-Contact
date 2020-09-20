// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//获取数据库对象
const db=cloud.database();
//获取运算能力
const _=db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  //更新操作-----从event中取参数
  try {
    //判断参数变量类型
    if(typeof event.data == 'string'){
      //将字符串转化为js对象
      event.data= eval("("+event.data+")");
    }
    //包含doc字段-----根据id筛选
    if(event.doc){
      return await db.collection(event.collection).doc(event.doc)
      .update({
        data: {
          ...event.data
        },
      })
    }
    //包含where字段----自定义筛选
    else{
      console.log(event.data);
      return await db.collection(event.collection).where({...event.where})
      .update({
        data: {
          ...event.data
        },
      })
    }

  } catch(e) {
    console.error(e)
  }
}