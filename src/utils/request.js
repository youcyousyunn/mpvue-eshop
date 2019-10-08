import wx from 'wx'
import Fly from 'flyio'

const flyio = new Fly()

// 设置请求基地址
// request.config.baseURL = 'http://youcyousyunn.free.idcfengye.com/eshop/'

// 添加请求拦截器
flyio.interceptors.request.use((request) => {
  // 处理flyio请求后台根据method的不同添加不同请求头
  var contentType = 'application/json;charset=UTF-8'
  const method = request.method
  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    contentType = 'application/x-www-form-urlencoded;charset=UTF-8'
  }
  // 给所有请求添加自定义header，带上sessionId信息让服务器验证用户登录
  request.headers = {// 设置请求头
    'Content-Type': contentType,
    'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionid'),
    'version': '1.0.1'
  }
  request.timeout = 30000 // 设置请求超时时间
  wx.showNavigationBarLoading()
  return request
})

// 添加响应拦截器，响应拦截器会在then/catch处理之前执行
flyio.interceptors.response.use((response, promise) => {
  wx.hideNavigationBarLoading()
  return promise.resolve(response.data)
}, (err, promise) => {
  wx.hideNavigationBarLoading()
  wx.showToast({
    title: err.message,
    icon: 'none'
  })
  return promise.resolve()
})

export default flyio
