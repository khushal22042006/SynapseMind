// chrome-extension/src/popup/MindMapView.jsx
import React, { useState } from 'react';
import { Network, Download, Maximize2, Minimize2, GitBranch, LayoutGrid, Link as LinkIcon } from 'lucide-react';

const MindMapView = ({ selectedText, loading, generatedContent, onGenerate, onExport }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerateClick = () => {
    if (selectedText && !selectedText.includes('No text selected') && !selectedText.includes('Error loading')) {
      onGenerate('mindmap');
    }
  };

  const renderMindMapPreview = () => {
    if (!generatedContent || generatedContent.type !== 'mindmap') return null;

    const { nodes, edges } = generatedContent.content;
    
    return (
      <div className="mt-4 animate-fadeIn">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Network size={18} />
            </div>
            <h3 className="font-semibold text-slate-200">Mind Map Preview</h3>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={() => onExport(JSON.stringify(generatedContent.content, null, 2), `synapsemind-mindmap-${Date.now()}.json`)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title="Export"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
        
        <div className={`bg-slate-800 border border-slate-700 rounded-lg p-4 ${isExpanded ? 'h-64' : 'h-48'} overflow-auto`}>
          {/* Nodes Visualization */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Concepts</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {nodes.slice(0, 8).map((node) => (
                <div
                  key={node.id}
                  className={`px-3 py-2 rounded-lg border ${
                    node.type === 'main'
                      ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/30'
                      : node.type === 'sub'
                      ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-purple-500/30'
                      : 'bg-gradient-to-r from-slate-700 to-slate-800 border-slate-600'
                  }`}
                >
                  <div className="text-sm font-medium text-slate-200">{node.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{node.type}</div>
                </div>
              ))}
              {nodes.length > 8 && (
                <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg">
                  <div className="text-sm text-slate-400">+{nodes.length - 8} more</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Connections */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GitBranch size={16} className="text-green-400" />
              <span className="text-sm font-medium text-slate-300">Connections</span>
            </div>
            <div className="space-y-2">
              {edges.slice(0, 5).map((edge, index) => (
                <div key={index} className="flex items-center text-sm">
                  <span className="font-medium text-blue-300">
                    {nodes.find(n => n.id === edge.source)?.label}
                  </span>
                  <LinkIcon size={12} className="mx-2 text-slate-500" />
                  <span className="font-medium text-green-300">
                    {nodes.find(n => n.id === edge.target)?.label}
                  </span>
                  {edge.label && (
                    <span className="ml-2 px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">
                      {edge.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400 flex justify-between">
          <span>{nodes.length} nodes, {edges.length} connections</span>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <button
        onClick={handleGenerateClick}
        disabled={loading || selectedText.includes('No text selected') || selectedText.includes('Error loading')}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          loading || selectedText.includes('No text selected') || selectedText.includes('Error loading')
            ? 'bg-slate-700 cursor-not-allowed text-slate-400'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Generating Mind Map...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Network size={18} />
            Generate Mind Map
          </span>
        )}
      </button>

      {/* Mind Map Display */}
      {renderMindMapPreview()}

      {/* Empty State */}
      {!generatedContent && !loading && (
        <div className="text-center py-8 text-slate-400">
          <div className="text-4xl mb-3">🧠</div>
          <h3 className="font-medium mb-2">Visual Learning Assistant</h3>
          <p className="text-sm">Generate interactive mind maps from selected text</p>
          <div className="mt-4 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <span>Main Concepts (Primary Nodes)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <span>Sub Concepts (Secondary Nodes)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600"></div>
              <span>Connections & Relationships</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {generatedContent && (
        <div className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div className="font-medium mb-2 text-slate-300">Legend</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <span>Main Concept</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <span>Sub Concept</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-500 to-slate-600"></div>
              <span>Detail</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapView;