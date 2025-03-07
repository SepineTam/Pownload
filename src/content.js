async function downloadWithDelay() {
  // 检查是否在文章详情页
  const pdfDownBtn = document.getElementById('pdfDown');
  if (pdfDownBtn) {
    console.log('找到PDF下载按钮'); // 调试日志
    
    try {
      // 添加0.5-1.5秒的随机延迟
      const delay = Math.floor(Math.random() * 1000) + 500;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const pdfLink = pdfDownBtn.href;
      console.log('准备下载:', pdfLink); // 调试日志
      
      // 触发下载
      window.location.href = pdfLink;
    } catch (err) {
      console.error('下载过程出错:', err);
    }
  }
}

// 确保页面完全加载后再执行
if (document.readyState === 'complete') {
  downloadWithDelay();
} else {
  window.addEventListener('load', downloadWithDelay);
} 