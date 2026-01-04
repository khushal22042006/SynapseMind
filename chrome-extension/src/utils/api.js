// chrome-extension/src/utils/api.js - COMPLETE FIXED VERSION
const API_BASE_URL = 'http://localhost:8000'; // Your backend URL

// ============================================
// TEXT SELECTION FUNCTIONS
// ============================================

/**
 * Get selected text from content script (FIXED VERSION)
 */
export const getSelectedText = async () => {
  return new Promise((resolve, reject) => {
    console.log("🔍 Getting selected text...");
    
    // FIRST: Check storage immediately (fastest)
    chrome.storage.local.get([
      "lastSelection",
      "contextMenuSelection", 
      "selectionText",
      "synapseSelection"
    ], (storageResult) => {
      console.log("📦 Storage check result:", Object.keys(storageResult));
      
      // Check all possible storage keys
      const possibleKeys = [
        "contextMenuSelection",  // From right-click (most reliable)
        "lastSelection",         // From content script
        "selectionText",         // Alternative key
        "synapseSelection"       // Backup key
      ];
      
      for (const key of possibleKeys) {
        const text = storageResult[key];
        if (text && text.trim().length > 10) {
          console.log(`✅ Found text in storage key: "${key}"`);
          console.log(`Text length: ${text.length} chars`);
          console.log(`Preview: ${text.substring(0, 100)}...`);
          resolve(text);
          return;
        }
      }
      
      console.log("📭 No text in storage, trying content script...");
      
      // SECOND: Try to communicate with content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0 || !tabs[0].id) {
          console.log("❌ No active tab found");
          reject(new Error("No active tab found. Please open a webpage first."));
          return;
        }
        
        const tab = tabs[0];
        const tabId = tab.id;
        console.log(`Active tab ID: ${tabId}, URL: ${tab.url}`);
        
        // IMPORTANT: Check if content script is available on this tab
        chrome.tabs.sendMessage(
          tabId,
          {
            type: "GET_CURRENT_SELECTION",
            requestId: Date.now()
          },
          (response) => {
            // Check for runtime errors
            if (chrome.runtime.lastError) {
              const errorMsg = chrome.runtime.lastError.message;
              console.log(`⚠️ Content script error: ${errorMsg}`);
              
              // The content script isn't loaded or isn't responding
              // Try to inject content script dynamically
              console.log("🔄 Content script not loaded, trying to inject...");
              
              chrome.scripting.executeScript(
                {
                  target: { tabId },
                  func: () => {
                    try {
                      const selection = window.getSelection();
                      const text = selection.toString().trim();
                      
                      // Also check session storage as fallback
                      let sessionText = null;
                      try {
                        const sessionData = sessionStorage.getItem("synapse_last_selection");
                        if (sessionData) {
                          const parsed = JSON.parse(sessionData);
                          sessionText = parsed.text;
                        }
                      } catch (e) {}
                      
                      return {
                        success: true,
                        text: text || sessionText || "",
                        hasText: (text && text.length > 10) || (sessionText && sessionText.length > 10),
                        length: text ? text.length : (sessionText ? sessionText.length : 0),
                        error: null
                      };
                    } catch (error) {
                      return {
                        success: false,
                        text: "",
                        hasText: false,
                        error: error.message
                      };
                    }
                  }
                },
                (results) => {
                  if (chrome.runtime.lastError) {
                    console.log("❌ Injection failed:", chrome.runtime.lastError.message);
                    reject(new Error(
                      "Please:\n1. Select text on the page\n2. Right-click → 'Generate with SynapseMind'\n3. Or refresh the page and try again"
                    ));
                  } else if (results && results[0] && results[0].result) {
                    const { text, hasText, length } = results[0].result;
                    
                    if (hasText && text && text.length > 10) {
                      console.log(`✅ Got text via injection: ${length} chars`);
                      console.log(`Preview: ${text.substring(0, 100)}...`);
                      
                      // Save to storage for next time
                      chrome.storage.local.set({ 
                        lastSelection: text,
                        injectionTimestamp: Date.now()
                      });
                      
                      resolve(text);
                    } else {
                      console.log("📏 Text too short via injection:", length, "chars");
                      console.log("Text:", text);
                      
                      // LAST RESORT: Try to get text from DOM
                      chrome.scripting.executeScript(
                        {
                          target: { tabId },
                          func: () => {
                            // Try to find any selected text by checking various methods
                            let text = "";
                            
                            // 1. Standard selection
                            text = window.getSelection().toString().trim();
                            if (text) return text;
                            
                            // 2. Check for highlight classes
                            const highlights = document.querySelectorAll('.highlight, .selected, [style*="background"]');
                            for (const el of highlights) {
                              if (el.textContent && el.textContent.trim()) {
                                text = el.textContent.trim();
                                if (text.length > 10) return text;
                              }
                            }
                            
                            // 3. Look for recent text in storage
                            try {
                              const recent = sessionStorage.getItem("synapse_last_selection");
                              if (recent) {
                                const parsed = JSON.parse(recent);
                                if (parsed.text) return parsed.text;
                              }
                            } catch (e) {}
                            
                            return "";
                          }
                        },
                        (fallbackResults) => {
                          if (fallbackResults && fallbackResults[0] && fallbackResults[0].result) {
                            const fallbackText = fallbackResults[0].result;
                            if (fallbackText && fallbackText.length > 10) {
                              console.log(`✅ Found text via fallback: ${fallbackText.length} chars`);
                              chrome.storage.local.set({ lastSelection: fallbackText });
                              resolve(fallbackText);
                            } else {
                              reject(new Error(
                                "No text selected. Please select some text on the page first."
                              ));
                            }
                          } else {
                            reject(new Error(
                              "No text selected. Please select text on the page and try again."
                            ));
                          }
                        }
                      );
                    }
                  } else {
                    console.log("📭 No results from injection");
                    reject(new Error(
                      "Unable to access page content. Please try selecting text again."
                    ));
                  }
                }
              );
            } else if (response && response.text && response.text.trim().length > 10) {
              // SUCCESS: Got text from content script
              console.log(`✅ Got text from content script: ${response.text.length} chars`);
              console.log(`Preview: ${response.text.substring(0, 100)}...`);
              
              // Save to storage
              chrome.storage.local.set({ 
                lastSelection: response.text,
                fromContentScript: true,
                timestamp: Date.now()
              });
              
              resolve(response.text);
            } else if (response && response.text) {
              console.log(`📏 Text from content script too short: ${response.text.length} chars`);
              console.log("Text:", response.text);
              reject(new Error(
                `Selected text is too short (${response.text.length} chars).\nPlease select at least 10 characters.`
              ));
            } else {
              console.log("📭 No response or empty text from content script");
              console.log("Response:", response);
              reject(new Error(
                "No text selected. Please select text on the page first."
              ));
            }
          }
        );
      });
    });
  });
};

// ============================================
// AI GENERATION FUNCTIONS
// ============================================

/**
 * Generate summary using your working backend
 */
export const generateSummary = async (text, level = 'quick') => {
  console.log(`📝 Generating ${level} summary for text: ${text.substring(0, 50)}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: text,
        level: level 
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Summary API response:', data);
    
    return {
      success: true,
      summary: data.summary || data.data?.summary,
      level: level,
      characters_processed: data.characters_processed,
      timestamp: data.timestamp,
      isMock: false
    };
    
  } catch (error) {
    console.error('❌ Summary API Error:', error);
    
    // Fallback mock data only if backend is completely down
    const mockSummaries = {
      quick: "Quick AI summary: " + text.substring(0, 100) + "...",
      detailed: "Detailed AI analysis: " + text.substring(0, 200) + "... This text contains important concepts that can be analyzed further.",
      academic: "Academic Summary:\n• Thesis: Main argument presented\n• Methodology: Analytical approach\n• Findings: Key points identified\n• Implications: Practical applications\n• Conclusion: Summary of analysis"
    };
    
    return {
      success: true, // Still success for demo
      summary: mockSummaries[level] || mockSummaries.quick,
      level: level,
      isMock: true
    };
  }
};

/**
 * Generate mind map using your working backend
 */
export const generateMindMap = async (text) => {
  console.log(`🗺️ Generating mind map for text: ${text.substring(0, 50)}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/mindmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: text
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Mind Map API response:', data);
    
    return {
      success: true,
      nodes: data.nodes || data.data?.nodes || [],
      edges: data.edges || data.data?.edges || [],
      total_concepts: data.total_concepts || data.nodes?.length || 0,
      isMock: false
    };
    
  } catch (error) {
    console.error('❌ Mind Map API Error:', error);
    
    // Fallback mock data
    return {
      success: true,
      nodes: [
        { id: '1', label: text.substring(0, 30) || 'Main Concept', type: 'main' },
        { id: '2', label: 'Key Point 1', type: 'sub' },
        { id: '3', label: 'Key Point 2', type: 'sub' },
        { id: '4', label: 'Supporting Detail', type: 'detail' },
        { id: '5', label: 'Related Concept', type: 'sub' }
      ],
      edges: [
        { source: '1', target: '2', label: 'includes' },
        { source: '1', target: '3', label: 'relates to' },
        { source: '2', target: '4', label: 'supports' },
        { source: '1', target: '5', label: 'connected to' }
      ],
      isMock: true
    };
  }
};

// ============================================
// STORAGE FUNCTIONS
// ============================================

/**
 * Save summary to history
 */
export const saveSummary = async (summaryData) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['summaries'], (result) => {
      const summaries = result.summaries || [];
      summaries.unshift({
        ...summaryData,
        timestamp: Date.now()
      });
      
      // Keep only last 50 summaries
      if (summaries.length > 50) {
        summaries.length = 50;
      }
      
      chrome.storage.local.set({ summaries }, () => {
        resolve({ success: true, count: summaries.length });
      });
    });
  });
};

/**
 * Save mind map to history
 */
export const saveMindMap = async (mindMapData) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['mindmaps'], (result) => {
      const mindmaps = result.mindmaps || [];
      mindmaps.unshift({
        ...mindMapData,
        timestamp: Date.now()
      });
      
      // Keep only last 20 mind maps
      if (mindmaps.length > 20) {
        mindmaps.length = 20;
      }
      
      chrome.storage.local.set({ mindmaps }, () => {
        resolve({ success: true, count: mindmaps.length });
      });
    });
  });
};

/**
 * Get history
 */
export const getHistory = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['summaries', 'mindmaps'], (result) => {
      resolve({
        summaries: result.summaries || [],
        mindmaps: result.mindmaps || []
      });
    });
  });
};

// ============================================
// UTILITY & DEBUG FUNCTIONS
// ============================================

/**
 * Check if backend is healthy
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return data.gemini_ready === true;
  } catch (error) {
    console.warn('⚠️ Backend health check failed:', error);
    return false;
  }
};

/**
 * Emergency function to set demo text for presentation
 */
export const setDemoText = (text = null) => {
  const demoText = text || "Artificial intelligence is revolutionizing education by providing personalized learning experiences to students worldwide. This technology enables adaptive learning paths, instant feedback, and customized educational content based on individual student needs and learning styles.";
  
  return new Promise((resolve) => {
    chrome.storage.local.set({
      lastSelection: demoText,
      contextMenuSelection: demoText,
      demoMode: true,
      timestamp: Date.now()
    }, () => {
      console.log("🚀 Demo text set:", demoText.substring(0, 50));
      resolve(demoText);
    });
  });
};

/**
 * Clear all text storage
 */
export const clearTextStorage = () => {
  return new Promise((resolve) => {
    chrome.storage.local.remove([
      'lastSelection',
      'contextMenuSelection',
      'selectionText',
      'synapseSelection'
    ], () => {
      console.log("🗑️ Cleared text storage");
      resolve();
    });
  });
};

/**
 * Test connection to content script
 */
export const testContentScriptConnection = () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        resolve({ success: false, error: "No active tab" });
        return;
      }
      
      chrome.tabs.sendMessage(
        tabs[0].id, 
        { type: "PING" }, 
        (response) => {
          if (chrome.runtime.lastError) {
            resolve({ 
              success: false, 
              error: chrome.runtime.lastError.message,
              tabId: tabs[0].id,
              url: tabs[0].url
            });
          } else {
            resolve({ 
              success: true, 
              response: response,
              tabId: tabs[0].id,
              url: tabs[0].url
            });
          }
        }
      );
    });
  });
};

/**
 * Get debug info about current state
 */
export const getDebugInfo = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (storage) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve({
          storage: storage,
          activeTab: tabs[0] ? {
            id: tabs[0].id,
            url: tabs[0].url,
            title: tabs[0].title
          } : null,
          timestamp: Date.now(),
          apiBase: API_BASE_URL,
          backendHealth: false // Will be set separately
        });
      });
    });
  });
};

/**
 * Force refresh text from current page
 */
export const forceRefreshText = async () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        reject(new Error("No active tab"));
        return;
      }
      
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            try {
              const selection = window.getSelection();
              const text = selection.toString().trim();
              return {
                success: true,
                text: text,
                length: text.length,
                url: window.location.href
              };
            } catch (error) {
              return {
                success: false,
                error: error.message
              };
            }
          }
        },
        (results) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (results && results[0] && results[0].success) {
            const text = results[0].text;
            
            // Save to multiple storage keys for reliability
            chrome.storage.local.set({
              lastSelection: text,
              selectionText: text,
              forceRefreshed: true,
              timestamp: Date.now()
            }, () => {
              resolve(text);
            });
          } else {
            reject(new Error("No text selected on page"));
          }
        }
      );
    });
  });
};

/**
 * Test the backend connection with a simple request
 */
export const testBackendConnection = async () => {
  try {
    console.log("🌐 Testing backend connection...");
    
    // Test 1: Health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    // Test 2: Quick summary endpoint
    const testResponse = await fetch(`${API_BASE_URL}/api/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: "Test connection",
        level: "quick"
      })
    });
    const testData = await testResponse.json();
    
    return {
      success: true,
      health: healthData,
      test: testData,
      backendUrl: API_BASE_URL,
      timestamp: Date.now()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      backendUrl: API_BASE_URL,
      timestamp: Date.now()
    };
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

export default {
  getSelectedText,
  generateSummary,
  generateMindMap,
  saveSummary,
  saveMindMap,
  getHistory,
  checkBackendHealth,
  setDemoText,
  clearTextStorage,
  testContentScriptConnection,
  getDebugInfo,
  forceRefreshText,
  testBackendConnection
};