import React, { useState, useEffect } from 'react';
import { X, Save, Key, ExternalLink } from 'lucide-react';
import { ApiSettings } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ApiSettings;
  onSave: (settings: ApiSettings) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [byteDanceKey, setByteDanceKey] = useState(settings.byteDance?.apiKey || '');
  const [byteDanceEndpoint, setByteDanceEndpoint] = useState(settings.byteDance?.endpointId || '');

  useEffect(() => {
    if (isOpen) {
      setByteDanceKey(settings.byteDance?.apiKey || '');
      setByteDanceEndpoint(settings.byteDance?.endpointId || '');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...settings,
      byteDance: {
        apiKey: byteDanceKey,
        endpointId: byteDanceEndpoint
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">API 配置 (External Keys)</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
            {/* Gemini Config */}
            <div className="space-y-4 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-100 rounded text-blue-700">
                        <Key className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">Google Gemini API</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                    使用高级模型 (如 Gemini 3.1) 需要连接已启用计费的 Google Cloud 项目 API Key。
                </p>
                <button 
                    onClick={() => {
                        const aistudio = (window as any).aistudio;
                        if (aistudio) aistudio.openSelectKey();
                        onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Key className="w-4 h-4" />
                    连接 / 切换 Google API Key
                </button>
            </div>

            {/* ByteDance Config */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-cyan-100 rounded text-cyan-700">
                        <Key className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">ByteDance (Doubao/Volcengine)</h3>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">API Key</label>
                        <input 
                            type="password" 
                            value={byteDanceKey}
                            onChange={(e) => setByteDanceKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Endpoint ID (Model ID)</label>
                        <div className="flex gap-2">
                             <input 
                                type="text" 
                                value={byteDanceEndpoint}
                                onChange={(e) => setByteDanceEndpoint(e.target.value)}
                                placeholder="ep-2024..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                           <ExternalLink className="w-3 h-3" />
                           可在火山引擎 (Volcengine) 控制台获取
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
             <button 
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors"
             >
                <Save className="w-4 h-4" />
                保存配置
             </button>
        </div>
      </div>
    </div>
  );
};