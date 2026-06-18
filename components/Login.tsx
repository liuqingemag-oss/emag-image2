import React, { useState } from 'react';
import { Image as ImageIcon, Lock, User, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // Mock Authentication Logic
      if (username === 'admin' && password === 'admin123') {
        onLogin({ username: 'admin', name: '超级管理员', role: 'admin' });
      } else if (username === 'designer' && password === '123456') {
        onLogin({ username: 'designer', name: '资深设计师', role: 'editor' });
      } else if (username === 'guest' && password === 'guest') {
        onLogin({ username: 'guest', name: '访客用户', role: 'viewer' });
      } else {
        setError('用户名或密码错误');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-dot-pattern flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden flex flex-col relative">
        {/* Brand Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center">
             <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl mb-4 shadow-inner">
                <ImageIcon className="w-8 h-8 text-white" />
             </div>
             <h1 className="text-2xl font-bold tracking-tight">eMAG 图片大师</h1>
             <p className="text-blue-100 text-sm mt-1 font-medium">企业级 AI 图像处理工作台</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-8">
           <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">账号</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    placeholder="输入用户名"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">密码</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    placeholder="输入密码"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-xs text-center bg-red-50 py-2 rounded-lg border border-red-100 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all"
              >
                {isLoading ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    安全登录 <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
           </form>

           {/* Role Hints */}
           <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400 mb-4">测试账号提示 (Demo Credentials)</p>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                 <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <div className="font-bold text-indigo-700 mb-1">管理员</div>
                    <div className="text-gray-500">admin / admin123</div>
                 </div>
                 <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <div className="font-bold text-blue-600 mb-1">设计师</div>
                    <div className="text-gray-500">designer / 123456</div>
                 </div>
                 <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <div className="font-bold text-gray-600 mb-1">访客</div>
                    <div className="text-gray-500">guest / guest</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};