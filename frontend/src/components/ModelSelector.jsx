import { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from './Icons';
import { getDisplayName, getProviderName, getModelTier, TIER_CONFIG } from '../utils/modelDisplayNames';
import './ModelSelector.css';

export default function ModelSelector({ value, onChange, models, compact = false }) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const ref = useRef(null);

  const tierInfo = getModelTier(value, models);

  // Close on click-outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Smart dropdown positioning — avoid viewport overflow
  useEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setAlignRight(rect.left + 400 > window.innerWidth - 16);
  }, [open]);

  function getTiers() {
    if (!models || !models.recommended_models) return [];
    return Object.entries(models.recommended_models).map(([key, tier]) => ({
      key,
      label: TIER_CONFIG[key]?.label || key,
      color: TIER_CONFIG[key]?.color || 'var(--text-muted)',
      description: tier.description || '',
      models: tier.models || [],
    }));
  }

  const tiers = getTiers();

  function handleSelect(modelId) {
    onChange(modelId);
    setOpen(false);
  }

  return (
    <div className={`model-selector${compact ? ' compact' : ''}`} ref={ref}>
      <button
        className="model-selector-trigger"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        type="button"
      >
        {tierInfo && (
          <span
            className="model-selector-tier-dot"
            style={{ '--tier-color': tierInfo.color }}
          />
        )}
        <span className="model-selector-trigger-name">{getDisplayName(value)}</span>
        <IconChevronDown size={compact ? 10 : 12} />
      </button>

      {open && (
        <div className={`model-selector-dropdown${alignRight ? ' align-right' : ''}`}>
          {tiers.map((tier) => (
            <div className="model-tier-group" key={tier.key}>
              <div className="model-tier-header">
                <span
                  className="model-tier-dot"
                  style={{ '--tier-color': tier.color }}
                />
                <span className="model-tier-label">{tier.label}</span>
                {tier.description && (
                  <span className="model-tier-desc">{tier.description}</span>
                )}
              </div>
              {tier.models.map((model) => {
                const isSelected = model.id === value;
                return (
                  <button
                    key={model.id}
                    className={`model-option${isSelected ? ' selected' : ''}`}
                    onClick={() => handleSelect(model.id)}
                    type="button"
                  >
                    <div className="model-option-left">
                      <span className="model-option-name">{getDisplayName(model.id)}</span>
                      <span className="model-option-provider">{getProviderName(model.id)}</span>
                    </div>
                    <div className="model-option-right">
                      <span className="model-option-cost">${model.cost_per_1m_tokens}/M</span>
                      <span className="model-option-context">{model.context}</span>
                    </div>
                    {isSelected && <span className="model-option-check">&#10003;</span>}
                  </button>
                );
              })}
            </div>
          ))}

          {tiers.length === 0 && (
            <div className="model-tier-empty">No models available</div>
          )}
        </div>
      )}
    </div>
  );
}
