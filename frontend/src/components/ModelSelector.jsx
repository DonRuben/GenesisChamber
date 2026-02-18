import { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from './Icons';
import './ModelSelector.css';

/**
 * ModelSelector — Dropdown for selecting LLM models, grouped by tier.
 *
 * Props:
 *   value    — current model ID string (e.g., "anthropic/claude-sonnet-4.5")
 *   onChange  — callback with new model ID
 *   models   — full model roster object from the /api/config/models endpoint
 *   compact  — boolean, use smaller trigger button (for participant cards)
 */
export default function ModelSelector({ value, onChange, models, compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

  // Extract short display name from a model ID like "anthropic/claude-sonnet-4.5"
  function getShortName(modelId) {
    if (!modelId) return 'Select model';
    const parts = modelId.split('/');
    return parts.length > 1 ? parts[1] : modelId;
  }

  // Extract provider from a model ID like "anthropic/claude-sonnet-4.5"
  function getProvider(modelId) {
    if (!modelId) return '';
    const parts = modelId.split('/');
    return parts[0] || '';
  }

  // Build tier entries from the models roster
  function getTiers() {
    if (!models || !models.recommended_models) return [];

    const tierLabels = {
      tier_1_premium: 'Premium',
      tier_2_balanced: 'Balanced',
      tier_3_efficient: 'Efficient',
    };

    return Object.entries(models.recommended_models).map(([key, tier]) => ({
      key,
      label: tierLabels[key] || key,
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
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span>{getShortName(value)}</span>
        <IconChevronDown size={12} />
      </button>

      {open && (
        <div className="model-selector-dropdown">
          {tiers.map((tier) => (
            <div className="model-tier-group" key={tier.key}>
              <div className="model-tier-label">
                {tier.label}
                {tier.description && (
                  <span className="model-tier-desc">{tier.description}</span>
                )}
              </div>
              {tier.models.map((model) => (
                <button
                  key={model.id}
                  className={`model-option${model.id === value ? ' selected' : ''}`}
                  onClick={() => handleSelect(model.id)}
                  type="button"
                >
                  <span className="model-option-provider">{getProvider(model.id)}</span>
                  <span className="model-option-name">{getShortName(model.id)}</span>
                  <span className="model-option-meta">
                    ${model.cost_per_1m_tokens}/M &middot; {model.context}
                  </span>
                </button>
              ))}
            </div>
          ))}

          {tiers.length === 0 && (
            <div className="model-tier-label" style={{ padding: '12px 13px', color: 'var(--text-muted)' }}>
              No models available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
