import wx from 'wx';
import api from '@/utils/api';

function formatTime (date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

function formatNumber (n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}
/**
 * 封装微信登录请求
 */
function request (url, data, method) {
  wx.removeStorageSync('sessionid') // 登录前清除sessionid
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      success: function (res) {
        if (res.statusCode === 200) {
          if (res.data.errno === 401) { // 授权失败重新请求登录
            // 需要登录后才可以操作
            let code = null;
            return login().then((res) => {
              code = res.code;
              return getUserInfo();
            }).then((res) => {
              // 登录远程服务器
              request(api.authLoginByWeixin, {
                openId: code,
                usrNo: code,
                nickName: res.userInfo.nickName,
                sex: res.userInfo.gender,
                avatar: res.userInfo.avatarUrl
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
          } else {
            resolve(res.data);
          }
        } else {
          reject(res.errMsg);
        }
      },
      fail: function (err) {
        reject(err)
      }
    })
  });
}

/**
 * 检查微信会话是否过期
 */
function checkSession () {
  return new Promise(function (resolve, reject) {
    wx.checkSession({
      success: function () {
        resolve(true);
      },
      fail: function () {
        reject(false);
      }
    })
  });
}

/**
 * 调用微信登录
 */
function login () {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (res.code) {
          // 登录远程服务器
          console.log('微信登录成功', res)
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

/**
 * 调用微信获取用户信息接口，需要button授权
 */
function getUserInfo () {
  return new Promise(function (resolve, reject) {
    // 查看button是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称信息
          wx.getUserInfo({
            withCredentials: true,
            success: function (res) {
              resolve(res);
            },
            fail: function (err) {
              reject(err);
            }
          })
        } else { // 没有授权
          console.log('但获取用户信息失败，未同意button授权');
        }
      }
    })
  });
}

function redirect (url) {
  // 判断页面是否需要登录
  // if (false) {
  //   wx.redirectTo({
  //     url: '/pages/auth/login/login'
  //   });
  //   return false;
  // } else {
  wx.redirectTo({
    url: url
  });
  // }
}

function showErrorToast (msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}

const util = {
  formatTime,
  request,
  redirect,
  showErrorToast,
  checkSession,
  login,
  getUserInfo
}

export default util
