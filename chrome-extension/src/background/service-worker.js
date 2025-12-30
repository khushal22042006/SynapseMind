// chrome-extension/src/background/service-worker.js - Basic service worker
console.log("SynapseMind service worker loaded");

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("SynapseMind extension installed");
  
  // Create context menu item
  chrome.contextMenus.create({
    id: "generateSynapseMind",
    title: "Generate with SynapseMind",
    contexts: ["selection"]
  });
  
  // Initialize storage
  chrome.storage.local.set({ summaries: [], mindmaps: [] });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateSynapseMind" && info.selectionText) {
    // Send selected text to popup
    chrome.storage.local.set({ 
      selectedText: info.selectionText,
      tabId: tab.id 
    });
    
    // Open popup
    chrome.action.openPopup();
  }
});

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);
  
  if (request.type === "GET_SELECTED_TEXT") {
    chrome.storage.local.get(["selectedText"], (result) => {
      sendResponse({ text: result.selectedText || "" });
    });
    return true; // Required for async response
  }
});