// 跟踪打开的静默标签页
const silentTabs = new Map();
const tabDownloadStatus = new Map();

// CNKI文章处理超时时间(毫秒)
const CNKI_TAB_TIMEOUT = 30000; // 增加到30秒，给足够时间下载

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 处理静默标签页下载请求 (新方法)
  if (request.action === 'openSilentTabAndDownload') {
    console.log(`开始处理文章 ${request.index}/${request.total}: ${request.title}`);
    
    // 创建新标签页，但不激活它
    chrome.tabs.create({
      url: request.url,
      active: false // 关键设置：不激活标签页，保持在后台
    }, tab => {
      console.log(`创建后台标签页: ${tab.id} 用于文章: ${request.title}`);
      
      // 记录标签页信息
      silentTabs.set(tab.id, {
        url: request.url,
        title: request.title,
        index: request.index,
        total: request.total,
        createdAt: Date.now()
      });
      
      // 设置下载状态
      tabDownloadStatus.set(tab.id, {
        attempted: false,
        success: false,
        error: null,
        closeScheduled: false
      });
      
      // 增加超时时间，给下载足够的启动时间
      setTimeout(() => {
        try {
          if (silentTabs.has(tab.id)) {
            const status = tabDownloadStatus.get(tab.id);
            if (status.closeScheduled) {
              console.log(`标签页 ${tab.id} 已计划关闭，跳过超时处理`);
              return;
            }
            
            console.log(`标签页 ${tab.id} 超时，准备关闭，下载状态:`, status);
            
            // 检查下载状态，如果没有尝试下载，尝试一次最后的下载
            if (!status.attempted) {
              console.log(`标签页 ${tab.id} 尚未尝试下载，尝试最后一次下载`);
              chrome.tabs.sendMessage(tab.id, {
                action: 'executeDownload',
                isLastChance: true
              }, response => {
                console.log(`标签页 ${tab.id} 最后一次下载尝试结果:`, response);
                
                // 不管结果如何，都在5秒后关闭标签页
                setTimeout(() => {
                  scheduleTabClose(tab.id, status, sendResponse, request);
                }, 5000);
              });
            } else {
              // 已经尝试过下载，直接关闭
              scheduleTabClose(tab.id, status, sendResponse, request);
            }
          }
        } catch (err) {
          console.error(`处理标签页 ${tab.id} 时出错:`, err);
          sendResponse({success: false, error: err.message});
        }
      }, CNKI_TAB_TIMEOUT); // 使用更长的超时时间
    });
    
    return true; // 异步响应
  }
  
  // 处理下载文件请求（保留兼容）
  if (request.action === 'downloadFile') {
    console.log('收到下载请求:', request.url);
    
    // 使用chrome.downloads API下载文件
    chrome.downloads.download({
      url: request.url,
      filename: request.filename || '',
      saveAs: false, // 不显示另存为对话框，直接保存
      conflictAction: 'uniquify' // 自动重命名文件以避免冲突
    }, downloadId => {
      if (chrome.runtime.lastError) {
        console.error('下载失败:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('下载已开始, ID:', downloadId);
        sendResponse({ success: true, downloadId: downloadId });
        
        // 监听下载完成
        chrome.downloads.onChanged.addListener(function downloadListener(delta) {
          if (delta.id === downloadId && delta.state) {
            if (delta.state.current === 'complete') {
              console.log(`下载 ${downloadId} 已完成`);
              // 移除监听器
              chrome.downloads.onChanged.removeListener(downloadListener);
            } else if (delta.state.current === 'interrupted') {
              console.log(`下载 ${downloadId} 被中断`);
              // 移除监听器
              chrome.downloads.onChanged.removeListener(downloadListener);
            }
          }
        });
      }
    });
    
    return true; // 异步响应
  }
  
  // 处理下载状态上报
  if (request.action === 'reportDownloadStatus') {
    const tabId = sender.tab.id;
    console.log(`标签页 ${tabId} 报告下载状态:`, request.success);
    
    if (tabDownloadStatus.has(tabId)) {
      const status = tabDownloadStatus.get(tabId);
      status.attempted = true;
      status.success = request.success;
      status.error = request.error || null;
      
      // 如果下载成功，安排15秒后关闭标签页
      if (request.success && !status.closeScheduled) {
        console.log(`下载成功，安排15秒后关闭标签页 ${tabId}`);
        status.closeScheduled = true;
        setTimeout(() => {
          closeTab(tabId, status, () => {}, { title: silentTabs.get(tabId)?.title || 'unknown' });
        }, 15000); // 下载成功后等待15秒再关闭
      }
      
      tabDownloadStatus.set(tabId, status);
    }
    
    sendResponse({received: true});
    return true;
  }
});

// 安排关闭标签页
function scheduleTabClose(tabId, status, sendResponse, request) {
  if (status.closeScheduled) {
    console.log(`标签页 ${tabId} 已经安排关闭，跳过`);
    return;
  }
  
  console.log(`安排关闭标签页 ${tabId}`);
  status.closeScheduled = true;
  tabDownloadStatus.set(tabId, status);
  
  setTimeout(() => {
    closeTab(tabId, status, sendResponse, request);
  }, 5000); // 再等5秒关闭
}

// 关闭标签页的函数
function closeTab(tabId, status, sendResponse, request) {
  if (!silentTabs.has(tabId)) {
    console.log(`标签页 ${tabId} 已不存在，无需关闭`);
    return;
  }
  
  chrome.tabs.get(tabId, tab => {
    if (chrome.runtime.lastError) {
      console.log(`标签页 ${tabId} 不存在或已关闭:`, chrome.runtime.lastError.message);
      silentTabs.delete(tabId);
      tabDownloadStatus.delete(tabId);
      return;
    }
    
    chrome.tabs.remove(tabId, () => {
      console.log(`标签页 ${tabId} 已关闭`);
      silentTabs.delete(tabId);
      tabDownloadStatus.delete(tabId);
      
      // 发送结果
      if (typeof sendResponse === 'function') {
        sendResponse({
          success: status && status.success,
          error: status && status.error,
          title: request.title,
          index: request.index
        });
      }
    });
  });
}

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 检查这个标签页是否是我们的静默标签页
  if (silentTabs.has(tabId) && changeInfo.status === 'complete') {
    const tabInfo = silentTabs.get(tabId);
    console.log(`静默标签页 ${tabId} 已加载完成: ${tabInfo.title}`);
    
    // 等待一段时间让页面加载完成
    setTimeout(() => {
      // 检查标签页是否已关闭
      chrome.tabs.get(tabId, tab => {
        if (chrome.runtime.lastError) {
          console.log(`标签页 ${tabId} 不存在或已关闭:`, chrome.runtime.lastError.message);
          return;
        }
        
        // 尝试执行下载操作
        chrome.tabs.sendMessage(tabId, {
          action: 'executeDownload'
        }, response => {
          console.log(`标签页 ${tabId} 执行下载结果:`, response);
          
          if (tabDownloadStatus.has(tabId)) {
            const status = tabDownloadStatus.get(tabId);
            
            if (response) {
              status.attempted = true;
              status.success = response.success;
              status.error = response.error || null;
              
              // 如果下载成功，安排15秒后关闭标签页
              if (response.success && !status.closeScheduled) {
                console.log(`下载成功，安排15秒后关闭标签页 ${tabId}`);
                status.closeScheduled = true;
                setTimeout(() => {
                  closeTab(tabId, status, () => {}, { title: tabInfo.title });
                }, 15000); // 下载成功后等待15秒再关闭
              }
            } else {
              status.attempted = true;
              status.success = false;
              status.error = 'content script无响应';
            }
            
            tabDownloadStatus.set(tabId, status);
          }
        });
      });
    }, 4000); // 增加到4秒，给页面更多时间加载
  }
});

// 监听标签页关闭事件
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (silentTabs.has(tabId)) {
    console.log(`标签页 ${tabId} 已被关闭`);
    silentTabs.delete(tabId);
    tabDownloadStatus.delete(tabId);
  }
}); 