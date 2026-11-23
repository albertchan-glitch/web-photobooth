/**
 * 全局状态管理模块
 * 负责各操作步骤、用户选择、拍摄照片缓存和事件派发
 */
import { getTemplateById } from '../config/templates.js';

class StateStore {
  constructor() {
    this.state = {
      // 当前流程步骤: 1=模板选择, 2=相框选择, 3=拍摄页面, 4=成品预览
      currentStep: 1,

      // 选择的模板与相框
      selectedTemplateId: '4slots',
      selectedFrameId: 'classic_white',
      selectedFilterId: 'normal',

      // 拍摄过程中的照片数组 (原始照片 DataURL，保证不被滤镜损毁)
      photos: [],

      // 当前正在拍摄的格子索引 (0 ~ photoCount - 1)
      currentShootIndex: 0,

      // 刚拍好的单张照片暂存（等待用户点击 🔴 重拍 或 🟢 确认）
      currentShotPhoto: null,

      // 是否处于单张重拍模式 (若为数字则为指定格子的索引，重拍确认后直接返回预览)
      retakeSingleIndex: null,

      // 摄像头设置
      cameraFacingMode: 'user', // 'user' (前置) 或 'environment' (后置)
      isMirrored: true,         // 前置摄像头默认镜面翻转

      // 预览页面底部菜单激活项: 'frames' | 'filters' | null
      bottomMenuTab: 'frames',
      
      // 是否正在倒计时
      isCountingDown: false,
    };

    this.listeners = new Set();
  }

  get currentTemplate() {
    return getTemplateById(this.state.selectedTemplateId);
  }

  get(key) {
    return this.state[key];
  }

  set(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    this.notify(updates, prevState);
  }

  /**
   * 监听状态变动
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(changes, prevState) {
    for (const listener of this.listeners) {
      try {
        listener(this.state, changes, prevState);
      } catch (err) {
        console.error('State subscriber error:', err);
      }
    }
  }

  /**
   * 重置当前模板下的拍摄照片
   */
  resetPhotos() {
    const tmpl = this.currentTemplate;
    this.set({
      photos: new Array(tmpl.photoCount).fill(null),
      currentShootIndex: 0,
      currentShotPhoto: null,
      retakeSingleIndex: null
    });
  }

  /**
   * 切换模板，同时校验并重置相关状态
   */
  selectTemplate(templateId) {
    const prevTemplateId = this.state.selectedTemplateId;
    if (prevTemplateId !== templateId) {
      this.set({
        selectedTemplateId: templateId,
        selectedFrameId: 'classic_white', // 恢复默认相框
        photos: [],                       // 清空之前不同规格的照片
        currentShootIndex: 0,
        currentShotPhoto: null,
        retakeSingleIndex: null
      });
    }
  }

  /**
   * 确认当前单张拍摄的照片，存入 photos 对应位置
   */
  confirmCurrentShot() {
    const { photos, currentShotPhoto, currentShootIndex, retakeSingleIndex } = this.state;
    if (!currentShotPhoto) return;

    const targetIndex = retakeSingleIndex !== null ? retakeSingleIndex : currentShootIndex;
    const newPhotos = [...photos];
    newPhotos[targetIndex] = currentShotPhoto;

    const tmpl = this.currentTemplate;

    if (retakeSingleIndex !== null) {
      // 单张重拍模式：确认后直接返回预览页面
      this.set({
        photos: newPhotos,
        currentShotPhoto: null,
        retakeSingleIndex: null,
        currentStep: 4
      });
    } else {
      // 正常连拍流程
      const nextIndex = currentShootIndex + 1;
      if (nextIndex < tmpl.photoCount) {
        // 进入下一张拍摄
        this.set({
          photos: newPhotos,
          currentShootIndex: nextIndex,
          currentShotPhoto: null
        });
      } else {
        // 全部拍完，自动进入步骤 4: 成品预览
        this.set({
          photos: newPhotos,
          currentShootIndex: 0,
          currentShotPhoto: null,
          currentStep: 4
        });
      }
    }
  }

  /**
   * 重拍当前刚拍的照片
   */
  retakeCurrentShot() {
    this.set({
      currentShotPhoto: null
    });
  }

  /**
   * 从成品预览中发起对特定某一张照片的重新拍摄
   */
  startRetakeSingleSlot(slotIndex) {
    this.set({
      retakeSingleIndex: slotIndex,
      currentShootIndex: slotIndex,
      currentShotPhoto: null,
      currentStep: 3
    });
  }
}

export const stateStore = new StateStore();
