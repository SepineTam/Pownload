// 检查是否在文章详情页
if (document.getElementById('pdfDown')) {
  const pdfLink = document.getElementById('pdfDown').href;
  // 触发下载
  window.location.href = pdfLink;
} 