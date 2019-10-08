/**
 * 用户相关服务
 */
import wx from 'wx'
import api from '@/utils/api'
import util from '@/utils/util'

/**
 * 调用微信登录
 */
function loginByWeixin () {
  wx.removeStorageSync('sessionid') // 登录前清除sessionid
  let code = null;
  return new Promise(function (resolve, reject) {
    return util.login().then((res) => { // 微信登录获取CODE
      code = res.code;
      // 获取微信用户信息
      return util.getUserInfo()
    }).then((res) => {
      let userInfo = res.userInfo
      // 把用户信息传给后台，存入数据库，并计算一个sessionId给前台存起来
      util.request(api.authLoginByWeixin, {
        openId: code,
        nickName: userInfo.nickName,
        sex: userInfo.gender,
        avatar: userInfo.avatarUrl
      }, 'POST').then(res => {
        if (res.rspCd === '00000') {
          // 存储用户信息
          wx.setStorageSync('userInfo', res.data);
          wx.setStorageSync('sessionid', res.sessionId);
          resolve(res);
        } else {
          reject(res);
        }
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    })
  });
}

/**
 * 判断用户是否登录
 */
function checkLogin () {
  return new Promise(function (resolve, reject) {
    if (wx.getStorageSync('userInfo') && wx.getStorageSync('sessionid')) {
      util.checkSession().then(() => {
        resolve(true);
      }).catch(() => {
        reject(false);
      });
    } else {
      reject(false);
    }
  });
}

const user = {
  loginByWeixin,
  checkLogin
}

export default user
