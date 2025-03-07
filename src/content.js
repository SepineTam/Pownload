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

// 修改消息监听器
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "start") {
        // 使用接收到的暂停时长
        const pauseDuration = request.pauseDuration || 100; // 默认值为100毫秒
        
        // 在处理每个元素时使用该暂停时长
        async function processElements() {
            // ... existing code ...
            
            for (let element of elements) {
                // ... existing code ...
                
                // 使用设定的暂停时长
                await new Promise(resolve => setTimeout(resolve, pauseDuration));
                
                // ... existing code ...
            }
        }
        
        processElements();
    }
}); 