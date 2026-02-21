import { useState, useEffect } from 'react';
import { api } from '../api';
import { IconImage, IconVideo, IconPresentation, IconScroll, IconCheck, IconDownload, IconExport } from './Icons';
import CopyButton from './CopyButton';
import './OutputPanel.css';

// Image model options for user selection
const IMAGE_MODELS = [
  { key: 'auto', label: 'Auto-select', desc: 'Best model chosen per concept' },
  { key: 'nano_banana_pro', label: 'Nano Banana Pro', desc: 'Google — fast, high quality, ~$0.15/img' },
  { key: 'recraft_v4', label: 'Recraft V4', desc: 'Brand/design, ~$0.04/img' },
  { key: 'flux_2_pro', label: 'Flux 2 Pro', desc: 'Photorealistic, editorial' },
  { key: 'flux_2_max', label: 'Flux 2 Max', desc: 'Highest quality photorealistic' },
  { key: 'seedream_4_5', label: 'Seedream 4.5', desc: 'Artistic/creative, ~$0.04/img' },
  { key: 'ideogram_v3', label: 'Ideogram V3', desc: 'Typography, text in images' },
];

export default function OutputPanel({ simId, simState }) {
  const [imageStatus, setImageStatus] = useState(null); // null | 'generating' | 'complete' | 'error'
  const [videoStatus, setVideoStatus] = useState(null);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoTiers, setVideoTiers] = useState(null);
  const [selectedTier, setSelectedTier] = useState('standard');
  const [selectedImageModel, setSelectedImageModel] = useState('auto');
  const [imageScope, setImageScope] = useState('active');

  useEffect(() => {
    // Try to load existing images/videos
    loadExistingMedia();
    loadVideoTiers();
  }, [simId]);

  const loadExistingMedia = async () => {
    try {
      const imgResult = await api.getImages(simId);
      if (imgResult?.images?.length > 0) {
        setImages(imgResult.images);
        setImageStatus('complete');
      }
    } catch (e) { /* no existing images */ }

    try {
      const vidResult = await api.getVideos(simId);
      if (vidResult?.videos?.length > 0) {
        setVideos(vidResult.videos);
        setVideoStatus('complete');
      }
    } catch (e) { /* no existing videos */ }
  };

  const loadVideoTiers = async () => {
    try {
      const tiers = await api.getVideoTiers(simId);
      setVideoTiers(tiers);
    } catch (e) { /* video tiers not available */ }
  };

  const handleGenerateImages = async () => {
    setImageStatus('generating');
    try {
      const options = {
        ...(selectedImageModel !== 'auto' ? { model: selectedImageModel } : {}),
        scope: imageScope,
      };
      await api.generateImages(simId, options);
      // Poll for completion
      const poll = setInterval(async () => {
        try {
          const result = await api.getImages(simId);
          if (result?.status === 'complete' || result?.images?.length > 0) {
            setImages(result.images || []);
            setImageStatus('complete');
            clearInterval(poll);
          }
        } catch (e) { /* keep polling */ }
      }, 5000);
      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(poll);
        if (imageStatus === 'generating') setImageStatus('error');
      }, 300000);
    } catch (e) {
      console.error('Image generation failed:', e);
      setImageStatus('error');
    }
  };

  const handleGenerateVideos = async () => {
    setVideoStatus('generating');
    try {
      await api.generateVideos(simId, selectedTier);
      const poll = setInterval(async () => {
        try {
          const result = await api.getVideos(simId);
          if (result?.status === 'complete' || result?.videos?.length > 0) {
            setVideos(result.videos || []);
            setVideoStatus('complete');
            clearInterval(poll);
          }
        } catch (e) { /* keep polling */ }
      }, 10000);
      setTimeout(() => {
        clearInterval(poll);
        if (videoStatus === 'generating') setVideoStatus('error');
      }, 600000);
    } catch (e) {
      console.error('Video generation failed:', e);
      setVideoStatus('error');
    }
  };

  const handleDownloadPresentation = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
    window.open(`${baseUrl}/api/simulation/${simId}/presentation`, '_blank');
  };

  const handleDownloadTranscript = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
    window.open(`${baseUrl}/api/simulation/${simId}/transcript`, '_blank');
  };

  const renderStatusBadge = (status) => {
    if (!status) return null;
    if (status === 'generating') return <span className="gc-badge gc-badge-cyan">Generating...</span>;
    if (status === 'complete') return <span className="gc-badge gc-badge-green"><IconCheck size={12} /> Complete</span>;
    if (status === 'error') return <span className="gc-badge gc-badge-red">Failed</span>;
    return null;
  };

  // Get tier info for display
  const selectedTierInfo = videoTiers?.[selectedTier];

  return (
    <div className="op-container">
      <div className="op-header">
        <h3 className="op-title">Deliverables</h3>
        <p className="op-subtitle">Generate and download simulation outputs</p>
      </div>

      <div className="op-grid">
        {/* Images Card */}
        <div className="op-card">
          <div className="op-card-icon"><IconImage size={24} /></div>
          <div className="op-card-info">
            <div className="op-card-title">Concept Images</div>
            <div className="op-card-desc">Generate AI visualizations for each concept</div>

            {/* Model selector */}
            <div className="op-model-select">
              <label className="op-model-label">Model</label>
              <select
                className="gc-input op-model-dropdown"
                value={selectedImageModel}
                onChange={(e) => setSelectedImageModel(e.target.value)}
              >
                {IMAGE_MODELS.map(m => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
              <div className="op-model-desc">
                {IMAGE_MODELS.find(m => m.key === selectedImageModel)?.desc}
              </div>
            </div>

            {/* V3: Scope selector */}
            <div className="op-model-select" style={{ marginTop: 8 }}>
              <label className="op-model-label">Generate for</label>
              <select
                className="gc-input op-model-dropdown"
                value={imageScope}
                onChange={(e) => setImageScope(e.target.value)}
              >
                <option value="active">Active concepts</option>
                <option value="all">All concepts (inc. eliminated)</option>
                <option value="winner">Winner only</option>
              </select>
            </div>

            {renderStatusBadge(imageStatus)}
          </div>
          <button
            className="gc-btn gc-btn-cyan op-card-action"
            onClick={handleGenerateImages}
            disabled={imageStatus === 'generating'}
          >
            {imageStatus === 'generating' ? (
              <><span className="gc-spinner" /> Generating...</>
            ) : imageStatus === 'complete' ? (
              <><IconCheck size={16} /> Regenerate</>
            ) : (
              <><IconImage size={16} /> Generate</>
            )}
          </button>
        </div>

        {/* Videos Card */}
        <div className="op-card">
          <div className="op-card-icon"><IconVideo size={24} /></div>
          <div className="op-card-info">
            <div className="op-card-title">Video Presentations</div>
            <div className="op-card-desc">Create video walkthroughs of concepts</div>
            {videoTiers && (
              <div className="op-tier-select">
                {Object.entries(videoTiers).map(([key, tier]) => (
                  <button
                    key={key}
                    className={`gc-btn gc-btn-ghost op-tier-btn ${selectedTier === key ? 'active' : ''}`}
                    onClick={() => setSelectedTier(key)}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            )}
            {selectedTierInfo && (
              <div className="op-tier-info">
                <span className="op-tier-detail">{selectedTierInfo.description}</span>
                <span className="op-tier-cost">{selectedTierInfo.cost_estimate}</span>
              </div>
            )}
            {renderStatusBadge(videoStatus)}
          </div>
          <button
            className="gc-btn gc-btn-cyan op-card-action"
            onClick={handleGenerateVideos}
            disabled={videoStatus === 'generating'}
          >
            {videoStatus === 'generating' ? (
              <><span className="gc-spinner" /> Generating...</>
            ) : videoStatus === 'complete' ? (
              <><IconCheck size={16} /> Regenerate</>
            ) : (
              <><IconVideo size={16} /> Generate</>
            )}
          </button>
        </div>

        {/* Presentation Card */}
        <div className="op-card">
          <div className="op-card-icon"><IconPresentation size={24} /></div>
          <div className="op-card-info">
            <div className="op-card-title">Presentation Deck</div>
            <div className="op-card-desc">Download reveal.js presentation package</div>
          </div>
          <button className="gc-btn gc-btn-secondary op-card-action" onClick={handleDownloadPresentation}>
            <IconDownload size={16} /> Download
          </button>
        </div>

        {/* Transcript Card */}
        <div className="op-card">
          <div className="op-card-icon"><IconScroll size={24} /></div>
          <div className="op-card-info">
            <div className="op-card-title">Full Transcript</div>
            <div className="op-card-desc">Download the complete simulation record</div>
          </div>
          <button className="gc-btn gc-btn-secondary op-card-action" onClick={handleDownloadTranscript}>
            <IconDownload size={16} /> Download
          </button>
        </div>

        {/* Markdown Exports Card */}
        <div className="op-card op-card-wide">
          <div className="op-card-icon"><IconExport size={24} /></div>
          <div className="op-card-info">
            <div className="op-card-title">Markdown Exports</div>
            <div className="op-card-desc">Download structured markdown for specific rounds, personas, or the winner</div>
            <div className="op-export-links">
              <a href={api.getExportUrl(simId, 'summary')} className="gc-btn gc-btn-ghost op-export-btn" download>
                <IconDownload size={14} /> Full Summary
              </a>
              <a href={api.getExportUrl(simId, 'winner')} className="gc-btn gc-btn-ghost op-export-btn" download>
                <IconDownload size={14} /> Winner Package
              </a>
              <a href={api.getDAExportUrl(simId)} className="gc-btn gc-btn-ghost op-export-btn" style={{borderColor: '#DC2626', color: '#DC2626'}} download>
                <IconDownload size={14} /> DA Report
              </a>
              <a href={api.getProductionExportUrl(simId)} className="gc-btn gc-btn-ghost op-export-btn" style={{borderColor: 'var(--gc-gold)', color: 'var(--gc-gold)'}} download>
                <IconDownload size={14} /> Production Package
              </a>
              {simState?.rounds?.map((r) => (
                <a key={r.round_num} href={api.getExportUrl(simId, 'round', r.round_num)} className="gc-btn gc-btn-ghost op-export-btn" download>
                  <IconDownload size={14} /> R{r.round_num}
                </a>
              ))}
            </div>
            {simState?.config?.participants && Object.keys(simState.config.participants).length > 0 && (
              <div className="op-export-links" style={{ marginTop: '8px' }}>
                <span className="op-export-label">By Persona:</span>
                {Object.entries(simState.config.participants).map(([pid, p]) => (
                  <a key={pid} href={api.getExportUrl(simId, 'persona', pid)} className="gc-btn gc-btn-ghost op-export-btn" download>
                    <IconDownload size={14} /> {p.display_name || pid}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Gallery Preview */}
      {images.length > 0 && (
        <div className="op-gallery">
          <h4 className="op-gallery-title">Generated Images ({images.length})</h4>
          <div className="op-gallery-grid">
            {images.map((img, i) => {
              const imgUrl = (img.local_path && img.filename)
                ? `/api/simulation/${simId}/media/images/${img.filename}`
                : img.url;
              return (
                <div key={i} className="op-gallery-item">
                  <img src={imgUrl} alt={img.concept_name || `Concept ${i + 1}`} className="op-gallery-img" />
                  <div className="op-gallery-caption">
                    {img.concept_name || img.caption || `Concept ${i + 1}`}
                    {img.model && <span className="op-gallery-model">{img.model}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Video Results */}
      {videos.length > 0 && (
        <div className="op-video-results">
          <h4 className="op-gallery-title">Generated Videos ({videos.length})</h4>
          {videos.map((vid, i) => {
            const vidUrl = (vid.local_path && vid.filename)
              ? `/api/simulation/${simId}/media/videos/${vid.filename}`
              : vid.url;
            return (
              <div key={i} className="op-video-item">
                <IconVideo size={16} />
                <span className="op-video-name">{vid.concept_name || vid.name || `Video ${i + 1}`}</span>
                {vid.model && <span className="op-video-model">{vid.model}</span>}
                <a href={vidUrl} target="_blank" rel="noopener noreferrer" className="gc-btn gc-btn-ghost">
                  <IconDownload size={14} /> Download
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
