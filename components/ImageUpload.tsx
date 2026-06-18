import React, { useRef, useState } from 'react';
import { Upload, X, Plus, FileImage } from 'lucide-react';
import { BatchItem } from '../types';

interface ImageUploadProps {
  items: BatchItem[];
  onAddItems: (newItems: BatchItem[]) => void;
  onRemoveItem: (id: string) => void;
  disabled: boolean;
  compact?: boolean; // New prop for layout
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ items, onAddItems, onRemoveItem, disabled, compact }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: FileList | File[]) => {
    const newItems: BatchItem[] = [];
    const fileArray = Array.from(files);
    
    let processedCount = 0;

    fileArray.forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const [mimePrefix, base64Data] = result.split(',');
        const mimeType = mimePrefix.match(/:(.*?);/)?.[1] || 'image/jpeg';
        
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          previewUrl: result,
          base64: base64Data,
          mimeType,
          status: 'idle',
          resultUrl: null,
          error: null,
          history: [] 
        });

        processedCount++;
        if (processedCount === fileArray.length) {
          onAddItems(newItems);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* COMPACT MODE: List of items + Mini Add Button */}
      {compact && items.length > 0 ? (
        <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2">
                {items.map((item) => (
                    <div key={item.id} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 group">
                        <img src={item.previewUrl} className="w-full h-full object-cover" />
                        {!disabled && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                                className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-500"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                        {item.status === 'success' && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-tl-md"></div>}
                    </div>
                ))}
                
                {/* Add Button in Grid */}
                <button
                    onClick={() => !disabled && fileInputRef.current?.click()}
                    className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-gray-400 hover:text-indigo-500"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
        </div>
      ) : (
        /* FULL MODE: Big Drop Zone */
        <div
            onClick={() => !disabled && fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`
            relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : 'cursor-pointer'}
            ${isDragging 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50'
            }
            `}
        >
            <div className={`p-3 rounded-full mb-2 ${isDragging ? 'bg-indigo-200 text-indigo-700' : 'bg-indigo-100 text-indigo-600'}`}>
                <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-900 text-center">
                点击或拖拽上传图片
            </p>
            <p className="text-xs text-gray-500 mt-1 text-center">支持批量 (JPG, PNG)</p>
        </div>
      )}
    </div>
  );
};