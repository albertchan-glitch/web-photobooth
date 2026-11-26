/**
 * 步骤一：拍摄模板选择组件 (街机 CRT 视口版)
 * 支持物理按键 (黄色左右选择，绿色确认) 与触屏点击
 */

import { TEMPLATES } from '../config/templates.js';
import { stateStore } from '../modules/state.js';
import { sound } from '../modules/audio.js';

export class TemplateSelector {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.selectedId = stateStore.get('selectedTemplateId') || '3slots';
  }

  render() {
    this.selectedId = stateStore.get('selectedTemplateId') || '3slots';

    this.container.innerHTML = `
      <div class="crt-step-view step-template">
        <h2 class="crt-step-title">Select a Template:</h2>

        <div class="crt-carousel-container" id="template-carousel">
          <div class="crt-carousel-track">
            ${TEMPLATES.map(t => this.renderTemplateCard(t)).join('')}
          </div>
        </div>

        <div class="crt-screen-footer-hint">
          <span class="hint-blink">&lt; SELECT &gt;  OK: [GREEN]</span>
        </div>
      </div>
    `;

    this.bindEvents();
    this.scrollToSelected();
  }

  renderTemplateCard(template) {
    const isSelected = template.id === this.selectedId;
    const aspectRatio = template.canvasWidth / template.canvasHeight;
    return `
      <div class="crt-template-card ${isSelected ? 'active' : ''}" data-id="${template.id}" style="--template-aspect-ratio: ${aspectRatio}">
        <div class="crt-card-paper">
          <div class="crt-card-slots slots-${template.id}">
            ${template.slots.map(() => `<span class="crt-slot-box"></span>`).join('')}
          </div>
        </div>
        <span class="crt-card-label">${template.nameEng || template.name}</span>
      </div>
    `;
  }

  bindEvents() {
    const cards = this.container.querySelectorAll('.crt-template-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        this.selectTemplate(id);
      });
    });
  }

  selectTemplate(id) {
    this.selectedId = id;
    stateStore.set({ selectedTemplateId: id });
    sound.play('click');

    const cards = this.container.querySelectorAll('.crt-template-card');
    cards.forEach(card => {
      card.classList.toggle('active', card.dataset.id === id);
    });

    this.scrollToSelected();
  }

  selectPrevTemplate() {
    const currentIndex = TEMPLATES.findIndex(t => t.id === this.selectedId);
    const prevIndex = (currentIndex - 1 + TEMPLATES.length) % TEMPLATES.length;
    this.selectTemplate(TEMPLATES[prevIndex].id);
  }

  selectNextTemplate() {
    const currentIndex = TEMPLATES.findIndex(t => t.id === this.selectedId);
    const nextIndex = (currentIndex + 1) % TEMPLATES.length;
    this.selectTemplate(TEMPLATES[nextIndex].id);
  }

  confirmTemplate() {
    sound.play('confirm');
    stateStore.set({
      selectedTemplateId: this.selectedId,
      currentStep: 2
    });
  }

  scrollToSelected() {
    const activeCard = this.container.querySelector(`.crt-template-card[data-id="${this.selectedId}"]`);
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
      this.selectPrevTemplate();
    } else if (action === 'next') {
      this.selectNextTemplate();
    } else if (action === 'green') {
      this.confirmTemplate();
    } else if (action === 'red') {
      sound.play('click');
    }
  }

  destroy() {}
}
