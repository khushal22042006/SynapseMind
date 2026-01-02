// chrome-extension/src/content/content-script.js
console.log("🖱️ SynapseMind content script loaded");

// Add selection listener
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText && selectedText.length > 10) {
    console.log("📄 Text selected:", selectedText.substring(0, 100) + "...");
    
    // Store in local storage for quick access
    chrome.storage.local.set({ 
      lastSelection: selectedText,
      selectionUrl: window.location.href,
      selectionTitle: document.title
    });
  }
});

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_CURRENT_SELECTION") {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    sendResponse({
      success: true,
      text: selectedText,
      url: window.location.href,
      title: document.title
    });
  }
  
  if (request.type === "HIGHLIGHT_TEXT") {
    // Optional: Add highlighting functionality
    // This can be implemented later if needed
  }
  
  return true;
});

// Add subtle selection indicator
document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText && selectedText.length > 20) {
    // Add a subtle visual indicator
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Can add floating button or tooltip here (for future enhancement)
  }
});