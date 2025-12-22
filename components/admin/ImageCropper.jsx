'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_ASPECT_OPTIONS = [
  { label: 'Paysage 3:2', value: 3 / 2 },
  { label: 'Large 2:1', value: 2 },
  { label: 'Carré 1:1', value: 1 },
  { label: 'Portrait 2:3', value: 2 / 3 },
  { label: 'Classique 4:3', value: 4 / 3 },
];

function buildAspectOptions(options, initialAspect) {
  const list = options && options.length ? options : DEFAULT_ASPECT_OPTIONS;
  if (!initialAspect) return list;
  const exists = list.some((item) => Math.abs(item.value - initialAspect) < 0.001);
  if (exists) return list;
  return [{ label: 'Format actuel', value: initialAspect }, ...list];
}

function inferMimeType(fileType, fileName) {
  if (fileType) return fileType;
  const lower = (fileName || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function makeOutputName(fileName, mimeType) {
  const fallback = `image-${Date.now()}`;
  const base = fileName ? fileName.replace(/\.[^/.]+$/, '') : fallback;
  const extension = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
  return `${base}-recadre${extension}`;
}

export default function ImageCropper({
  sourceUrl,
  initialAspect,
  aspectOptions,
  fileName,
  fileType,
  rawFile,
  onCancel,
  onSave,
}) {
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);
  const [aspect, setAspect] = useState(initialAspect || DEFAULT_ASPECT_OPTIONS[0].value);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const aspectList = useMemo(() => buildAspectOptions(aspectOptions, initialAspect), [aspectOptions, initialAspect]);

  useEffect(() => {
    setAspect(initialAspect || DEFAULT_ASPECT_OPTIONS[0].value);
  }, [initialAspect, sourceUrl]);

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [aspect, sourceUrl]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return undefined;
    const updateSize = () => {
      const width = node.clientWidth;
      const height = width ? width / aspect : 0;
      setStageSize({ width, height });
    };
    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateSize);
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [aspect]);

  const metrics = useMemo(() => {
    if (!naturalSize.width || !naturalSize.height || !stageSize.width || !stageSize.height) return null;
    const baseScale = Math.max(stageSize.width / naturalSize.width, stageSize.height / naturalSize.height);
    const scale = baseScale * zoom;
    const displayWidth = naturalSize.width * scale;
    const displayHeight = naturalSize.height * scale;
    const maxX = Math.max(0, (displayWidth - stageSize.width) / 2);
    const maxY = Math.max(0, (displayHeight - stageSize.height) / 2);
    return { scale, displayWidth, displayHeight, maxX, maxY };
  }, [naturalSize, stageSize, zoom]);

  const clampOffset = (next) => {
    if (!metrics) return next;
    return {
      x: Math.max(-metrics.maxX, Math.min(metrics.maxX, next.x)),
      y: Math.max(-metrics.maxY, Math.min(metrics.maxY, next.y)),
    };
  };

  useEffect(() => {
    setOffset((current) => clampOffset(current));
  }, [metrics?.maxX, metrics?.maxY]);

  const handlePointerDown = (event) => {
    if (!metrics) return;
    event.preventDefault();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    setOffset(clampOffset({ x: dragRef.current.offsetX + dx, y: dragRef.current.offsetY + dy }));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleSave = async () => {
    if (!imageRef.current || !metrics) return;
    const cropWidth = stageSize.width;
    const cropHeight = stageSize.height;
    const imgLeft = (cropWidth - metrics.displayWidth) / 2 + offset.x;
    const imgTop = (cropHeight - metrics.displayHeight) / 2 + offset.y;

    let cropX = (0 - imgLeft) / metrics.scale;
    let cropY = (0 - imgTop) / metrics.scale;
    let cropW = cropWidth / metrics.scale;
    let cropH = cropHeight / metrics.scale;

    cropW = Math.min(naturalSize.width, cropW);
    cropH = Math.min(naturalSize.height, cropH);
    cropX = Math.max(0, Math.min(naturalSize.width - cropW, cropX));
    cropY = Math.max(0, Math.min(naturalSize.height - cropH, cropY));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(cropW);
    canvas.height = Math.round(cropH);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(imageRef.current, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

    const mimeType = inferMimeType(fileType, fileName);
    const outputName = makeOutputName(fileName, mimeType);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, 0.92));
    if (!blob) return;

    onSave({ blob, fileName: outputName, fileType: mimeType });
  };

  return (
    <div className="image-cropper">
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <div>
          <label className="form-label fw-semibold mb-1">Format</label>
          <select
            className="form-select form-select-sm"
            value={aspect}
            onChange={(event) => setAspect(Number(event.target.value))}
          >
            {aspectList.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-grow-1">
          <label className="form-label fw-semibold mb-1">Zoom</label>
          <input
            type="range"
            className="form-range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setOffset({ x: 0, y: 0 })}>
          Recentrer
        </button>
      </div>

      <div
        ref={stageRef}
        className="image-cropper-stage"
        style={{
          aspectRatio: aspect,
          width: '100%',
          maxWidth: '520px',
          height: stageSize.height ? `${stageSize.height}px` : '320px',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <img
          ref={imageRef}
          src={sourceUrl}
          alt="Ajustement"
          draggable={false}
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            setNaturalSize({ width: naturalWidth, height: naturalHeight });
          }}
          style={{
            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${metrics?.scale ?? 1})`,
            pointerEvents: 'none',
          }}
        />
        <div className="image-cropper-frame" />
      </div>

      <div className="d-flex flex-wrap gap-2 mt-3">
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          Enregistrer l&apos;image
        </button>
        {rawFile ? (
          <button type="button" className="btn btn-outline-primary" onClick={() => onSave({ useOriginal: true })}>
            Téléverser sans recadrer
          </button>
        ) : null}
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </div>
  );
}
