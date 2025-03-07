document.getElementById('startDownload').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // 将下载逻辑注入到页面中执行
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: startDownload
  });

  // 更新popup中的状态显示
  const status = document.getElementById('status');
  status.textContent = '开始下载...';
});

// 注入到页面中执行的函数
function startDownload() {
  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function processDownloads() {
    // 获取所有文章链接
    const articles = Array.from(document.querySelectorAll('#rightCataloglist .row .name a'));
    
    console.log(`找到 ${articles.length} 篇文章`); // 调试日志
    
    for(let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const url = article.href;
      
      console.log(`处理第 ${i + 1} 篇文章: ${url}`); // 调试日志
      
      // 每下载两篇文章添加1-3秒的随机延迟
      if(i > 0 && i % 2 === 0) {
        const delay = Math.floor(Math.random() * 2000) + 1000;
        await sleep(delay);
      }
      
      // 打开新页面
      window.open(url, '_blank');
    }
  }

  // 执行下载过程
  processDownloads().catch(err => console.error('下载过程出错:', err));
} 