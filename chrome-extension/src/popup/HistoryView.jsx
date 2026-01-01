// chrome-extension/src/popup/HistoryView.js
import React, { useState, useEffect } from 'react';
import { History, Trash2, Clock, FileText, Network, ExternalLink } from 'lucide-react';

const HistoryView = () => {
  const [history, setHistory] = useState({
    summaries: [],
    mindmaps: []
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      chrome.storage.local.get(['summaries', 'mindmaps'], (result) => {
        setHistory({
          summaries: result.summaries || [],
          mindmaps: result.mindmaps || []
        });
      });
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const clearHistory = (type) => {
    if (type === 'all') {
      chrome.storage.local.set({ summaries: [], mindmaps: [] }, () => {
        setHistory({ summaries: [], mindmaps: [] });
      });
    } else if (type === 'summaries') {
      chrome.storage.local.set({ summaries: [] }, () => {
        setHistory(prev => ({ ...prev, summaries: [] }));
      });
    } else if (type === 'mindmaps') {
      chrome.storage.local.set({ mindmaps: [] }, () => {
        setHistory(prev => ({ ...prev, mindmaps: [] }));
      });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="text-blue-400" />
          <h3 className="font-semibold text-slate-200">History</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => clearHistory('summaries')}
            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          >
            Clear Summaries
          </button>
          <button
            onClick={() => clearHistory('all')}
            className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Recent Summaries */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-green-400" />
          <h4 className="font-medium text-slate-300">Recent Summaries</h4>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {history.summaries.length}
          </span>
        </div>
        
        {history.summaries.length > 0 ? (
          <div className="space-y-2">
            {history.summaries.slice(0, 3).map((item, index) => (
              <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded text-xs ${
                      item.level === 'quick' ? 'bg-green-500/20 text-green-300' :
                      item.level === 'detailed' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {item.level}
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {formatTime(item.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2 mb-2">
                  {item.text.length > 100 ? item.text.substring(0, 100) + '...' : item.text}
                </p>
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>{item.summary.split(' ').length} words</span>
                  <button className="hover:text-slate-400">View</button>
                </div>
              </div>
            ))}
            {history.summaries.length > 3 && (
              <div className="text-center">
                <button className="text-sm text-blue-400 hover:text-blue-300">
                  Show {history.summaries.length - 3} more
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500">
            <p>No summary history yet</p>
          </div>
        )}
      </div>

      {/* Recent Mind Maps */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Network size={16} className="text-purple-400" />
          <h4 className="font-medium text-slate-300">Recent Mind Maps</h4>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {history.mindmaps.length}
          </span>
        </div>
        
        {history.mindmaps.length > 0 ? (
          <div className="space-y-2">
            {history.mindmaps.slice(0, 2).map((item, index) => (
              <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                      Mind Map
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {formatTime(item.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2 mb-2">
                  {item.text.length > 100 ? item.text.substring(0, 100) + '...' : item.text}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 mr-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      {item.nodes?.filter(n => n.type === 'main').length || 0} main
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      {item.nodes?.filter(n => n.type === 'sub').length || 0} sub
                    </span>
                  </div>
                  <button className="text-xs text-blue-400 hover:text-blue-300">Visualize</button>
                </div>
              </div>
            ))}
            {history.mindmaps.length > 2 && (
              <div className="text-center">
                <button className="text-sm text-blue-400 hover:text-blue-300">
                  Show {history.mindmaps.length - 2} more
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500">
            <p>No mind map history yet</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{history.summaries.length}</div>
            <div className="text-xs text-slate-400">Summaries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{history.mindmaps.length}</div>
            <div className="text-xs text-slate-400">Mind Maps</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;