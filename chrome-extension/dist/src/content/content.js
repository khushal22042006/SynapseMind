var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) =>
  function __require() {
    return (
      mod ||
        (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    );
  };
var require_content = __commonJS({
  "src/content/content.js"(exports, module) {
    console.log("🖱️ SynapseMind content script loaded - ULTIMATE FIX");
    let lastSelection = null;
    function captureSelection() {
      try {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (selectedText && selectedText.length > 10) {
          console.log(
            "📄 Text selected:",
            selectedText.substring(0, 100) + "..."
          );
          lastSelection = {
            text: selectedText,
            url: window.location.href,
            title: document.title,
            timestamp: Date.now(),
          };
          try {
            sessionStorage.setItem(
              "synapse_last_selection",
              JSON.stringify(lastSelection)
            );
          } catch (e) {}
          console.log("✅ Selection captured locally");
          tryToSaveToChrome(lastSelection);
        }
      } catch (error) {
        console.error("Selection capture error:", error);
      }
    }
    function tryToSaveToChrome(selectionData) {
      if (
        typeof chrome === "undefined" ||
        typeof chrome.runtime === "undefined"
      ) {
        console.log("⚠️ Chrome APIs not available");
        return;
      }
      try {
        if (chrome.runtime && chrome.runtime.id) {
          if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.set(
              {
                lastSelection: selectionData.text,
                selectionUrl: selectionData.url,
                selectionTitle: selectionData.title,
                timestamp: selectionData.timestamp,
              },
              () => {
                if (chrome.runtime.lastError) {
                  console.log(
                    "⚠️ Chrome storage error (non-critical):",
                    chrome.runtime.lastError.message
                  );
                } else {
                  console.log("✅ Also saved to Chrome storage");
                }
              }
            );
          }
        }
      } catch (chromeError) {
        console.log("⚠️ Chrome API error (non-critical):", chromeError.message);
      }
    }
    function setupMessageListener() {
      if (
        typeof chrome === "undefined" ||
        typeof chrome.runtime === "undefined"
      ) {
        console.log("⚠️ Chrome runtime not available for messages");
        return;
      }
      try {
        chrome.runtime.onMessage.addListener(
          (request, sender, sendResponse) => {
            console.log("📨 Message received:", request);
            const response = {
              success: true,
              text: lastSelection ? lastSelection.text : "",
              url: window.location.href,
              title: document.title,
              timestamp: Date.now(),
              fromCache: !!lastSelection,
            };
            if (request.type === "GET_CURRENT_SELECTION") {
              const selection = window.getSelection();
              const currentText = selection.toString().trim();
              if (currentText) {
                response.text = currentText;
                response.fromCache = false;
              }
            }
            try {
              sendResponse(response);
            } catch (responseError) {
              console.log("⚠️ Could not send response (non-critical)");
            }
            return true;
          }
        );
        console.log("✅ Message listener setup complete");
      } catch (error) {
        console.log(
          "⚠️ Could not setup message listener (non-critical):",
          error.message
        );
      }
    }
    try {
      document.addEventListener("mouseup", (event) => {
        setTimeout(captureSelection, 50);
      });
      console.log("✅ Event listener attached successfully");
    } catch (eventError) {
      console.error("❌ Could not attach event listener:", eventError);
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
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
    setupMessageListener();
    console.log("✅ SynapseMind initialized successfully");
    console.log("Current URL:", window.location.href);
    console.log("Document title:", document.title);
    if (typeof module !== "undefined") {
      module.exports = { captureSelection, lastSelection };
    }
  },
});
