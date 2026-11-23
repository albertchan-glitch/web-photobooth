/**
 * 拍摄模板规格与数据配置
 * 严格对应用户提供的五种模板规格与透明拍摄窗口坐标
 */

export const TEMPLATES = [
  {
    id: '4slots',
    name: '经典四格',
    nameEng: '4 slots',
    subtitle: '条状四连拍',
    dimensions: '5 × 15 cm',
    cm: '5×15cm',
    photoCount: 4,
    canvasWidth: 591,
    canvasHeight: 1772,
    canvasAspectRatio: 591 / 1772, // ~0.3335 (5×15cm)
    viewfinderRatio: 492 / 368,   // ~1.337 (4:3 横向)
    templateImage: './public/templates/template_4slots.png',
    slots: [
      { index: 0, x: 50, y: 37, width: 492, height: 368, aspectRatio: 1.337 },
      { index: 1, x: 50, y: 433, width: 492, height: 368, aspectRatio: 1.337 },
      { index: 2, x: 50, y: 829, width: 492, height: 368, aspectRatio: 1.337 },
      { index: 3, x: 50, y: 1224, width: 492, height: 368, aspectRatio: 1.337 }
    ],
    description: '四张横向照片，经典人生四格风，底部留白适中'
  },
  {
    id: '3slots',
    name: '宽幅三格',
    nameEng: '3 slots',
    subtitle: '胶片三连拍',
    dimensions: '7.5 × 15 cm',
    cm: '7.5×15cm',
    photoCount: 3,
    canvasWidth: 512,
    canvasHeight: 1024,
    canvasAspectRatio: 512 / 1024, // 0.500
    viewfinderRatio: 428 / 285,   // ~1.502 (3:2 横向)
    templateImage: './public/templates/template_3slots.png',
    slots: [
      { index: 0, x: 42, y: 35, width: 428, height: 285, aspectRatio: 1.502 },
      { index: 1, x: 42, y: 336, width: 428, height: 284, aspectRatio: 1.507 },
      { index: 2, x: 42, y: 636, width: 428, height: 285, aspectRatio: 1.502 }
    ],
    description: '三张 3:2 照片，画幅更大，更具电影故事感'
  },
  {
    id: 'mini',
    name: '竖版单格',
    nameEng: 'mini',
    subtitle: 'Mini 拍立得',
    dimensions: '5.4 × 8.6 cm',
    cm: '5.4×8.6cm',
    photoCount: 1,
    canvasWidth: 638,
    canvasHeight: 1016,
    canvasAspectRatio: 638 / 1016, // ~0.628
    viewfinderRatio: 539 / 720,   // ~0.749 (3:4 竖向)
    templateImage: './public/templates/template_mini.png',
    slots: [
      { index: 0, x: 49, y: 58, width: 539, height: 720, aspectRatio: 0.749 }
    ],
    description: '竖向单格 Mini 尺寸，便于手机屏保或随身钱包照'
  },
  {
    id: 'square',
    name: '方形单格',
    nameEng: 'square',
    subtitle: '经典拍立得',
    dimensions: '7.2 × 8.6 cm',
    cm: '7.2×8.6cm',
    photoCount: 1,
    canvasWidth: 850,
    canvasHeight: 1016,
    canvasAspectRatio: 850 / 1016, // ~0.837
    viewfinderRatio: 1.0,         // 1:1 正方形
    templateImage: './public/templates/template_square.png',
    slots: [
      { index: 0, x: 61, y: 49, width: 728, height: 728, aspectRatio: 1.0 }
    ],
    description: '1:1 正方画幅，经典拍立得复古比例，底部留白签名'
  },
  {
    id: 'landscape',
    name: '横版单格',
    nameEng: 'landscape',
    subtitle: '宽幅拍立得',
    dimensions: '10.8 × 8.6 cm',
    cm: '10.8×8.6cm',
    photoCount: 1,
    canvasWidth: 1024,
    canvasHeight: 815,
    canvasAspectRatio: 1024 / 815, // ~1.256
    viewfinderRatio: 925 / 519,   // ~1.782 (16:9 横向)
    templateImage: './public/templates/template_landscape.png',
    slots: [
      { index: 0, x: 50, y: 39, width: 925, height: 519, aspectRatio: 1.782 }
    ],
    description: '横向 16:9 宽画幅，适合多人合影或风景'
  }
];

export function getTemplateById(id) {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}