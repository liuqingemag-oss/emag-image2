import React, { useState } from 'react';
import { Type, Pencil, Plus, Palette, ArrowRight, MousePointer2, PaintBucket, MoveVertical, Sparkles, Wand2, RefreshCcw, Eraser, AlignCenter, Scan, CircleDashed, BoxSelect, Languages } from 'lucide-react';
import { FONT_STYLES, TargetPoint, SelectionBox } from '../types';

interface TextEditorProps {
  onAction: (prompt: string) => void;
  disabled: boolean;
  targetPoint: TargetPoint | null;
  onUpdateTargetPoint: (point: TargetPoint | null) => void;
  selectionBox: SelectionBox | null;
  onUpdateSelectionBox: (box: SelectionBox | null) => void;
  activeTool: 'pan' | 'select';
  setActiveTool: (tool: 'pan' | 'select') => void;
}

type EditorMode = 'replace' | 'add' | 'style' | 'spot' | 'translate';

const SPOT_ACTIONS = [
  { label: "细节锐化 (Sharpen)", value: "Sharpen details and enhance clarity" },
  { label: "色彩校正 (Color Correct)", value: "Correct color balance and saturation" },
  { label: "局部提亮 (Brighten)", value: "Brighten shadows and improve lighting" },
  { label: "去除瑕疵/修复 (Inpaint)", value: "Remove blemishes, spots, or artifacts (inpainting)" },
  { label: "局部降噪 (Denoise)", value: "Reduce noise and grain" },
  { label: "高斯模糊 (Blur)", value: "Apply gaussian blur to obscure details" }
];

const TARGET_LANGUAGES = [
  { label: '中文 (CN)', val: 'Chinese (Simplified)' },
  { label: '英语 (EN)', val: 'English' },
  { label: '罗马尼亚语 (RO)', val: 'Romanian' },
  { label: '波兰语 (PL)', val: 'Polish' },
  { label: '保加利亚语 (BG)', val: 'Bulgarian' },
  { label: '匈牙利语 (HU)', val: 'Hungarian' },
  { label: '捷克语 (CZ)', val: 'Czech' },
  { label: '德语 (DE)', val: 'German' },
  { label: '法语 (FR)', val: 'French' },
  { label: '西班牙语 (ES)', val: 'Spanish' },
  { label: '意大利语 (IT)', val: 'Italian' },
];

export const TextEditor: React.FC<TextEditorProps> = ({ 
  onAction, 
  disabled, 
  targetPoint, 
  onUpdateTargetPoint,
  selectionBox, 
  onUpdateSelectionBox,
  activeTool,
  setActiveTool
}) => {
  const [mode, setMode] = useState<EditorMode>('replace');
  
  // Inputs
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [addText, setAddText] = useState('');
  
  // Style State
  const [selectedFont, setSelectedFont] = useState(FONT_STYLES[0].value);
  const [textColor, setTextColor] = useState('#000000');
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [fontSize, setFontSize] = useState<string>('default');

  // Spot State
  const [spotAction, setSpotAction] = useState(SPOT_ACTIONS[0].value);
  
  // Translate State - Default to Chinese
  const [targetLang, setTargetLang] = useState('Chinese (Simplified)');

  // Effect to switch tools when tab changes
  React.useEffect(() => {
    if (mode === 'spot' || mode === 'translate') {
      setActiveTool('select');
    } else {
      setActiveTool('pan');
      // Clear selection box when leaving selection modes
      // onUpdateSelectionBox(null); 
    }
  }, [mode, setActiveTool]);

  const handleApply = () => {
    let prompt = "";
    const isStyleOnly = mode === 'style';

    // 1. Core Intent
    if (mode === 'replace') {
      if (!replaceText.trim()) return;
      prompt = `Find the text "${findText || 'text in the image'}" and REPLACE it with "${replaceText}".`;
    } else if (mode === 'add') {
      if (!addText.trim()) return;
      prompt = `ADD the text "${addText}" to the image.`;
    } else if (mode === 'style') {
      prompt = `Modify the text style in the image.`;
      if (findText) prompt += ` Target specifically the text "${findText}".`;
      else prompt += ` Target ALL text in the image.`;
    } else if (mode === 'spot') {
      if (!selectionBox) return;
      
      const ymin = Math.round(selectionBox.y);
      const xmin = Math.round(selectionBox.x);
      const ymax = Math.round(selectionBox.y + selectionBox.height);
      const xmax = Math.round(selectionBox.x + selectionBox.width);

      prompt = `LOCALLY APPLY: ${spotAction}. TARGET BOUNDING BOX: [${ymin}, ${xmin}, ${ymax}, ${xmax}] (scale 0-100). CONSTRAINT: Only affect pixels INSIDE this box. Blend edges seamlessly.`;
      onAction(prompt);
      return;
    } else if (mode === 'translate') {
      if (!selectionBox) return;
      
      const ymin = Math.round(selectionBox.y);
      const xmin = Math.round(selectionBox.x);
      const ymax = Math.round(selectionBox.y + selectionBox.height);
      const xmax = Math.round(selectionBox.x + selectionBox.width);

      prompt = `Translate the text found strictly within the bounding box region [${ymin}, ${xmin}, ${ymax}, ${xmax}] (scale 0-100) to ${targetLang}. Replace the original text with the translation, matching the original font, color, and perspective. Do not translate text outside this box.`;
      onAction(prompt);
      return;
    }

    // 2. Positioning (AI or Manual) for Text modes
    if (targetPoint) {
       prompt += ` Location: strictly centered around horizontal ${targetPoint.x.toFixed(1)}% and vertical ${targetPoint.y.toFixed(1)}%.`;
    } else if (mode === 'add') {
       prompt += ` Location: Identify the best open space or compositionally balanced area for this text.`;
    } else if (mode === 'replace' && !findText) {
       prompt += ` Location: Identify the most prominent text.`;
    }

    // 3. Styling Logic
    const stylePromptParts = [];
    
    // Font
    if (selectedFont !== FONT_STYLES[0].value) {
      stylePromptParts.push(`change font to ${selectedFont}`);
    } else if (mode === 'replace') {
      stylePromptParts.push(`maintain the original font style exactly`);
    }

    // Color
    if (useCustomColor) {
      stylePromptParts.push(`change color to ${textColor} (hex)`);
    } else if (mode === 'replace' && !isStyleOnly) {
       stylePromptParts.push(`keep original text color`);
    }

    // Size
    if (fontSize !== 'default') {
      stylePromptParts.push(`resize text to be ${fontSize}`);
    }

    if (stylePromptParts.length > 0) {
      prompt += ` Style instructions: ${stylePromptParts.join(', ')}.`;
    }

    // 4. Quality Guardrails
    prompt += " Ensure the modified text blends naturally with the original lighting, perspective, and background texture (inpainting where necessary).";

    onAction(prompt);
  };

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-blue-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">AI 智能编辑大师</h3>
        </div>
        
        {/* Clear Buttons */}
        {(mode === 'spot' || mode === 'translate') && selectionBox && (
           <button 
             onClick={() => onUpdateSelectionBox(null)}
             className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full border border-red-100 hover:bg-red-100 transition-colors"
           >
             <BoxSelect className="w-3 h-3" />
             清除选区
           </button>
        )}
        {(mode !== 'spot' && mode !== 'translate') && targetPoint && (
           <button 
             onClick={() => onUpdateTargetPoint(null)}
             className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full border border-red-100 hover:bg-red-100 transition-colors"
           >
             <MousePointer2 className="w-3 h-3" />
             清除定点
           </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setMode('replace')}
          className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors relative ${mode === 'replace' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          替换
          {mode === 'replace' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
        <button
          onClick={() => setMode('add')}
          className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors relative ${mode === 'add' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Plus className="w-3.5 h-3.5" />
          新增
          {mode === 'add' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
        <button
          onClick={() => setMode('style')}
          className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors relative ${mode === 'style' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Palette className="w-3.5 h-3.5" />
          样式
          {mode === 'style' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
        <button
          onClick={() => setMode('spot')}
          className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors relative ${mode === 'spot' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Scan className="w-3.5 h-3.5" />
          局部
          {mode === 'spot' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
        <button
          onClick={() => setMode('translate')}
          className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors relative ${mode === 'translate' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Languages className="w-3.5 h-3.5" />
          翻译
          {mode === 'translate' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
      </div>

      <div className="p-4 space-y-4">
        
        {/* Dynamic Inputs based on Mode */}
        {mode === 'replace' && (
          <div className="space-y-3">
             <div className="relative">
                <input
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="原文本 (选填，AI 自动识别)"
                  className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-gray-50 placeholder-gray-400"
                />
                {!findText && !targetPoint && <span className="absolute right-2 top-2.5 text-[10px] text-blue-500 font-medium">Auto</span>}
             </div>
             <div className="relative">
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="替换为..."
                  className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"
                />
             </div>
          </div>
        )}

        {mode === 'add' && (
           <div className="space-y-3">
              <input
                  type="text"
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  placeholder="输入要添加的文字..."
                  className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"
              />
              {!targetPoint && (
                 <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>未选择位置。AI 将自动寻找最佳空白处。</span>
                 </div>
              )}
           </div>
        )}

        {mode === 'style' && (
           <div className="space-y-3">
              <input
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="目标文本 (留空则修改所有文本)"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-gray-50 placeholder-gray-400"
              />
           </div>
        )}

        {mode === 'spot' && (
           <div className="space-y-3">
              <div>
                  <label className="text-[10px] font-semibold text-gray-500 mb-1 block">操作类型</label>
                  <select
                      value={spotAction}
                      onChange={(e) => setSpotAction(e.target.value)}
                      className="w-full px-2 py-2 text-sm border border-blue-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"
                  >
                      {SPOT_ACTIONS.map(action => (
                          <option key={action.value} value={action.value}>{action.label}</option>
                      ))}
                  </select>
              </div>
              
              {!selectionBox ? (
                 <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100 animate-pulse">
                    <BoxSelect className="w-3.5 h-3.5" />
                    <span>请在右侧图片上<b>拖拽鼠标</b>以框选区域</span>
                 </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100">
                    <BoxSelect className="w-3.5 h-3.5" />
                    <span>已选区域: {Math.round(selectionBox.width)}% x {Math.round(selectionBox.height)}%</span>
                 </div>
              )}
           </div>
        )}

        {mode === 'translate' && (
           <div className="space-y-3">
              <div>
                  <label className="text-[10px] font-semibold text-gray-500 mb-1 block">目标语言</label>
                  <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="w-full px-2 py-2 text-sm border border-blue-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white shadow-sm"
                  >
                      {TARGET_LANGUAGES.map(lang => (
                          <option key={lang.val} value={lang.val}>{lang.label}</option>
                      ))}
                  </select>
              </div>
              
              {!selectionBox ? (
                 <div className="flex items-center gap-2 text-xs text-pink-700 bg-pink-50 p-2 rounded border border-pink-100 animate-pulse">
                    <BoxSelect className="w-3.5 h-3.5" />
                    <span>请在右侧图片上<b>拖拽鼠标</b>以框选需要翻译的文本</span>
                 </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100">
                    <BoxSelect className="w-3.5 h-3.5" />
                    <span>已选区域: {Math.round(selectionBox.width)}% x {Math.round(selectionBox.height)}%</span>
                 </div>
              )}
           </div>
        )}

        {/* Location Hint (Text Modes) */}
        {(mode !== 'spot' && mode !== 'translate') && targetPoint && (
           <div className="flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100">
              <span className="flex items-center gap-1.5">
                 <MousePointer2 className="w-3.5 h-3.5" />
                 定位坐标: X {targetPoint.x.toFixed(0)}%, Y {targetPoint.y.toFixed(0)}%
              </span>
           </div>
        )}
        {(mode !== 'spot' && mode !== 'translate') && !targetPoint && (
           <div className="group relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-[10px] text-gray-400">点击图片可精确定位</span>
              </div>
           </div>
        )}

        {/* Style Controls (Only for Standard Text Modes) */}
        {(mode !== 'spot' && mode !== 'translate') && (
            <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Font */}
                <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    disabled={disabled}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-gray-700"
                >
                    {FONT_STYLES.map((style) => (
                    <option key={style.value} value={style.value}>{style.label}</option>
                    ))}
                </select>
                
                {/* Size */}
                <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                disabled={disabled}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-gray-700"
                >
                <option value="default">大小: 默认</option>
                <option value="very small">大小: 极小</option>
                <option value="small">大小: 小</option>
                <option value="medium">大小: 中等</option>
                <option value="large">大小: 大</option>
                <option value="huge">大小: 特大</option>
                </select>

                {/* Color */}
                <div className="col-span-2 flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="useColor"
                        checked={useCustomColor} 
                        onChange={(e) => setUseCustomColor(e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="useColor" className="text-xs text-gray-600 cursor-pointer select-none">自定义颜色</label>
                    </div>
                    <input
                        type="color"
                        value={textColor}
                        onChange={(e) => {
                        setTextColor(e.target.value);
                        setUseCustomColor(true);
                        }}
                        disabled={!useCustomColor}
                        className={`h-6 flex-1 rounded cursor-pointer border-0 p-0 ${!useCustomColor ? 'opacity-30 grayscale' : ''}`}
                    />
                </div>
            </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleApply}
          disabled={disabled || (mode === 'replace' && !replaceText) || (mode === 'add' && !addText) || ((mode === 'spot' || mode === 'translate') && !selectionBox)}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4" />
          AI 执行: {mode === 'replace' ? '替换文本' : mode === 'add' ? '新增文本' : mode === 'spot' ? '局部调整' : mode === 'translate' ? '翻译' : '修改样式'}
        </button>
      </div>
    </div>
  );
}