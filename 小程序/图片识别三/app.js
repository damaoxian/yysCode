App({
  onLaunch() {
    // 小程序启动时执行
  },
  globalData: {
    // 百度OCR配置
    baiduOCR: {
      apiKey: '你的client_id',          // 替换成你的 client_id
      secretKey: '你的client_secret',    // 替换成你的 client_secret
      accessToken: '',                 // 访问令牌
      tokenExpireTime: 0              // 令牌过期时间
    }
  }
}) 