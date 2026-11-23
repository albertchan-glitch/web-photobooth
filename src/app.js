/**
 * 网页拍贴机主程序入口控制器 (街机模式)
 * 负责各步骤组件的生命周期管理、街机物理按键响应与吐纸/落地页流程
 */

import { stateStore } from './modules/state.js';
import { sound } from './modules/audio.js';
import { TemplateSelector } from './components/template-selector.js';
import { FrameSelector } from './components/frame-selector.js';
import { CameraView } from './components/camera-view.js';
import { PreviewView } from './components/preview-view.js';

export class App {
  constructor() {
    this.crtContent = document.getElementById('crt-content');
    this.cabinetWrapper = document.getElementById('cabinet-wrapper');
    this.spitSlot = document.getElementById('spit-slot');
    this.spittingStrip = document.getElementById('spitting-strip');
    this.resultLanding = document.getElementById('result-landing');
    this.resultFinalImg = document.getElementById('result-final-img');
    this.btnLandingRestart = document.getElementById('btn-landing-restart');
    this.btnLandingDownload = document.getElementById('btn-landing-download');
    
    this.currentViewInstance = null;
    this.currentStep = null;
    this.currentFinalDataUrl = null;
  }

  init() {
    this.bindArcadeControls();
    this.bindLandingEvents();

    stateStore.subscribe((state, changes) => {
      if (changes.currentStep !== undefined && changes.currentStep !== this.currentStep) {
        this.transitionToStep(changes.currentStep);
      }
    });

    this.transitionToStep(stateStore.get('currentStep'));
  }

  bindArcadeControls() {
    const btnRed = document.getElementById('btn-arcade-red');
    const btnPrev = document.getElementById('btn-arcade-prev');
    const btnNext = document.getElementById('btn-arcade-next');
    const btnGreen = document.getElementById('btn-arcade-green');

    if (btnRed) btnRed.addEventListener('click', () => this.handleArcadeAction('red'));
    if (btnPrev) btnPrev.addEventListener('click', () => this.handleArcadeAction('prev'));
    if (btnNext) btnNext.addEventListener('click', () => this.handleArcadeAction('next'));
    if (btnGreen) btnGreen.addEventListener('click', () => this.handleArcadeAction('green'));

    // 键盘支持
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.handleArcadeAction('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.handleArcadeAction('next');
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleArcadeAction('green');
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        this.handleArcadeAction('red');
      }
    });
  }

  bindLandingEvents() {
    if (this.btnLandingRestart) {
      this.btnLandingRestart.addEventListener('click', () => this.restart());
    }

    if (this.btnLandingDownload) {
      this.btnLandingDownload.addEventListener('click', () => this.downloadFinalPhoto());
    }
  }

  handleArcadeAction(action) {
    if (this.currentViewInstance && typeof this.currentViewInstance.onArcadeAction === 'function') {
      this.currentViewInstance.onArcadeAction(action);
    }
  }

  transitionToStep(step) {
    if (this.currentViewInstance && typeof this.currentViewInstance.destroy === 'function') {
      this.currentViewInstance.destroy();
    }

    this.currentStep = step;
    if (!this.crtContent) {
      this.crtContent = document.getElementById('crt-content');
    }
    this.crtContent.innerHTML = '';

    const viewContainer = document.createElement('div');
    viewContainer.className = `crt-step-container step-stage-${step}`;
    this.crtContent.appendChild(viewContainer);

    switch (step) {
      case 1:
        this.currentViewInstance = new TemplateSelector(viewContainer, this);
        break;
      case 2:
        this.currentViewInstance = new FrameSelector(viewContainer, this);
        break;
      case 3:
        this.currentViewInstance = new CameraView(viewContainer, this);
        break;
      case 4:
        this.currentViewInstance = new PreviewView(viewContainer, this);
        break;
      default:
        console.error('Unknown step:', step);
        return;
    }

    this.currentViewInstance.render();
  }

  /**
   * 步骤(5) 吐纸出片动效 (Spit FX) 与落地页激活
   */
  triggerSpitAndLand(dataUrl) {
    this.currentFinalDataUrl = dataUrl;
    sound.play('shutter');

    // 1. 设置出纸口相片并启动关键帧动画
    if (this.spittingStrip) {
      this.spittingStrip.src = dataUrl;
      this.spittingStrip.classList.remove('is-spitting');
      void this.spittingStrip.offsetWidth;
      this.spittingStrip.classList.add('is-spitting');
    }

    // 2. 机身淡出
    setTimeout(() => {
      if (this.cabinetWrapper) {
        this.cabinetWrapper.classList.add('fade-out');
      }
    }, 1800);

    // 3. 落地页淡入激活展示
    setTimeout(() => {
      if (this.resultFinalImg) {
        this.resultFinalImg.src = dataUrl;
      }
      if (this.resultLanding) {
        this.resultLanding.classList.add('is-active');
      }
    }, 2400);
  }

  restart() {
    if (this.resultLanding) this.resultLanding.classList.remove('is-active');
    if (this.cabinetWrapper) this.cabinetWrapper.classList.remove('fade-out');
    if (this.spittingStrip) this.spittingStrip.classList.remove('is-spitting');
    
    stateStore.resetPhotos();
    stateStore.set({ currentStep: 1 });
  }

  downloadFinalPhoto() {
    if (!this.currentFinalDataUrl) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `purikura_${timeStr}.png`;

    const a = document.createElement('a');
    a.href = this.currentFinalDataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 150);
  }
}

export let appInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  appInstance = new App();
  appInstance.init();
});
