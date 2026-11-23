/**
 * 相框配置与样式管理
 * 支持针对不同模板规格提供对应的相框素材
 * 对应 public/frames/ 目录下的新相框素材
 */

import { stateStore } from '../modules/state.js';

/**
 * 各模板专属相框配置表
 * 3slots、4slots 各 4 个，landscape、mini、square 各 5 个
 */
export const TEMPLATE_FRAMES = {
  '4slots': [
    {
      id: '1',
      name: '相框 1',
      colorHex: '#f65eae',
      borderHex: '#fe2b88',
      description: '四格精选相框 1',
      imageSrc: './public/frames/4slots_1.png',
      templateId: '4slots'
    },
    {
      id: '2',
      name: '相框 2',
      colorHex: '#81bed0',
      borderHex: '#7ccbcf',
      description: '四格精选相框 2',
      imageSrc: './public/frames/4slots_2.png',
      templateId: '4slots'
    },
    {
      id: '3',
      name: '相框 3',
      colorHex: '#854db9',
      borderHex: '#b946c1',
      description: '四格精选相框 3',
      imageSrc: './public/frames/4slots_3.png',
      templateId: '4slots'
    },
    {
      id: '4',
      name: '相框 4',
      colorHex: '#7ba9e0',
      borderHex: '#5c7ce5',
      description: '四格精选相框 4',
      imageSrc: './public/frames/4slots_4.png',
      templateId: '4slots'
    }
  ],
  '3slots': [
    {
      id: '1',
      name: '相框 1',
      colorHex: '#966bb3',
      borderHex: '#8d6ea5',
      description: '三格精选相框 1',
      imageSrc: './public/frames/3slots_1.png',
      templateId: '3slots'
    },
    {
      id: '2',
      name: '相框 2',
      colorHex: '#546d99',
      borderHex: '#000b81',
      description: '三格精选相框 2',
      imageSrc: './public/frames/3slots_2.png',
      templateId: '3slots'
    },
    {
      id: '3',
      name: '相框 3',
      colorHex: '#b09bcb',
      borderHex: '#ff82cb',
      description: '三格精选相框 3',
      imageSrc: './public/frames/3slots_3.png',
      templateId: '3slots'
    },
    {
      id: '4',
      name: '相框 4',
      colorHex: '#508e82',
      borderHex: '#3a947f',
      description: '三格精选相框 4',
      imageSrc: './public/frames/3slots_4.png',
      templateId: '3slots'
    }
  ],
  'landscape': [
    {
      id: '1',
      name: '相框 1',
      colorHex: '#cba1ec',
      borderHex: '#9464d5',
      description: '横版精选相框 1',
      imageSrc: './public/frames/landscape_1.png',
      templateId: 'landscape'
    },
    {
      id: '2',
      name: '相框 2',
      colorHex: '#b5b8d7',
      borderHex: '#87cec4',
      description: '横版精选相框 2',
      imageSrc: './public/frames/landscape_2.png',
      templateId: 'landscape'
    },
    {
      id: '3',
      name: '相框 3',
      colorHex: '#a75a7a',
      borderHex: '#6f2e47',
      description: '横版精选相框 3',
      imageSrc: './public/frames/landscape_3.png',
      templateId: 'landscape'
    },
    {
      id: '4',
      name: '相框 4',
      colorHex: '#b9bcbf',
      borderHex: '#898585',
      description: '横版精选相框 4',
      imageSrc: './public/frames/landscape_4.png',
      templateId: 'landscape'
    },
    {
      id: '5',
      name: '相框 5',
      colorHex: '#9f93c5',
      borderHex: '#a4a7c6',
      description: '横版精选相框 5',
      imageSrc: './public/frames/landscape_5.png',
      templateId: 'landscape'
    }
  ],
  'mini': [
    {
      id: '1',
      name: '相框 1',
      colorHex: '#be87af',
      borderHex: '#7c2342',
      description: '竖版精选相框 1',
      imageSrc: './public/frames/mini_1.png',
      templateId: 'mini'
    },
    {
      id: '2',
      name: '相框 2',
      colorHex: '#7062be',
      borderHex: '#4944ae',
      description: '竖版精选相框 2',
      imageSrc: './public/frames/mini_2.png',
      templateId: 'mini'
    },
    {
      id: '3',
      name: '相框 3',
      colorHex: '#8e5ea0',
      borderHex: '#6d509b',
      description: '竖版精选相框 3',
      imageSrc: './public/frames/mini_3.png',
      templateId: 'mini'
    },
    {
      id: '4',
      name: '相框 4',
      colorHex: '#b8b3cb',
      borderHex: '#9a8fc4',
      description: '竖版精选相框 4',
      imageSrc: './public/frames/mini_4.png',
      templateId: 'mini'
    },
    {
      id: '5',
      name: '相框 5',
      colorHex: '#88879d',
      borderHex: '#83819c',
      description: '竖版精选相框 5',
      imageSrc: './public/frames/mini_5.png',
      templateId: 'mini'
    }
  ],
  'square': [
    {
      id: '1',
      name: '相框 1',
      colorHex: '#d9c7ca',
      borderHex: '#fbe0d4',
      description: '方形精选相框 1',
      imageSrc: './public/frames/square_1.png',
      templateId: 'square'
    },
    {
      id: '2',
      name: '相框 2',
      colorHex: '#c982b7',
      borderHex: '#fd8cca',
      description: '方形精选相框 2',
      imageSrc: './public/frames/square_2.png',
      templateId: 'square'
    },
    {
      id: '3',
      name: '相框 3',
      colorHex: '#c69fe8',
      borderHex: '#9f70f9',
      description: '方形精选相框 3',
      imageSrc: './public/frames/square_3.png',
      templateId: 'square'
    },
    {
      id: '4',
      name: '相框 4',
      colorHex: '#807275',
      borderHex: '#b65a56',
      description: '方形精选相框 4',
      imageSrc: './public/frames/square_4.png',
      templateId: 'square'
    },
    {
      id: '5',
      name: '相框 5',
      colorHex: '#9c92ca',
      borderHex: '#bc85e2',
      description: '方形精选相框 5',
      imageSrc: './public/frames/square_5.png',
      templateId: 'square'
    }
  ]
};

// 兼容旧导出
export const FRAME_STYLES = TEMPLATE_FRAMES['4slots'];

/**
 * 获取指定模板可用的相框列表
 * @param {string} templateId 模板标识 (4slots, 3slots, landscape, mini, square)
 * @returns {Array} 相框列表
 */
export function getFramesForTemplate(templateId) {
  const frames = TEMPLATE_FRAMES[templateId] || TEMPLATE_FRAMES['4slots'];

  // 同步校验 stateStore 中的选中相框，确保在切换模板或初次加载时处于有效状态
  if (typeof stateStore !== 'undefined' && stateStore && typeof stateStore.get === 'function') {
    const currentId = stateStore.get('selectedFrameId');
    if (!currentId || currentId === 'classic_white' || !frames.some(f => f.id === currentId)) {
      stateStore.set({ selectedFrameId: frames[0].id });
    }
  }

  return frames;
}

/**
 * 根据模板ID与相框ID获取具体相框对象
 * @param {string} templateId 模板标识
 * @param {string} frameId 相框ID
 * @returns {Object} 相框配置对象
 */
export function getFrameById(templateId, frameId) {
  const frames = getFramesForTemplate(templateId);
  return frames.find(f => f.id === frameId || (frameId === 'classic_white' && f.id === '1')) || frames[0];
}
