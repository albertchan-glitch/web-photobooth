/**
 * 摄像头硬件与流管理模块
 * 处理摄像头授权、前后置切换、画面镜像与高分辨率截帧
 */

export class CameraManager {
  constructor(videoElement) {
    this.video = videoElement;
    this.stream = null;
    this.facingMode = 'user'; // 'user' (前置) 或 'environment' (后置)
    this.isMirrored = true;
    this.isReady = false;
  }

  /**
   * 启动摄像头视频流
   */
  async start(facingMode = 'user') {
    this.stop();
    this.facingMode = facingMode;
    this.isMirrored = (facingMode === 'user');

    // 1. 安全上下文校验 (手机浏览器在非 HTTPS 下会隐藏 navigator.mediaDevices)
    if (window.isSecureContext === false) {
      const hostname = window.location.hostname;
      const httpsUrl = `https://${hostname}:3443`;
      const err = new Error(
        `手机浏览器安全限制：HTTP 协议下禁用摄像头。请使用 HTTPS 访问：${httpsUrl} （首次访问点击“高级” -> “继续访问”信任本地证书即可正常使用摄像头）。`
      );
      err.isSecureContextError = true;
      err.httpsUrl = httpsUrl;
      throw err;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('当前浏览器未开放摄像头访问接口。请检查浏览器设置或更换自带原生浏览器访问。');
    }

    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920, min: 640 },
        height: { ideal: 1080, min: 480 }
      }
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      this.video.setAttribute('playsinline', 'true');
      this.video.setAttribute('webkit-playsinline', 'true');
      this.video.muted = true;

      await new Promise((resolve) => {
        if (this.video.readyState >= 2) {
          resolve();
        } else {
          this.video.onloadedmetadata = () => resolve();
        }
      });

      await this.video.play();
      this.isReady = true;
      return true;
    } catch (err) {
      this.isReady = false;
      let errorMsg = '摄像头授权失败。';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = '摄像头权限已被拒绝。请在手机浏览器地址栏或系统设置中允许本网站使用摄像头。';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = '未检测到可用的摄像头设备。可使用【导入照片】功能继续体验。';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = '摄像头已被其他应用占用，请关闭其他相机程序后重试。';
      }
      const customError = new Error(errorMsg);
      customError.originalError = err;
      throw customError;
    }
  }

  /**
   * 停止当前视频流
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (_) {}
      });
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
    this.isReady = false;
  }

  /**
   * 切换前后置摄像头
   */
  async switchCamera() {
    const targetMode = this.facingMode === 'user' ? 'environment' : 'user';
    return await this.start(targetMode);
  }

  /**
   * 切换镜像翻转
   */
  toggleMirror() {
    this.isMirrored = !this.isMirrored;
    return this.isMirrored;
  }

  /**
   * 按照目标取景框比例高分辨率截取当前摄像头画面
   */
  capture(targetAspectRatio = 4 / 3) {
    if (!this.isReady || !this.video) {
      throw new Error('摄像头尚未就绪，无法拍照');
    }

    const vw = this.video.videoWidth;
    const vh = this.video.videoHeight;

    if (!vw || !vh) {
      throw new Error('摄像头画面尺寸无效');
    }

    const videoAspect = vw / vh;
    let cropW, cropH, cropX, cropY;

    // 居中裁剪 (Cover 模式)，使画面精确匹配目标比例
    if (videoAspect > targetAspectRatio) {
      cropH = vh;
      cropW = vh * targetAspectRatio;
      cropX = (vw - cropW) / 2;
      cropY = 0;
    } else {
      cropW = vw;
      cropH = vw / targetAspectRatio;
      cropX = 0;
      cropY = (vh - cropH) / 2;
    }

    const canvas = document.createElement('canvas');
    const outWidth = Math.min(Math.round(cropW), 1440);
    const outHeight = Math.round(outWidth / targetAspectRatio);

    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext('2d', { alpha: false });

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (this.isMirrored) {
      ctx.translate(outWidth, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      this.video,
      cropX, cropY, cropW, cropH,
      0, 0, outWidth, outHeight
    );

    return canvas.toDataURL('image/jpeg', 0.95);
  }
}
