/**
 * Canvas 图片合成与导出引擎
 * 将多张拍摄照片与所选模板/相框精准合成，支持非破坏性滤镜渲染与高分辨率下载
 */

import { getFrameById } from '../config/frames.js';
import { getFilterById } from '../config/filters.js';

class ImageCache {
  constructor() {
    this.cache = new Map();
  }

  async load(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.cache.set(src, img);
        resolve(img);
      };
      img.onerror = (e) => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }
}

export const imageCache = new ImageCache();

export class Composer {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * 合成照片与相框
   * @param {Object} options
   * @param {Object} options.template 模板配置对象
   * @param {string} options.frameId 相框ID
   * @param {Array<string>} options.photos 照片 DataURL 数组
   * @param {string} options.filterId 滤镜ID
   * @param {number} options.pixelRatio 放大倍数 (默认 2 倍输出超清成品)
   */
  async render({ template, frameId, photos = [], filterId = 'normal', pixelRatio = 2 }) {
    const { canvasWidth: baseW, canvasHeight: baseH, slots } = template;
    const width = Math.round(baseW * pixelRatio);
    const height = Math.round(baseH * pixelRatio);

    this.canvas.width = width;
    this.canvas.height = height;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. 底层白色背景填充
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 2. 加载相框图像
    const frameConfig = getFrameById(template.id, frameId);
    let frameImg = null;
    try {
      frameImg = await imageCache.load(frameConfig.imageSrc);
    } catch (e) {
      console.warn('Frame image load failed, trying template image', e);
      try {
        frameImg = await imageCache.load(template.templateImage);
      } catch (err2) {
        console.error('All frame images failed to load', err2);
      }
    }

    // 3. 滤镜配置
    const filter = getFilterById(filterId);

    // 4. 逐槽位绘制照片 (照片位于下层，严格充满窗口且不溢出)
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const photoSrc = photos[i];

      const sx = Math.round(slot.x * pixelRatio);
      const sy = Math.round(slot.y * pixelRatio);
      const sw = Math.round(slot.width * pixelRatio);
      const sh = Math.round(slot.height * pixelRatio);

      if (photoSrc) {
        try {
          const photoImg = await imageCache.load(photoSrc);

          ctx.save();
          // 应用所选滤镜
          if (filter.canvasFilter && filter.canvasFilter !== 'none') {
            ctx.filter = filter.canvasFilter;
          }

          // 裁剪区域限制在当前槽位矩形内
          ctx.beginPath();
          ctx.rect(sx, sy, sw, sh);
          ctx.clip();

          // Cover 模式计算照片居中裁剪坐标
          const imgW = photoImg.naturalWidth || photoImg.width;
          const imgH = photoImg.naturalHeight || photoImg.height;
          const imgAspect = imgW / imgH;
          const slotAspect = sw / sh;

          let cropX = 0, cropY = 0, cropW = imgW, cropH = imgH;
          if (imgAspect > slotAspect) {
            // 照片更宽，裁切两边
            cropW = imgH * slotAspect;
            cropX = (imgW - cropW) / 2;
          } else {
            // 照片更高，裁切上下
            cropH = imgW / slotAspect;
            cropY = (imgH - cropH) / 2;
          }

          ctx.drawImage(
            photoImg,
            cropX, cropY, cropW, cropH,
            sx, sy, sw, sh
          );

          ctx.restore();
        } catch (e) {
          console.error(`Error drawing photo slot ${i}:`, e);
        }
      } else {
        // 未拍摄的槽位显示占位暗灰色及格号
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(sx, sy, sw, sh);
        ctx.fillStyle = '#94a3b8';
        ctx.font = `${Math.round(24 * pixelRatio)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`P${i + 1}`, sx + sw / 2, sy + sh / 2);
      }
    }

    // 5. 顶层绘制相框 (相框覆盖在照片之上，确保相框花纹/边框不被遮挡)
    if (frameImg) {
      ctx.drawImage(frameImg, 0, 0, width, height);
    }

    // 6. 底部留白区域添加微型品质文字标签 (优雅小标)
    ctx.save();
    ctx.fillStyle = frameConfig.id === 'noir_dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)';
    ctx.font = `${Math.max(10, Math.round(7 * pixelRatio))}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    const dateStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
    const bottomY = height - Math.round(10 * pixelRatio);
    ctx.fillText(`WEB PHOTOBOOTH  •  ${dateStr}`, width / 2, bottomY);
    ctx.restore();

    return this.canvas;
  }

  /**
   * 将合成后的 Canvas 导出为高质量图片并触发本地下载
   */
  async exportAndDownload({ template, frameId, photos, filterId }) {
    // 导出时使用 2.5 倍高清分辨率
    const canvas = await this.render({
      template,
      frameId,
      photos,
      filterId,
      pixelRatio: 2.5
    });

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `photobooth_${template.id}_${timeStr}.png`;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve(true);
        }, 150);
      }, 'image/png');
    });
  }

  /**
   * 根据点击屏幕上的预览 Canvas 像素位置，判断点击了哪一个照片槽位
   * @param {number} clientX 点击的 clientX
   * @param {number} clientY 点击的 clientY
   * @param {HTMLCanvasElement} previewCanvas 页面上的预览 canvas
   * @param {Object} template 模板对象
   * @returns {number|null} 命中的槽位索引，若未命中返回 null
   */
  getSlotFromClick(clientX, clientY, previewCanvas, template) {
    const rect = previewCanvas.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // 换算到模板基准坐标系 (canvasWidth, canvasHeight)
    const scaleX = template.canvasWidth / rect.width;
    const scaleY = template.canvasHeight / rect.height;

    const baseClickX = relX * scaleX;
    const baseClickY = relY * scaleY;

    for (let i = 0; i < template.slots.length; i++) {
      const s = template.slots[i];
      if (
        baseClickX >= s.x &&
        baseClickX <= s.x + s.width &&
        baseClickY >= s.y &&
        baseClickY <= s.y + s.height
      ) {
        return i;
      }
    }
    return null;
  }
}

export const composer = new Composer();
