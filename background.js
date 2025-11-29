chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'openInSideKick',
        title: 'Open in SideKick',
        contexts: ['link']
    });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openInSideKick' && info.linkUrl) {
        // Store the URL to be opened
        chrome.storage.local.set({ pendingUrl: info.linkUrl });

        // Open the side panel
        chrome.sidePanel.open({ tabId: tab.id });
    }
});