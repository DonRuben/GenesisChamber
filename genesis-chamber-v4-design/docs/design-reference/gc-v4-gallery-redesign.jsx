import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// GENESIS CHAMBER V4 — GALLERY + COMPARE VIEW
// Tobias van Schneider — flat surfaces, 2px accents, no shadows
// Grid / Concept-grouped / Compare views + Lightbox
// ═══════════════════════════════════════════════════════════════

const s = { display: "inline-block", verticalAlign: "-0.125em" };
const IC = {
  gallery: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="2" y="3" width="16" height="14" rx="1.5"/><circle cx="7" cy="8" r="1.5"/><path d="M2 14l4-4 3 3 4-5 5 6"/></svg>,
  search: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><circle cx="8.5" cy="8.5" r="5"/><path d="M13 13l4 4"/></svg>,
  xClose: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M5 5l10 10M15 5L5 15"/></svg>,
  download: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M4 13v3a1 1 0 001 1h10a1 1 0 001-1v-3"/><path d="M10 3v10"/><path d="M6 10l4 4 4-4"/></svg>,
  clipboard: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M7 3h6"/><rect x="4" y="2" width="12" height="16" rx="1.5"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>,
  crown: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M3 15h14l-2-8-3 4-2-6-2 6-3-4z"/><path d="M3 15v2h14v-2"/></svg>,
};

const T = {
  bg: "#111113", surface: "#18181B", surfaceRaised: "#1F1F23", surfaceHover: "#26262B",
  flame: "#F27123", cyan: "#00D9FF", gold: "#D4A853", magenta: "#E5375E",
  green: "#34D399", purple: "#8B5CF6", amber: "#F59E0B", red: "#EF4444",
  text: "#E8E6E3", textSoft: "#A1A1AA", textMuted: "#63636E",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
};
const font = { display: "'OmniPresent', Inter, system-ui", body: "Inter, system-ui, sans-serif", mono: "'JetBrains Mono', monospace" };
const MODEL_COLORS = { Claude: "#D97706", "GPT-4o": "#10A37F", Gemini: "#4285F4", DeepSeek: "#06B6D4", Grok: "#1D9BF0" };

const Tag = ({ label, color = T.cyan }) => (
  <span style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 600, color, background: `${color}14`, borderRadius: 4, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</span>
);
const MonoLabel = ({ children, icon, color = T.textMuted }) => (
  <div style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: 6 }}>
    {icon && <span style={{ fontSize: 14 }}>{icon}</span>}{children}
  </div>
);
const statusColor = (st) => st === "winner" ? T.gold : st === "eliminated" ? T.red : T.cyan;

const CONCEPTS = [
  { id: 1, name: "SoundSphere Elite", persona: "Claude", status: "winner", score: 94 },
  { id: 2, name: "AudioVault Pro", persona: "GPT-4o", status: "surviving", score: 87 },
  { id: 3, name: "FreqWave", persona: "Gemini", status: "surviving", score: 78 },
  { id: 4, name: "DecibelX", persona: "DeepSeek", status: "eliminated", score: 62 },
  { id: 5, name: "BassNova", persona: "Grok", status: "eliminated", score: 45 },
];
const MEDIA = [
  { id: 1, conceptId: 1, type: "image", model: "Recraft V4", prompt: "Premium headphone brand hero, spatial audio waves, cinematic" },
  { id: 2, conceptId: 1, type: "image", model: "Flux 2 Pro", prompt: "SoundSphere product, minimalist studio, warm lighting" },
  { id: 3, conceptId: 1, type: "video", model: "Veo 3.1", duration: 8, prompt: "Camera orbit premium headphones, particles" },
  { id: 4, conceptId: 2, type: "image", model: "Ideogram V3", prompt: "Vault headphone case, brushed metal, secure" },
  { id: 5, conceptId: 2, type: "image", model: "Recraft V4", prompt: "AudioVault identity, lock + sound wave" },
  { id: 6, conceptId: 3, type: "image", model: "Seedream 4.5", prompt: "Youth headphones, modular, vibrant" },
  { id: 7, conceptId: 4, type: "image", model: "Nano Banana", prompt: "Studio monitors, technical precision" },
  { id: 8, conceptId: 4, type: "video", model: "Kling 3.0", duration: 5, prompt: "Engineer workspace, DecibelX in use" },
  { id: 9, conceptId: 5, type: "image", model: "Flux 2 Pro", prompt: "Bass headphones, neon club, EDM" },
];

const PlaceholderImg = ({ conceptId, index }) => {
  const c = CONCEPTS.find(cc => cc.id === conceptId);
  const mc = MODEL_COLORS[c?.persona] || T.cyan;
  return (<div style={{ width: "100%", aspectRatio: index % 3 === 0 ? "4/5" : index % 3 === 1 ? "1/1" : "3/4", background: T.surfaceRaised, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
    <span style={{ fontSize: 28, color: mc, opacity: 0.4 }}>{IC.gallery}</span>
    <span style={{ fontFamily: font.mono, fontSize: 9, color: T.textMuted }}>{c?.name?.split(" ")[0]}</span>
  </div>);
};
const PlaceholderVideo = ({ conceptId }) => {
  const mc = MODEL_COLORS[CONCEPTS.find(cc => cc.id === conceptId)?.persona] || T.cyan;
  return (<div style={{ width: "100%", aspectRatio: "16/9", background: T.surfaceRaised, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 40, height: 40, borderRadius: 9999, background: `${mc}14`, border: `1px solid ${mc}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: `12px solid ${mc}`, marginLeft: 2 }} />
    </div>
  </div>);
};

export default function GalleryRedesign() {
  const [view, setView] = useState("gallery");
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const [compareLeft, setCompareLeft] = useState(null);
  const [compareRight, setCompareRight] = useState(null);
  const [compareSide, setCompareSide] = useState(null);
  const [searchPrompt, setSearchPrompt] = useState("");

  const filtered = MEDIA.filter(m => {
    if (filter !== "all" && m.type !== filter) return false;
    if (searchPrompt && !m.prompt.toLowerCase().includes(searchPrompt.toLowerCase())) return false;
    return true;
  });
  const grouped = CONCEPTS.map(c => ({ ...c, media: filtered.filter(m => m.conceptId === c.id) })).filter(g => g.media.length > 0);
  const lbIdx = lightbox ? filtered.findIndex(m => m.id === lightbox.id) : -1;
  const lbPrev = () => { if (lbIdx > 0) setLightbox(filtered[lbIdx - 1]); };
  const lbNext = () => { if (lbIdx < filtered.length - 1) setLightbox(filtered[lbIdx + 1]); };

  useEffect(() => {
    if (!lightbox) return;
    const h = (e) => { if (e.key === "Escape") setLightbox(null); if (e.key === "ArrowLeft") lbPrev(); if (e.key === "ArrowRight") lbNext(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lightbox, lbIdx]);

  const handleCompareSelect = (media) => {
    if (compareSide === "left") { setCompareLeft(media); setCompareSide(null); }
    else if (compareSide === "right") { setCompareRight(media); setCompareSide(null); }
  };

  const Btn = ({ active, onClick, children, accent = T.cyan }) => (
    <button onClick={onClick} style={{ padding: "5px 13px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: font.body, background: active ? `${accent}14` : "transparent", color: active ? accent : T.textMuted }}>{children}</button>
  );

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: font.body }}>
      {/* TOP BAR */}
      <div style={{ padding: "16px 21px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, background: T.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <h2 style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, margin: 0 }}>Gallery</h2>
          <Tag label={`${MEDIA.filter(m => m.type === "image").length} img`} color={T.cyan} />
          <Tag label={`${MEDIA.filter(m => m.type === "video").length} vid`} color={T.purple} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: T.surfaceRaised, borderRadius: 6, width: 180 }}>
            <span style={{ color: T.textMuted, fontSize: 13 }}>{IC.search}</span>
            <input type="text" placeholder="Search prompts…" value={searchPrompt} onChange={e => setSearchPrompt(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 11, fontFamily: font.body, width: "100%" }} />
          </div>
          <div style={{ display: "flex", background: T.surfaceRaised, borderRadius: 6, padding: 2 }}>
            {["all", "image", "video"].map(f => <Btn key={f} active={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "All" : f === "image" ? "Images" : "Videos"}</Btn>)}
          </div>
          <div style={{ display: "flex", background: T.surfaceRaised, borderRadius: 6, padding: 2 }}>
            {[["gallery","Grid"],["concept","Concept"],["compare","Compare"]].map(([k,l]) => <Btn key={k} active={view === k} onClick={() => setView(k)} accent={T.flame}>{l}</Btn>)}
          </div>
          <button style={{ padding: "6px 13px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: T.flame, color: "#fff" }}>{IC.download} ZIP</button>
        </div>
      </div>

      {/* GRID VIEW */}
      {view === "gallery" && (
        <div style={{ padding: 21 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 13 }}>
            {filtered.map((media, i) => {
              const concept = CONCEPTS.find(c => c.id === media.conceptId);
              const isElim = concept?.status === "eliminated";
              return (
                <div key={media.id} onClick={() => setLightbox(media)} style={{ background: T.surface, borderRadius: 8, overflow: "hidden", cursor: "pointer", borderLeft: `2px solid ${statusColor(concept?.status)}`, opacity: isElim ? 0.55 : 1 }}>
                  <div style={{ position: "relative" }}>
                    {media.type === "image" ? <PlaceholderImg conceptId={media.conceptId} index={i} /> : <PlaceholderVideo conceptId={media.conceptId} />}
                    <div style={{ position: "absolute", top: 8, left: 8 }}><Tag label={media.type === "video" ? `▶ ${media.duration}s` : "IMG"} color={media.type === "video" ? T.purple : T.cyan} /></div>
                    {concept?.status === "winner" && <div style={{ position: "absolute", top: 8, right: 8, display: "flex", alignItems: "center", gap: 3 }}><Tag label="WIN" color={T.gold} /></div>}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isElim ? T.textMuted : T.text }}>{concept?.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 10, color: T.textMuted }}>{concept?.persona}</span>
                      <Tag label={media.model} color={MODEL_COLORS[concept?.persona] || T.cyan} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONCEPT VIEW */}
      {view === "concept" && (
        <div style={{ padding: 21, display: "flex", flexDirection: "column", gap: 21 }}>
          {grouped.map(group => {
            const isElim = group.status === "eliminated"; const sc = statusColor(group.status);
            return (
              <div key={group.id} style={{ background: T.surface, borderRadius: 8, overflow: "hidden", borderLeft: `2px solid ${sc}`, opacity: isElim ? 0.6 : 1 }}>
                <div style={{ padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: font.mono, fontSize: 14, fontWeight: 700, color: sc }}>#{CONCEPTS.indexOf(group) + 1}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, textDecoration: isElim ? "line-through" : "none", color: isElim ? T.textMuted : T.text }}>{group.name}</div>
                      <span style={{ fontSize: 11, color: T.textMuted }}>{group.persona} · {group.media.length} media</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: font.mono, fontSize: 18, fontWeight: 700, color: sc }}>{group.score}</span>
                    <Tag label={group.status} color={sc} />
                  </div>
                </div>
                <div style={{ padding: 10, display: "grid", gridTemplateColumns: `repeat(${Math.min(group.media.length, 4)}, 1fr)`, gap: 8 }}>
                  {group.media.map((media, i) => (
                    <div key={media.id} onClick={() => setLightbox(media)} style={{ borderRadius: 8, overflow: "hidden", cursor: "pointer", position: "relative" }}>
                      {media.type === "image" ? <PlaceholderImg conceptId={media.conceptId} index={i} /> : <PlaceholderVideo conceptId={media.conceptId} />}
                      <div style={{ position: "absolute", bottom: 6, left: 6, fontFamily: font.mono, fontSize: 9, color: T.textSoft, background: `${T.bg}cc`, padding: "2px 6px", borderRadius: 4 }}>{media.model}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPARE VIEW */}
      {view === "compare" && (
        <div style={{ padding: 21, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, minHeight: 350 }}>
            {[{ side: "left", item: compareLeft, setItem: setCompareLeft }, { side: "right", item: compareRight, setItem: setCompareRight }].map(({ side, item, setItem }) => (
              <div key={side} style={{ background: T.surface, borderRadius: 8, overflow: "hidden", borderLeft: `2px solid ${compareSide === side ? T.cyan : T.border}`, display: "flex", flexDirection: "column" }}>
                {item ? (<>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 13, background: T.bg }}>
                    {item.type === "image" ? <PlaceholderImg conceptId={item.conceptId} index={item.id} /> : <PlaceholderVideo conceptId={item.conceptId} />}
                  </div>
                  <div style={{ padding: "10px 13px", borderTop: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{CONCEPTS.find(c => c.id === item.conceptId)?.name}</div>
                        <span style={{ fontSize: 10, color: T.textMuted }}>{item.model}</span>
                      </div>
                      <button onClick={() => setItem(null)} style={{ background: T.surfaceRaised, border: "none", borderRadius: 4, padding: "3px 8px", color: T.textMuted, fontSize: 10, cursor: "pointer", fontFamily: font.mono }}>{IC.xClose} CLEAR</button>
                    </div>
                    <div style={{ fontSize: 11, color: T.textSoft, lineHeight: 1.5, padding: 8, background: T.surfaceRaised, borderRadius: 6, marginTop: 8, maxHeight: 60, overflow: "auto" }}>{item.prompt}</div>
                  </div>
                </>) : (
                  <div onClick={() => setCompareSide(side)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, border: `1px dashed ${T.textMuted}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: T.textMuted }}>+</div>
                    <span style={{ fontSize: 11, color: T.textMuted }}>{compareSide === side ? "Select below ↓" : `Choose ${side}`}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {compareSide && (<>
            <div style={{ padding: "6px 10px", background: `${T.cyan}08`, borderRadius: 6, borderLeft: `2px solid ${T.cyan}`, fontSize: 11, color: T.cyan }}>Click image for <strong>{compareSide}</strong> panel</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
              {MEDIA.filter(m => m.type === "image").map((media, i) => {
                const concept = CONCEPTS.find(c => c.id === media.conceptId);
                return (<div key={media.id} onClick={() => handleCompareSelect(media)} style={{ background: T.surface, borderRadius: 8, overflow: "hidden", cursor: "pointer", borderLeft: `2px solid ${statusColor(concept?.status)}` }}>
                  <PlaceholderImg conceptId={media.conceptId} index={i} />
                  <div style={{ padding: "4px 8px", fontSize: 10, color: T.textSoft }}>{concept?.name}</div>
                </div>);
              })}
            </div>
          </>)}
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox && (() => {
        const concept = CONCEPTS.find(c => c.id === lightbox.conceptId); const sc = statusColor(concept?.status);
        return (<div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: `${T.bg}f0`, display: "flex" }}>
          {lbIdx > 0 && <button onClick={e => { e.stopPropagation(); lbPrev(); }} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>←</button>}
          {lbIdx < filtered.length - 1 && <button onClick={e => { e.stopPropagation(); lbNext(); }} style={{ position: "absolute", right: 300, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>→</button>}
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 16, left: 16, width: 32, height: 32, borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>{IC.xClose}</button>
          <div onClick={e => e.stopPropagation()} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 55 }}>
            {lightbox.type === "image" ? <PlaceholderImg conceptId={lightbox.conceptId} index={lightbox.id} /> : <PlaceholderVideo conceptId={lightbox.conceptId} />}
          </div>
          <div onClick={e => e.stopPropagation()} style={{ width: 280, background: T.surface, borderLeft: `2px solid ${sc}`, padding: 21, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
            <MonoLabel color={T.textMuted}>{lbIdx + 1} / {filtered.length}</MonoLabel>
            <div><div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{concept?.name}</div><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, color: T.textMuted }}>{concept?.persona}</span><Tag label={concept?.status} color={sc} /></div></div>
            <div style={{ height: 1, background: T.flame, opacity: 0.15 }} />
            <div><MonoLabel icon={IC.clipboard} color={T.textMuted}>Technical</MonoLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}><Tag label={lightbox.model} color={T.cyan} /><Tag label={lightbox.type} color={T.textMuted} />{lightbox.duration && <Tag label={`${lightbox.duration}s`} color={T.purple} />}</div></div>
            <div style={{ height: 1, background: T.flame, opacity: 0.15 }} />
            <div><MonoLabel color={T.textMuted}>Prompt</MonoLabel><div style={{ fontSize: 12, color: T.textSoft, lineHeight: 1.6, padding: 10, background: T.surfaceRaised, borderRadius: 6, marginTop: 8 }}>{lightbox.prompt}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto" }}><span style={{ fontFamily: font.mono, fontSize: 28, fontWeight: 700, color: sc }}>{concept?.score}</span><div><div style={{ fontSize: 11, fontWeight: 600 }}>Concept Score</div><div style={{ fontSize: 10, color: T.textMuted }}>Final evaluation</div></div></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer", background: T.flame, color: "#fff", fontSize: 11, fontWeight: 600 }}>{IC.download} Download</button>
              <button style={{ padding: "8px 13px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.surfaceRaised, color: T.textSoft, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Open</button>
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, textAlign: "center", fontFamily: font.mono }}>← → navigate · ESC close</div>
          </div>
        </div>);
      })()}
    </div>
  );
}
