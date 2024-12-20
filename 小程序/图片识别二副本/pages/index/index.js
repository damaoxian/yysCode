const baiduAI = require('../../utils/baiduAI.js');

Page({
  data: {
    currentTab: 0,
    tempImage: '',
    recognizedText: '',
    wordList: [
      {
        word: 'Hello',
        translation: '你好',
        checked: false
      },
      {
        word: 'World',
        translation: '世界',
        checked: false
      },
      {
        word: 'Example',
        translation: '示例',
        checked: false
      }
    ],
    arrangeInputs: [],
    currentUnit: 0,
    unitList: ['L1', 'L2', 'L3', 'L4', 'L5'],
    recordList: [
      {
        date: '03-14',
        time: '12:00',
        unit: 'L1',
        correct: 8,
        wrong: 2,
        accuracy: '80%'
      }
      // 可以添加更多测试记录数据
    ]
  },

  // 切换标签页
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      currentTab: index
    })
  },

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          tempImage: res.tempFiles[0].tempFilePath
        })
      }
    })
  },

  // 识别文字
  recognizeText() {
    if (!this.data.tempImage) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '识别中...',
    })

    // 将图片转为base64
    wx.getFileSystemManager().readFile({
      filePath: this.data.tempImage,
      encoding: 'base64',
      success: (res) => {
        baiduAI.recognizeText(res.data)
          .then(result => {
            wx.hideLoading()
            const recognizedText = result.words_result
              .map(item => item.words)
              .join('\n')
            
            this.setData({
              recognizedText
            })

            wx.showToast({
              title: '识别成功',
              icon: 'success'
            })
          })
          .catch(err => {
            wx.hideLoading()
            wx.showToast({
              title: err.message || '识别失败',
              icon: 'none'
            })
            console.error('识别失败:', err)
          })
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({
          title: '图片处理失败',
          icon: 'none'
        })
        console.error('读取图片失败:', err)
      }
    })
  },

  // 编辑单词
  editWord(e) {
    const index = e.currentTarget.dataset.index
    // 实现编辑功能
  },

  // 删除单词
  deleteWord(e) {
    const index = e.currentTarget.dataset.index
    const wordList = this.data.wordList
    wordList.splice(index, 1)
    this.setData({
      wordList
    })
  },

  // 处理整理页面的输入
  handleArrangeInput(e) {
    const { index, type } = e.currentTarget.dataset;
    const value = e.detail.value;
    const wordList = this.data.wordList;

    if (type === 'word') {
      wordList[index].word = value;
    } else if (type === 'translation') {
      wordList[index].translation = value;
    } else if (type === 'input') {
      // 处理第三列输入
      const arrangeInputs = this.data.arrangeInputs;
      arrangeInputs[index] = value;
      this.setData({ arrangeInputs });
      return;
    }

    this.setData({ wordList });
  },

  // 添加删除处理方法
  handleArrangeDelete(e) {
    const index = e.currentTarget.dataset.index;
    const wordList = this.data.wordList;
    const arrangeInputs = this.data.arrangeInputs;
    
    wordList.splice(index, 1);
    arrangeInputs.splice(index, 1);
    
    this.setData({
      wordList,
      arrangeInputs
    });
  },

  // 添加保存处理方法
  handleArrangeSave() {
    // 这里添加保存逻辑
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    });
  },

  // 处理单元选择
  handleUnitChange(e) {
    this.setData({
      currentUnit: e.detail.value
    })
  },

  // 格式化日期方法
  formatDate(fullDate) {
    const date = new Date(fullDate);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}-${day}`;
  }
}) 