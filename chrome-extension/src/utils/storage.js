// chrome-extension/src/utils/storage.js
// Wrapper for Chrome storage API

export const storage = {
  // Set data
  set: (key, value) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },

  // Get data
  get: (key) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key]);
        }
      });
    });
  },

  // Remove data
  remove: (key) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove([key], () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },

  // Clear all data
  clear: () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },

  // Get multiple keys
  getMultiple: (keys) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Set multiple keys
  setMultiple: (data) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
};

// Specific storage utilities for SynapseMind
export const summaryStorage = {
  save: async (text, summary, level) => {
    const summaries = await storage.get('summaries') || [];
    summaries.unshift({
      text: text.substring(0, 500),
      summary,
      level,
      timestamp: Date.now()
    });
    
    // Keep only last 50 summaries
    if (summaries.length > 50) {
      summaries.length = 50;
    }
    
    await storage.set('summaries', summaries);
    return summaries;
  },

  getAll: async () => {
    return await storage.get('summaries') || [];
  },

  clear: async () => {
    await storage.set('summaries', []);
  }
};

export const mindMapStorage = {
  save: async (text, nodes, edges) => {
    const mindmaps = await storage.get('mindmaps') || [];
    mindmaps.unshift({
      text: text.substring(0, 500),
      nodes,
      edges,
      timestamp: Date.now()
    });
    
    // Keep only last 20 mind maps
    if (mindmaps.length > 20) {
      mindmaps.length = 20;
    }
    
    await storage.set('mindmaps', mindmaps);
    return mindmaps;
  },

  getAll: async () => {
    return await storage.get('mindmaps') || [];
  },

  clear: async () => {
    await storage.set('mindmaps', []);
  }
};