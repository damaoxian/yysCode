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
    unitList: ['L1', 'L2', 'L3', 'L4', 'L5']
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
    // 这里添加文字识别的具体实现
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
  }
}) 