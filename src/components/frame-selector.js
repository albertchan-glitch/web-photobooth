/**
 * 步骤二：相框选择组件 (街机 CRT 视口版)
 * 纯净呈现 public/frames/ 素材，支持黄色按键左右切换，绿色确认进入拍摄，红色返回步骤一
 */

import { getFramesForTemplate } from '../config/frames.js';
import { stateStore } from '../modules/state.js';
import { sound } from '../modules/audio.js';

export class FrameSelector {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  render() {
    const tmpl = stateStore.currentTemplate;
    const frames = getFramesForTemplate(tmpl.id);
    const selectedFrameId = stateStore.get('selectedFrameId') || frames[0].id;

    this.container.innerHTML = `
      <div class="crt-step-view step-frame step-frame-${tmpl.id}">
        <h2 class="crt-step-title">Choose Frame:</h2>

        <div class="crt-carousel-container" id="frame-carousel">
          <div class="crt-carousel-track">
            ${frames.map(f => this.renderFrameCard(f, f.id === selectedFrameId)).join('')}
          </div>
        </div>

        <div class="crt-screen-footer-hint">
          <span class="hint-blink">[RED] BACK  [GREEN] OK</span>
        </div>
      </div>
    `;

    this.bindEvents(frames);
    this.scrollToSelected();
  }

  renderFrameCard(frame, isSelected) {
    return `
      <div class="crt-frame-card ${isSelected ? 'active' : ''}" data-id="${frame.id}">
        <div class="crt-frame-preview-box">
          <img src="${frame.imageSrc}" alt="${frame.name}" class="crt-frame-img" />
        </div>
        <span class="crt-card-label">${frame.name}</span>
      </div>
    `;
  }

  bindEvents(frames) {
    const cards = this.container.querySelectorAll('.crt-frame-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        this.selectFrame(id, frames);
      });
    });
  }

  selectFrame(id, frames) {
    stateStore.set({ selectedFrameId: id });
    sound.play('click');

    const cards = this.container.querySelectorAll('.crt-frame-card');
    cards.forEach(card => {
      card.classList.toggle('active', card.dataset.id === id);
    });

    this.scrollToSelected();
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

  confirmFrame() {
    sound.play('confirm');
    stateStore.resetPhotos();
    stateStore.set({ currentStep: 3 });
  }

  goBack() {
    sound.play('click');
    stateStore.set({ currentStep: 1 });
  }

  scrollToSelected() {
    const selectedId = stateStore.get('selectedFrameId');
    const activeCard = this.container.querySelector(`.crt-frame-card[data-id="${selectedId}"]`);
    if (activeCard) {
      activeCard.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }

  onArcadeAction(action) {
    if (action === 'prev') {
      this.selectPrevFrame();
    } else if (action === 'next') {
      this.selectNextFrame();
    } else if (action === 'green') {
      this.confirmFrame();
    } else if (action === 'red') {
      this.goBack();
    }
  }

  destroy() {}
}
