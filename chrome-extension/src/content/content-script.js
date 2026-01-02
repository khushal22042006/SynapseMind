console.log("🖱️ SynapseMind content script loaded - ULTIMATE FIX");

// ============================================
// PART 1: Basic selection capture (ALWAYS WORKS)
// ============================================

// This part works WITHOUT any Chrome APIs
let lastSelection = null;

function captureSelection() {
  try {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText && selectedText.length > 10) {
      console.log("📄 Text selected:", selectedText.substring(0, 100) + "...");
      
      // Store locally (always works)
      lastSelection = {
        text: selectedText,
        url: window.location.href,
        title: document.title,
        timestamp: Date.now()
      };
      
      // Also store in sessionStorage for persistence
      try {
        sessionStorage.setItem('synapse_last_selection', JSON.stringify(lastSelection));
      } catch (e) {
        // Ignore if sessionStorage fails
      }
      
      console.log("✅ Selection captured locally");
      
      // Try to save to Chrome storage IF available
      tryToSaveToChrome(lastSelection);
    }
  } catch (error) {
    console.error("Selection capture error:", error);
  }
}

// ============================================
// PART 2: Chrome API handling (OPTIONAL)
// ============================================

function tryToSaveToChrome(selectionData) {
  // Check if Chrome APIs might be available
  if (typeof chrome === 'undefined' || typeof chrome.runtime === 'undefined') {
    console.log("⚠️ Chrome APIs not available");
    return;
  }
  
  // Use a try-catch to avoid any errors
  try {
    // Very careful check
    if (chrome.runtime && chrome.runtime.id) {
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          lastSelection: selectionData.text,
          selectionUrl: selectionData.url,
          selectionTitle: selectionData.title,
          timestamp: selectionData.timestamp
        }, () => {
          if (chrome.runtime.lastError) {
            console.log("⚠️ Chrome storage error (non-critical):", chrome.runtime.lastError.message);
          } else {
            console.log("✅ Also saved to Chrome storage");
          }
        });
      }
    }
  } catch (chromeError) {
    console.log("⚠️ Chrome API error (non-critical):", chromeError.message);
    // DO NOT THROW - just ignore and continue
  }
}

// ============================================
// PART 3: Message handling (with fallbacks)
// ============================================

function setupMessageListener() {
  if (typeof chrome === 'undefined' || typeof chrome.runtime === 'undefined') {
    console.log("⚠️ Chrome runtime not available for messages");
    return;
  }
  
  try {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("📨 Message received:", request);
      
      // Create response
      const response = {
        success: true,
        text: lastSelection ? lastSelection.text : '',
        url: window.location.href,
        title: document.title,
        timestamp: Date.now(),
        fromCache: !!lastSelection
      };
      
      // For GET_CURRENT_SELECTION requests
      if (request.type === "GET_CURRENT_SELECTION") {
        const selection = window.getSelection();
        const currentText = selection.toString().trim();
        
        if (currentText) {
          response.text = currentText;
          response.fromCache = false;
        }
      }
      
      // Try to send response, but don't crash if it fails
      try {
        sendResponse(response);
      } catch (responseError) {
        console.log("⚠️ Could not send response (non-critical)");
      }
      
      return true; // Keep channel open for async
    });
    
    console.log("✅ Message listener setup complete");
  } catch (error) {
    console.log("⚠️ Could not setup message listener (non-critical):", error.message);
  }
}

// ============================================
// PART 4: Event listener setup
// ============================================

// This is the CRITICAL PART - we wrap everything in a try-catch
try {
  document.addEventListener("mouseup", (event) => {
    // Small delay to ensure selection is captured
    setTimeout(captureSelection, 50);
  });
  
  console.log("✅ Event listener attached successfully");
} catch (eventError) {
  console.error("❌ Could not attach event listener:", eventError);
  
  // Fallback: try a different approach
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        document.addEventListener("mouseup", (event) => {
          setTimeout(captureSelection, 50);
        });
      } catch (e) {
        console.error("❌ Even fallback failed");
      }
    });
  }
}

// ============================================
// PART 5: Initialize
// ============================================

// Set up message listener (if possible)
setupMessageListener();

// Test that basic functionality works
console.log("✅ SynapseMind initialized successfully");
console.log("Current URL:", window.location.href);
console.log("Document title:", document.title);

// Export for testing (if needed)
if (typeof module !== 'undefined') {
  module.exports = { captureSelection, lastSelection };
}