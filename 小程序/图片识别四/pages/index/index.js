const baiduAI = require('../../utils/baiduAI.js');

Page({
  data: {
    currentTab: 0,
    tempImage: '',
    recognizedText: '',
    copy_string: '',
    isWaitingMean: false,
    word_mean: [],
    unitList: ['U1L1', 'U1L2', 'U1L3','U2L1', 'U2L2', 'U2L3','U3L1', 'U3L2', 'U3L3','U4L1', 'U4L2', 'U4L3','U5L1', 'U5L2', 'U5L3','U6L1', 'U6L2', 'U6L3','U7L1', 'U7L2', 'U7L3','U8L1', 'U8L2', 'U8L3','U9L1', 'U9L2', 'U9L3'],
    currentUnit: 0,          // 当前选择的单元
    testWords: [],          // 当前测试的单词列表
    currentWordIndex: -1,   // 当前测试的单词索引
    inputWord: '',          // 用户输入的单词
    isTesting: false,       // 是否在测试中
    testResults: {          // 测试结果
      total: 0,
      current: 0,
      correct: 0,
      wrong: 0
    },
    testRecords: [],         // 测试记录
    letters: [
      ['q','w','e','r','t','y','u','i','o','p'],
      ['a','s','d','f','g','h','j','k','l'],
      ['z','x','c','v','b','n','m']
    ],
    isUpperCase: false,  // 是否大写
    showKeyboard: false,
    editingId: null,  // 当前正在编辑的单词 ID
    editWord: '',     // 编辑中的单词
    editMean: '',      // 编辑中的释义
    exportContent: '', // 导出的内容
    showExportModal: false, // 控制导出弹窗显示
  },

  // 在页面加载时读取本地存储的数据
  onLoad() {
    this.loadWordMeanFromStorage();
    const testRecords = wx.getStorageSync('testRecords') || [];
    this.setData({ testRecords });
    console.log('页面加载时 word_mean:', this.data.word_mean);
  },

  // 从本地存储加载数据
  loadWordMeanFromStorage() {
    const wordMean = wx.getStorageSync('word_mean') || [];
    this.setData({
      word_mean: wordMean
    });
    console.log('从本地存储加载的 word_mean:', this.data.word_mean);
  },

  // 保存数据到本地存储
  saveWordMeanToStorage() {
    wx.setStorageSync('word_mean', this.data.word_mean);
  },

  // 切换标签页
  switchTab(e) {
    const newIndex = parseInt(e.currentTarget.dataset.index);
    
    // 如果正在测试中且要切换到其他标签页
    if (this.data.isTesting && this.data.currentTab === 0 && newIndex !== 0) {
      wx.showModal({
        title: '正在测试中',
        content: '切换页面将结束当前测试，是否继续？',
        success: (res) => {
          if (res.confirm) {
            // 用户确认切换，结束测试
            this.finishTest();
            this.setData({
              currentTab: newIndex
            });
          }
          // 用户取消则停留在当前页面，不做任何操作
        }
      });
    } else {
      // 不在测试中或在其他标签页，直接切换
      this.setData({
        currentTab: newIndex
      });
    }
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
          title: '片处理失败',
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
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个单词吗？',
      success: (res) => {
        if (res.confirm) {
          const wordMean = this.data.word_mean.filter(item => item.id !== id);
          
          this.setData({
            word_mean: wordMean
          });
          
          // 保存到本地存储
          this.saveWordMeanToStorage();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
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

  // 修改测试页面的单元选择处理方法
  handleUnitChange(e) {
    const unitIndex = parseInt(e.detail.value);
    this.setData({
      currentUnit: unitIndex
    });
  },

  // 录入页面的单元选择处理方法
  handleInputUnitChange(e) {
    const unitIndex = parseInt(e.detail.value);
    this.setData({
      currentUnit: unitIndex
    }, () => {
      console.log('当前选择的单元:', this.data.unitList[unitIndex]);
    });
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
      unit: this.data.unitList[this.data.currentUnit] // 使用当前选择的单元
    };

    this.setData({
      word_mean: [...this.data.word_mean, newWord]
    }, () => {
      this.saveWordMeanToStorage();
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
  },

  // 开始测试
  startTest() {
    // 获取当前单元的单词
    const unitWords = this.data.word_mean.filter(
      item => item.unit === this.data.unitList[this.data.currentUnit]
    );
    console.log('开始测试时筛选的单词:', unitWords);

    if (unitWords.length === 0) {
      wx.showToast({
        title: '该单元没有单词',
        icon: 'none'
      });
      return;
    }

    // 随机打乱单词顺序
    const shuffledWords = [...unitWords].sort(() => Math.random() - 0.5);
    console.log('打乱顺序后的单词:', shuffledWords);

    this.setData({
      testWords: shuffledWords,
      currentWordIndex: 0,
      isTesting: true,
      inputWord: '',
      testResults: {
        total: shuffledWords.length,
        current: 0,
        correct: 0,
        wrong: 0
      }
    });
  },

  // 处理用户输入
  handleTestInput(e) {
    this.setData({
      inputWord: e.detail.value.toUpperCase() // 转换为大写
    });
  },

  // 检查答案
  checkAnswer() {
    const { testWords, currentWordIndex, inputWord, testResults } = this.data;
    const currentWord = testWords[currentWordIndex];
    console.log('当前测试的单词:', currentWord);
    
    // 检查答案是否正确（不区分大小写）
    const isCorrect = inputWord.toLowerCase() === currentWord.word.toLowerCase();
    
    // 更新统计数据
    const wordMean = [...this.data.word_mean];
    const wordIndex = wordMean.findIndex(item => item.id === currentWord.id);
    
    if (isCorrect) {
      wordMean[wordIndex].rightTime = (wordMean[wordIndex].rightTime || 0) + 1;
      testResults.correct++;
      console.log('答对后更新的单词:', wordMean[wordIndex]);
      // 显示正确提示
      wx.showToast({
        title: '正确!',
        icon: 'success',
        duration: 1000
      });
    } else {
      wordMean[wordIndex].wrongTime = (wordMean[wordIndex].wrongTime || 0) + 1;
      testResults.wrong++;
      console.log('答错后更新的单词:', wordMean[wordIndex]);
      // 显示错误提示和正确答案
      wx.showModal({
        title: '错误',
        content: `正确答案是: ${currentWord.word} \n 你的答案是: ${inputWord}`,
        showCancel: false,
        success: () => {
          // 模态框关闭后继续下一题
          this.continueToNextWord();
        }
      });
    }
    
    testResults.current++;

    // 更新数据
    this.setData({
      word_mean: wordMean,
      testResults,
      inputWord: ''
    }, () => {
      this.saveWordMeanToStorage();
      
      // 只有在答案正确时才立即继续下一题
      // 错误时等待用户查看正确答案后再继续
      if (isCorrect) {
        this.continueToNextWord();
      }
    });
  },

  // 继续下一个单词的方法
  continueToNextWord() {
    const { testResults } = this.data;
    // 检查是否完成测试
    if (testResults.current >= testResults.total) {
      this.finishTest();
    } else {
      // 继续下一个单词
      setTimeout(() => {
        this.setData({
          currentWordIndex: this.data.currentWordIndex + 1
        });
      }, 500);
    }
  },

  // 完成测试
  finishTest() {
    const { testResults, unitList, currentUnit } = this.data;
    console.log('测试完成时的 word_mean:', this.data.word_mean);
    const accuracy = ((testResults.correct / testResults.total) * 100).toFixed(1);
    
    // 创建测试记录
    const record = {
      id: Date.now(),
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      unit: unitList[currentUnit],
      total: testResults.total,
      correct: testResults.correct,
      wrong: testResults.wrong,
      accuracy: accuracy + '%'
    };

    // 更新测试记录
    const testRecords = [record, ...this.data.testRecords];
    
    this.setData({
      testRecords,
      isTesting: false
    });

    // 保存测试记录到本地存储
    wx.setStorageSync('testRecords', testRecords);

    // 显示测试结果
    wx.showModal({
      title: '测试完成',
      content: `总题数: ${testResults.total}\n正确: ${testResults.correct}\n错误: ${testResults.wrong}\n正确率: ${accuracy}%`,
      showCancel: false
    });
  },

  // 结束测试
  endTest() {
    wx.showModal({
      title: '确认结束',
      content: '确定要结束本次测试吗？',
      success: (res) => {
        if (res.confirm) {
          this.finishTest();
        }
      }
    });
  },

  // 添加处理整理页面单元选择的方法
  handleArrangeUnitChange(e) {
    const index = e.currentTarget.dataset.index;
    const unitIndex = parseInt(e.detail.value);
    
    const wordMean = [...this.data.word_mean];
    wordMean[index].unit = this.data.unitList[unitIndex];
    
    this.setData({
      word_mean: wordMean
    }, () => {
      this.saveWordMeanToStorage();
      console.log('修改单元后的 word_mean:', this.data.word_mean);
    });
  },

  // 添加键盘相关方法
  showKeyboard() {
    this.setData({
      showKeyboard: true
    });
  },

  hideKeyboard() {
    this.setData({
      showKeyboard: false
    });
  },

  handleKeyTap(e) {
    const letter = e.currentTarget.dataset.letter;
    const currentInput = this.data.inputWord;
    this.setData({
      inputWord: currentInput + (this.data.isUpperCase ? letter.toUpperCase() : letter)
    });
  },

  handleDelete() {
    const inputWord = this.data.inputWord;
    if (inputWord.length > 0) {
      this.setData({
        inputWord: inputWord.slice(0, -1)
      });
    }
  },

  handleKeyboardConfirm() {
    this.hideKeyboard();
    this.checkAnswer();
  },

  // 添加大小写切换方法
  toggleCase() {
    this.setData({
      isUpperCase: !this.data.isUpperCase
    });
  },

  // 添加空格输入方法
  handleSpace() {
    const currentInput = this.data.inputWord;
    this.setData({
      inputWord: currentInput + ' '
    });
  },

  // 添加编辑相关方法
  handleEdit(e) {
    const id = e.currentTarget.dataset.id;
    const word = this.data.word_mean.find(item => item.id === id);
    if (word) {
      this.setData({
        editingId: id,
        editWord: word.word,
        editMean: word.mean
      });
    }
  },

  // 处理编辑输入
  handleEditInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  // 保存编辑
  handleEditSave() {
    const { editingId, editWord, editMean, word_mean } = this.data;
    if (!editWord.trim() || !editMean.trim()) {
      wx.showToast({
        title: '单词和释义不能为空',
        icon: 'none'
      });
      return;
    }

    const updatedWordMean = word_mean.map(item => {
      if (item.id === editingId) {
        return {
          ...item,
          word: editWord.trim(),
          mean: editMean.trim()
        };
      }
      return item;
    });

    this.setData({
      word_mean: updatedWordMean,
      editingId: null,
      editWord: '',
      editMean: ''
    }, () => {
      this.saveWordMeanToStorage();
      wx.showToast({
        title: '修改成功',
        icon: 'success'
      });
    });
  },

  // 取消编辑
  handleEditCancel() {
    this.setData({
      editingId: null,
      editWord: '',
      editMean: ''
    });
  },

  // 导出数据到文件
  handleExport() {
    const wordList = wx.getStorageSync('word_mean') || [];
    // 将数据转换为固定格式
    let exportData = '单词学习小程序数据文件\n';
    exportData += '版本:1.0\n';
    exportData += '导出时间:' + new Date().toLocaleString() + '\n';
    exportData += '---BEGIN---\n';
    wordList.forEach(item => {
      exportData += `${item.word}|${item.mean}|${item.unit}|${item.rightTime || 0}|${item.wrongTime || 0}\n`;
    });
    exportData += '---END---\n';
    
    // 保存为文件
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/wordlist_${Date.now()}.txt`;
    
    fs.writeFile({
      filePath: filePath,
      data: exportData,
      encoding: 'utf8',
      success: () => {
        // 保存文件到本地
        wx.saveFile({
          tempFilePath: filePath,
          success: (res) => {
            wx.showModal({
              title: '导出成功',
              content: '文件已保存，可以分享给其他用户',
              confirmText: '分享文件',
              success: (res) => {
                if (res.confirm) {
                  wx.shareFileMessage({
                    filePath: filePath,
                    success: () => {
                      console.log('分享成功');
                    },
                    fail: (err) => {
                      console.error('分享失败:', err);
                    }
                  });
                }
              }
            });
          },
          fail: (err) => {
            console.error('保存文件失败:', err);
            wx.showToast({
              title: '导出失败',
              icon: 'error'
            });
          }
        });
      },
      fail: (err) => {
        console.error('写入文件失败:', err);
        wx.showToast({
          title: '导出失败',
          icon: 'error'
        });
      }
    });
  },

  // 导入数据文件
  handleImport() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['txt'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].path;
        const fs = wx.getFileSystemManager();
        
        fs.readFile({
          filePath: tempFilePath,
          encoding: 'utf8',
          success: (res) => {
            try {
              const lines = res.data.split('\n');
              // 验证文件格式
              if (lines[0].trim() !== '单词学习小程序数据文件' || 
                  !lines[1].startsWith('版本:') ||
                  !lines[2].startsWith('导出时间:') ||
                  lines[3].trim() !== '---BEGIN---') {
                throw new Error('文件格式不正确');
              }

              const newWords = [];
              let i = 4; // 跳过头部信息
              while (i < lines.length && lines[i].trim() !== '---END---') {
                const parts = lines[i].trim().split('|');
                if (parts.length === 5) {
                  newWords.push({
                    id: Date.now() + i.toString(), // 生成新的ID
                    word: parts[0],
                    mean: parts[1],
                    unit: parts[2],
                    rightTime: parseInt(parts[3]),
                    wrongTime: parseInt(parts[4])
                  });
                }
                i++;
              }

              if (newWords.length > 0) {
                wx.showModal({
                  title: '确认导入',
                  content: `发现 ${newWords.length} 个单词，是否导入？`,
                  success: (res) => {
                    if (res.confirm) {
                      // 合并现有数据
                      const existingWords = wx.getStorageSync('word_mean') || [];
                      const mergedWords = [...existingWords, ...newWords];
                      wx.setStorageSync('word_mean', mergedWords);
                      
                      // 刷新页面数据
                      this.loadWordMeanFromStorage();
                      
                      wx.showToast({
                        title: '导入成功',
                        icon: 'success'
                      });
                    }
                  }
                });
              }
            } catch (error) {
              wx.showToast({
                title: '文件格式错误',
                icon: 'error'
              });
            }
          },
          fail: (err) => {
            console.error('读取文件失败:', err);
            wx.showToast({
              title: '导入失败',
              icon: 'error'
            });
          }
        });
      }
    });
  },

  // 在 methods 中添加删除全部的方法
  handleDeleteAll() {
    wx.showModal({
      title: '警告',
      content: '确定要删除所有单词吗？此操作不可恢复！',
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          // 二次确认
          wx.showModal({
            title: '最后确认',
            content: '真的要删除所有单词吗？',
            confirmText: '确定删除',
            confirmColor: '#ff4d4f',
            success: (res) => {
              if (res.confirm) {
                // 清空数据
                this.setData({
                  word_mean: []
                }, () => {
                  this.saveWordMeanToStorage();
                  wx.showToast({
                    title: '已清空所有数据',
                    icon: 'success'
                  });
                });
              }
            }
          });
        }
      }
    });
  }
}) 