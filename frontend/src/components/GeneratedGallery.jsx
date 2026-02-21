import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { IconImage, IconVideo, IconDownload, IconClose } from './Icons';
import CopyButton from './CopyButton';
import './GeneratedGallery.css';

// Model display names (mirrors backend FAL_MODEL_NAMES / FAL_VIDEO_MODEL_NAMES)
const MODEL_NAMES = {
  nano_banana_pro: 'Nano Banana Pro',
  nano_banana_edit: 'Nano Banana Edit',
  recraft_v4: 'Recraft V4',
  recraft_v4_vector: 'Recraft V4 Vector',
  flux_2_pro: 'Flux 2 Pro',
  flux_2_max: 'Flux 2 Max',
  seedream_4_5: 'Seedream 4.5',
  ideogram_v3: 'Ideogram V3',
  kling_3_i2v: 'Kling 3.0',
  kling_o3_i2v: 'Kling O3',
  minimax_i2v: 'MiniMax Hailuo',
  minimax_fast_i2v: 'MiniMax Fast',
  luma_i2v: 'Luma Ray 2',
  kling_o3_t2v: 'Kling O3',
  veo_3_1_t2v: 'Veo 3.1',
  minimax_t2v: 'MiniMax Hailuo',
  luma_t2v: 'Luma Ray 2',
};

export default function GeneratedGallery({ simId }) {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [expandedPrompts, setExpandedPrompts] = useState({});
  const lightboxRef = useRef(null);

  useEffect(() => {
    loadGenerated();
  }, [simId]);

  const loadGenerated = async () => {
    setLoading(true);
    try {
      const [imgResult, vidResult] = await Promise.all([
        api.getImages(simId).catch(() => ({ images: [] })),
        api.getVideos(simId).catch(() => ({ videos: [] })),
      ]);
      setImages(imgResult?.images || []);
      setVideos(vidResult?.videos || []);
    } catch (e) {
      console.error('Failed to load generated content:', e);
    }
    setLoading(false);
  };

  const togglePrompt = (key) => {
    setExpandedPrompts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const closeLightbox = () => setLightboxImg(null);

  // Handle lightbox click-outside and Escape
  useEffect(() => {
    if (!lightboxImg) return;
    const handleKey = (e) => { if (e.key === 'Escape') closeLightbox(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [lightboxImg]);

  // V3: Prefer local file (persisted) over fal.ai URL (expires in ~24h)
  const getMediaUrl = (item) => {
    if (item.local_path && item.filename) {
      const type = item.local_path.includes('video') ? 'videos' : 'images';
      return `/api/simulation/${simId}/media/${type}/${item.filename}`;
    }
    return item.url; // Fallback to fal.ai URL
  };

  const hasContent = images.length > 0 || videos.length > 0;

  if (loading) {
    return (
      <div className="gg-container">
        <div className="gg-loading">
          <div className="gc-spinner" style={{ width: 24, height: 24 }} />
          <span>Loading generated content...</span>
        </div>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="gg-container">
        <div className="gg-empty">
          <IconImage size={32} className="gg-empty-icon" />
          <div className="gg-empty-text">No generated content yet</div>
          <div className="gg-empty-hint">
            Use the Output tab to generate concept images and videos.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gg-container">
      {/* Bulk Actions */}
      <div className="gg-bulk-actions">
        <span className="gg-bulk-count">
          {images.length} image{images.length !== 1 ? 's' : ''}
          {videos.length > 0 && `, ${videos.length} video${videos.length !== 1 ? 's' : ''}`}
        </span>
        <a
          href={api.getDownloadUrl(simId, 'all')}
          className="gc-btn gc-btn-secondary gg-download-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconDownload size={14} /> Download All (ZIP)
        </a>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="gg-section">
          <h3 className="gg-section-title">
            <IconImage size={16} /> Concept Images
          </h3>
          <div className="gg-grid">
            {images.map((img, i) => (
              <div key={i} className="gg-card">
                <div className="gg-card-img-wrap" onClick={() => setLightboxImg(img)}>
                  <img
                    src={getMediaUrl(img)}
                    alt={img.concept_name || `Image ${i + 1}`}
                    className="gg-card-img"
                    loading="lazy"
                  />
                </div>
                <div className="gg-card-info">
                  <div className="gg-card-name">
                    {img.concept_name || `Concept ${i + 1}`}
                    {img.local_path ? (
                      <span className="gc-badge gc-badge-green" style={{fontSize: '0.6em', marginLeft: 6}}>Local</span>
                    ) : (
                      <span className="gc-badge gc-badge-red" style={{fontSize: '0.6em', marginLeft: 6}}>Expires</span>
                    )}
                  </div>
                  {img.persona && (
                    <div className="gg-card-persona">by {img.persona}</div>
                  )}
                  {img.model && (
                    <span className="gg-card-model">{MODEL_NAMES[img.model] || img.model}</span>
                  )}
                </div>

                {img.prompt && (
                  <div className="gg-card-prompt-wrap">
                    <button
                      className="gg-card-prompt-toggle"
                      onClick={() => togglePrompt(`img-${i}`)}
                    >
                      {expandedPrompts[`img-${i}`] ? 'Hide prompt' : 'Show prompt'}
                    </button>
                    {expandedPrompts[`img-${i}`] && (
                      <div className="gg-card-prompt gc-copyable">
                        {img.prompt}
                        <CopyButton text={img.prompt} />
                      </div>
                    )}
                  </div>
                )}

                <div className="gg-card-actions">
                  <a
                    href={getMediaUrl(img)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gc-btn gc-btn-ghost gg-card-download"
                    download
                  >
                    <IconDownload size={13} /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Gallery */}
      {videos.length > 0 && (
        <div className="gg-section">
          <h3 className="gg-section-title">
            <IconVideo size={16} /> Concept Videos
          </h3>
          <div className="gg-grid">
            {videos.map((vid, i) => (
              <div key={i} className="gg-card">
                <div className="gg-card-video-wrap">
                  <video
                    src={getMediaUrl(vid)}
                    className="gg-card-video"
                    controls
                    preload="metadata"
                  />
                </div>
                <div className="gg-card-info">
                  <div className="gg-card-name">
                    {vid.concept_name || `Video ${i + 1}`}
                    {vid.local_path ? (
                      <span className="gc-badge gc-badge-green" style={{fontSize: '0.6em', marginLeft: 6}}>Local</span>
                    ) : (
                      <span className="gc-badge gc-badge-red" style={{fontSize: '0.6em', marginLeft: 6}}>Expires</span>
                    )}
                  </div>
                  {vid.persona && (
                    <div className="gg-card-persona">by {vid.persona}</div>
                  )}
                  <div className="gg-card-meta">
                    {vid.model && (
                      <span className="gg-card-model">{MODEL_NAMES[vid.model] || vid.model}</span>
                    )}
                    {vid.quality_tier && (
                      <span className="gg-card-tier">{vid.quality_tier}</span>
                    )}
                    {vid.duration && (
                      <span className="gg-card-duration">{vid.duration}s</span>
                    )}
                  </div>
                </div>

                {vid.prompt && (
                  <div className="gg-card-prompt-wrap">
                    <button
                      className="gg-card-prompt-toggle"
                      onClick={() => togglePrompt(`vid-${i}`)}
                    >
                      {expandedPrompts[`vid-${i}`] ? 'Hide prompt' : 'Show prompt'}
                    </button>
                    {expandedPrompts[`vid-${i}`] && (
                      <div className="gg-card-prompt gc-copyable">
                        {vid.prompt}
                        <CopyButton text={vid.prompt} />
                      </div>
                    )}
                  </div>
                )}

                <div className="gg-card-actions">
                  <a
                    href={getMediaUrl(vid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gc-btn gc-btn-ghost gg-card-download"
                    download
                  >
                    <IconDownload size={13} /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div className="gg-lightbox" onClick={closeLightbox}>
          <button className="gg-lightbox-close" onClick={closeLightbox} type="button" aria-label="Close">
            <IconClose size={20} />
          </button>
          <div className="gg-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={getMediaUrl(lightboxImg)}
              alt={lightboxImg.concept_name || 'Generated image'}
              className="gg-lightbox-img"
            />
            <div className="gg-lightbox-info">
              <div className="gg-lightbox-name">{lightboxImg.concept_name}</div>
              {lightboxImg.persona && <div className="gg-lightbox-persona">by {lightboxImg.persona}</div>}
              {lightboxImg.model && (
                <span className="gg-lightbox-model">{MODEL_NAMES[lightboxImg.model] || lightboxImg.model}</span>
              )}
              {lightboxImg.prompt && (
                <div className="gg-lightbox-prompt">{lightboxImg.prompt}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
