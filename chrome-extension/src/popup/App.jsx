// chrome-extension/src/popup/App.js - COMPLETELY UPDATED WITH YOUR DESIGN
// chrome-extension/src/popup/App.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import SummaryView from './SummaryView.jsx';
import MindMapView from './MindMapView.jsx';
import HistoryView from './HistoryView.jsx';
// FIX: Import all needed functions
import { 
  getSelectedText, 
  generateSummary, 
  generateMindMap,
  saveSummary,
  saveMindMap 
} from '../utils/api.js';
import { Brain, FileText, Network, History, Copy, Download, Zap, BookOpen, GraduationCap, Sparkles } from 'lucide-react';


const App = () => {
  const [selectedText, setSelectedText] = useState('');
  const [activeView, setActiveView] = useState('summary'); // 'summary', 'mindmap', 'history'
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  useEffect(() => {
    loadSelectedText();
  }, []);




 const loadSelectedText = async () => {
  try {
    console.log("🔄 Loading selected text...");
    const text = await getSelectedText();
    
    if (text && text.trim().length > 10) {
      setSelectedText(text);
      console.log("✅ Text loaded successfully");
    } else {
      setSelectedText("No text selected. Please:\n1. Select text on any webpage\n2. Right-click → 'Generate with SynapseMind'\n3. Or click Refresh after selecting text");
      console.log("📭 Text too short or empty");
    }
  } catch (error) {
    console.error("❌ Error loading selected text:", error);
    
    // Try to get any cached text as last resort
    chrome.storage.local.get(["lastSelection"], (result) => {
      if (result.lastSelection && result.lastSelection.length > 10) {
        console.log("📦 Using cached text");
        setSelectedText(result.lastSelection);
      } else {
        setSelectedText(`Error: ${error.message}\n\nPlease select text on the page and try again.`);
      }
    });
  }
};




 // Update the handleGenerate function in App.jsx
const handleGenerate = async (type, level) => {
  setLoading(true);
  setGeneratedContent(null);
  
  try {
    if (type === 'summary') {
      const result = await generateSummary(selectedText, level);
      
      if (result.success) {
        setGeneratedContent({
          type: 'summary',
          content: result.summary,
          level: level,
          isMock: result.isMock
        });
        
        // Save to history
        await saveSummary({
          text: selectedText,
          summary: result.summary,
          level: level,
          characters: selectedText.length
        });
      }
    } else if (type === 'mindmap') {
      const result = await generateMindMap(selectedText);
      
      if (result.success) {
        setGeneratedContent({
          type: 'mindmap',
          content: {
            nodes: result.nodes,
            edges: result.edges
          },
          isMock: result.isMock
        });
        
        // Save to history
        await saveMindMap({
          text: selectedText,
          nodes: result.nodes,
          edges: result.edges
        });
      }
    }
  } catch (error) {
    console.error('Generation error:', error);
    // Show error to user
    setGeneratedContent({
      type: 'error',
      content: `Failed to generate: ${error.message}`
    });
  } finally {
    setLoading(false);
  }
};

const handleCopy = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    console.log("✅ Text copied to clipboard");
    // You could add a toast notification here
  }).catch((err) => {
    console.error("Copy failed:", err);
    // Fallback method
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      console.log("✅ Text copied (fallback method)");
    } catch (copyErr) {
      console.error("Fallback copy failed:", copyErr);
    }
    document.body.removeChild(textArea);
  });
};

  const handleExport = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderSelectedTextPreview = () => {
  const isPlaceholder = selectedText.includes("No text selected") || 
                        selectedText.includes("Error loading") ||
                        selectedText.length < 20;
  
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-slate-300", children: "Selected Text" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: loadSelectedText,
            className: "text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors",
            children: "🔄 Refresh"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              // Clear storage and reload
              chrome.storage.local.clear(() => {
                loadSelectedText();
              });
            },
            className: "text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors",
            children: "Clear Cache"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 rounded-lg ${isPlaceholder ? "bg-slate-800/50 border-dashed" : "bg-slate-800"} border border-slate-700`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${isPlaceholder ? "text-slate-400 italic" : "text-slate-200"} line-clamp-4`, children: 
        selectedText.length > 300 ? selectedText.substring(0, 300) + "..." : selectedText
      }),
      !isPlaceholder && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mt-2 text-xs text-slate-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          selectedText.length,
          " characters"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => handleCopy(selectedText),
            className: "flex items-center gap-1 hover:text-slate-300",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 12 }),
              " Copy"
            ]
          }
        )
      ] })
    ] })
  ] });
};

  return (
    <div className="w-[380px] min-h-[500px] p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
          <Brain className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SynapseMind
          </h1>
          <p className="text-xs text-slate-400">AI-Powered Learning Companion</p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Selected Text Preview */}
        {renderSelectedTextPreview()}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            className={`flex-1 py-2 text-center font-medium ${activeView === 'summary' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}`}
            onClick={() => setActiveView('summary')}
          >
            <span className="flex items-center justify-center gap-2">
              <FileText size={16} /> Summary
            </span>
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium ${activeView === 'mindmap' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}`}
            onClick={() => setActiveView('mindmap')}
          >
            <span className="flex items-center justify-center gap-2">
              <Network size={16} /> Mind Map
            </span>
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium ${activeView === 'history' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}`}
            onClick={() => setActiveView('history')}
          >
            <span className="flex items-center justify-center gap-2">
              <History size={16} /> History
            </span>
          </button>
        </div>

        {/* Content Views */}
        <div className="min-h-[300px]">
          {activeView === 'summary' && (
            <SummaryView 
              selectedText={selectedText}
              loading={loading}
              generatedContent={generatedContent}
              onGenerate={handleGenerate}
              onCopy={handleCopy}
              onExport={handleExport}
            />
          )}
          
          {activeView === 'mindmap' && (
            <MindMapView 
              selectedText={selectedText}
              loading={loading}
              generatedContent={generatedContent}
              onGenerate={handleGenerate}
              onExport={handleExport}
            />
          )}
          
          {activeView === 'history' && (
            <HistoryView />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 pt-4 border-t border-slate-700 text-center">
        <p className="text-xs text-slate-400">MVP Demo • Chrome Extension Popup</p>
        <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
          <span>Select text → Right-click → SynapseMind</span>
        </div>
      </footer>
    </div>
  );
};

export default App;