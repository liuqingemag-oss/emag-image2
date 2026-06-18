import React, { useState } from 'react';
import { RotateCw, RotateCcw, Sun, Moon, Sparkles, Zap, Layers, ShoppingBag, Rotate3d, Eraser, PaintBucket, Type, Wand2, Palette, Languages, Scissors, Square, RectangleVertical, RectangleHorizontal, Scaling, Expand, Maximize2, ArrowLeftRight, ArrowUpDown, Aperture, Film, ChevronDown, PenTool, MonitorPlay, FileText, Globe, Image as ImageIcon, Armchair, Mountain, LayoutTemplate, Sliders, Activity, Droplet, SunMedium, ShoppingCart, Package, Info as InfoIcon, Camera } from 'lucide-react';

interface QuickActionsProps {
  onAction: (prompt: string, immediate?: boolean) => void;
  onMerge: (prompt: string) => void;
  onExpand: (prompt: string, aspectRatio?: string) => void;
  onGenerateAlt: () => void;
  onStitch: (direction: 'horizontal' | 'vertical') => void;
  disabled: boolean;
}

const TARGET_LANGUAGES = [
  { label: '中文 (Chinese)', val: 'Chinese (Simplified)' },
  { label: '英语 (English)', val: 'English' },
  { label: '罗马尼亚语 (RO)', val: 'Romanian' },
  { label: '波兰语 (Polish)', val: 'Polish' },
  { label: '保加利亚语 (BG)', val: 'Bulgarian' },
  { label: '匈牙利语 (HU)', val: 'Hungarian' },
  { label: '捷克语 (Czech)', val: 'Czech' },
  { label: '德语 (German)', val: 'German' },
  { label: '法语 (French)', val: 'French' },
  { label: '西班牙语 (Spanish)', val: 'Spanish' },
  { label: '意大利语 (Italian)', val: 'Italian' },
];

interface AccordionItemProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  colorTheme: 'blue' | 'green' | 'orange' | 'pink' | 'yellow' | 'purple' | 'cyan';
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ 
  id,
  title, 
  icon, 
  isOpen, 
  onToggle, 
  colorTheme,
  children 
}) => {
  const getThemeClasses = () => {
    switch(colorTheme) {
      case 'blue': return {
        header: isOpen ? 'bg-blue-50 text-blue-800' : 'hover:bg-blue-50 text-gray-700',
        border: isOpen ? 'border-blue-200 ring-blue-50' : 'border-gray-200',
        icon: 'text-blue-500'
      };
      case 'green': return {
        header: isOpen ? 'bg-green-50 text-green-800' : 'hover:bg-green-50 text-gray-700',
        border: isOpen ? 'border-green-200 ring-green-50' : 'border-gray-200',
        icon: 'text-green-500'
      };
      case 'orange': return {
        header: isOpen ? 'bg-orange-50 text-orange-800' : 'hover:bg-orange-50 text-gray-700',
        border: isOpen ? 'border-orange-200 ring-orange-50' : 'border-gray-200',
        icon: 'text-orange-500'
      };
      case 'pink': return {
        header: isOpen ? 'bg-pink-50 text-pink-800' : 'hover:bg-pink-50 text-gray-700',
        border: isOpen ? 'border-pink-200 ring-pink-50' : 'border-gray-200',
        icon: 'text-pink-500'
      };
      case 'yellow': return {
        header: isOpen ? 'bg-yellow-50 text-yellow-800' : 'hover:bg-yellow-50 text-gray-700',
        border: isOpen ? 'border-yellow-200 ring-yellow-50' : 'border-gray-200',
        icon: 'text-yellow-600'
      };
      case 'purple': return {
        header: isOpen ? 'bg-purple-50 text-purple-800' : 'hover:bg-purple-50 text-gray-700',
        border: isOpen ? 'border-purple-200 ring-purple-50' : 'border-gray-200',
        icon: 'text-purple-500'
      };
      case 'cyan': return {
        header: isOpen ? 'bg-cyan-50 text-cyan-800' : 'hover:bg-cyan-50 text-gray-700',
        border: isOpen ? 'border-cyan-200 ring-cyan-50' : 'border-gray-200',
        icon: 'text-cyan-500'
      };
      default: return {
        header: isOpen ? 'bg-gray-50' : 'hover:bg-gray-50',
        border: 'border-gray-200',
        icon: 'text-gray-500'
      };
    }
  };

  const theme = getThemeClasses();

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${theme.border} ${isOpen ? 'ring-1 bg-white shadow-sm' : 'bg-white'}`}>
      <button
        onClick={onToggle}
        className={`w-full px-3 py-3 flex items-center justify-between text-left transition-colors ${theme.header}`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`${isOpen ? 'scale-110' : ''} transition-transform duration-200`}>
             {React.cloneElement(icon as React.ReactElement, { className: `w-4 h-4 ${theme.icon}` })}
          </div>
          <span className="text-xs font-bold tracking-tight">{title}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="p-2 border-t border-gray-100 animate-in slide-in-from-top-1 fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, disabled, fullWidth }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-indigo-600 
        border border-gray-200 hover:border-indigo-200 rounded-lg text-xs font-medium transition-all shadow-sm hover:shadow 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${fullWidth ? 'w-full' : 'w-full'}
      `}
      title={label}
    >
      {icon}
      <span className="truncate max-w-[140px]">{label}</span>
    </button>
  );
};

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction, onMerge, onExpand, onGenerateAlt, onStitch, disabled }) => {
  // Default open section
  const [openSection, setOpenSection] = useState<string>('AMAZON');

  // Expansion State
  const [expandZoom, setExpandZoom] = useState('1.5x');
  const [expandRatio, setExpandRatio] = useState<string | undefined>(undefined);
  const [expandFill, setExpandFill] = useState('generative');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  const handleSmartExpand = () => {
    let prompt = `Zoom out the image by ${expandZoom}.`;
    
    // Fill strategy
    if (expandFill === 'solid_white') {
        prompt += " Fill the new background space with a clean, solid white color.";
    } else if (expandFill === 'solid_black') {
        prompt += " Fill the new background space with a clean, solid black color.";
    } else if (expandFill === 'blur') {
        prompt += " Fill the extended background area with a blurred version of the original image content.";
    } else {
        // Generative (default)
        prompt += " Extend the background seamlessly to show more context, matching the lighting and perspective of the original scene.";
    }

    onExpand(prompt, expandRatio);
  };

  return (
    <div className="space-y-3">
      
      {/* 0. AMAZON E-COMMERCE (Orange/Gold) */}
      <AccordionItem 
         id="AMAZON" 
         title="亚马逊主图 (Amazon Pro)" 
         icon={<ShoppingCart />}
         isOpen={openSection === 'AMAZON'}
         onToggle={() => toggleSection('AMAZON')}
         colorTheme="orange"
      >
           <p className="text-[10px] text-gray-500 mb-3 px-1">
             一键生成符合亚马逊标准的高端电商主图与详情页。
           </p>
           
           <div className="space-y-2">
              <div className="relative">
                <ActionButton 
                  icon={<Camera className="w-3.5 h-3.5 text-orange-600" />} 
                  label="生成亚马逊主图 (Main)" 
                  fullWidth
                  onClick={() => onAction("Style: Professional e-commerce kitchen photography, high-resolution, bright and appetizing lighting.\n\nComposition: Focus on the product from the image. It is the central element on a clean quartz countertop.\n\nBackground: A bright, modern kitchen with a window in the blurred background. A cutting board with some vegetables, a nice bowl of fresh fruit, and a sleek coffee maker are visible but out of focus.\n\nLighting: Natural window light supplemented by soft studio fill, highlighting the textures of food and the product's design.", true)} 
                  disabled={disabled}
                />
                <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-orange-500 text-[8px] font-bold text-white rounded-full shadow-sm pointer-events-none">一键生成</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <ActionButton 
                    icon={<Maximize2 className="w-3.5 h-3.5" />} 
                    label="细节/多角度" 
                    onClick={() => onAction("Style: Professional e-commerce kitchen photography.\n\nComposition: A detailed close-up view of the product, showing its internal structure or a key feature (e.g., if it's an air fryer, show the basket slightly pulled out to reveal the cooking chamber). Use a shallow depth of field.\n\nBackground: Modern kitchen countertop, slightly blurred.\n\nLighting: Bright, clear lighting to highlight textures and build quality.", true)} 
                    disabled={disabled}
                  />
                  <div className="absolute -top-1 -right-1 px-1 py-0.5 bg-orange-400 text-[7px] font-bold text-white rounded-full pointer-events-none">一键</div>
                </div>
                <div className="relative">
                  <ActionButton 
                    icon={<InfoIcon className="w-3.5 h-3.5" />} 
                    label="功能卖点图" 
                    onClick={() => onAction("Style: Clean e-commerce infographic.\n\nComposition: The product centered on a clean background. Add clean, professional call-out lines and text labels pointing to key features (e.g., 'Intuitive Touch Control', 'Large Capacity').\n\nBackground: Minimalist studio background.\n\nLighting: Even, flat lighting for clarity.", true)} 
                    disabled={disabled}
                  />
                  <div className="absolute -top-1 -right-1 px-1 py-0.5 bg-orange-400 text-[7px] font-bold text-white rounded-full pointer-events-none">一键</div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 relative">
                <button
                  onClick={() => onAction("Generate a set of 3 Amazon-style images: 1. Main image on a quartz countertop in a modern kitchen. 2. A detail shot showing the product's unique features. 3. An infographic style shot with feature callouts. Maintain consistent lighting and professional e-commerce style across all.", true)}
                  disabled={disabled}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border border-transparent rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  生成全套亚马主图 (Set)
                </button>
                <div className="absolute top-0.5 right-1 px-2 py-0.5 bg-amber-500 text-[8px] font-bold text-white rounded-full shadow-sm pointer-events-none">PRO</div>
              </div>
           </div>
      </AccordionItem>

      {/* 布局与拼接 */}
      <AccordionItem 
        id="LAYOUT"
        title="布局与拼接 (Stitch)" 
        icon={<LayoutTemplate className="w-4 h-4" />} 
        isOpen={openSection === 'LAYOUT'} 
        onToggle={() => toggleSection('LAYOUT')}
        colorTheme="cyan"
      >
        <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">
          将当前批次中的所有已处理图片拼接成一张长图。
        </p>
        <div className="grid grid-cols-2 gap-2">
          <ActionButton 
            icon={<ArrowUpDown className="w-3.5 h-3.5" />} 
            label="纵向拼接" 
            onClick={() => onStitch('vertical')} 
            disabled={disabled}
          />
          <ActionButton 
            icon={<ArrowLeftRight className="w-3.5 h-3.5" />} 
            label="横向拼接" 
            onClick={() => onStitch('horizontal')} 
            disabled={disabled}
          />
        </div>
      </AccordionItem>

      {/* 0. SMART SCENE (Blue) */}
      <AccordionItem 
         id="SCENE" 
         title="智能场景 (Scene)" 
         icon={<ImageIcon />}
         isOpen={openSection === 'SCENE'}
         onToggle={() => toggleSection('SCENE')}
         colorTheme="blue"
      >
           <p className="text-[10px] text-gray-500 mb-2 px-1">
             AI 自动分析产品，生成完美融合的背景场景。
           </p>
           <div className="grid grid-cols-2 gap-2 mb-2">
              <ActionButton 
                icon={<Sparkles className="w-3.5 h-3.5 text-blue-500" />} 
                label="智能匹配 (Auto)" 
                onClick={() => onAction("Analyze the product in this image. Based on its type, material, and usage context, replace the background with a hyper-realistic, highly aesthetic setting that fits perfectly. Ensure realistic lighting and perspective matching.")} 
                disabled={disabled}
              />
              <ActionButton 
                icon={<LayoutTemplate className="w-3.5 h-3.5" />} 
                label="高级影棚" 
                onClick={() => onAction("Place the product in a high-end, minimal photography studio setting. Use a clean podium or textured surface, soft cinematic lighting, and generate realistic contact shadows.")} 
                disabled={disabled}
              />
           </div>
           <div className="grid grid-cols-2 gap-2">
              <ActionButton 
                icon={<Armchair className="w-3.5 h-3.5" />} 
                label="居家生活" 
                onClick={() => onAction("Place the product in a cozy, stylish home interior setting (e.g., on a wooden table, kitchen counter, or living room shelf). Ensure soft, natural window lighting and a slightly blurred background depth of field.")} 
                disabled={disabled}
              />
              <ActionButton 
                icon={<Mountain className="w-3.5 h-3.5" />} 
                label="自然风光" 
                onClick={() => onAction("Place the product in a beautiful outdoor nature setting. Use elements like sunlight, natural rocks, water, or greenery that complement the product. Ensure the lighting matches an outdoor environment.")} 
                disabled={disabled}
              />
           </div>
      </AccordionItem>
      
      {/* 1. ESSENTIALS (Green) */}
      <AccordionItem 
         id="ESSENTIALS" 
         title="基础修图 (Essentials)" 
         icon={<Zap />}
         isOpen={openSection === 'ESSENTIALS'}
         onToggle={() => toggleSection('ESSENTIALS')}
         colorTheme="green"
      >
           <div className="grid grid-cols-2 gap-2 mb-2">
              <ActionButton 
                icon={<PaintBucket className="w-3.5 h-3.5 text-green-600" />} 
                label="生成白底图" 
                onClick={() => onAction("Replace the background with a clean solid white background (#FFFFFF). Preserve the subject and its natural contact shadows.")} 
                disabled={disabled}
              />
              <ActionButton 
                icon={<Eraser className="w-3.5 h-3.5" />} 
                label="一键抠图 (透明)" 
                onClick={() => onAction("Remove the background from the image, leaving only the main subject on a transparent layer.")} 
                disabled={disabled}
              />
           </div>
           <div className="grid grid-cols-2 gap-2">
               <ActionButton 
                icon={<Wand2 className="w-3.5 h-3.5" />} 
                label="去除杂物/水印" 
                onClick={() => onAction("Intelligently remove distracting elements, clutter, text watermarks, and logos from the background. Fill the gaps seamlessly to match the surrounding texture.")} 
                disabled={disabled}
              />
              <ActionButton 
                icon={<Maximize2 className="w-3.5 h-3.5" />} 
                label="高清放大" 
                onClick={() => onAction("Upscale the image 2x. Enhance clarity, sharpen details, reduce noise, and fix compression artifacts while maintaining photo-realism.")} 
                disabled={disabled}
              />
           </div>
      </AccordionItem>

      {/* NEW: SMART EDITING TOOLS (Orange) */}
      <AccordionItem 
         id="SMART_EDIT" 
         title="智能调优 (Enhance)" 
         icon={<Sliders />}
         isOpen={openSection === 'SMART_EDIT'}
         onToggle={() => toggleSection('SMART_EDIT')}
         colorTheme="orange"
      >
           <div className="grid grid-cols-2 gap-2 mb-2">
              <ActionButton 
                icon={<SunMedium className="w-3.5 h-3.5 text-orange-500" />} 
                label="自动对比度" 
                onClick={() => onAction("Automatically adjust the contrast of the image to maximize dynamic range, making shadows deeper and highlights brighter while maintaining a natural look.")} 
                disabled={disabled}
              />
              <ActionButton 
                icon={<Droplet className="w-3.5 h-3.5" />} 
                label="色彩平衡" 
                onClick={() => onAction("Automatically correct the white balance and color saturation to ensure the image has natural, accurate, and vibrant colors.")} 
                disabled={disabled}
              />
           </div>
           <div className="grid grid-cols-2 gap-2">
              <ActionButton 
                icon={<Activity className="w-3.5 h-3.5" />} 
                label="智能锐化" 
                onClick={() => onAction("Smartly sharpen details and edges of the subject to improve clarity without adding artifacts or excessive noise.")} 
                disabled={disabled}
              />
              <ActionButton 
                icon={<Sun className="w-3.5 h-3.5" />} 
                label="自动曝光" 
                onClick={() => onAction("Automatically adjust the exposure to correct under-exposed or over-exposed areas, ensuring balanced lighting brightness.")} 
                disabled={disabled}
              />
           </div>
      </AccordionItem>

      {/* 2. TRANSLATION (Pink) */}
      <AccordionItem 
         id="TRANSLATE" 
         title="多语言翻译 (Translation)" 
         icon={<Globe />}
         isOpen={openSection === 'TRANSLATE'}
         onToggle={() => toggleSection('TRANSLATE')}
         colorTheme="pink"
      >
           <div className="grid grid-cols-3 gap-2">
              {TARGET_LANGUAGES.map((lang) => (
                 <button
                    key={lang.val}
                    onClick={() => onAction(`Translate all text in the image to ${lang.val}. STRICTLY maintain the original font style, size, color, perspective, and background details. The translated text must look like it was originally printed on the object. Ensure ${lang.val} grammar is perfect.`)}
                    disabled={disabled}
                    className="flex flex-col items-center justify-center p-2 bg-white hover:bg-pink-50 border border-gray-100 hover:border-pink-200 rounded-lg transition-all text-[10px] text-gray-700 hover:text-pink-700 disabled:opacity-50 shadow-sm hover:shadow"
                    title={`翻译为 ${lang.label}`}
                 >
                    <span className="font-semibold text-xs mb-0.5">{lang.label.split('(')[1].replace(')', '')}</span>
                    <span className="text-[9px] opacity-50">{lang.label.split(' ')[0]}</span>
                 </button>
              ))}
           </div>
           <div className="mt-2 pt-2 border-t border-gray-100">
              <ActionButton 
                icon={<Type className="w-3.5 h-3.5" />} 
                label="文字清晰化 (OCR 修复)" 
                onClick={() => onAction("Identify all text in the image (including small or low-contrast text) and redraw it to be clearer and sharper, while strictly preserving the original font style, layout, and background details.")} 
                disabled={disabled}
                fullWidth
              />
           </div>
      </AccordionItem>

      {/* 3. E-COMMERCE MERGE (Yellow) */}
      <AccordionItem 
         id="MERGE" 
         title="电商合成 (Pro)" 
         icon={<ShoppingBag />}
         isOpen={openSection === 'MERGE'}
         onToggle={() => toggleSection('MERGE')}
         colorTheme="yellow"
      >
           <div className="grid grid-cols-1 gap-2">
              <ActionButton 
                icon={<Layers className="w-3.5 h-3.5 text-yellow-600" />} 
                label="多图合成主图 (1:1)" 
                fullWidth
                onClick={() => onMerge("Create a high-impact e-commerce main listing image on a pure white background (1:1). COMPOSITION RULE: Maximize the product size to fill 85-90% of the canvas (tight crop, minimal white space margins), ensuring the product is the absolute primary focus and fully visible. If multiple images are provided, arrange them aesthetically. CRITICAL: DO NOT modify the product's original appearance, colors, or details. Use the input pixels as ground truth.")} 
                disabled={disabled}
              />
              <p className="text-[10px] text-gray-400 text-center px-1 leading-tight mt-1">
                *上传多张素材（如产品+配件），AI将自动排版合成一张电商白底主图。
              </p>
           </div>
      </AccordionItem>

      {/* 4. COMPOSITION (Purple) */}
      <AccordionItem 
         id="COMPOSITION" 
         title="构图与扩展" 
         icon={<Scaling />}
         isOpen={openSection === 'COMPOSITION'}
         onToggle={() => toggleSection('COMPOSITION')}
         colorTheme="purple"
      >
           {/* Basic Crop */}
           <div className="mb-3 space-y-2">
             <div className="grid grid-cols-2 gap-2">
                 <ActionButton 
                    icon={<RotateCcw className="w-3.5 h-3.5" />} 
                    label="向左旋转" 
                    onClick={() => onAction("Rotate the image 90 degrees counter-clockwise.")} 
                    disabled={disabled}
                  />
                  <ActionButton 
                    icon={<RotateCw className="w-3.5 h-3.5" />} 
                    label="向右旋转" 
                    onClick={() => onAction("Rotate the image 90 degrees clockwise.")} 
                    disabled={disabled}
                  />
             </div>
             <div className="grid grid-cols-3 gap-2">
                <ActionButton 
                  icon={<Square className="w-3.5 h-3.5" />} 
                  label="1:1" 
                  onClick={() => onAction("Crop the image to a square (1:1 aspect ratio).")} 
                  disabled={disabled}
                />
                <ActionButton 
                  icon={<RectangleVertical className="w-3.5 h-3.5" />} 
                  label="3:4" 
                  onClick={() => onAction("Crop the image to a portrait (3:4 aspect ratio).")} 
                  disabled={disabled}
                />
                <ActionButton 
                  icon={<RectangleHorizontal className="w-3.5 h-3.5" />} 
                  label="16:9" 
                  onClick={() => onAction("Crop the image to a wide (16:9 aspect ratio).")} 
                  disabled={disabled}
                />
             </div>
           </div>

           <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center gap-1 mb-2">
                 <Expand className="w-3.5 h-3.5 text-purple-500" />
                 <span className="text-xs font-semibold text-gray-700">智能扩图 (AI Expand)</span>
              </div>
              
              <div className="space-y-2">
                 {/* Zoom Level */}
                 <div className="flex gap-2">
                    {['1.25x', '1.5x', '2x'].map(z => (
                        <button
                          key={z}
                          onClick={() => setExpandZoom(z)}
                          className={`flex-1 py-1.5 text-[10px] border rounded-md transition-all ${expandZoom === z ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {z}
                        </button>
                    ))}
                 </div>

                 {/* Ratio */}
                 <div className="flex gap-2">
                    {[
                      { label: '保持比例', val: undefined },
                      { label: '16:9', val: '16:9' },
                      { label: '9:16', val: '9:16' },
                    ].map(r => (
                        <button
                          key={r.label}
                          onClick={() => setExpandRatio(r.val)}
                          className={`flex-1 py-1.5 text-[10px] border rounded-md transition-all ${expandRatio === r.val ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {r.label}
                        </button>
                    ))}
                 </div>

                 <button
                    onClick={handleSmartExpand}
                    disabled={disabled}
                    className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border border-transparent rounded-lg text-xs font-medium transition-all shadow-md shadow-purple-100 disabled:opacity-50"
                 >
                    生成扩展背景
                 </button>
              </div>
           </div>
      </AccordionItem>

      {/* 5. VISUAL STYLES (Cyan) */}
      <AccordionItem 
         id="STYLE" 
         title="视觉风格 (Style)" 
         icon={<Palette />}
         isOpen={openSection === 'STYLE'}
         onToggle={() => toggleSection('STYLE')}
         colorTheme="cyan"
      >
           <div className="grid grid-cols-2 gap-2">
              <ActionButton 
                icon={<Aperture className="w-3.5 h-3.5" />} 
                label="专业布光" 
                onClick={() => onAction("Relight the image with soft, professional studio lighting. Enhance contrast, add realistic shadows, and improve overall clarity.")} 
                disabled={disabled}
              />
              <ActionButton 
                icon={<Zap className="w-3.5 h-3.5" />} 
                label="HDR 增强" 
                onClick={() => onAction("Significantly enhance image clarity. Balance exposure, boost details in shadows/highlights, and remove noise.")} 
                disabled={disabled}
              />
              <ActionButton 
                icon={<PenTool className="w-3.5 h-3.5" />} 
                label="素描手绘" 
                onClick={() => onAction("Transform this image into a high-quality black and white pencil sketch artistic style.")} 
                disabled={disabled}
              />
              <ActionButton 
                icon={<Rotate3d className="w-3.5 h-3.5" />} 
                label="3D 粘土风" 
                onClick={() => onAction("Transform the subject into a cute 3D rendered clay style (Claymorphism). Soft edges, matte textures, pastel colors.")} 
                disabled={disabled}
              />
              <ActionButton 
                icon={<MonitorPlay className="w-3.5 h-3.5" />} 
                label="赛博朋克" 
                onClick={() => onAction("Apply a Cyberpunk aesthetic style. Neon lights, dark background, high contrast, vibrant magenta and cyan tones.")} 
                disabled={disabled}
              />
              <ActionButton 
                icon={<Sun className="w-3.5 h-3.5" />} 
                label="暖调胶片" 
                onClick={() => onAction("Apply a warm, nostalgic Kodak film aesthetic. Increase grain slightly, shift white balance to warm tones.")} 
                disabled={disabled}
              />
           </div>
      </AccordionItem>

    </div>
  );
};