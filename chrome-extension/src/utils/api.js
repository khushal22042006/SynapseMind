// chrome-extension/src/utils/api.js
const API_BASE_URL = 'http://localhost:8000'; // Your backend URL

// Get selected text from background
export const getSelectedText = async () => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_SELECTED_TEXT' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response && response.success) {
        resolve(response.text);
      } else {
        reject(new Error('Failed to get selected text'));
      }
    });
  });
};

// Generate summary
export const generateSummary = async (text, level = 'quick') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, level })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      summary: data.data?.summary || data.summary,
      level: level
    };
  } catch (error) {
    console.error('API Error (summary):', error);
    
    // Fallback mock data for development
    const mockSummaries = {
      quick: "This is a quick summary of the selected text.",
      detailed: "This text discusses important concepts that can be broken down into several key points. The main idea revolves around understanding core principles and their applications.",
      academic: "• Primary Concept: Core idea explanation\n• Secondary Aspects: Supporting elements\n• Implications: Practical applications\n• Conclusion: Summary of findings"
    };
    
    return {
      success: true, // Still success for demo
      summary: mockSummaries[level] || mockSummaries.quick,
      level: level,
      isMock: true // Flag for mock data
    };
  }
};

// Generate mind map
export const generateMindMap = async (text) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mindmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        nodes: data.data?.nodes || data.nodes || [],
        edges: data.data?.edges || data.edges || []
      }
    };
  } catch (error) {
    console.error('API Error (mindmap):', error);
    
    // Fallback mock data for development
    const mockMindMap = {
      nodes: [
        { id: '1', label: 'Main Topic', type: 'main' },
        { id: '2', label: 'Key Concept 1', type: 'sub' },
        { id: '3', label: 'Key Concept 2', type: 'sub' },
        { id: '4', label: 'Supporting Detail A', type: 'detail' },
        { id: '5', label: 'Supporting Detail B', type: 'detail' },
        { id: '6', label: 'Related Topic', type: 'sub' }
      ],
      edges: [
        { source: '1', target: '2', label: 'includes' },
        { source: '1', target: '3', label: 'includes' },
        { source: '2', target: '4', label: 'supports' },
        { source: '2', target: '5', label: 'supports' },
        { source: '1', target: '6', label: 'related to' }
      ]
    };
    
    return {
      success: true,
      data: mockMindMap,
      isMock: true // Flag for mock data
    };
  }
};

// Save to history
export const saveSummary = async (summaryData) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type: 'SAVE_SUMMARY',
      data: summaryData
    }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
};

export const saveMindMap = async (mindMapData) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type: 'SAVE_MINDMAP',
      data: mindMapData
    }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
};

// Get history
export const getHistory = async () => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_HISTORY' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
};