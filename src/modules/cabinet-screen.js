const TRANSPARENT_ALPHA_THRESHOLD = 128;
const MAX_CABINET_HEIGHT = 920;

function findScreenRegion(imageData, width, height) {
  const pixelCount = width * height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let largestRegion = null;

  for (let start = 0; start < pixelCount; start++) {
    if (visited[start] || imageData.data[start * 4 + 3] >= TRANSPARENT_ALPHA_THRESHOLD) {
      continue;
    }

    let head = 0;
    let tail = 0;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    let touchesEdge = false;
    visited[start] = 1;
    queue[tail++] = start;

    while (head < tail) {
      const pixel = queue[head++];
      const x = pixel % width;
      const y = Math.floor(pixel / width);

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      touchesEdge ||= x === 0 || y === 0 || x === width - 1 || y === height - 1;

      let neighbor = pixel - 1;
      if (
        x > 0 &&
        !visited[neighbor] &&
        imageData.data[neighbor * 4 + 3] < TRANSPARENT_ALPHA_THRESHOLD
      ) {
        visited[neighbor] = 1;
        queue[tail++] = neighbor;
      }

      neighbor = pixel + 1;
      if (
        x < width - 1 &&
        !visited[neighbor] &&
        imageData.data[neighbor * 4 + 3] < TRANSPARENT_ALPHA_THRESHOLD
      ) {
        visited[neighbor] = 1;
        queue[tail++] = neighbor;
      }

      neighbor = pixel - width;
      if (
        y > 0 &&
        !visited[neighbor] &&
        imageData.data[neighbor * 4 + 3] < TRANSPARENT_ALPHA_THRESHOLD
      ) {
        visited[neighbor] = 1;
        queue[tail++] = neighbor;
      }

      neighbor = pixel + width;
      if (
        y < height - 1 &&
        !visited[neighbor] &&
        imageData.data[neighbor * 4 + 3] < TRANSPARENT_ALPHA_THRESHOLD
      ) {
        visited[neighbor] = 1;
        queue[tail++] = neighbor;
      }
    }

    if (!touchesEdge && (!largestRegion || tail > largestRegion.area)) {
      largestRegion = {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        area: tail,
      };
    }
  }

  if (!largestRegion) {
    throw new Error('Could not find an enclosed transparent screen area in the cabinet image.');
  }

  return largestRegion;
}

function createScreenMask(sourcePixels, imageWidth, region) {
  const canvas = document.createElement('canvas');
  canvas.width = region.width;
  canvas.height = region.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not create a canvas context for the cabinet screen mask.');
  }

  const maskPixels = context.createImageData(region.width, region.height);
  for (let y = 0; y < region.height; y++) {
    for (let x = 0; x < region.width; x++) {
      const sourceIndex = ((region.y + y) * imageWidth + region.x + x) * 4;
      const maskIndex = (y * region.width + x) * 4;
      maskPixels.data[maskIndex] = 255;
      maskPixels.data[maskIndex + 1] = 255;
      maskPixels.data[maskIndex + 2] = 255;
      maskPixels.data[maskIndex + 3] = 255 - sourcePixels[sourceIndex + 3];
    }
  }

  context.putImageData(maskPixels, 0, 0);
  return canvas.toDataURL('image/png');
}

function waitForImage(image) {
  if (image.complete) {
    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Could not load cabinet image: ${image.src}`));
  }

  return new Promise((resolve, reject) => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener(
      'error',
      () => reject(new Error(`Could not load cabinet image: ${image.src}`)),
      { once: true }
    );
  });
}

export async function initializeCabinetScreen({ image, wrapper, screen, app }) {
  if (!image || !wrapper || !screen || !app) {
    throw new Error('Cabinet image, wrapper, screen, and app elements are required.');
  }

  await waitForImage(image);

  const imageWidth = image.naturalWidth;
  const imageHeight = image.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = imageWidth;
  canvas.height = imageHeight;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Could not create a canvas context for the cabinet image.');
  }

  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, imageWidth, imageHeight);
  const region = findScreenRegion(imageData, imageWidth, imageHeight);
  const maskUrl = createScreenMask(imageData.data, imageWidth, region);

  screen.style.left = `${(region.x / imageWidth) * 100}%`;
  screen.style.top = `${(region.y / imageHeight) * 100}%`;
  screen.style.width = `${(region.width / imageWidth) * 100}%`;
  screen.style.height = `${(region.height / imageHeight) * 100}%`;
  screen.style.setProperty('mask-image', `url("${maskUrl}")`);
  screen.style.setProperty('-webkit-mask-image', `url("${maskUrl}")`);
  screen.style.setProperty('mask-size', '100% 100%');
  screen.style.setProperty('-webkit-mask-size', '100% 100%');
  screen.style.setProperty('mask-repeat', 'no-repeat');
  screen.style.setProperty('-webkit-mask-repeat', 'no-repeat');

  const fitCabinet = () => {
    const availableWidth = app.clientWidth * 0.96;
    const availableHeight = Math.min(app.clientHeight * 0.96, MAX_CABINET_HEIGHT);
    const scale = Math.min(availableWidth / imageWidth, availableHeight / imageHeight);

    if (!Number.isFinite(scale) || scale <= 0) {
      throw new Error('Could not determine a valid cabinet size for the current viewport.');
    }

    wrapper.style.aspectRatio = `${imageWidth} / ${imageHeight}`;
    wrapper.style.width = `${imageWidth * scale}px`;
    wrapper.style.height = `${imageHeight * scale}px`;
  };

  fitCabinet();
  window.addEventListener('resize', fitCabinet, { passive: true });
  window.visualViewport?.addEventListener('resize', fitCabinet, { passive: true });
  wrapper.style.visibility = 'visible';
  screen.style.visibility = 'visible';
}
