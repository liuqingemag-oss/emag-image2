import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { PromptSelector } from './components/PromptSelector';
import { QuickActions } from './components/QuickActions';
import { TextEditor } from './components/TextEditor';
import { SeoModal } from './components/SeoModal';
import { ModelSelector } from './components/ModelSelector';
import { ApiKeyModal } from './components/ApiKeyModal';
import { BatchItem, TargetPoint, SelectionBox, AVAILABLE_MODELS, AIModelConfig, ApiSettings } from './types';
import { editImage, generateCompositeImage, generateAltText, generateSeoMetadata } from './services/geminiService';
import { resizeImage } from './utils/imageUtils';
import { stitchImages } from './utils/stitchUtils';
import { Download, Loader2, Sparkles, Key, Maximize2, X, Undo2, FolderDown, Image as ImageIcon, ChevronRight, ZoomIn, ZoomOut, Move, RotateCcw, FileText, Check, Search, MousePointer2, AlertCircle, Info, Hand, BoxSelect, Bot } from 'lucide-react';

// --- Toast Component (Internal) ---
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-in min-w-[300px] max-w-md backdrop-blur-md
            ${toast.type === 'success' ? 'bg-white/90 border-green-200 text-green-800' : ''}
            ${toast.type === 'error' ? 'bg-white/90 border-red-200 text-red-800' : ''}
            ${toast.type === 'info' ? 'bg-white/90 border-blue-200 text-blue-800' : ''}
          `}
        >
          {toast.type === 'success' && <Check className="w-5 h-5 text-green-500" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
          <p className="text-sm font-medium">{toast.message}</p>
          <button onClick={() => onRemove(toast.id)} className="ml-auto text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  // Batch State
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // SEO Modal State
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false);
  const [isSeoProcessing, setIsSeoProcessing] = useState(false);

  // Model & API State
  const [selectedModel, setSelectedModel] = useState<AIModelConfig>(AVAILABLE_MODELS[0]);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiSettings, setApiSettings] = useState<ApiSettings>({});

  // Selection State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [targetPoint, setTargetPoint] = useState<TargetPoint | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  // Tool Mode
  const [activeTool, setActiveTool] = useState<'pan' | 'select'>('pan');

  const [prompt, setPrompt] = useState('');
  
  // Pending Options for Deferred Execution
  const [pendingAspectRatio, setPendingAspectRatio] = useState<string | undefined>(undefined);
  const [pendingOperation, setPendingOperation] = useState<'edit' | 'merge'>('edit');

  // Zoom & Pan State
  const [viewState, setViewState] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Selection Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });

  // UI States
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Computed stats
  const hasItems = batchItems.length > 0;
  const activeItem = batchItems.find(i => i.id === selectedId) || batchItems[batchItems.length - 1] || null;
  const hasSuccessItems = batchItems.some(i => i.status === 'success');

  // Helper: Show Toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000); // Auto dismiss after 4s
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    // Auto-select the newest item if nothing is selected
    if (!selectedId && batchItems.length > 0) {
      setSelectedId(batchItems[batchItems.length - 1].id);
    }
  }, [batchItems.length]);

  // Reset zoom and target point when switching images
  useEffect(() => {
    setViewState({ scale: 1, x: 0, y: 0 });
    setTargetPoint(null);
    setSelectionBox(null);
  }, [selectedId]);

  useEffect(() => {
    const checkKey = async () => {
      try {
        // Check both API_KEY (selected) and GEMINI_API_KEY (default)
        const env = (process as any).env || {};
        if (env.API_KEY || env.GEMINI_API_KEY) {
          setHasApiKey(true);
          setIsCheckingKey(false);
          return;
        }

        const aistudio = (window as any).aistudio;
        if (aistudio && await aistudio.hasSelectedApiKey()) {
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Error checking API key:", e);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        await aistudio.openSelectKey();
        setHasApiKey(true);
      } else {
        showToast("未检测到 AI Studio 环境。请确保 API_KEY 已配置。", "error");
      }
    } catch (e) {
      console.error("Error selecting API key:", e);
      showToast("连接 API Key 失败", "error");
    }
  };

  const handleAddItems = (newItems: BatchItem[]) => {
    setBatchItems(prev => [...prev, ...newItems]);
    if (newItems.length > 0) {
      setSelectedId(newItems[0].id);
      showToast(`已添加 ${newItems.length} 张图片`, "success");
    }
  };

  const handleRemoveItem = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const handleUndo = (id: string) => {
    setBatchItems(prev => prev.map(item => {
      if (item.id !== id || item.history.length === 0) return item;

      const newHistory = [...item.history];
      const previousState = newHistory.pop();
      
      return {
        ...item,
        resultUrl: previousState || null,
        history: newHistory,
        status: previousState ? 'success' : 'idle',
        error: null,
        altText: null,
        customFileName: null 
      };
    }));
    showToast("已撤销上一步操作", "info");
  };

  const executeMerge = async (mergePrompt: string) => {
    if (batchItems.length === 0) return;
    setIsProcessing(true);
    showToast("正在合成图片...", "info");

    const placeholderId = Math.random().toString(36).substr(2, 9);
    
    const newItem: BatchItem = {
      id: placeholderId,
      file: new File([""], "Combined_Image.png", { type: "image/png" }),
      previewUrl: batchItems[0].previewUrl,
      base64: "", 
      mimeType: "image/png",
      status: 'processing',
      resultUrl: null,
      error: null,
      history: [],
      altText: null,
      customFileName: null
    };

    setBatchItems(prev => [...prev, newItem]);
    setSelectedId(placeholderId);

    try {
      const inputItems = batchItems.filter(i => i.id !== placeholderId);
      
      // --- Optimization: Parallel Resizing for Composite ---
      const optimizedInputs = await Promise.all(inputItems.map(async (item) => {
        let sourceBase64 = item.base64;
        let mimeType = item.mimeType;
        if (item.resultUrl && item.resultUrl.startsWith('data:')) {
          sourceBase64 = item.resultUrl.split(',')[1];
          mimeType = 'image/png';
        }
        
        const { base64, mimeType: optimizedMime } = await resizeImage(
          `data:${mimeType};base64,${sourceBase64}`,
          800, // Reduced from 1024
          0.7  // Quality
        );
        
        return { base64, mimeType: optimizedMime };
      }));

      const { imageUrl, altText } = await generateCompositeImage(
          optimizedInputs, 
          mergePrompt,
          selectedModel.id
      );

      setBatchItems(prev => prev.map(p => {
        if (p.id === placeholderId) {
          return {
            ...p,
            status: 'success',
            resultUrl: imageUrl,
            file: new File([""], "Composite_Result.png", { type: "image/png" }),
            altText: altText
          };
        }
        return p;
      }));
      showToast("图片合成成功！", "success");

    } catch (err: any) {
      console.error("Merge failed:", err);
      showToast(err.message || "合成失败，请重试", "error");
      setBatchItems(prev => prev.map(p => {
        if (p.id === placeholderId) {
          return { ...p, status: 'error', error: err.message || "Merge failed" };
        }
        return p;
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMerge = (mergePrompt: string) => {
    setPrompt(mergePrompt);
    setPendingOperation('merge');
    // showToast("指令已就绪，请点击“生成”按钮", "info");
  };

  const generateWithPrompt = async (currentPrompt: string, options: { aspectRatio?: string } = {}) => {
    if (!hasItems || !currentPrompt.trim()) {
      showToast("请输入指令或上传图片", "error");
      return;
    }

    setIsProcessing(true);
    showToast(`AI 正在并行处理 ${batchItems.length} 张图片...`, "info");

    const processItem = async (item: BatchItem) => {
      setBatchItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'processing', error: null } : p));

      try {
        let sourceImage = item.base64;
        let mimeType = item.mimeType;

        if (item.resultUrl && item.resultUrl.startsWith('data:')) {
           sourceImage = item.resultUrl.split(',')[1];
           mimeType = 'image/png'; 
        }

        // --- Optimization: Resize image before sending to API ---
        const { base64: optimizedBase64, mimeType: optimizedMimeType } = await resizeImage(
          `data:${mimeType};base64,${sourceImage}`,
          1024, // Reduced from 1536 for speed
          0.75  // Quality
        );

        const { imageUrl, altText } = await editImage(
          optimizedBase64,
          optimizedMimeType,
          currentPrompt,
          selectedModel.id,
          options.aspectRatio
        );

        setBatchItems(prev => prev.map(p => {
          if (p.id === item.id) {
             const currentHistory = [...p.history, p.resultUrl];
             return { 
               ...p, 
               status: 'success', 
               resultUrl: imageUrl,
               history: currentHistory,
               altText: altText
             };
          }
          return p;
        }));

      } catch (err: any) {
        console.error(`Error processing item ${item.id}:`, err);
        
        if (err.message && err.message.includes("Requested entity was not found")) {
          setHasApiKey(false);
          const aistudio = (window as any).aistudio;
          if (aistudio) await aistudio.openSelectKey();
          throw err; // Stop parallel execution if key is missing
        }
        
        setBatchItems(prev => prev.map(p => p.id === item.id ? { 
          ...p, 
          status: 'error', 
          error: err.message || "Failed" 
        } : p));
      }
    };

    try {
      await Promise.all(batchItems.map(processItem));
      showToast("批量处理完成！", "success");
    } catch (e) {
      console.error("Batch processing interrupted", e);
    } finally {
      setIsProcessing(false);
      setTargetPoint(null);
      setSelectionBox(null);
    }
  };

  const handleGenerateAltText = async () => {
    if (!activeItem) return;
    setIsProcessing(true);
    showToast("正在生成 Alt 文本...", "info");

    try {
      let sourceImage = activeItem.base64;
      let mimeType = activeItem.mimeType;

      if (activeItem.resultUrl && activeItem.resultUrl.startsWith('data:')) {
          sourceImage = activeItem.resultUrl.split(',')[1];
          mimeType = 'image/png';
      }

      // --- Optimization: Resize for Alt Text generation ---
      const { base64: optimizedBase64, mimeType: optimizedMimeType } = await resizeImage(
        `data:${mimeType};base64,${sourceImage}`,
        768, // Reduced from 1024
        0.6  // Lower quality for analysis
      );

      const text = await generateAltText(optimizedBase64, optimizedMimeType);

      setBatchItems(prev => prev.map(p => {
        if (p.id === activeItem.id) {
          return { ...p, altText: text };
        }
        return p;
      }));
      showToast("Alt 文本生成成功", "success");

    } catch (err: any) {
      console.error("Alt text gen failed:", err);
      showToast("生成 Alt 文本失败", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchSeoOptimize = async (keywords: string, namingPattern: string) => {
      setIsSeoProcessing(true);
      const successItems = batchItems.filter(item => item.status === 'success');
      
      if (successItems.length === 0) {
        showToast("没有处理成功的图片", "error");
        setIsSeoProcessing(false);
        return;
      }
      
      showToast(`正在并行优化 ${successItems.length} 张图片的 SEO 信息...`, "info");

      const processSeo = async (item: BatchItem) => {
         try {
            let sourceImage = item.base64;
            let mimeType = item.mimeType;
            if (item.resultUrl && item.resultUrl.startsWith('data:')) {
                sourceImage = item.resultUrl.split(',')[1];
                mimeType = 'image/png';
            }

            // --- Optimization: Resize for SEO analysis ---
            const { base64: optimizedBase64, mimeType: optimizedMimeType } = await resizeImage(
              `data:${mimeType};base64,${sourceImage}`,
              768, // Reduced from 1024
              0.6  // Lower quality for analysis
            );

            const { fileName, altText } = await generateSeoMetadata(optimizedBase64, optimizedMimeType, keywords, namingPattern);
            setBatchItems(prev => prev.map(p => {
                if (p.id === item.id) {
                    return { ...p, customFileName: fileName, altText: altText, seoKeywords: keywords };
                }
                return p;
            }));
         } catch (e) {
             console.error(`Failed to generate SEO data for item ${item.id}`, e);
         }
      };

      await Promise.all(successItems.map(processSeo));
      setIsSeoProcessing(false);
      showToast("SEO 批量优化完成", "success");
  };

  const handleGenerate = () => {
    if (pendingOperation === 'merge') {
      executeMerge(prompt);
    } else {
      generateWithPrompt(prompt, { aspectRatio: pendingAspectRatio });
    }
    // Reset Pending Options
    setPendingOperation('edit');
    setPendingAspectRatio(undefined);
  };

  const handleQuickAction = (actionPrompt: string, immediate: boolean = false) => {
    setPrompt(actionPrompt);
    setPendingOperation('edit');
    setPendingAspectRatio(undefined);
    if (immediate) {
      generateWithPrompt(actionPrompt);
    }
  };

  const handleExpand = (expandPrompt: string, aspectRatio?: string) => {
    setPrompt(expandPrompt);
    setPendingOperation('edit');
    setPendingAspectRatio(aspectRatio);
    // Defer execution
  };

  const handleStitch = async (direction: 'horizontal' | 'vertical') => {
    const successfulItems = batchItems.filter(item => item.status === 'success');
    if (successfulItems.length < 2) {
      showToast('请至少准备两张处理成功的图片进行拼接', 'error');
      return;
    }

    setIsProcessing(true);
    showToast("正在拼接图片...", "info");
    
    try {
      const imagesToStitch = await Promise.all(successfulItems.map(async item => {
        let base64Data = item.base64;
        let mimeType = item.mimeType;

        if (item.resultUrl && item.resultUrl.startsWith('data:')) {
          base64Data = item.resultUrl.split(',')[1];
          mimeType = 'image/png';
        }
        
        return { base64: base64Data, mimeType };
      }));

      const result = await stitchImages(imagesToStitch, direction, 10, '#ffffff');
      
      // Create a new file object from base64
      const byteString = atob(result.base64);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: result.mimeType });
      const file = new File([blob], `stitched_${direction}.png`, { type: result.mimeType });

      const newItem: BatchItem = {
        id: Math.random().toString(36).substr(2, 9),
        file: file,
        previewUrl: URL.createObjectURL(blob),
        base64: result.base64,
        mimeType: result.mimeType,
        status: 'success',
        resultUrl: `data:${result.mimeType};base64,${result.base64}`,
        error: null,
        history: []
      };

      setBatchItems(prev => [...prev, newItem]);
      setSelectedId(newItem.id);
      showToast('图片拼接成功！', 'success');
    } catch (error) {
      console.error('Stitching error:', error);
      showToast('图片拼接失败，请重试', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadItem = (id: string) => {
    const item = batchItems.find(i => i.id === id);
    if (item && item.resultUrl) {
      const link = document.createElement('a');
      link.href = item.resultUrl;
      link.download = item.customFileName || `emag-studio-${item.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("下载已开始", "success");
    }
  };

  // --- Zoom & Pan & Selection Handlers ---
  const handleWheel = (e: React.WheelEvent) => {
    if (!activeItem) return;
    // Don't zoom if drawing
    if (isDrawing) return;

    const zoomIntensity = 0.1;
    const direction = e.deltaY > 0 ? -1 : 1;
    let newScale = viewState.scale + (direction * zoomIntensity * viewState.scale);
    newScale = Math.min(Math.max(0.1, newScale), 5);
    setViewState(prev => ({ ...prev, scale: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeItem) return;

    if (activeTool === 'pan') {
      setDragStart({ x: e.clientX - viewState.x, y: e.clientY - viewState.y });
      setIsDragging(false); // Will become true on move
    } else if (activeTool === 'select') {
      const imgElement = e.currentTarget.querySelector('img');
      if (imgElement) {
         const rect = imgElement.getBoundingClientRect();
         const x = e.clientX - rect.left;
         const y = e.clientY - rect.top;
         
         // Only start if inside image bounds
         if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
           setIsDrawing(true);
           setDrawStart({ x, y });
           // Initialize box
           const xPercent = (x / rect.width) * 100;
           const yPercent = (y / rect.height) * 100;
           setSelectionBox({
             id: Math.random().toString(36),
             x: xPercent,
             y: yPercent,
             width: 0,
             height: 0
           });
           setTargetPoint(null); // Clear single point when starting box
         }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeTool === 'pan' && e.buttons === 1) { 
        if (!isDragging) setIsDragging(true); 
        e.preventDefault();
        setViewState(prev => ({
            ...prev,
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        }));
    } else if (activeTool === 'select' && isDrawing && e.buttons === 1) {
        const imgElement = e.currentTarget.querySelector('img');
        if (imgElement) {
            const rect = imgElement.getBoundingClientRect();
            const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

            const startX = drawStart.x;
            const startY = drawStart.y;

            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            const x = Math.min(currentX, startX);
            const y = Math.min(currentY, startY);

            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;
            const wPercent = (width / rect.width) * 100;
            const hPercent = (height / rect.height) * 100;

            setSelectionBox(prev => prev ? ({
               ...prev,
               x: xPercent,
               y: yPercent,
               width: wPercent,
               height: hPercent
            }) : null);
        }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!activeItem) return;

    if (activeTool === 'pan') {
      if (!isDragging) {
        // It was a click! Handle single point targeting (only if not in selection mode)
        const imgElement = e.currentTarget.querySelector('img');
        if (imgElement) {
            const rect = imgElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Convert to percentage
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;

            if (xPercent >= 0 && xPercent <= 100 && yPercent >= 0 && yPercent <= 100) {
                setTargetPoint({
                    id: Math.random().toString(36),
                    x: xPercent,
                    y: yPercent
                });
                setSelectionBox(null); // Clear selection box if point clicked
            }
        }
      }
      setIsDragging(false);
    } else if (activeTool === 'select') {
      setIsDrawing(false);
      // If box is too small, treat as click/clear
      if (selectionBox && (selectionBox.width < 1 || selectionBox.height < 1)) {
         setSelectionBox(null);
      }
    }
  };

  const resetView = () => {
    setViewState({ scale: 1, x: 0, y: 0 });
  };

  const zoomIn = () => {
    setViewState(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5) }));
  };

  const zoomOut = () => {
    setViewState(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.1) }));
  };


  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex flex-col bg-dot-pattern">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-10 text-center border border-white">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200 rotate-12">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">欢迎使用 Studio Pro</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              请连接 Google API 密钥以解锁 Gemini 3 Pro <br/>强大的图像编辑与 AI 设计能力。
            </p>
            <button
              onClick={handleSelectKey}
              className="w-full flex items-center justify-center px-4 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Key className="w-5 h-5 mr-2" />
              连接 API Key
            </button>
            <p className="text-xs text-gray-400 mt-6">
               使用 Gemini API 需要 Google Cloud 计费账户支持。
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans text-gray-900">
      <Header />
      
      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <SeoModal 
         isOpen={isSeoModalOpen}
         onClose={() => setIsSeoModalOpen(false)}
         items={batchItems}
         onGenerate={handleBatchSeoOptimize}
         onDownload={downloadItem}
         isProcessing={isSeoProcessing}
      />

      <ApiKeyModal 
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        settings={apiSettings}
        onSave={setApiSettings}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Tools & Input */}
        <aside className="w-[400px] flex flex-col border-r border-gray-200 bg-white z-10 flex-shrink-0 shadow-lg shadow-gray-100/50">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
            
            {/* 1. Model Selector (New) */}
            <div className="space-y-3">
               <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  AI 模型
                </h2>
              </div>
              <ModelSelector 
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                disabled={isProcessing}
                onOpenConfig={() => setIsApiModalOpen(true)}
              />
            </div>

            <hr className="border-gray-100" />

            {/* 2. Upload Section */}
            <div className="space-y-3">
               <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  图片素材
                </h2>
                {hasItems && (
                  <button onClick={() => setBatchItems([])} className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors">清空</button>
                )}
              </div>
              <ImageUpload 
                items={batchItems} 
                onAddItems={handleAddItems} 
                onRemoveItem={handleRemoveItem}
                disabled={isProcessing}
                compact={hasItems}
              />
            </div>

            <hr className="border-gray-100" />

            {/* 3. Text Editor (New) */}
            <TextEditor 
               onAction={handleQuickAction}
               disabled={isProcessing || !hasItems}
               targetPoint={targetPoint}
               onUpdateTargetPoint={setTargetPoint}
               selectionBox={selectionBox}
               onUpdateSelectionBox={setSelectionBox}
               activeTool={activeTool}
               setActiveTool={setActiveTool}
            />

            {/* 4. Prompt Input */}
             <div className="bg-blue-50/30 rounded-xl p-4 border border-blue-50">
                <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  生成指令
                </h2>
                <PromptSelector 
                  prompt={prompt} 
                  setPrompt={setPrompt} 
                  isProcessing={isProcessing}
                  hasItems={hasItems}
                  onGenerate={handleGenerate}
                />
             </div>

            {/* 5. Quick Actions */}
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI 工具箱</span>
              </div>
              <QuickActions 
                onAction={handleQuickAction} 
                onMerge={handleMerge}
                onExpand={handleExpand}
                onGenerateAlt={handleGenerateAltText}
                onStitch={handleStitch}
                disabled={isProcessing || !hasItems} 
              />
            </div>

          </div>
        </aside>

        {/* Main Workspace: Canvas & Filmstrip */}
        <main className="flex-1 flex flex-col bg-dot-pattern min-w-0 relative">
          
          {/* Top: Main Canvas */}
          <div 
            className={`flex-1 relative overflow-hidden flex items-center justify-center ${activeItem ? 'bg-gray-100/50' : ''} ${activeTool === 'pan' && isDragging ? 'cursor-grabbing' : activeTool === 'pan' ? 'cursor-grab' : 'cursor-crosshair'}`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
             {activeItem ? (
                <>
                  {/* Transform Container */}
                  <div 
                    className="relative transition-transform duration-75 ease-out origin-center z-10"
                    style={{ 
                      transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})` 
                    }}
                  >
                    <div className="relative shadow-2xl bg-white max-w-[80vw] max-h-[80vh] group/image ring-1 ring-gray-900/5 bg-checkerboard select-none">
                      <img 
                          src={activeItem.resultUrl || activeItem.previewUrl} 
                          className="max-w-full max-h-[calc(100vh-250px)] object-contain block"
                          alt="Workspace"
                          draggable={false}
                      />
                      
                      {/* Target Point Marker */}
                      {targetPoint && !selectionBox && (
                          <div 
                             className="absolute w-6 h-6 -ml-3 -mt-3 text-blue-600 z-50 pointer-events-none drop-shadow-md animate-bounce"
                             style={{ left: `${targetPoint.x}%`, top: `${targetPoint.y}%` }}
                          >
                             <MousePointer2 className="w-full h-full fill-blue-600 stroke-white" />
                          </div>
                      )}

                      {/* Selection Box Overlay (Pink for Playfulness) */}
                      {selectionBox && (
                          <div 
                            className="absolute border-2 border-pink-500 bg-pink-500/20 z-40 pointer-events-none"
                            style={{ 
                                left: `${selectionBox.x}%`, 
                                top: `${selectionBox.y}%`, 
                                width: `${selectionBox.width}%`, 
                                height: `${selectionBox.height}%` 
                            }}
                          >
                             {/* Corners */}
                             <div className="absolute -top-1 -left-1 w-2 h-2 bg-pink-600 border border-white"></div>
                             <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-600 border border-white"></div>
                             <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-600 border border-white"></div>
                             <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-pink-600 border border-white"></div>
                          </div>
                      )}

                       {/* Hover hint for click-to-target */}
                       {!isDragging && !isDrawing && !targetPoint && !selectionBox && !isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 pointer-events-none transition-opacity duration-500">
                             <div className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/10">
                                {activeTool === 'pan' ? '点击定位，或拖拽移动' : '拖拽以框选区域'}
                             </div>
                          </div>
                       )}

                       {/* Processing State Overlay */}
                       {activeItem.status === 'processing' && (
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px] flex items-center justify-center z-20">
                             <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-3 scale-[1/scale] border border-gray-100">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                                   AI (Gemini 3 Pro) 正在绘制中...
                                </span>
                             </div>
                          </div>
                       )}
                    </div>
                  </div>

                  {/* Info Overlay */}
                  <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 items-start animate-slide-in">
                     <div className="bg-white/90 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-2 flex items-center gap-3 ring-1 ring-black/5">
                         <div className="px-2">
                            <p className="font-semibold text-sm truncate max-w-[200px] text-gray-800">{activeItem.customFileName || activeItem.file.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${activeItem.status === 'success' ? 'bg-green-500' : activeItem.status === 'error' ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                                <p className="opacity-60 text-xs text-gray-500">{activeItem.history.length > 0 ? `版本 v${activeItem.history.length + 1}` : '原始版本'}</p>
                            </div>
                         </div>
                         <div className="h-8 w-px bg-gray-200"></div>
                         <div className="flex gap-1">
                            <button 
                              onClick={() => handleUndo(activeItem.id)} 
                              disabled={activeItem.history.length === 0}
                              className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition disabled:opacity-30" 
                              title="撤销"
                            >
                              <Undo2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => downloadItem(activeItem.id)}
                              className="p-2 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition" 
                              title="下载"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                         </div>
                     </div>
                  </div>

                  {/* Zoom & Tool Controls */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-slide-in">
                     
                     {/* Tool Toggle */}
                     <div className="flex bg-white/90 backdrop-blur-md p-1 rounded-full shadow-xl border border-white/50 ring-1 ring-black/5">
                        <button 
                          onClick={() => setActiveTool('pan')} 
                          className={`p-2 rounded-full transition-colors ${activeTool === 'pan' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
                          title="平移 / 点击 (Pan)"
                        >
                            <Hand className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setActiveTool('select')} 
                          className={`p-2 rounded-full transition-colors ${activeTool === 'select' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`}
                          title="框选区域 (Select)"
                        >
                            <BoxSelect className="w-4 h-4" />
                        </button>
                     </div>

                     {/* Zoom */}
                     <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-xl border border-white/50 ring-1 ring-black/5">
                        <button onClick={zoomOut} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors" title="缩小">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <div className="w-12 text-center text-xs font-mono font-medium text-gray-600 tabular-nums">
                            {Math.round(viewState.scale * 100)}%
                        </div>
                        <button onClick={zoomIn} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors" title="放大">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <button onClick={resetView} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors" title="重置视图">
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                     </div>
                  </div>
                </>
             ) : (
                <div className="text-center flex flex-col items-center animate-slide-in">
                   <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 rotate-3 transform transition-transform hover:rotate-6 duration-300">
                      <ImageIcon className="w-10 h-10 text-blue-200" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">开始创作</h3>
                   <p className="text-gray-500 max-w-xs leading-relaxed">
                      请在左侧菜单上传图片，<br/>使用 AI 进行编辑、翻译与合成。
                   </p>
                </div>
             )}
          </div>

          {/* Bottom: Filmstrip / Gallery */}
          <div className="h-36 bg-white border-t border-gray-200 px-6 py-4 flex gap-4 overflow-x-auto custom-scrollbar items-center z-30 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
             {batchItems.length > 0 ? (
                <>
                  {batchItems.map(item => (
                     <div 
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`
                           relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 group bg-checkerboard
                           ${selectedId === item.id ? 'border-blue-600 ring-4 ring-blue-50 scale-105 shadow-lg z-10' : 'border-gray-100 hover:border-gray-300 opacity-80 hover:opacity-100'}
                        `}
                     >
                        <img src={item.resultUrl || item.previewUrl} className="w-full h-full object-contain" />
                        
                        {/* Status Indicators */}
                        {item.status === 'success' && selectedId !== item.id && (
                           <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                        )}
                         {item.status === 'processing' && (
                           <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                           </div>
                        )}

                        <button 
                           onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
                           className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                        >
                           <X className="w-3 h-3" />
                        </button>
                     </div>
                  ))}
                  
                  <div className="w-px h-16 bg-gray-200 mx-4"></div>
                  
                  <div className="flex items-center gap-3 h-full pr-4">
                     <button 
                       onClick={() => setIsSeoModalOpen(true)}
                       disabled={!hasSuccessItems}
                       className="group flex flex-col items-center justify-center w-24 h-24 bg-white hover:bg-blue-50 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl transition-all gap-2 disabled:opacity-40 disabled:border-gray-200 disabled:bg-gray-50"
                     >
                        <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg text-blue-600 transition-colors">
                           <Search className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-semibold text-blue-900">SEO</span>
                     </button>
                     
                     <button 
                       onClick={() => {
                           const successful = batchItems.filter(i => i.status === 'success' && i.resultUrl);
                           if(successful.length) successful.forEach(i => downloadItem(i.id));
                       }}
                       disabled={!hasSuccessItems}
                       className="group flex flex-col items-center justify-center w-24 h-24 bg-white hover:bg-green-50 border-2 border-dashed border-green-200 hover:border-green-400 rounded-xl transition-all gap-2 disabled:opacity-40 disabled:border-gray-200 disabled:bg-gray-50"
                     >
                        <div className="p-2 bg-green-100 group-hover:bg-green-200 rounded-lg text-green-600 transition-colors">
                            <FolderDown className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-semibold text-green-900">保存全部</span>
                     </button>
                  </div>
                </>
             ) : (
                <div className="w-full text-center text-xs text-gray-400 flex items-center justify-center gap-3 py-4">
                   <div className="h-px w-12 bg-gray-200"></div>
                   <span>图片历史记录将显示在此处</span>
                   <div className="h-px w-12 bg-gray-200"></div>
                </div>
             )}
          </div>
        </main>

      </div>
    </div>
  );
}