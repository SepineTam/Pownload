document.addEventListener('DOMContentLoaded', function() {
  // 创建暂停时长控制界面
  const controlDiv = document.createElement('div');
  controlDiv.style.marginBottom = '10px';
  
  const pauseLabel = document.createElement('label');
  pauseLabel.textContent = '暂停时长(秒): ';
  
  const pauseDurationInput = document.createElement('input');
  pauseDurationInput.type = 'number';
  pauseDurationInput.min = '0.1';
  pauseDurationInput.step = '0.1';
  pauseDurationInput.value = '0.1';
  pauseDurationInput.style.width = '60px';
  
  controlDiv.appendChild(pauseLabel);
  controlDiv.appendChild(pauseDurationInput);
  
  // 将控制界面插入到开始按钮之前
  const startButton = document.getElementById('startDownload');
  startButton.parentNode.insertBefore(controlDiv, startButton);
  
  // 修改点击事件处理
  startButton.addEventListener('click', async () => {
    const pauseDuration = parseFloat(pauseDurationInput.value) * 1000; // 转换为毫秒
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 注入下载脚本并传递暂停时长
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: startDownload,
      args: [pauseDuration]  // 将暂停时长作为参数传递
    });

    // 更新状态显示
    const status = document.getElementById('status');
    status.textContent = '开始下载...';
  });
});

// 修改注入函数以接收暂停时长参数
function startDownload(pauseDuration) {
  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function processDownloads() {
    // 获取所有文章链接
    const articles = Array.from(document.querySelectorAll('#rightCataloglist .row .name a'));
    
    console.log(`找到 ${articles.length} 篇文章`);
    
    for(let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const url = article.href;
      
      console.log(`处理第 ${i + 1} 篇文章: ${url}`);
      
      // 使用用户设定的暂停时长
      await sleep(pauseDuration);
      
      // 打开新页面
      window.open(url, '_blank');
    }
  }

  // 执行下载过程
  processDownloads().catch(err => console.error('下载过程出错:', err));
} 