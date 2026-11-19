const MAX_DIMENSION = 2400;
const MAX_UNTOUCHED_BYTES = 1.5 * 1024 * 1024;
const RESIZABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function outputType(file) {
  if (file.type === 'image/png' || file.type === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}

function renameFor(name, type) {
  const base = (name || `photo-${Date.now()}`).replace(/\.[^/.]+$/, '');
  return `${base}.${type === 'image/webp' ? 'webp' : 'jpg'}`;
}

function loadImage(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}

async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null);
    if (bitmap) return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  }
  const image = await loadImage(file);
  if (!image) return null;
  return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => {} };
}

export async function compressImage(file) {
  if (!RESIZABLE_TYPES.includes(file.type)) {
    return file;
  }

  const decoded = await decode(file);
  if (!decoded) return file;

  const largest = Math.max(decoded.width, decoded.height);
  if (file.size <= MAX_UNTOUCHED_BYTES && largest <= MAX_DIMENSION) {
    decoded.release();
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / largest);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(decoded.width * scale);
  canvas.height = Math.round(decoded.height * scale);
  canvas.getContext('2d').drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
  decoded.release();

  const type = outputType(file);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, 0.85));
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], renameFor(file.name, type), { type });
}
