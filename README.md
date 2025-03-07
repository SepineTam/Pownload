<div align="center">

# Pownload

</div>

[![en](https://img.shields.io/badge/lang-English-red.svg)](README.md)
[![cn](https://img.shields.io/badge/语言-中文-yellow.svg)](docs/README/cn/README.md)
![Version](https://img.shields.io/badge/version-0.0.2-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
[![Chrome](https://img.shields.io/badge/Chrome-88+-green.svg)](#)

> A Chrome extension for batch downloading academic papers from CNKI (China National Knowledge Infrastructure).

---

## 🎯 Features

- 📚 Batch download PDF papers from CNKI journal catalog pages
- 🤖 Auto-detect and trigger downloads with random delays
- 📰 Support journals like Economic Research Journal (经济研究)
- 🛡️ Smart delay mechanism to avoid server restrictions
- 📊 Progress tracking and status display
- 🎨 Clean and simple user interface

## 🚀 Installation

1. Clone this repository or download the latest release
```bash
git clone https://github.com/sepinetam/pownload.git
```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `src` directory

## 📖 Usage

1. Visit a CNKI journal catalog page
2. Click the Pownload extension icon
3. Click "Start Download" in the popup
4. Wait for the downloads to complete

## 👨‍💻 Development

### Prerequisites

- Chrome Browser (88+)
- Git

### Project Structure

```bash
pownload/
├── src/                # Source code
│   ├── manifest.json   # Extension manifest
│   ├── popup.html     # Popup interface
│   ├── popup.js       # Popup logic
│   ├── content.js     # Content script
│   └── img/           # Images and icons
│       └── icons.svg  # Extension icon
├── docs/              # Documentation
│   └── README/        # Multi-language documentation
│       └── cn/        # Chinese documentation
└── README.md          # Main readme
```

### Technical Stack

- Chrome Extension Manifest V3
- Vanilla JavaScript
- SVG Icons

## 🗺️ Roadmap

- [ ] Add support for more CNKI journals
- [ ] Implement download progress tracking
- [ ] Add download history
- [ ] Support batch size configuration
- [ ] Add download resume capability
- [ ] Support more file formats (CAJ, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Copyright © 2025 [Sepine Tam](https://github.com/sepinetam).<br />
This project is [MIT](LICENSE) licensed.

## ⚠️ Disclaimer

This tool is for academic research purposes only. Please respect CNKI's terms of service and use responsibly.
