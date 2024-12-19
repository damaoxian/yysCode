Page({
  data: {
    currentTab: 0  // 当前选中的标签页索引
  },

  // 切换标签页
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      currentTab: index
    })
  }
}) 