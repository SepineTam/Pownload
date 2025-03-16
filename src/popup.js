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
  
  // 添加后台下载选项
  const bgDownloadDiv = document.createElement('div');
  bgDownloadDiv.style.marginBottom = '10px';
  
  const bgDownloadLabel = document.createElement('label');
  bgDownloadLabel.textContent = '启用后台下载: ';
  
  const bgDownloadCheckbox = document.createElement('input');
  bgDownloadCheckbox.type = 'checkbox';
  bgDownloadCheckbox.checked = true;
  
  bgDownloadDiv.appendChild(bgDownloadLabel);
  bgDownloadDiv.appendChild(bgDownloadCheckbox);
  
  // 将控制界面插入到开始按钮之前
  const startButton = document.getElementById('startDownload');
  startButton.parentNode.insertBefore(controlDiv, startButton);
  startButton.parentNode.insertBefore(bgDownloadDiv, startButton);
  
  // 修改点击事件处理
  startButton.addEventListener('click', async () => {
    const pauseDuration = parseFloat(pauseDurationInput.value) * 1000; // 转换为毫秒
    const useBgDownload = bgDownloadCheckbox.checked; // 获取是否启用后台下载
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 注入下载脚本并传递参数
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: startDownload,
      args: [pauseDuration, useBgDownload]  // 传递暂停时长和是否后台下载
    });

    // 更新状态显示
    const status = document.getElementById('status');
    status.textContent = '开始下载...';
  });
});

// 修改注入函数以接收参数
function startDownload(pauseDuration, useBgDownload) {
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
      const title = article.textContent.trim();
      
      console.log(`处理第 ${i + 1}/${articles.length} 篇文章: ${title}`);
      
      // 使用用户设定的暂停时长
      await sleep(pauseDuration);
      
      if (useBgDownload) {
        // 使用后台下载模式
        chrome.runtime.sendMessage({
          action: 'openSilentTabAndDownload',
          url: url,
          title: title,
          index: i + 1,
          total: articles.length
        }, response => {
          console.log(`文章 ${i+1} 下载结果:`, response);
        });
      } else {
        // 传统模式：打开新页面
        window.open(url, '_blank');
      }
    }
  }

  // 执行下载过程
  processDownloads().catch(err => console.error('下载过程出错:', err));
} 