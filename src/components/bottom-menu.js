/**
 * 步骤五：成品预览底部功能菜单组件
 * 支持相框切换、滤镜切换与拼贴暂缓入口
 * 点击选项后成品预览实时无损更新，不影响拍摄原图
 */

import { getFramesForTemplate } from '../config/frames.js';
import { FILTERS } from '../config/filters.js';
import { stateStore } from '../modules/state.js';

export class BottomMenu {
  constructor(container, onUpdate) {
    this.container = container;
    this.onUpdate = onUpdate; // 回调触发 Canvas 实时重绘
    this.currentTab = 'frames'; // 'frames' | 'filters' | 'collage'
  }

  render() {
    const tmpl = stateStore.currentTemplate;
    const frames = getFramesForTemplate(tmpl.id);
    const selectedFrameId = stateStore.get('selectedFrameId');
    const selectedFilterId = stateStore.get('selectedFilterId');

    this.container.innerHTML = `
      <div class="bottom-menu-widget">
        <!-- 主菜单导航标签栏 -->
        <nav class="menu-tabs-bar">
          <button class="menu-tab-btn ${this.currentTab === 'frames' ? 'active' : ''}" data-tab="frames">
            <span class="tab-icon">🖼️</span>
            <span class="tab-label">相框</span>
          </button>
          
          <button class="menu-tab-btn ${this.currentTab === 'filters' ? 'active' : ''}" data-tab="filters">
            <span class="tab-icon">🎨</span>
            <span class="tab-label">滤镜</span>
          </button>

          <button class="menu-tab-btn tab-disabled ${this.currentTab === 'collage' ? 'active' : ''}" data-tab="collage" title="功能筹备中">
            <span class="tab-icon">🧩</span>
            <span class="tab-label">拼贴</span>
            <span class="badge-pending">暂缓</span>
          </button>
        </nav>

        <!-- 选项抽屉内容栏 (横向滑动选项) -->
        <div class="menu-tray-content">
          ${this.currentTab === 'frames' ? this.renderFramesTray(frames, selectedFrameId) : ''}
          ${this.currentTab === 'filters' ? this.renderFiltersTray(selectedFilterId) : ''}
        </div>
      </div>
    `;

    this.bindEvents(frames);
  }

  renderFramesTray(frames, selectedId) {
    return `
      <div class="horizontal-options-scroll" id="tray-frames">
        ${frames.map(f => {
          const isSelected = f.id === selectedId;
          return `
            <button class="option-item-btn frame-option ${isSelected ? 'active' : ''}" data-frame-id="${f.id}">
              <div class="frame-thumb-circle" style="background-color: ${f.colorHex}; border: 2px solid ${f.borderHex};">
                ${isSelected ? '<span class="check-icon">✓</span>' : ''}
              </div>
              <span class="option-label">${f.name}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  renderFiltersTray(selectedId) {
    return `
      <div class="horizontal-options-scroll" id="tray-filters">
        ${FILTERS.map(f => {
          const isSelected = f.id === selectedId;
          return `
            <button class="option-item-btn filter-option ${isSelected ? 'active' : ''}" data-filter-id="${f.id}">
              <div class="filter-thumb-box" style="background-color: ${f.previewColor};">
                <span class="filter-sample" style="filter: ${f.cssFilter};">Aa</span>
                ${isSelected ? '<span class="check-icon">✓</span>' : ''}
              </div>
              <span class="option-label">${f.name}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  bindEvents(frames) {
    // 菜单 Tab 切换
    const tabBtns = this.container.querySelectorAll('.menu-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab === 'collage') {
          // 暂缓功能提示
          this.showToast('拼贴功能正在筹备中，敬请期待！');
          return;
        }
        this.currentTab = tab;
        this.render();
      });
    });

    // 相框选项点击
    const frameBtns = this.container.querySelectorAll('.frame-option');
    frameBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const frameId = btn.dataset.frameId;
        stateStore.set({ selectedFrameId: frameId });
        this.render();
        if (this.onUpdate) this.onUpdate();
      });
    });

    // 滤镜选项点击
    const filterBtns = this.container.querySelectorAll('.filter-option');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterId = btn.dataset.filterId;
        stateStore.set({ selectedFilterId: filterId });
        this.render();
        if (this.onUpdate) this.onUpdate();
      });
    });
  }

  showToast(msg) {
    let toast = document.querySelector('#global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.className = 'global-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }
}
