const urlInput = document.getElementById('urlInput');
const loadBtn = document.getElementById('loadBtn');
const iframe = document.getElementById('contentFrame');
const placeholder = document.getElementById('placeholder');
const errorDiv = document.getElementById('error');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const reloadBtn = document.getElementById('reloadBtn');
const homeBtn = document.getElementById('homeBtn');
const openInTabBtn = document.getElementById('openInTabBtn');
const quickLinks = document.querySelectorAll('.quick-link');

let history = [];
let currentIndex = -1;
let currentLoadingUrl = null; // Track current URL for "Open in Tab" functionality

// Check for pending URL from context menu (on initial load)
chrome.storage.local.get(['pendingUrl'], (result) => {
    if (result.pendingUrl) {
        urlInput.value = result.pendingUrl;
        addToHistory(result.pendingUrl);
        loadFrame(result.pendingUrl);
        // Clear the pending URL
        chrome.storage.local.remove('pendingUrl');
    }
});

// Listen for storage changes (when panel is already open)
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.pendingUrl && changes.pendingUrl.newValue) {
        const newUrl = changes.pendingUrl.newValue;
        urlInput.value = newUrl;
        addToHistory(newUrl);
        loadFrame(newUrl);
        // Clear the pending URL
        chrome.storage.local.remove('pendingUrl');
    }
});

// Event listeners
loadBtn.addEventListener('click', loadUrl);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // Ctrl/Cmd + Enter opens in new tab
        if (e.ctrlKey || e.metaKey) {
            const input = urlInput.value.trim();
            if (input) {
                chrome.tabs.create({ url: parseInput(input) });
            }
        } else {
            loadUrl();
        }
    }
});

// Select all text on focus for easy editing
urlInput.addEventListener('focus', () => {
    urlInput.select();
});

backBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        navigateToHistoryIndex();
    }
});

forwardBtn.addEventListener('click', () => {
    if (currentIndex < history.length - 1) {
        currentIndex++;
        navigateToHistoryIndex();
    }
});

reloadBtn.addEventListener('click', () => {
    if (!iframe.classList.contains('hidden')) {
        iframe.src = iframe.src;
    }
});

homeBtn.addEventListener('click', () => {
    goHome();
});

openInTabBtn.addEventListener('click', () => {
    if (currentLoadingUrl) {
        chrome.tabs.create({ url: currentLoadingUrl });
    }
});

// Quick links
quickLinks.forEach(link => {
    link.addEventListener('click', () => {
        const url = link.dataset.url;
        urlInput.value = url;
        addToHistory(url);
        loadFrame(url);
    });
});

function loadUrl() {
    const input = urlInput.value.trim();
    hideError();

    if (!input) {
        showError('Please enter a URL or search query');
        return;
    }

    const finalUrl = parseInput(input);
    addToHistory(finalUrl);
    loadFrame(finalUrl);
    urlInput.value = finalUrl;
}

function parseInput(input) {
    // Check if wrapped in parentheses like (github.com)
    const parenMatch = input.match(/^\((.+)\)$/);
    if (parenMatch) {
        input = parenMatch[1];
    }

    // Check if it contains spaces - search using Google with igu=1 for iframe support
    if (input.includes(' ')) {
        return `https://www.google.com/search?igu=1&q=${encodeURIComponent(input)}`;
    }

    // Check if it looks like a URL (contains a dot and no spaces)
    const looksLikeUrl = /^[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+(\/.*)?$/.test(input) ||
        input.startsWith('http://') ||
        input.startsWith('https://');

    if (looksLikeUrl) {
        // Add https:// if missing
        if (!input.startsWith('http://') && !input.startsWith('https://')) {
            return 'https://' + input;
        }
        return input;
    }

    // Single word without dots - search using Google with igu=1
    return `https://www.google.com/search?igu=1&q=${encodeURIComponent(input)}`;
}

function addToHistory(url) {
    // Remove any forward history if we're not at the end
    history = history.slice(0, currentIndex + 1);
    history.push(url);
    currentIndex = history.length - 1;
    updateNavButtons();
}

function navigateToHistoryIndex() {
    if (currentIndex >= 0 && currentIndex < history.length) {
        loadFrame(history[currentIndex]);
        urlInput.value = history[currentIndex];
    }
    updateNavButtons();
}

// List of known sites that block iframes
const BLOCKED_SITES = [
    'bing.com',
    'github.com',
    'youtube.com',
    'twitter.com',
    'x.com',
    'facebook.com',
    'instagram.com',
    'linkedin.com',
    'reddit.com',
    'amazon.com',
    'netflix.com',
    'microsoft.com',
    'apple.com',
    'stackoverflow.com',
    'duckduckgo.com',
    'news.ycombinator.com',
    'dev.to',
    'medium.com',
    'notion.so',
    'discord.com',
    'slack.com',
    'twitch.tv',
    'paypal.com',
    'ebay.com',
    'dropbox.com',
    'spotify.com'
];

function isBlockedSite(url) {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        return BLOCKED_SITES.some(site =>
            hostname === site || hostname.endsWith('.' + site)
        );
    } catch {
        return false;
    }
}

function loadFrame(url) {
    currentLoadingUrl = url; // Store URL for "Open in Tab" button
    updateNavButtons();

    if (isBlockedSite(url)) {
        showBlockedMessage(url);
        return;
    }

    // Show loading state
    iframe.style.opacity = '0.5';
    iframe.src = url;
    iframe.classList.remove('hidden');
    placeholder.classList.add('hidden');

    // Remove loading state when loaded
    iframe.onload = () => {
        iframe.style.opacity = '1';
    };

    // Listen for load errors (though CSP errors don't always trigger this)
    iframe.onerror = () => {
        iframe.style.opacity = '1';
        showBlockedMessage(url);
    };
}

function showBlockedMessage(url) {
    iframe.classList.add('hidden');
    placeholder.classList.remove('hidden');

    // Update placeholder to show blocked message
    const placeholderTitle = placeholder.querySelector('.placeholder-title');
    const placeholderSubtitle = placeholder.querySelector('.placeholder-subtitle');
    const quickLinksContainer = placeholder.querySelector('.quick-links');

    if (placeholderTitle) {
        placeholderTitle.textContent = 'Site cannot be embedded';
    }
    if (placeholderSubtitle) {
        placeholderSubtitle.innerHTML = `<strong>${new URL(url).hostname}</strong> blocks embedding in iframes for security reasons.`;
    }
    if (quickLinksContainer) {
        quickLinksContainer.innerHTML = `
            <button class="quick-link gradient-btn" id="blockedOpenInTabBtn">Open in New Tab</button>
            <button class="quick-link" id="goHomeBtn">Go Home</button>
        `;

        document.getElementById('blockedOpenInTabBtn').addEventListener('click', () => {
            chrome.tabs.create({ url: url });
        });

        document.getElementById('goHomeBtn').addEventListener('click', () => {
            resetPlaceholder();
            goHome();
        });
    }
}

function resetPlaceholder() {
    const placeholderTitle = placeholder.querySelector('.placeholder-title');
    const placeholderSubtitle = placeholder.querySelector('.placeholder-subtitle');
    const quickLinksContainer = placeholder.querySelector('.quick-links');

    if (placeholderTitle) {
        placeholderTitle.textContent = 'Ready to explore';
    }
    if (placeholderSubtitle) {
        placeholderSubtitle.textContent = 'Enter a URL or search query to search Google';
    }
    if (quickLinksContainer) {
        quickLinksContainer.innerHTML = `
            <button class="quick-link" data-url="https://www.google.com/search?igu=1">Google</button>
            <button class="quick-link" data-url="https://en.wikipedia.org">Wikipedia</button>
        `;

        // Re-attach quick link listeners
        document.querySelectorAll('.quick-link[data-url]').forEach(link => {
            link.addEventListener('click', () => {
                const url = link.dataset.url;
                urlInput.value = url;
                addToHistory(url);
                loadFrame(url);
            });
        });
    }
}

function goHome() {
    iframe.src = '';
    iframe.classList.add('hidden');
    placeholder.classList.remove('hidden');
    urlInput.value = '';
    history = [];
    currentIndex = -1;
    currentLoadingUrl = null;
    updateNavButtons();
}

function updateNavButtons() {
    backBtn.disabled = currentIndex <= 0;
    forwardBtn.disabled = currentIndex >= history.length - 1;
    reloadBtn.disabled = iframe.classList.contains('hidden');
    openInTabBtn.disabled = !currentLoadingUrl;
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    errorDiv.classList.add('error-show');
}

function hideError() {
    errorDiv.textContent = '';
    errorDiv.classList.add('hidden');
    errorDiv.classList.remove('error-show');
}