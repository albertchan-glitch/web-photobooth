/**
 * Cyber-Purikura 2000 独立原型交互逻辑
 * 支持在 4 个流程阶段之间自由切换、体验取景器、3秒倒计时动效、快门按压、单张重拍弹窗及底部菜单切换
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 阶段切换器
  const stageBtns = document.querySelectorAll('.demo-tab-btn');
  const panels = {
    1: document.getElementById('panel-template'),
    2: document.getElementById('panel-frame'),
    3: document.getElementById('panel-camera'),
    4: document.getElementById('panel-preview'),
  };

  function switchStage(stageNum) {
    stageBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.stage == stageNum);
    });

    Object.keys(panels).forEach(num => {
      if (panels[num]) {
        panels[num].classList.toggle('active', num == stageNum);
      }
    });
  }

  stageBtns.forEach(btn => {
    btn.addEventListener('click', () => switchStage(btn.dataset.stage));
  });

  // 2. Stage 1: 模板选择交互
  const templateCards = document.querySelectorAll('.cyber-card[data-template]');
  templateCards.forEach(card => {
    card.addEventListener('click', () => {
      templateCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  const btnTemplateNext = document.getElementById('btn-template-next');
  if (btnTemplateNext) {
    btnTemplateNext.addEventListener('click', () => switchStage(2));
  }

  // 3. Stage 2: 相框选择交互
  const frameCards = document.querySelectorAll('.cyber-card[data-frame]');
  frameCards.forEach(card => {
    card.addEventListener('click', () => {
      frameCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  const btnFrameBack = document.getElementById('btn-frame-back');
  const btnFrameNext = document.getElementById('btn-frame-next');
  if (btnFrameBack) btnFrameBack.addEventListener('click', () => switchStage(1));
  if (btnFrameNext) btnFrameNext.addEventListener('click', () => switchStage(3));

  // 4. Stage 3: 取景框、倒计时与快门交互
  const shutterBtn = document.getElementById('btn-arcade-shutter');
  const countdownModal = document.getElementById('countdown-modal');
  const countdownNumber = document.getElementById('countdown-number');
  const controlsShutter = document.getElementById('controls-shutter');
  const controlsFeedback = document.getElementById('controls-feedback');
  const videoEl = document.getElementById('demo-cam-video');
  const btnToggleLiveCam = document.getElementById('btn-toggle-live-cam');

  let countdownInterval = null;
  let liveStream = null;

  // 开启/关闭实机摄像头测试
  if (btnToggleLiveCam && videoEl) {
    btnToggleLiveCam.addEventListener('click', async () => {
      if (liveStream) {
        liveStream.getTracks().forEach(t => t.stop());
        liveStream = null;
        videoEl.srcObject = null;
        btnToggleLiveCam.textContent = '📷 开启实时摄像头';
        btnToggleLiveCam.style.background = 'var(--bg-panel)';
      } else {
        try {
          liveStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 } },
            audio: false
          });
          videoEl.srcObject = liveStream;
          btnToggleLiveCam.textContent = '⏹ 关闭实时摄像头';
          btnToggleLiveCam.style.background = 'var(--neon-acid)';
          btnToggleLiveCam.style.color = '#000';
        } catch (e) {
          alert('摄像头调用提示: ' + e.message + '\n(在 HTTPS 下即可直接调用实机前摄)');
        }
      }
    });
  }

  // 倒计时拍摄
  if (shutterBtn) {
    shutterBtn.addEventListener('click', () => {
      if (!countdownModal) return;
      countdownModal.classList.remove('hidden');
      let count = 3;
      countdownNumber.textContent = count;

      countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
          countdownNumber.textContent = count;
        } else {
          clearInterval(countdownInterval);
          countdownModal.classList.add('hidden');

          // 白光闪烁反馈
          const flash = document.createElement('div');
          flash.style.position = 'absolute';
          flash.style.inset = '0';
          flash.style.background = '#fff';
          flash.style.zIndex = '20';
          flash.style.transition = 'opacity 0.25s ease';
          flash.style.opacity = '1';
          document.querySelector('.viewfinder-box').appendChild(flash);
          setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => flash.remove(), 250);
          }, 80);

          // 切换到底部红绿反馈按键
          if (controlsShutter) controlsShutter.style.display = 'none';
          if (controlsFeedback) controlsFeedback.style.display = 'flex';
        }
      }, 900);
    });
  }

  // 反馈按键
  const btnRetake = document.getElementById('btn-arcade-retake');
  const btnConfirm = document.getElementById('btn-arcade-confirm');

  if (btnRetake) {
    btnRetake.addEventListener('click', () => {
      if (controlsShutter) controlsShutter.style.display = 'flex';
      if (controlsFeedback) controlsFeedback.style.display = 'none';
    });
  }

  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      if (controlsShutter) controlsShutter.style.display = 'flex';
      if (controlsFeedback) controlsFeedback.style.display = 'none';
      switchStage(4);
    });
  }

  const btnCameraBack = document.getElementById('btn-camera-back');
  if (btnCameraBack) {
    btnCameraBack.addEventListener('click', () => switchStage(2));
  }

  // 5. Stage 4: 成品画板与单张重拍弹窗
  const printStrip = document.getElementById('demo-print-strip');
  const retakeModal = document.getElementById('demo-retake-modal');
  const btnModalCancel = document.getElementById('btn-retake-cancel');
  const btnModalOk = document.getElementById('btn-retake-ok');

  if (printStrip && retakeModal) {
    printStrip.addEventListener('click', () => {
      retakeModal.style.display = 'flex';
    });
  }

  if (btnModalCancel && retakeModal) {
    btnModalCancel.addEventListener('click', () => {
      retakeModal.style.display = 'none';
    });
  }

  if (btnModalOk && retakeModal) {
    btnModalOk.addEventListener('click', () => {
      retakeModal.style.display = 'none';
      switchStage(3);
    });
  }

  // Stage 5 底部菜单抽屉交互
  const consoleTabs = document.querySelectorAll('.console-tab-item');
  consoleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      consoleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  const chipBtns = document.querySelectorAll('.console-chip-btn');
  chipBtns.forEach(chip => {
    chip.addEventListener('click', () => {
      chipBtns.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // 下载按钮展示 Toast
  const btnDownload = document.getElementById('btn-demo-download');
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      alert('✨ [CYBER PURIKURA 2000] ✨\n\n超清照片已准备就绪！在正式功能中将触发 2.5× 高清 PNG 导出下载！');
    });
  }
});
