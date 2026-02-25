// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — IMAGE OUTPUT RENDERER
// Thumbnail (compact row) and Full (artifact panel) variants
// Handles base64 and URL images with error fallback
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';

function ImageErrorFallback({ t }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 6, width: '100%', height: '100%', minHeight: 60,
      background: t.surfaceRaised, borderRadius: 8, color: t.textMuted,
      fontSize: 10, fontFamily: font.mono,
    }}>
      <span style={{ fontSize: 20, opacity: 0.5 }}>🖼</span>
      Image failed to load
    </div>
  );
}

function resolveImageUrl(img) {
  if (typeof img === 'string') return img;
  return img?.url || img?.data || img?.image_url || '';
}

function resolveImageAlt(img, idx) {
  if (typeof img === 'string') return `Generated ${idx + 1}`;
  return img?.alt || img?.description || `Generated ${idx + 1}`;
}

export default function ImageOutput({
  images = [],
  modelColor,
  variant = 'thumbnail',
  onImageClick,
}) {
  const t = useTokens();
  const mc = modelColor || t.cyan;

  if (!images || images.length === 0) return null;

  if (variant === 'full') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {images.map((img, idx) => (
          <FullImage key={idx} img={img} idx={idx} mc={mc} t={t} />
        ))}
      </div>
    );
  }

  // Thumbnail variant — horizontal scroll row
  return (
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
    }}>
      {images.slice(0, 6).map((img, idx) => (
        <ThumbnailImage
          key={idx} img={img} idx={idx} mc={mc} t={t}
          onClick={() => onImageClick?.(idx)}
        />
      ))}
      {images.length > 6 && (
        <div style={{
          width: 80, height: 80, borderRadius: 8, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: t.surfaceRaised, border: `1px solid ${t.border}`,
          fontSize: 11, fontFamily: font.mono, color: t.textMuted,
        }}>
          +{images.length - 6}
        </div>
      )}
    </div>
  );
}

function ThumbnailImage({ img, idx, mc, t, onClick }) {
  const [error, setError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const url = resolveImageUrl(img);
  const alt = resolveImageAlt(img, idx);

  if (error || !url) {
    return (
      <div style={{ width: 80, height: 80, flexShrink: 0 }}>
        <ImageErrorFallback t={t} />
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        width: 80, height: 80, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
        border: `1px solid ${hovered ? mc : `${mc}33`}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s',
      }}
    >
      <img
        src={url}
        alt={alt}
        onError={() => setError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}

function FullImage({ img, idx, mc, t }) {
  const [error, setError] = useState(false);
  const url = resolveImageUrl(img);
  const alt = resolveImageAlt(img, idx);
  const prompt = typeof img === 'object' ? img?.prompt : null;

  if (error || !url) {
    return <ImageErrorFallback t={t} />;
  }

  return (
    <div>
      <img
        src={url}
        alt={alt}
        onError={() => setError(true)}
        style={{
          maxWidth: '100%', borderRadius: 12,
          border: `1px solid ${t.border}`, display: 'block',
        }}
      />
      {alt && alt !== `Generated ${idx + 1}` && (
        <div style={{
          fontSize: 10, fontFamily: font.mono, color: t.textMuted,
          marginTop: 6, paddingLeft: 2,
        }}>
          {alt}
        </div>
      )}
      {prompt && (
        <div style={{
          fontSize: 11, color: t.textMuted, lineHeight: 1.5,
          marginTop: 8, padding: '8px 12px',
          background: t.surfaceRaised, borderRadius: 6,
          borderLeft: `2px solid ${mc}`,
          fontFamily: font.mono,
        }}>
          {prompt}
        </div>
      )}
    </div>
  );
}
