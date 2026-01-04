console.log("✅ SynapseMind service worker loaded");
let selectedText = "";
let currentTabId = null;
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ SynapseMind extension installed");
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "generateSynapseMind",
      title: "Generate with SynapseMind",
      contexts: ["selection"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error creating menu:", chrome.runtime.lastError);
      } else {
        console.log("✅ Context menu created");
      }
    });
  });
  chrome.storage.local.set({
    summaries: [],
    mindmaps: [],
    selectedText: "",
    tabId: null
  });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateSynapseMind" && info.selectionText) {
    console.log("📝 Text selected:", info.selectionText.substring(0, 100) + "...");
    selectedText = info.selectionText;
    currentTabId = tab.id;
    chrome.storage.local.set({
      selectedText: info.selectionText,
      tabId: tab.id,
      timestamp: Date.now()
    }, () => {
      console.log("💾 Text saved to storage");
      chrome.action.openPopup();
    });
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Message received:", request.type);
  switch (request.type) {
    case "GET_SELECTED_TEXT":
      sendResponse({
        success: true,
        text: selectedText,
        tabId: currentTabId
      });
      break;
    case "SAVE_SUMMARY":
      chrome.storage.local.get(["summaries"], (result) => {
        const summaries = result.summaries || [];
        summaries.push({
          text: request.data.text,
          summary: request.data.summary,
          level: request.data.level,
          timestamp: Date.now()
        });
        chrome.storage.local.set({ summaries });
        sendResponse({ success: true });
      });
      return true;
    case "SAVE_MINDMAP":
      chrome.storage.local.get(["mindmaps"], (result) => {
        const mindmaps = result.mindmaps || [];
        mindmaps.push({
          text: request.data.text,
          nodes: request.data.nodes,
          edges: request.data.edges,
          timestamp: Date.now()
        });
        chrome.storage.local.set({ mindmaps });
        sendResponse({ success: true });
      });
      return true;
    case "GET_HISTORY":
      chrome.storage.local.get(["summaries", "mindmaps"], (result) => {
        sendResponse({
          summaries: result.summaries || [],
          mindmaps: result.mindmaps || []
        });
      });
      return true;
    default:
      sendResponse({ success: false, error: "Unknown message type" });
  }
});
setInterval(() => {
  console.log("❤️ Service worker alive");
}, 6e4);
