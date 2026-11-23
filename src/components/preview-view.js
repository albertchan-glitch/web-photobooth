/**
 * 步骤四：成品预览与出片组件 (街机 CRT 视口版)
 * 呈现实时合成的拍贴相片，支持物理按键：
 * 绿色按键：[GREEN] PRINT! 触发出纸动效 (Spit FX) 与落地页导出
 * 红色按键：[RED] AGAIN 重新开始
 * 黄色按键：左右切换不同相框
 */

import { composer } from '../modules/composer.js';
import { stateStore } from '../modules/state.js';
import { getFramesForTemplate } from '../config/frames.js';
import { sound } from '../modules/audio.js';

export class PreviewView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.isRendering = false;
    this.previewCanvas = null;
  }

  render() {
    const tmpl = stateStore.currentTemplate;
    const frames = getFramesForTemplate(tmpl.id);
    const selectedFrameId = stateStore.get('selectedFrameId') || frames[0].id;

    this.container.innerHTML = `
      <div class="crt-step-view step-preview crt-preview-container">
        <h2 class="crt-step-title">PRINT PREVIEW</h2>

        <main class="crt-composite-box" id="artboard-box">
          <canvas id="composite-preview-canvas" class="crt-composite-canvas"></canvas>
        </main>

        <!-- 底部相框快速切换条 -->
        <div class="crt-tray-bar" id="crt-frame-tray">
          ${frames.map(f => `
            <button class="crt-tray-item ${f.id === selectedFrameId ? 'active' : ''}" data-frame-id="${f.id}">
              ${f.name}
            </button>
          `).join('')}
        </div>

        <footer class="crt-screen-footer-hint">
          <span class="hint-blink">[GREEN] PRINT!  [RED] AGAIN</span>
        </footer>
      </div>
    `;

    this.previewCanvas = this.container.querySelector('#composite-preview-canvas');
    this.bindEvents(frames);
    this.updateComposite();
  }

  async updateComposite() {
    if (this.isRendering || !this.previewCanvas) return;
    this.isRendering = true;

    try {
      const tmpl = stateStore.currentTemplate;
      const { selectedFrameId, selectedFilterId, photos } = stateStore.state;

      const renderedCanvas = await composer.render({
        template: tmpl,
        frameId: selectedFrameId,
        photos: photos,
        filterId: selectedFilterId,
        pixelRatio: 1.5
      });

      this.previewCanvas.width = renderedCanvas.width;
      this.previewCanvas.height = renderedCanvas.height;

      const ctx = this.previewCanvas.getContext('2d');
      ctx.clearRect(0, 0, renderedCanvas.width, renderedCanvas.height);
      ctx.drawImage(renderedCanvas, 0, 0);
    } catch (err) {
      console.error('Composite render failed:', err);
    } finally {
      this.isRendering = false;
    }
  }

  bindEvents(frames) {
    // 点击托盘切换相框
    const trayBtns = this.container.querySelectorAll('.crt-tray-item');
    trayBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const frameId = btn.dataset.frameId;
        this.selectFrame(frameId, frames);
      });
    });

    // 点击画面单张重拍
    if (this.previewCanvas) {
      this.previewCanvas.addEventListener('click', (e) => {
        const tmpl = stateStore.currentTemplate;
        const clickedSlotIndex = composer.getSlotFromClick(
          e.clientX,
          e.clientY,
          this.previewCanvas,
          tmpl
        );

        if (clickedSlotIndex !== null) {
          if (confirm(`重新拍摄第 ${clickedSlotIndex + 1} 张照片？`)) {
            stateStore.set({
              retakeSingleIndex: clickedSlotIndex,
              currentShotPhoto: null,
              currentStep: 3
            });
          }
        }
      });
    }
  }

  selectFrame(frameId, frames) {
    stateStore.set({ selectedFrameId: frameId });
    sound.play('click');

    const trayBtns = this.container.querySelectorAll('.crt-tray-item');
    trayBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.frameId === frameId);
    });

    this.updateComposite();
  }

  selectPrevFrame() {
    const tmpl = stateStore.currentTemplate;
    const frames = getFramesForTemplate(tmpl.id);
    const selectedId = stateStore.get('selectedFrameId') || frames[0].id;
    const currentIndex = frames.findIndex(f => f.id === selectedId);
    const prevIndex = (currentIndex - 1 + frames.length) % frames.length;
    this.selectFrame(frames[prevIndex].id, frames);
  }

  selectNextFrame() {
    const tmpl = stateStore.currentTemplate;
    const frames = getFramesForTemplate(tmpl.id);
    const selectedId = stateStore.get('selectedFrameId') || frames[0].id;
    const currentIndex = frames.findIndex(f => f.id === selectedId);
    const nextIndex = (currentIndex + 1) % frames.length;
    this.selectFrame(frames[nextIndex].id, frames);
  }

  async handleExportAndSpit() {
    if (this.isRendering) return;
    this.isRendering = true;

    try {
      const tmpl = stateStore.currentTemplate;
      const { selectedFrameId, selectedFilterId, photos } = stateStore.state;

      const highResCanvas = await composer.render({
        template: tmpl,
        frameId: selectedFrameId,
        photos: photos,
        filterId: selectedFilterId,
        pixelRatio: 2.5
      });

      const dataUrl = highResCanvas.toDataURL('image/png');
      if (this.app && typeof this.app.triggerSpitAndLand === 'function') {
        this.app.triggerSpitAndLand(dataUrl);
      }
    } catch (e) {
      alert('出片失败: ' + e.message);
    } finally {
      this.isRendering = false;
    }
  }

  onArcadeAction(action) {
    if (action === 'green') {
      this.handleExportAndSpit();
    } else if (action === 'red') {
      if (confirm('确认重新开始？已拍摄照片将被清空。')) {
        if (this.app) this.app.restart();
      }
    } else if (action === 'prev') {
      this.selectPrevFrame();
    } else if (action === 'next') {
      this.selectNextFrame();
    }
  }

  destroy() {}
}
