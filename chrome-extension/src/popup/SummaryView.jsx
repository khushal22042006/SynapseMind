// chrome-extension/src/popup/SummaryView.js
import React, { useState } from 'react';
import { Zap, BookOpen, GraduationCap, Copy, Download, Loader2 } from 'lucide-react';

const SummaryView = ({ selectedText, loading, generatedContent, onGenerate, onCopy, onExport }) => {
  const [level, setLevel] = useState('quick');

  const levelConfig = [
    { id: 'quick', label: 'Quick', icon: <Zap size={16} />, color: 'from-green-500 to-emerald-500', description: 'Brief overview' },
    { id: 'detailed', label: 'Detailed', icon: <BookOpen size={16} />, color: 'from-blue-500 to-cyan-500', description: 'Paragraph summary' },
    { id: 'academic', label: 'Academic', icon: <GraduationCap size={16} />, color: 'from-purple-500 to-pink-500', description: 'Structured analysis' }
  ];

  const handleGenerateClick = () => {
    if (selectedText && !selectedText.includes('No text selected') && !selectedText.includes('Error loading')) {
      onGenerate('summary', level);
    }
  };

  return (
    <div className="space-y-4">
      {/* Level Selection */}
      <div className="grid grid-cols-3 gap-2">
        {levelConfig.map((config) => (
          <button
            key={config.id}
            onClick={() => setLevel(config.id)}
            className={`p-3 rounded-lg border transition-all ${
              level === config.id 
                ? `bg-gradient-to-br ${config.color} border-transparent text-white shadow-lg` 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              {config.icon}
              <span className="text-sm font-medium">{config.label}</span>
              <span className="text-xs opacity-80">{config.description}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateClick}
        disabled={loading || selectedText.includes('No text selected') || selectedText.includes('Error loading')}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          loading || selectedText.includes('No text selected') || selectedText.includes('Error loading')
            ? 'bg-slate-700 cursor-not-allowed text-slate-400'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            Processing with AI...
          </span>
        ) : (
          'Generate Summary'
        )}
      </button>

      {/* Generated Summary Display */}
      {generatedContent && generatedContent.type === 'summary' && (
        <div className="mt-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md bg-gradient-to-br ${
                level === 'quick' ? 'from-green-500/20 to-emerald-500/20' :
                level === 'detailed' ? 'from-blue-500/20 to-cyan-500/20' :
                'from-purple-500/20 to-pink-500/20'
              }`}>
                {levelConfig.find(l => l.id === level)?.icon}
              </div>
              <h3 className="font-semibold text-slate-200">
                {level.charAt(0).toUpperCase() + level.slice(1)} Summary
              </h3>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onCopy(generatedContent.content)}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                title="Copy summary"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => onExport(generatedContent.content, `synapsemind-summary-${level}-${Date.now()}.txt`)}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                title="Export summary"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                {generatedContent.content}
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-700 text-xs text-slate-400 flex justify-between">
              <span>{generatedContent.content.split(' ').length} words</span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!generatedContent && !loading && (
        <div className="text-center py-8 text-slate-400">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="font-medium mb-2">Ready to Generate</h3>
          <p className="text-sm">Select a summary level and click "Generate Summary"</p>
          <div className="mt-4 text-xs space-y-1">
            <p><span className="font-medium text-green-400">Quick:</span> 1-2 sentence overview</p>
            <p><span className="font-medium text-blue-400">Detailed:</span> Comprehensive paragraph</p>
            <p><span className="font-medium text-purple-400">Academic:</span> Structured analysis with bullet points</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryView;