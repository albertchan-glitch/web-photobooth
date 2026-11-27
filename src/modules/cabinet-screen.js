const MAX_CABINET_HEIGHT = 920;

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
