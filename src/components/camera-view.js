/**
 * 步骤三：拍摄页面组件 (街机 CRT 视口版)
 * 适配 CRT 屏幕尺寸，支持物理按键控制：
 * 绿色按键：拍照倒计时 / 确认当前照片
 * 红色按键：返回 / 重拍当前照片
 * 黄色按键：翻转镜头 / 切换前后摄
 */

import { CameraManager } from '../modules/camera.js';
import { sound } from '../modules/audio.js';
import { stateStore } from '../modules/state.js';

export class CameraView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.cameraManager = null;
    this.countdownTimer = null;
    this.isCountingDown = false;
  }

  render() {
    const tmpl = stateStore.currentTemplate;
    const { currentShootIndex, retakeSingleIndex, currentShotPhoto } = stateStore.state;
    const isSingleRetake = retakeSingleIndex !== null;
    const activeIndex = isSingleRetake ? retakeSingleIndex : currentShootIndex;

    this.container.innerHTML = `
      <div class="crt-step-view step-camera crt-cam-container">
        <!-- 顶部取景状态条 -->
        <header class="crt-cam-header">
          <span class="crt-cam-title">
            ${isSingleRetake ? `RETAKE #${activeIndex + 1}` : `SHOT ${activeIndex + 1}/${tmpl.photoCount}`}
          </span>
          <div class="crt-cam-tools">
            <button class="crt-mini-btn" id="btn-camera-mirror" title="镜像翻转">🪞</button>
            <button class="crt-mini-btn" id="btn-camera-switch" title="切换前后摄">🔄</button>
            <label class="crt-mini-btn" title="导入已有相片" style="cursor:pointer;">
              📁
              <input type="file" accept="image/*" id="input-camera-import" style="display:none;"/>
            </label>
          </div>
        </header>

        <!-- CRT 取景框 -->
        <main class="crt-viewfinder-box">
          <div class="crt-viewfinder" id="viewfinder" style="aspect-ratio: ${tmpl.viewfinderRatio};">
            <video id="camera-video" class="crt-cam-video ${stateStore.get('isMirrored') ? 'mirrored' : ''}" autoplay playsinline webkit-playsinline muted></video>
            
            <div class="crt-grid-crosshair"></div>

            <!-- 3秒倒计时浮层 -->
            <div class="crt-countdown-layer ${this.isCountingDown ? '' : 'hidden'}" id="countdown-overlay">
              <span class="crt-countdown-digit" id="countdown-number">3</span>
            </div>

            <!-- 拍照瞬间闪光 -->
            <div class="crt-flash-layer" id="flash-overlay"></div>

            <!-- 拍摄完成后的单张预览 -->
            <div class="crt-snapshot-review ${currentShotPhoto ? 'visible' : ''}" id="snapshot-preview">
              <img src="${currentShotPhoto || ''}" alt="Shot Review" id="snapshot-img" />
            </div>
          </div>
        </main>

        <!-- 底部物理按键指引 / 状态提示 -->
        <footer class="crt-screen-footer-hint">
          ${currentShotPhoto ? `
            <div class="crt-shot-prompt-bar">
              <span class="prompt-pill red">[RED] RETAKE</span>
              <span class="prompt-pill green">[GREEN] OK</span>
            </div>
          ` : `
            <span class="hint-blink">PRESS [GREEN] TO SHOOT!</span>
          `}
        </footer>
      </div>
    `;

    this.bindEvents();
    if (!currentShotPhoto) {
      this.initCamera();
    }
  }

  async initCamera() {
    const video = this.container.querySelector('#camera-video');
    if (!video) return;

    this.cameraManager = new CameraManager(video);

    try {
      await this.cameraManager.start(stateStore.get('cameraFacingMode'));
    } catch (err) {
      console.warn('Camera init failed, using mock fallback if needed:', err);
    }
  }

  bindEvents() {
    const viewfinder = this.container.querySelector('#viewfinder');
    if (viewfinder) {
      viewfinder.addEventListener('click', () => {
        if (!stateStore.state.currentShotPhoto && !this.isCountingDown) {
          this.startCountdownAndCapture();
        }
      });
    }

    const mirrorBtn = this.container.querySelector('#btn-camera-mirror');
    if (mirrorBtn) {
      mirrorBtn.addEventListener('click', () => {
        if (!this.cameraManager) return;
        const mirrored = this.cameraManager.toggleMirror();
        stateStore.set({ isMirrored: mirrored });
        const video = this.container.querySelector('#camera-video');
        if (video) video.classList.toggle('mirrored', mirrored);
      });
    }

    const switchBtn = this.container.querySelector('#btn-camera-switch');
    if (switchBtn) {
      switchBtn.addEventListener('click', async () => {
        if (!this.cameraManager) return;
        try {
          await this.cameraManager.switchCamera();
          stateStore.set({
            cameraFacingMode: this.cameraManager.facingMode,
            isMirrored: this.cameraManager.isMirrored
          });
          const video = this.container.querySelector('#camera-video');
          if (video) video.classList.toggle('mirrored', this.cameraManager.isMirrored);
        } catch (e) {
          console.warn('Switch camera error', e);
        }
      });
    }

    const importInput = this.container.querySelector('#input-camera-import');
    if (importInput) {
      importInput.addEventListener('change', (e) => this.handleFallbackFile(e));
    }
  }

  startCountdownAndCapture() {
    this.isCountingDown = true;
    stateStore.set({ isCountingDown: true });

    const countdownOverlay = this.container.querySelector('#countdown-overlay');
    const countdownNum = this.container.querySelector('#countdown-number');
    if (countdownOverlay) countdownOverlay.classList.remove('hidden');

    let secondsLeft = 3;
    if (countdownNum) countdownNum.textContent = secondsLeft;
    sound.playCountdownTick();

    this.countdownTimer = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        if (countdownNum) countdownNum.textContent = secondsLeft;
        if (secondsLeft === 1) {
          sound.playCountdownFinalTick();
        } else {
          sound.playCountdownTick();
        }
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.isCountingDown = false;
        stateStore.set({ isCountingDown: false });

        if (countdownOverlay) countdownOverlay.classList.add('hidden');
        this.triggerShutterSnap();
      }
    }, 1000);
  }

  triggerShutterSnap() {
    sound.playShutterSound();

    const flash = this.container.querySelector('#flash-overlay');
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 300);
    }

    const tmpl = stateStore.currentTemplate;
    let photoDataUrl;
    if (this.cameraManager && this.cameraManager.isReady) {
      photoDataUrl = this.cameraManager.capture(tmpl.viewfinderRatio);
    } else {
      photoDataUrl = this.generateMockPhoto(tmpl.viewfinderRatio);
    }

    stateStore.set({ currentShotPhoto: photoDataUrl });
    this.render();
  }

  handleFallbackFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const tmpl = stateStore.currentTemplate;
        const targetRatio = tmpl.viewfinderRatio;

        const canvas = document.createElement('canvas');
        const outW = Math.min(img.naturalWidth, 1440);
        const outH = Math.round(outW / targetRatio);
        canvas.width = outW;
        canvas.height = outH;

        const ctx = canvas.getContext('2d');
        const imgAspect = img.naturalWidth / img.naturalHeight;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

        if (imgAspect > targetRatio) {
          sw = img.naturalHeight * targetRatio;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = img.naturalWidth / targetRatio;
          sy = (img.naturalHeight - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
        const croppedUrl = canvas.toDataURL('image/jpeg', 0.95);

        stateStore.set({ currentShotPhoto: croppedUrl });
        this.render();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  generateMockPhoto(aspectRatio) {
    const canvas = document.createElement('canvas');
    const w = 800;
    const h = Math.round(w / aspectRatio);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#ff9a9e');
    grad.addColorStop(1, '#fecfef');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ff2a85';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PURIKURA SHOT', w / 2, h / 2 - 20);

    ctx.fillStyle = '#111';
    ctx.font = '24px monospace';
    ctx.fillText(new Date().toLocaleTimeString(), w / 2, h / 2 + 30);

    return canvas.toDataURL('image/jpeg', 0.95);
  }

  onArcadeAction(action) {
    const { currentShotPhoto, retakeSingleIndex } = stateStore.state;

    if (action === 'green') {
      if (currentShotPhoto) {
        // 确认当前照片
        sound.play('confirm');
        stateStore.confirmCurrentShot();
        if (stateStore.get('currentStep') === 3) {
          this.render();
        }
      } else if (!this.isCountingDown) {
        // 触发拍摄倒计时
        this.startCountdownAndCapture();
      }
    } else if (action === 'red') {
      if (currentShotPhoto) {
        // 重拍当前照片
        sound.play('click');
        stateStore.retakeCurrentShot();
        this.render();
      } else if (this.isCountingDown) {
        // 取消倒计时
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.isCountingDown = false;
        stateStore.set({ isCountingDown: false });
        this.render();
      } else {
        // 返回相框选择或成品预览
        this.destroy();
        if (retakeSingleIndex !== null) {
          stateStore.set({ retakeSingleIndex: null, currentStep: 4 });
        } else {
          stateStore.set({ currentStep: 2 });
        }
      }
    } else if (action === 'prev' || action === 'next') {
      // 切换前后摄或镜像
      const mirrorBtn = this.container.querySelector('#btn-camera-mirror');
      if (mirrorBtn) mirrorBtn.click();
    }
  }

  destroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.cameraManager) {
      this.cameraManager.stop();
    }
  }
}

