/**
 * 滤镜配置
 * 用于在 Canvas 合成和预览时无损应用到照片上，不影响拍摄原图
 */

export const FILTERS = [
  {
    id: 'normal',
    name: '原图',
    tag: 'Normal',
    cssFilter: 'none',
    canvasFilter: 'none',
    previewColor: '#e2e8f0',
    description: '保持相机原始色彩与清晰度'
  },
  {
    id: 'vintage',
    name: '复古胶片',
    tag: 'Vintage',
    cssFilter: 'sepia(0.32) contrast(1.15) brightness(0.98) saturate(1.15)',
    canvasFilter: 'sepia(0.32) contrast(1.15) brightness(0.98) saturate(1.15)',
    previewColor: '#e0c9a6',
    description: '暖色调怀旧胶卷，带有温暖岁月感'
  },
  {
    id: 'mono',
    name: '经典黑白',
    tag: 'B&W',
    cssFilter: 'grayscale(1) contrast(1.25) brightness(1.05)',
    canvasFilter: 'grayscale(1) contrast(1.25) brightness(1.05)',
    previewColor: '#4a5568',
    description: '高反差黑白肖像，凸显光影与轮廓'
  },
  {
    id: 'warm',
    name: '暖阳日落',
    tag: 'Sunset',
    cssFilter: 'sepia(0.18) saturate(1.25) contrast(1.08) brightness(1.04)',
    canvasFilter: 'sepia(0.18) saturate(1.25) contrast(1.08) brightness(1.04)',
    previewColor: '#fbd38d',
    description: '暖黄黄金时刻阳光，气色红润'
  },
  {
    id: 'cool',
    name: '清冷冷调',
    tag: 'Cool',
    cssFilter: 'contrast(1.12) brightness(1.04) saturate(0.85)',
    canvasFilter: 'contrast(1.12) brightness(1.04) saturate(0.85)',
    previewColor: '#90cdf4',
    description: '清透低饱和冷感，干净通透'
  },
  {
    id: 'soft',
    name: '柔光粉黛',
    tag: 'Dream',
    cssFilter: 'brightness(1.08) contrast(0.96) saturate(1.2)',
    canvasFilter: 'brightness(1.08) contrast(0.96) saturate(1.2)',
    previewColor: '#fbb6ce',
    description: '奶油轻微柔焦美肤感，温柔梦幻'
  },
  {
    id: 'vivid',
    name: '鲜活底片',
    tag: 'Vivid',
    cssFilter: 'contrast(1.18) saturate(1.35) brightness(1.02)',
    canvasFilter: 'contrast(1.18) saturate(1.35) brightness(1.02)',
    previewColor: '#68d391',
    description: '高饱和生动色彩，鲜亮吸睛'
  }
];

export function getFilterById(id) {
  return FILTERS.find(f => f.id === id) || FILTERS[0];
}
