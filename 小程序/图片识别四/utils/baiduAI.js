const BASE_URL = 'https://aip.baidubce.com';
const API_KEY = 'LdyMS3G70tLmUH9IPXWLRk8c';
const SECRET_KEY = '6hH9ljtqTKiSCtzwGTWdRaUkXs6Sr4Sr';

// 获取百度AI的access token
const getAccessToken = () => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`,
      method: 'GET',
      success: res => {
        console.log('token响应:', res.data);
        if (res.data && res.data.access_token) {
          resolve(res.data.access_token);
        } else {
          reject(new Error('获取token失败: ' + JSON.stringify(res.data)));
        }
      },
      fail: err => {
        console.error('获取token网络请求失败:', err);
        reject(new Error('网络请求失败: ' + JSON.stringify(err)));
      }
    });
  });
};

// 调用通用文字识别API
const recognizeText = (imageBase64) => {
  return new Promise((resolve, reject) => {
    getAccessToken().then(token => {
      console.log('开始发送识别请求');
      wx.request({
        url: `${BASE_URL}/rest/2.0/ocr/v1/general_basic?access_token=${token}`,
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          image: imageBase64,
          language_type: 'CHN_ENG'
        },
        success: res => {
          console.log('识别API响应:', res);
          
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP错误: ${res.statusCode}`));
            return;
          }

          if (!res.data) {
            reject(new Error('响应数据为空'));
            return;
          }

          if (res.data.error_code) {
            reject(new Error(`识别失败(${res.data.error_code}): ${res.data.error_msg}`));
            return;
          }

          if (!res.data.words_result) {
            reject(new Error('响应数据格式错误: ' + JSON.stringify(res.data)));
            return;
          }

          resolve(res.data);
        },
        fail: err => {
          console.error('识别API请求失败:', err);
          reject(new Error('请求失败: ' + JSON.stringify(err)));
        }
      });
    }).catch(err => {
      console.error('获取token失败:', err);
      reject(err);
    });
  });
};

module.exports = {
  recognizeText
}; 