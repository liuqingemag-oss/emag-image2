import React, { useState } from 'react';
import { BatchItem } from '../types';
import { Loader2, Download, X, Sparkles, FileText, Type, ChevronRight } from 'lucide-react';

interface SeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: BatchItem[];
  onGenerate: (keywords: string, pattern: string) => Promise<void>;
  onDownload: (id: string) => void;
  isProcessing: boolean;
}

const NAMING_TEMPLATES = [
  { label: "简单 (Simple)", value: "produs-{culoare}-{stil}.png" },
  { label: "电商标准 (E-commerce)", value: "{brand}-{categorie}-{culoare}.jpg" },
  { label: "详细 SEO (Full SEO)", value: "{brand}-{categorie}-{cuvinte_cheie}-{atribut}.jpg" }
];

export const SeoModal: React.FC<SeoModalProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onGenerate, 
  onDownload,
  isProcessing 
}) => {
  const [keywords, setKeywords] = useState('');
  const [namingPattern, setNamingPattern] = useState('{brand}-{categorie}-{cuvinte_cheie}-{atribut}.jpg');
  
  if (!isOpen) return null;

  const handleGenerateClick = () => {
    if (items.length === 0) return;
    onGenerate(keywords, namingPattern);
  };

  const handleDownloadAll = () => {
    items.forEach(item => {
        if (item.status === 'success') {
            onDownload(item.id);
        }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-900">批量 SEO 优化 & 下载</h2>
                <p className="text-xs text-gray-500">自动生成文件名和 Alt 文本</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            
            {/* Left: Settings */}
            <div className="w-full md:w-1/3 p-6 border-r border-gray-100 bg-white flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Type className="w-4 h-4 text-gray-400" />
                        关键词 (Keywords)
                    </label>
                    <textarea 
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="例如：运动鞋, 夏季, 透气, 跑步..."
                        className="w-full h-24 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">AI 将根据这些词优化 Alt 文本。</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        文件名命名规则 (Pattern)
                    </label>
                    <input 
                        type="text"
                        value={namingPattern}
                        onChange={(e) => setNamingPattern(e.target.value)}
                        placeholder="Ex: {brand}-{categorie}-{culoare}.jpg"
                        className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    />
                    
                    {/* Templates */}
                    <div className="mt-3 space-y-2">
                       <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">推荐模板</span>
                       <div className="flex flex-col gap-1.5">
                          {NAMING_TEMPLATES.map((tpl, idx) => (
                             <button
                               key={idx}
                               onClick={() => setNamingPattern(tpl.value)}
                               className="text-left px-2 py-1.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 text-xs text-gray-600 transition-colors group flex items-center justify-between"
                             >
                                <span>{tpl.label}</span>
                                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                             </button>
                          ))}
                       </div>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                    <button 
                        onClick={handleGenerateClick}
                        disabled={isProcessing || items.length === 0}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isProcessing ? 'AI 正在分析...' : '生成 SEO 数据'}
                    </button>
                </div>
            </div>

            {/* Right: Preview List */}
            <div className="flex-1 bg-gray-50 p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    {items.filter(i => i.status === 'success').map((item, index) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                                <img src={item.resultUrl || item.previewUrl} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                                {/* Filename */}
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">文件名</span>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={item.customFileName || "等待生成..."} 
                                            className={`w-full text-xs font-mono p-1.5 rounded border ${item.customFileName ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                        />
                                    </div>
                                </div>
                                {/* Alt Text */}
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Alt 文本 (中文)</span>
                                    <p className={`text-xs p-2 rounded border ${item.altText ? 'bg-white border-gray-200 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-400 italic'}`}>
                                        {item.altText || "等待生成..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {items.filter(i => i.status === 'success').length === 0 && (
                        <div className="text-center text-gray-400 py-10">
                            请先在主界面处理图片，然后再进行 SEO 优化。
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-white p-4 border-t border-gray-200 flex justify-end gap-3">
             <button 
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
             >
                取消
             </button>
             <button 
                onClick={handleDownloadAll}
                disabled={items.filter(i => i.status === 'success').length === 0}
                className="px-6 py-2.5 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg shadow-green-200 flex items-center gap-2 transition-all disabled:opacity-50"
             >
                <Download className="w-4 h-4" />
                全部保存 (新文件名)
             </button>
        </div>

      </div>
    </div>
  );
};