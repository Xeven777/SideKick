# ⚡ SideKick

A sleek Chrome extension that lets you browse websites in a side panel alongside your current page.

![SideKick](icons/icon128.png)

## ✨ Features

- **Side Panel Browser** - View any website in a convenient side panel without leaving your current tab
- **Smart URL Parsing** - Enter URLs directly or search Google automatically
- **Navigation Controls** - Back, forward, and reload buttons for seamless browsing
- **Quick Links** - One-click access to Google and Wikipedia
- **Open in New Tab** - Easily open the current page in a full browser tab
- **Fullscreen Mode** - Expand the side panel for a better viewing experience
- **AI Assistant** - Quick access to Cerebras AI for instant help
- **Context Menu Integration** - Right-click any link to open it in SideKick
- **Beautiful UI** - Modern glass-morphism design with smooth animations

## 🚀 Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked** and select the SideKick folder
5. Click the SideKick icon in your toolbar to open the side panel

## 🎯 Usage

### Opening URLs

- Type a URL in the search bar and press Enter
- Type a search query to search Google
- Use `Ctrl/Cmd + Enter` to open in a new tab instead

### Navigation

- Use the back/forward arrows to navigate history
- Click the reload button to refresh the current page
- Click the home button to return to the start screen

### Quick Actions

- **✨ Sparkle Button** - Opens Cerebras AI assistant
- **🏠 Home** - Returns to the welcome screen
- **↗️ Open in Tab** - Opens current page in a new browser tab
- **⛶ Fullscreen** - Toggles fullscreen mode (press Escape to exit)

### Context Menu

Right-click any link on a webpage and select **"Open in SideKick"** to load it in the side panel.

## 🛠️ Tech Stack

- HTML5, CSS3, JavaScript
- Chrome Extensions Manifest V3
- Chrome Side Panel API

## 📁 Project Structure

```
SideKick/
├── manifest.json      # Extension configuration
├── background.js      # Service worker for context menu
├── panel.html         # Side panel UI
├── panel.js           # Side panel logic
├── styles.css         # Styles with glass-morphism design
├── icons/             # Extension icons (PNG)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## ⚠️ Limitations

Some websites block being loaded in iframes due to security policies (X-Frame-Options). These include:

- GitHub, YouTube, Twitter/X
- Facebook, Instagram, LinkedIn
- Reddit, Amazon, Netflix
- And many more...

For these sites, use the **"Open in New Tab"** button to view them in a full browser tab.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Made with 💜 by [Xeven777](https://github.com/Xeven777)
