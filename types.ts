
export interface User {
  username: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
  mimeType: string | null;
}

export interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  resultUrl: string | null;
  error: string | null;
  history: (string | null)[]; // Stack of previous resultUrls
  altText?: string | null; // SEO Alt Text
  customFileName?: string | null; // SEO Optimized Filename
  seoKeywords?: string; // User defined keywords
}

export interface TargetPoint {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface SelectionBox {
  id: string;
  x: number; // percentage 0-100 (Left)
  y: number; // percentage 0-100 (Top)
  width: number; // percentage 0-100
  height: number; // percentage 0-100
}

export interface GenerationResult {
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "3:4",
  LANDSCAPE = "4:3",
  WIDE = "16:9",
  TALL = "9:16"
}

export const FONT_STYLES = [
  { label: "保持原始风格 / 默认", value: "matching the original style" },
  { label: "手写体 (Handwritten)", value: "handwritten style" },
  { label: "无衬线 (Sans-serif)", value: "sans-serif style" },
  { label: "衬线体 (Serif)", value: "serif style" },
  { label: "粗体 (Bold)", value: "bold typeface" },
  { label: "霓虹荧光 (Neon)", value: "glowing neon style" },
  { label: "涂鸦风格 (Graffiti)", value: "graffiti style" },
  { label: "复古打字机 (Typewriter)", value: "vintage typewriter style" },
  { label: "粉笔字 (Chalk)", value: "chalk on blackboard style" },
  { label: "3D 立体字", value: "3D rendered text" }
];

export const SAMPLE_PROMPTS = [
  "提高图片清晰度 (Sharpen)",
  "生成电商专用白底图",
  "将产品放置在木质桌面上，背景虚化",
  "将产品放置在浴室大理石台面上",
  "在右上角添加红色 'Best Seller' 标签",
  "在左下角添加绿色 '100% Bio' 徽章",
  "保持产品不变，将背景替换为极简风格",
  "将图中文字翻译为中文 (保持原格式)",
  "将图中文字翻译为罗马尼亚语 (保持原格式)"
];

export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  badge?: string;
}

export const AVAILABLE_MODELS: AIModelConfig[] = [
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash (Standard)',
    provider: 'Google',
    description: '标准视觉模型，速度快，兼容性好。支持基础编辑功能。',
    badge: '默认'
  },
  {
    id: 'gemini-3.1-flash-image-preview',
    name: 'Gemini 3.1 Flash (High Quality)',
    provider: 'Google',
    description: '高级视觉模型，支持高分辨率与多种比例。需连接已启用计费的 Google Cloud 项目 API Key。',
    badge: '专业'
  },
  {
    id: 'doubao-vision-pro',
    name: 'Doubao Vision',
    provider: 'ByteDance',
    description: '火山引擎视觉模型 (需配置 Key)',
  }
];

export interface ApiSettings {
  byteDance?: {
    apiKey: string;
    endpointId: string;
  };
}