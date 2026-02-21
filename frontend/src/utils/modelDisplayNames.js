/**
 * Model display name utilities — single source of truth for
 * converting raw model IDs to human-readable names.
 */

const DISPLAY_NAMES = {
  'claude-opus-4-6':             'Claude Opus 4.6',
  'claude-sonnet-4.6':           'Claude Sonnet 4.6',
  'claude-haiku-4.5':            'Claude Haiku 4.5',
  'claude-haiku-4-5-20251001':   'Claude Haiku 4.5',
  'gpt-5.2':                     'GPT-5.2',
  'gpt-5.1':                     'GPT-5.1',
  'gemini-3-pro':                'Gemini 3 Pro',
  'gemini-2.5-pro':              'Gemini 2.5 Pro',
  'gemini-2.5-flash':            'Gemini 2.5 Flash',
  'gemini-3-flash':              'Gemini 3 Flash',
  'grok-4':                      'Grok 4',
  'grok-4.1':                    'Grok 4.1',
  'llama-4-maverick':            'Llama 4 Maverick',
  'mistral-large':               'Mistral Large',
  'deepseek-v3.2':               'DeepSeek V3.2',
  'deepseek-r1':                 'DeepSeek R1',
  'qwen-3-235b':                 'Qwen 3 235B',
  'kimi-k2.5':                   'Kimi K2.5',
  'minimax-m2.5':                'MiniMax M2.5',
  'llama-3.3-nemotron':          'Nemotron 70B',
};

const PROVIDER_DISPLAY = {
  anthropic:    'Anthropic',
  openai:       'OpenAI',
  google:       'Google',
  'x-ai':       'xAI',
  'meta-llama': 'Meta',
  meta:         'Meta',
  deepseek:     'DeepSeek',
  mistralai:    'Mistral',
  moonshot:     'Moonshot',
  minimax:      'MiniMax',
  nvidia:       'NVIDIA',
  qwen:         'Alibaba',
};

export const TIER_CONFIG = {
  tier_1_premium:   { label: 'Premium',   color: 'var(--gc-gold)' },
  tier_2_balanced:  { label: 'Balanced',  color: 'var(--gc-cyan)' },
  tier_3_efficient: { label: 'Efficient', color: 'var(--status-success)' },
  tier_4_budget:    { label: 'Budget',    color: 'var(--text-muted)' },
};

export function getModelSlug(modelId) {
  if (!modelId) return '';
  const parts = modelId.split('/');
  return parts.length > 1 ? parts[1] : modelId;
}

export function getDisplayName(modelId) {
  if (!modelId) return 'Select model';
  const slug = getModelSlug(modelId);
  return DISPLAY_NAMES[slug] || slug;
}

export function getProviderName(modelId) {
  if (!modelId) return '';
  const provider = modelId.split('/')[0] || '';
  return PROVIDER_DISPLAY[provider] || provider;
}

export function getModelTier(modelId, modelsRoster) {
  if (!modelId || !modelsRoster?.recommended_models) return null;
  for (const [key, tier] of Object.entries(modelsRoster.recommended_models)) {
    if (tier.models?.some(m => m.id === modelId)) {
      return { key, ...TIER_CONFIG[key] };
    }
  }
  return null;
}
