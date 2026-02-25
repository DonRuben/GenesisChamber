// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — THEME-AWARE PDF EXPORT
// Uses html2canvas + jsPDF for proper dark/light rendering
// ─────────────────────────────────────────────────────────

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { font } from '../design/tokens';

const DARK_COLORS = {
  bg: '#111113',
  text: '#E8E6E3',
  muted: '#63636E',
  gold: '#C9A96E',
  cyan: '#00D9FF',
  codeBg: 'rgba(0,0,0,0.4)',
};

const LIGHT_COLORS = {
  bg: '#FFFFFF',
  text: '#1A1A1E',
  muted: '#8E8E93',
  gold: '#9A7B4F',
  cyan: '#0099BB',
  codeBg: 'rgba(0,0,0,0.04)',
};

function getTheme() {
  return typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme') || 'dark'
    : 'dark';
}

function slugify(text, maxLen = 40) {
  return (text || 'export')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLen);
}

/**
 * Theme-aware PDF export.
 * @param {HTMLElement} contentEl — DOM node whose innerHTML to render
 * @param {Object} opts
 * @param {string} opts.filename — base filename (no extension)
 * @param {string} opts.title — document title
 * @param {string} opts.modelName — model attribution
 * @param {string} opts.topic — brief/question text for header
 */
export async function exportToPDF(contentEl, { filename, title, modelName, topic } = {}) {
  const isDark = getTheme() !== 'light';
  const c = isDark ? DARK_COLORS : LIGHT_COLORS;

  // Build off-screen container
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 800px; padding: 40px;
    background: ${c.bg}; color: ${c.text};
    font-family: ${font.body}; font-size: 13px; line-height: 1.7;
  `;

  // Title block
  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title;
    h1.style.cssText = `
      font-family: ${font.display}; font-size: 22px; font-weight: 700;
      color: ${c.gold}; margin: 0 0 4px;
    `;
    container.appendChild(h1);
  }

  // Subtitle line
  const parts = [];
  if (modelName) parts.push(modelName);
  if (topic) parts.push(topic.length > 80 ? topic.slice(0, 80) + '...' : topic);
  if (parts.length) {
    const sub = document.createElement('p');
    sub.textContent = parts.join(' · ');
    sub.style.cssText = `
      font-family: ${font.mono}; font-size: 10px; color: ${c.muted};
      margin: 0 0 20px; letter-spacing: 0.04em;
    `;
    container.appendChild(sub);
  }

  // Divider
  const hr = document.createElement('hr');
  hr.style.cssText = `border: none; border-top: 1px solid ${c.muted}; margin: 0 0 20px; opacity: 0.3;`;
  container.appendChild(hr);

  // Clone content
  const clone = contentEl.cloneNode(true);

  // Style headings and code in the clone
  clone.querySelectorAll('h1, h2, h3').forEach((el) => {
    el.style.color = c.gold;
    el.style.fontFamily = font.display;
  });
  clone.querySelectorAll('pre, code').forEach((el) => {
    el.style.background = c.codeBg;
    el.style.color = c.cyan;
    el.style.borderRadius = '4px';
    el.style.padding = el.tagName === 'PRE' ? '12px' : '2px 4px';
    el.style.fontFamily = font.mono;
    el.style.fontSize = '11px';
  });
  clone.querySelectorAll('a').forEach((el) => {
    el.style.color = c.cyan;
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: c.bg,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgW = canvas.width;
    const imgH = canvas.height;

    // A4 dimensions in mm
    const pageW = 210;
    const pageH = 297;
    const margin = 10;
    const contentW = pageW - margin * 2;
    const contentH = pageH - margin * 2;

    const ratio = contentW / (imgW / 2); // scale=2
    const scaledH = (imgH / 2) * ratio;

    const pdf = new jsPDF('p', 'mm', 'a4');

    // Set background for each page
    const totalPages = Math.ceil(scaledH / contentH);
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      // Fill background
      pdf.setFillColor(c.bg);
      pdf.rect(0, 0, pageW, pageH, 'F');

      const srcY = (page * contentH) / ratio * 2;
      const srcH = Math.min((contentH / ratio) * 2, imgH - srcY);
      const destH = srcH * ratio / 2;

      // Create a sub-canvas for this page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgW;
      pageCanvas.height = Math.ceil(srcH);
      const ctx = pageCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, srcY, imgW, srcH, 0, 0, imgW, srcH);

      const pageImg = pageCanvas.toDataURL('image/png');
      pdf.addImage(pageImg, 'PNG', margin, margin, contentW, destH);
    }

    // Generate filename
    const ts = Math.floor(Date.now() / 1000);
    const slug = slugify(filename || title || topic || 'council-export');
    pdf.save(`${slug}-${ts}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
