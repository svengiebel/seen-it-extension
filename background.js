// Listener for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // Get the currently active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
      const activeTab = activeTabs[0];
      if (activeTab.url.includes("www.immobilienscout24.de")) {
        if (tabId === activeTab.id) {
          // Send a message to the content script
          chrome.tabs.sendMessage(tabId, {
            type: "URL_CHANGED",
            url: changeInfo.url,
          });
        }
      }
    });
  }
});
