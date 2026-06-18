import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-green-400 p-2 rounded-xl shadow-sm rotate-3 hover:rotate-6 transition-transform">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 leading-none tracking-tight">eMAG 智能设计工作室</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">eMAG 商家专属 AI 设计工具</p>
          </div>
        </div>
        <a 
          href="https://ai.google.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-bold text-green-700 hover:text-green-800 transition-colors bg-green-100 hover:bg-green-200 px-4 py-2 rounded-full shadow-sm border border-green-200"
        >
          由 Gemini 3 驱动
        </a>
      </div>
    </header>
  );
};