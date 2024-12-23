const baiduAI = require('../../utils/baiduAI.js');

Page({
  data: {
    currentTab: 1,
    tempImage: '',
    recognizedText: '',
    copy_string: '',
    word_mean: [
      {
        id: '1',
        word: 'example',
        mean: '例子',
        rightTime: 0,
        wrongTime: 0,
        unit: 'L1'
      }
    ],
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
    // 里添加保存逻辑
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
  },

  // 处理识别文本变化
  handleRecognizedTextChange(e) {
    this.setData({
      recognizedText: e.detail.value
    })
  },

  // 处理文本选中事件
  handleTextSelect(e) {
    this.setData({
      copy_string: e.detail.value
    });
  },

  // 处理单词按钮点击
  handleWordBtn() {
    const wordMean = this.data.word_mean;
    const lastItem = wordMean[wordMean.length - 1];
    
    if (!lastItem || (!lastItem.word && !lastItem.mean)) {
      // 如果没有数据或最后一条数据word和mean都为空，直接添加新数据
      this.addNewWord();
    } else if (!lastItem.word && lastItem.mean) {
      // 如果word为空但mean不为空，填充word
      const updatedWordMean = [...wordMean];
      updatedWordMean[wordMean.length - 1].word = this.data.copy_string;
      this.setData({
        word_mean: updatedWordMean
      });
    } else if (lastItem.word && !lastItem.mean) {
      // 如果word不为空但mean为空，提示输入释义
      wx.showToast({
        title: '请输入释义',
        icon: 'none'
      });
    } else {
      // 如果都不为空，添加新数据
      this.addNewWord();
    }
  },

  // 添加新的单词数据
  addNewWord() {
    const newWord = {
      id: Date.now().toString(), // 使用时间戳作为临时ID
      word: this.data.copy_string,
      mean: '',
      rightTime: 0,
      wrongTime: 0,
      unit: 'L1'
    };

    this.setData({
      word_mean: [...this.data.word_mean, newWord]
    });
  },

  // 获取最后三条数据
  getLastThreeWords() {
    const wordMean = this.data.word_mean;
    return wordMean.slice(-3);
  }
}) 