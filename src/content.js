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
      
      // 不再使用window.location跳转，而是发送消息给background.js进行后台下载
      chrome.runtime.sendMessage({
        action: 'downloadFile',
        url: pdfLink,
        filename: document.title.replace(/[\\/:*?"<>|]/g, '_') + '.pdf' // 使用当前页面标题作为文件名
      }, response => {
        console.log('下载响应:', response);
        // 向页面通知下载状态
        if (response && response.success) {
          chrome.runtime.sendMessage({
            action: 'reportDownloadStatus',
            success: true
          });
        } else {
          chrome.runtime.sendMessage({
            action: 'reportDownloadStatus',
            success: false,
            error: response?.error || '未知错误'
          });
        }
      });
    } catch (err) {
      console.error('下载过程出错:', err);
      chrome.runtime.sendMessage({
        action: 'reportDownloadStatus',
        success: false,
        error: err.message
      });
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
    } else if (request.action === "executeDownload") {
        // 执行下载操作
        downloadWithDelay().then(() => {
            sendResponse({success: true});
        }).catch(err => {
            console.error('执行下载时出错:', err);
            sendResponse({success: false, error: err.message});
        });
        return true; // 异步响应
    }
}); 