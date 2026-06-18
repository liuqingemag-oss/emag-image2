import React from 'react';
import { Wand2, Command } from 'lucide-react';
import { SAMPLE_PROMPTS } from '../types';

interface PromptSelectorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isProcessing: boolean;
  hasItems: boolean;
  onGenerate: () => void;
}

export const PromptSelector: React.FC<PromptSelectorProps> = ({ prompt, setPrompt, isProcessing, hasItems, onGenerate }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasItems) {
        onGenerate();
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          placeholder="描述修改需求 (例如：将背景改为沙滩，翻译所有文字为中文...)"
          className="w-full h-24 p-3 pr-10 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm text-gray-900 bg-white disabled:bg-gray-50 custom-scrollbar"
        />
        <button
          onClick={onGenerate}
          disabled={isProcessing || !hasItems || !prompt.trim()}
          className="absolute bottom-2 right-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          title={!hasItems ? "请先上传图片" : "生成"}
        >
          <Wand2 className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts List */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-1">
           <Command className="w-3 h-3 text-gray-400" />
           <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">常用指令</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((sample, index) => (
            <button
              key={index}
              onClick={() => setPrompt(sample)}
              disabled={isProcessing}
              className="px-2 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded text-[10px] transition-all text-left max-w-full truncate"
              title={sample}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
      
      <p className="text-[10px] text-gray-400 text-right pt-1 border-t border-gray-100">
        Enter 发送 • Shift+Enter 换行
      </p>
    </div>
  );
};