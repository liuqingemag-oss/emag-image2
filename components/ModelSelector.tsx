import React, { useState } from 'react';
import { Bot, ChevronDown, Check, Zap, Cpu, Sparkles, Settings } from 'lucide-react';
import { AIModelConfig, AVAILABLE_MODELS } from '../types';

interface ModelSelectorProps {
  selectedModel: AIModelConfig;
  onSelectModel: (model: AIModelConfig) => void;
  disabled: boolean;
  onOpenConfig: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelectModel, disabled, onOpenConfig }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getProviderIcon = (provider: string, id: string) => {
    if (provider === 'ByteDance') return <Sparkles className="w-4 h-4" />;
    if (id.includes('flash')) return <Zap className="w-4 h-4" />;
    return <Cpu className="w-4 h-4" />;
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'Google': return 'bg-blue-50 text-blue-600';
      case 'ByteDance': return 'bg-cyan-50 text-cyan-600';
      case 'OpenAI': return 'bg-green-50 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="relative z-50">
      <div className="flex gap-2">
        <button
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-between px-3 py-2.5 bg-white border rounded-xl transition-all ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
        >
            <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${getProviderColor(selectedModel.provider)}`}>
                {getProviderIcon(selectedModel.provider, selectedModel.id)}
            </div>
            <div className="flex flex-col items-start min-w-0">
                <span className="text-xs font-bold text-gray-900 truncate w-full flex items-center gap-2">
                    {selectedModel.name}
                    {selectedModel.badge && (
                        <span className="px-1.5 py-0.5 bg-gray-900 text-white text-[9px] rounded-md font-medium">{selectedModel.badge}</span>
                    )}
                </span>
                <span className="text-[10px] text-gray-400 truncate w-full text-left">{selectedModel.provider} Cloud</span>
            </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <button 
            onClick={onOpenConfig}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-gray-50 text-gray-500 transition-all"
            title="API 配置"
        >
            <Settings className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="max-h-[300px] overflow-y-auto py-1">
                <div className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                    可用模型
                </div>
                {AVAILABLE_MODELS.map((model) => (
                    <button
                    key={model.id}
                    onClick={() => {
                        onSelectModel(model);
                        setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors border-b border-gray-50 last:border-0"
                    >
                    <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${getProviderColor(model.provider)}`}>
                         {getProviderIcon(model.provider, model.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-xs font-semibold ${model.id === selectedModel.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                                {model.name}
                            </span>
                            {model.id === selectedModel.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-snug">
                            {model.description}
                        </p>
                    </div>
                    </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};