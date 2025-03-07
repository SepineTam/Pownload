document.getElementById('startDownload').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: startDownload
  });
});

function startDownload() {
  // 获取所有文章链接
  const articles = document.querySelectorAll('#rightCataloglist .row .name a');
  
  articles.forEach(async (article) => {
    const url = article.href;
    // 打开每篇文章页面
    window.open(url, '_blank');
  });
} 