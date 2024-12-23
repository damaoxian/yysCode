const baiduAI = require('../../utils/baiduAI.js');

Page({
  data: {
    currentTab: 1,
    tempImage: '',
    recognizedText: '',
    copy_string: '',
    isWaitingMean: false,
    word_mean: [],
  },

  // 在页面加载时读取本地存储的数据
  onLoad() {
    this.loadWordMeanFromStorage();
  },

  // 从本地存储加载数据
  loadWordMeanFromStorage() {
    const wordMean = wx.getStorageSync('word_mean') || [];
    this.setData({
      word_mean: wordMean
    });
  },

  // 保存数据到本地存储
  saveWordMeanToStorage() {
    wx.setStorageSync('word_mean', this.data.word_mean);
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
    const selectedText = e.detail.value;
    this.setData({
      copy_string: selectedText
    });

    // 根据当前状态显示不同的菜单选项
    if (this.data.isWaitingMean) {
      this.showActionSheet(['录入单词', '添加释义']);
    } else {
      this.showActionSheet(['录入单词']);
    }
  },

  // 显示操作菜单
  showActionSheet(itemList) {
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        this.handleActionSheetClick(itemList[res.tapIndex]);
      }
    });
  },

  // 处理菜单点击事件
  handleActionSheetClick(type) {
    if (type === '录入单词') {
      this.handleInputWord();
    } else if (type === '添加释义') {
      this.handleInputMean();
    }
  },

  // 处理录入单词
  handleInputWord() {
    wx.getClipboardData({
      success: (res) => {
        const clipboardText = res.data;
        if (!clipboardText) {
          wx.showToast({
            title: '请先复制要录入的单词',
            icon: 'none'
          });
          return;
        }

        const wordMean = this.data.word_mean;
        const lastItem = wordMean[wordMean.length - 1];

        if (!lastItem || (lastItem.word && lastItem.mean)) {
          this.addNewWord(clipboardText);
        } else {
          const updatedWordMean = [...wordMean];
          updatedWordMean[wordMean.length - 1].word = clipboardText;
          this.setData({
            word_mean: updatedWordMean
          }, () => {
            this.saveWordMeanToStorage(); // 保存到本地存储
          });
        }

        this.setData({
          isWaitingMean: true
        });

        wx.showToast({
          title: '请复制并录入释义',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 处理录入释义
  handleInputMean() {
    wx.getClipboardData({
      success: (res) => {
        const clipboardText = res.data;
        if (!clipboardText) {
          wx.showToast({
            title: '请先复制要录入的释义',
            icon: 'none'
          });
          return;
        }

        const wordMean = this.data.word_mean;
        const lastItem = wordMean[wordMean.length - 1];

        if (lastItem && lastItem.word) {
          const updatedWordMean = [...wordMean];
          updatedWordMean[wordMean.length - 1].mean = clipboardText;
          
          this.setData({
            word_mean: updatedWordMean,
            isWaitingMean: false
          }, () => {
            this.saveWordMeanToStorage(); // 保存到本地存储
          });

          wx.showToast({
            title: '录入成功',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  // 添加新的单词数据
  addNewWord(word) {
    const newWord = {
      id: Date.now().toString(),
      word: word,
      mean: '',
      rightTime: 0,
      wrongTime: 0,
      unit: 'L1'
    };

    this.setData({
      word_mean: [...this.data.word_mean, newWord]
    }, () => {
      this.saveWordMeanToStorage(); // 保存到本地存储
    });
  },

  // 获取最后三条数据
  getLastThreeWords() {
    const wordMean = this.data.word_mean;
    return wordMean.slice(-3);
  },

  // 处理删除
  handleDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          const wordMean = this.data.word_mean;
          const updatedWordMean = wordMean.filter(item => item.id !== id);
          
          this.setData({
            word_mean: updatedWordMean
          }, () => {
            this.saveWordMeanToStorage(); // 保存到本地存储
          });

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  }
}) 