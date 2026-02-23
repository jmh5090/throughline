import { useState, useEffect, useCallback, useRef } from "react";
import {
  Zap, Search, ChevronRight, ChevronDown, ExternalLink, Copy, Check, Plus,
  ArrowRight, ArrowLeft, RefreshCw, Settings, X, Loader2, Radio, Users,
  MessageSquare, Mail, Linkedin, FileText, Globe, AlertTriangle, Filter,
  Clock, TrendingUp, Target, Mic, PenLine, Eye, Sparkles, LayoutGrid
} from "lucide-react";

import { loadState, persistState } from "./utils/storage";
import { aiCall, aiStream, aiJSON, aiSearchJSON } from "./utils/ai";
import { VOICE_PRESETS, CHANNELS, DEMO_CONFIG } from "./data/demo-config";

// ─── Design Tokens ───────────────────────────────────────────────────────────

const C = {
  bg: "#f9fafb",
  surface: "#ffffff",
  surfaceRaised: "#ffffff",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  borderFocus: "#0d9488",

  text: "#111827",
  textSecondary: "#6b7280",
  textTertiary: "#9ca3af",
  textInverse: "#ffffff",

  accent: "#0d9488",    // teal
  accentHover: "#0f766e",
  accentLight: "#f0fdfa",
  accentMuted: "#99f6e4",

  high: "#ef4444",
  highBg: "#fef2f2",
  medium: "#f59e0b",
  mediumBg: "#fffbeb",
  low: "#22c55e",
  lowBg: "#f0fdf4",

  sidebar: "#111827",
  sidebarText: "#9ca3af",
  sidebarTextActive: "#ffffff",
  sidebarHover: "#1f2937",
};

const font = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

const uid = () => Math.random().toString(36).slice(2, 9);

// ─── UI Primitives ───────────────────────────────────────────────────────────

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: `1px solid ${C.border}`, fontSize: "13px",
  fontFamily: font, outline: "none", background: C.surface,
  color: C.text, boxSizing: "border-box", transition: "border-color 0.15s",
};

const textareaStyle = { ...inputStyle, minHeight: "72px", resize: "vertical", lineHeight: 1.6 };

function Btn({ children, onClick, primary, ghost, danger, small, disabled, full, style: sx }) {
  const base = {
    padding: small ? "6px 12px" : "8px 18px", borderRadius: "8px",
    cursor: disabled ? "default" : "pointer", fontSize: small ? "12px" : "13px",
    fontWeight: 600, fontFamily: font, transition: "all 0.15s",
    display: "inline-flex", alignItems: "center", gap: "6px",
    width: full ? "100%" : "auto", justifyContent: "center",
    opacity: disabled ? 0.5 : 1, lineHeight: 1.2,
  };
  const v = danger ? { background: C.highBg, color: C.high, border: "none" }
    : ghost ? { background: "transparent", color: C.textSecondary, border: "none" }
    : primary ? { background: C.accent, color: C.textInverse, border: "none" }
    : { background: C.surface, color: C.text, border: `1px solid ${C.border}` };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...v, ...sx }}>{children}</button>;
}

function ImpactDot({ level, withLabel }) {
  const color = level === "high" ? C.high : level === "medium" ? C.medium : C.low;
  const bg = level === "high" ? C.highBg : level === "medium" ? C.mediumBg : C.lowBg;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: withLabel ? "2px 8px 2px 6px" : "0", borderRadius: "6px", background: withLabel ? bg : "transparent" }}>
      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
      {withLabel && <span style={{ fontSize: "11px", fontWeight: 600, color, textTransform: "capitalize" }}>{level}</span>}
    </span>
  );
}

function Spinner({ size = 16 }) {
  return <Loader2 size={size} style={{ animation: "throughline-spin 1s linear infinite", color: C.accent }} />;
}

function Label({ children }) {
  return <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: C.textSecondary, marginBottom: "5px", letterSpacing: "0.01em" }}>{children}</label>;
}

function SectionHeader({ children, count, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: C.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em" }}>{children}</span>
        {count !== undefined && <span style={{ fontSize: "11px", fontWeight: 600, color: C.accent, background: C.accentLight, padding: "1px 7px", borderRadius: "10px" }}>{count}</span>}
      </div>
      {action}
    </div>
  );
}

function Card({ children, style: sx, onClick, active }) {
  return (
    <div onClick={onClick} style={{
      background: C.surface, borderRadius: "10px",
      border: active ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`,
      padding: "14px", cursor: onClick ? "pointer" : "default",
      transition: "all 0.12s", ...sx
    }}>{children}</div>
  );
}

function RenderedMarkdown({ text }) {
  if (!text) return null;
  return (
    <div style={{ fontSize: "13.5px", lineHeight: 1.7, color: C.text }}>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("## ")) return <h3 key={i} style={{ fontSize: "15px", fontWeight: 700, margin: "20px 0 6px", color: C.text }}>{line.slice(3)}</h3>;
        if (line.startsWith("### ")) return <h4 key={i} style={{ fontSize: "12px", fontWeight: 700, color: C.accent, margin: "14px 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{line.slice(4)}</h4>;
        if (line.startsWith("**Subject")) return <div key={i} style={{ padding: "8px 12px", background: C.accentLight, borderRadius: "6px", fontWeight: 600, marginBottom: "10px", borderLeft: `3px solid ${C.accent}`, fontSize: "13px" }}>{line.replace(/\*\*/g, "")}</div>;
        if (/^[-•] /.test(line)) return <div key={i} style={{ paddingLeft: "16px", marginBottom: "3px", position: "relative" }}><span style={{ position: "absolute", left: "4px", color: C.textTertiary }}>–</span>{line.slice(2)}</div>;
        if (/^\d+\.\s/.test(line)) return <div key={i} style={{ paddingLeft: "4px", marginBottom: "3px" }}>{line}</div>;
        if (!line.trim()) return <div key={i} style={{ height: "8px" }} />;
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return <p key={i} style={{ margin: "0 0 5px" }}>{parts.map((p, j) => p.startsWith("**") && p.endsWith("**") ? <strong key={j} style={{ fontWeight: 600 }}>{p.slice(2, -2)}</strong> : p)}</p>;
      })}
    </div>
  );
}

// ─── WIZARD ──────────────────────────────────────────────────────────────────

function WizardShell({ step, totalSteps, children, onBack, onNext, nextLabel, nextDisabled, isLoading, onHome }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div onClick={onHome} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: onHome ? "pointer" : "default" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>Throughline</span>
        </div>
        <div style={{ display: "flex", gap: "3px" }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} style={{ width: i === step ? "20px" : "6px", height: "6px", borderRadius: "3px", background: i <= step ? C.accent : C.border, transition: "all 0.3s" }} />
          ))}
        </div>
      </header>
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "48px 24px 100px" }}>
        <div style={{ width: "100%", maxWidth: "680px" }}>{children}</div>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "14px 28px", background: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
        <div>{step > 0 && <Btn onClick={onBack} ghost><ArrowLeft size={14} /> Back</Btn>}</div>
        <Btn onClick={onNext} primary disabled={nextDisabled || isLoading}>
          {isLoading ? <><Spinner size={14} /> Working...</> : <>{nextLabel || "Continue"} <ArrowRight size={14} /></>}
        </Btn>
      </div>
    </div>
  );
}

function StepTheme({ value, onChange }) {
  const examples = [
    "Clean energy tax credit guidance and market intel",
    "AI regulation, governance, and LLM releases",
    "US tariff policy and supply chain impacts",
    "Agricultural sustainability and carbon markets",
    "Healthcare policy and pharmaceutical regulation"
  ];
  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px", color: C.text, letterSpacing: "-0.02em" }}>What do you want to track?</h1>
      <p style={{ fontSize: "14px", color: C.textSecondary, margin: "0 0 28px", lineHeight: 1.5 }}>Describe the policy, regulatory, or market domain you want to monitor.</p>
      <textarea style={{ ...textareaStyle, fontSize: "15px", minHeight: "100px" }} value={value} onChange={e => onChange(e.target.value)} placeholder="e.g. Clean energy tax credit guidance and market intel..." />
      <div style={{ marginTop: "24px" }}>
        <Label>Quick start</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {examples.map(ex => (
            <button key={ex} onClick={() => onChange(ex)} style={{
              padding: "7px 14px", borderRadius: "8px", border: `1px solid ${value === ex ? C.accent : C.border}`,
              background: value === ex ? C.accentLight : C.surface, color: value === ex ? C.accent : C.textSecondary,
              cursor: "pointer", fontSize: "12.5px", fontWeight: 500, fontFamily: font, textAlign: "left", transition: "all 0.12s"
            }}>{ex}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepSources({ sources, setSources, theme, suggestedSources, setSuggestedSources, isLoading, setIsLoading }) {
  const [manualInput, setManualInput] = useState("");

  const suggest = async () => {
    setIsLoading(true);
    const result = await aiJSON(`Given this intelligence theme, suggest 8-10 high-quality news sources a PMM should monitor.\n\nTHEME: "${theme}"\n\nReturn ONLY a JSON array:\n- "name": source name\n- "type": "government" | "news" | "research" | "industry" | "data"\n- "url": primary URL\n- "why": one sentence on relevance\n\nReturn valid JSON only.`, 1200);
    setSuggestedSources(result || []);
    setIsLoading(false);
  };

  useEffect(() => { if (theme && suggestedSources.length === 0 && !isLoading) suggest(); }, []);

  const add = (s) => { if (!sources.find(x => x.name === s.name)) setSources([...sources, s]); };
  const remove = (name) => setSources(sources.filter(s => s.name !== name));
  const addManual = () => { if (manualInput.trim()) { add({ name: manualInput.trim(), type: "custom", url: "", why: "Manually added" }); setManualInput(""); } };

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px", color: C.text, letterSpacing: "-0.02em" }}>Configure your sources</h1>
      <p style={{ fontSize: "14px", color: C.textSecondary, margin: "0 0 28px", lineHeight: 1.5 }}>Where should Throughline look for signals? Add sources manually or use suggestions.</p>

      {sources.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <SectionHeader count={sources.length}>Your sources</SectionHeader>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {sources.map(s => (
              <span key={s.name} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "7px", background: C.accentLight, color: C.accent, fontSize: "12.5px", fontWeight: 500 }}>
                {s.name}
                <button onClick={() => remove(s.name)} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, padding: 0, lineHeight: 1, display: "flex" }}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
        <input style={{ ...inputStyle, flex: 1 }} value={manualInput} onChange={e => setManualInput(e.target.value)} placeholder="Add a source name or URL..." onKeyDown={e => e.key === "Enter" && addManual()} />
        <Btn onClick={addManual} small><Plus size={14} /> Add</Btn>
      </div>

      <SectionHeader action={!isLoading && <Btn onClick={suggest} ghost small><RefreshCw size={12} /> Re-suggest</Btn>}>Suggested</SectionHeader>
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "28px", justifyContent: "center", color: C.textSecondary, fontSize: "13px" }}><Spinner /> Finding sources...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {suggestedSources.map(s => {
            const added = sources.find(x => x.name === s.name);
            return (
              <Card key={s.name} onClick={added ? undefined : () => add(s)} active={added} style={{ cursor: added ? "default" : "pointer", opacity: added ? 0.55 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: C.text }}>{s.name}</div>
                    <div style={{ fontSize: "11px", color: C.textTertiary, textTransform: "capitalize", marginTop: "1px" }}>{s.type}</div>
                  </div>
                  {added && <Check size={14} color={C.accent} strokeWidth={3} />}
                </div>
                <div style={{ fontSize: "12px", color: C.textSecondary, marginTop: "6px", lineHeight: 1.4 }}>{s.why}</div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepPersonas({ personas, setPersonas, theme, suggestedPersonas, setSuggestedPersonas, isLoading, setIsLoading }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", title: "", company: "", painPoints: [""], buyingTriggers: [""], sophistication: "medium", notes: "" });

  const suggest = async () => {
    setIsLoading(true);
    const result = await aiJSON(`Given this theme, suggest 3-4 distinct customer personas.\n\nTHEME: "${theme}"\n\nReturn ONLY a JSON array:\n- "name": persona label\n- "title": job title\n- "company": company type\n- "painPoints": array of 2-3\n- "buyingTriggers": array of 2-3\n- "sophistication": "low"|"medium"|"high"|"expert"\n- "notes": one communication note\n\nReturn valid JSON only.`, 1500);
    setSuggestedPersonas(result || []);
    setIsLoading(false);
  };

  useEffect(() => { if (theme && suggestedPersonas.length === 0 && !isLoading) suggest(); }, []);

  const add = (p) => { if (!personas.find(x => x.name === p.name)) setPersonas([...personas, { ...p, id: p.id || `p_${uid()}` }]); };
  const remove = (id) => setPersonas(personas.filter(p => p.id !== id));

  const startEdit = (p) => {
    setForm({ name: p?.name || "", title: p?.title || "", company: p?.company || "", painPoints: p?.painPoints?.length ? [...p.painPoints] : [""], buyingTriggers: p?.buyingTriggers?.length ? [...p.buyingTriggers] : [""], sophistication: p?.sophistication || "medium", notes: p?.notes || "" });
    setEditing(p?.id || "new");
  };

  const saveEdit = () => {
    const persona = { ...form, id: editing === "new" ? `p_${uid()}` : editing, painPoints: form.painPoints.filter(Boolean), buyingTriggers: form.buyingTriggers.filter(Boolean) };
    if (editing === "new") setPersonas([...personas, persona]);
    else setPersonas(personas.map(p => p.id === editing ? persona : p));
    setEditing(null);
  };

  if (editing !== null) {
    return (
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px", color: C.text, letterSpacing: "-0.02em" }}>{editing === "new" ? "Add persona" : "Edit persona"}</h1>
        <p style={{ fontSize: "14px", color: C.textSecondary, margin: "0 0 24px" }}>Define who this customer is and what drives their decisions.</p>
        <Card style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div><Label>Name</Label><input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Project Developer" /></div>
            <div><Label>Title</Label><input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. VP of Development" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", marginBottom: "12px" }}>
            <div><Label>Company type</Label><input style={inputStyle} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Mid-size renewable developer" /></div>
            <div><Label>Sophistication</Label><select style={{ ...inputStyle, cursor: "pointer" }} value={form.sophistication} onChange={e => setForm(f => ({ ...f, sophistication: e.target.value }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="expert">Expert</option></select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <Label>Pain points</Label>
              {form.painPoints.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                  <input style={{ ...inputStyle, fontSize: "12px", padding: "7px 10px" }} value={p} onChange={e => { const n = [...form.painPoints]; n[i] = e.target.value; setForm(f => ({ ...f, painPoints: n })); }} />
                  {form.painPoints.length > 1 && <button onClick={() => setForm(f => ({ ...f, painPoints: f.painPoints.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: C.textTertiary, display: "flex", alignItems: "center" }}><X size={12} /></button>}
                </div>
              ))}
              <button onClick={() => setForm(f => ({ ...f, painPoints: [...f.painPoints, ""] }))} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontSize: "12px", fontWeight: 600, fontFamily: font }}>+ Add</button>
            </div>
            <div>
              <Label>Buying triggers</Label>
              {form.buyingTriggers.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                  <input style={{ ...inputStyle, fontSize: "12px", padding: "7px 10px" }} value={t} onChange={e => { const n = [...form.buyingTriggers]; n[i] = e.target.value; setForm(f => ({ ...f, buyingTriggers: n })); }} />
                  {form.buyingTriggers.length > 1 && <button onClick={() => setForm(f => ({ ...f, buyingTriggers: f.buyingTriggers.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: C.textTertiary, display: "flex", alignItems: "center" }}><X size={12} /></button>}
                </div>
              ))}
              <button onClick={() => setForm(f => ({ ...f, buyingTriggers: [...f.buyingTriggers, ""] }))} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontSize: "12px", fontWeight: 600, fontFamily: font }}>+ Add</button>
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}><Label>Notes</Label><textarea style={{ ...textareaStyle, minHeight: "50px" }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Communication style notes..." /></div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Btn onClick={() => setEditing(null)}>Cancel</Btn>
            <Btn onClick={saveEdit} primary disabled={!form.name.trim()}>Save</Btn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px", color: C.text, letterSpacing: "-0.02em" }}>Define your personas</h1>
      <p style={{ fontSize: "14px", color: C.textSecondary, margin: "0 0 28px", lineHeight: 1.5 }}>Who are the customers impacted by this domain?</p>

      {personas.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <SectionHeader count={personas.length}>Your personas</SectionHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {personas.map(p => (
              <Card key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>{p.name}</div>
                  <div style={{ fontSize: "12px", color: C.textSecondary }}>{p.title} · {p.company}</div>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <Btn onClick={() => startEdit(p)} ghost small><PenLine size={12} /></Btn>
                  <Btn onClick={() => remove(p.id)} ghost small style={{ color: C.high }}><X size={12} /></Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
        <Btn onClick={() => startEdit(null)} small><Plus size={13} /> Add manually</Btn>
        {!isLoading && <Btn onClick={suggest} ghost small><RefreshCw size={12} /> Re-suggest</Btn>}
      </div>

      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "28px", justifyContent: "center", color: C.textSecondary, fontSize: "13px" }}><Spinner /> Analyzing personas...</div>
      ) : suggestedPersonas.length > 0 && (
        <div>
          <SectionHeader>Suggested</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {suggestedPersonas.map((s, i) => {
              const added = personas.find(x => x.name === s.name);
              return (
                <Card key={i} onClick={added ? undefined : () => add(s)} active={added} style={{ cursor: added ? "default" : "pointer", opacity: added ? 0.55 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "13px" }}>{s.name}</div>
                      <div style={{ fontSize: "11px", color: C.textSecondary }}>{s.title}</div>
                      <div style={{ fontSize: "11px", color: C.textTertiary }}>{s.company}</div>
                    </div>
                    {added && <Check size={14} color={C.accent} strokeWidth={3} />}
                  </div>
                  {s.notes && <div style={{ fontSize: "12px", color: C.textSecondary, marginTop: "6px", lineHeight: 1.4, fontStyle: "italic" }}>{s.notes}</div>}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StepVoice({ voice, setVoice }) {
  const [preset, setPreset] = useState(null);
  const [custom, setCustom] = useState(false);

  const pick = (id) => { setPreset(id); setCustom(false); setVoice({ ...VOICE_PRESETS[id] }); };
  const goCustom = () => { setPreset(null); setCustom(true); if (!voice.tone) setVoice({ tone: "", brandVoice: "", dos: [""], donts: [""], channelNotes: { email: "", linkedin: "", blog: "", web: "" } }); };

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px", color: C.text, letterSpacing: "-0.02em" }}>Set your messaging voice</h1>
      <p style={{ fontSize: "14px", color: C.textSecondary, margin: "0 0 28px", lineHeight: 1.5 }}>How should generated messaging sound? Choose a preset or define your own.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
        {Object.values(VOICE_PRESETS).map(p => (
          <Card key={p.id} onClick={() => pick(p.id)} active={preset === p.id} style={{ cursor: "pointer" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "3px" }}>{p.name}</div>
            <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.4 }}>{p.description}</div>
          </Card>
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <Btn onClick={goCustom} ghost small style={{ color: custom ? C.accent : C.textTertiary }}>
          <PenLine size={12} /> {custom ? "Editing custom voice" : "Write your own"}
        </Btn>
      </div>

      {(preset || custom) && voice && (
        <Card style={{ background: C.bg, padding: "20px" }}>
          <div style={{ marginBottom: "12px" }}><Label>Tone</Label><textarea style={{ ...textareaStyle, minHeight: "50px" }} value={voice.tone || ""} onChange={e => setVoice(v => ({ ...v, tone: e.target.value }))} placeholder="How should the voice feel?" /></div>
          <div style={{ marginBottom: "12px" }}><Label>Brand voice</Label><textarea style={{ ...textareaStyle, minHeight: "44px" }} value={voice.brandVoice || ""} onChange={e => setVoice(v => ({ ...v, brandVoice: e.target.value }))} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <Label>Do's</Label>
              {(voice.dos || [""]).map((d, i) => (
                <div key={i} style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>
                  <input style={{ ...inputStyle, padding: "6px 8px", fontSize: "12px" }} value={d} onChange={e => { const n = [...(voice.dos || [""])]; n[i] = e.target.value; setVoice(v => ({ ...v, dos: n })); }} />
                </div>
              ))}
              <button onClick={() => setVoice(v => ({ ...v, dos: [...(v.dos || []), ""] }))} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontSize: "12px", fontWeight: 600, fontFamily: font }}>+ Add</button>
            </div>
            <div>
              <Label>Don'ts</Label>
              {(voice.donts || [""]).map((d, i) => (
                <div key={i} style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>
                  <input style={{ ...inputStyle, padding: "6px 8px", fontSize: "12px" }} value={d} onChange={e => { const n = [...(voice.donts || [""])]; n[i] = e.target.value; setVoice(v => ({ ...v, donts: n })); }} />
                </div>
              ))}
              <button onClick={() => setVoice(v => ({ ...v, donts: [...(v.donts || []), ""] }))} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontSize: "12px", fontWeight: 600, fontFamily: font }}>+ Add</button>
            </div>
          </div>
          <Label>Channel notes</Label>
          {Object.entries(CHANNELS).map(([k, ch]) => (
            <div key={k} style={{ marginBottom: "6px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: C.textTertiary, marginBottom: "2px", display: "flex", alignItems: "center", gap: "4px" }}><ch.Icon size={11} /> {ch.name}</div>
              <input style={{ ...inputStyle, padding: "7px 10px", fontSize: "12px" }} value={voice.channelNotes?.[k] || ""} onChange={e => setVoice(v => ({ ...v, channelNotes: { ...v.channelNotes, [k]: e.target.value } }))} />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ─── WORKSPACE ───────────────────────────────────────────────────────────────

function Workspace({ config, setConfig, onReconfigure, onHome }) {
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [activeChannel, setActiveChannel] = useState("email");
  const [tldr, setTldr] = useState(null);
  const [isLoadingTldr, setIsLoadingTldr] = useState(false);
  const [impactAnalysis, setImpactAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddSignal, setShowAddSignal] = useState(false);
  const [signalForm, setSignalForm] = useState({ title: "", date: "", source: "", summary: "", impact: "medium", tags: [] });
  const [isLoadingSignals, setIsLoadingSignals] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [signalSort, setSignalSort] = useState("recent");
  const [copied, setCopied] = useState(false);
  const fetchedRef = useRef(false);
  const [pmmInsight, setPmmInsight] = useState("");
  const [editedContent, setEditedContent] = useState({});
  const [editMode, setEditMode] = useState({});

  const voice = config.voice;

  const togglePersona = (id) => { setSelectedPersonas(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]); };

  const guidelinesBlock = () => {
    if (!voice) return "";
    let s = "\n\nMESSAGING GUIDELINES:";
    if (voice.tone) s += `\nTone: ${voice.tone}`;
    if (voice.brandVoice) s += `\nBrand Voice: ${voice.brandVoice}`;
    if (voice.dos?.filter(Boolean).length) s += `\nDo's: ${voice.dos.filter(Boolean).join("; ")}`;
    if (voice.donts?.filter(Boolean).length) s += `\nDon'ts: ${voice.donts.filter(Boolean).join("; ")}`;
    return s;
  };

  const fetchSignals = async (isMore = false) => {
    if (isMore) setIsLoadingMore(true); else setIsLoadingSignals(true);
    const existingTitles = (config.signals || []).map(s => s.title);
    const avoidClause = existingTitles.length > 0 ? `\n\nDo NOT include articles with these titles:\n${existingTitles.slice(0, 15).join("\n")}` : "";
    const timeFrame = isMore ? "from the past 3-6 months" : "from the past few weeks";

    const result = await aiSearchJSON(`You are a policy intelligence analyst. Search the web for REAL, recent news related to:\n\nDOMAIN: "${config.theme}"\nPREFERRED SOURCES: ${config.sources.map(s => s.name).join(", ")}\nTIME FRAME: ${timeFrame}\n\nSearch for multiple relevant queries. Return ONLY a JSON array of 5 real articles:\n- "title": actual headline\n- "date": YYYY-MM-DD\n- "source": publication name\n- "url": actual URL\n- "summary": 2-3 sentences\n- "impact": "high"|"medium"|"low"\n- "tags": 2-4 keywords\n\nOnly real articles with real URLs.${avoidClause}\n\nReturn valid JSON array only.`, 2500);

    if (result && Array.isArray(result)) {
      const signals = result.filter(s => s.title && s.summary).map(s => ({ ...s, id: `s_${uid()}` }));
      setConfig(c => ({ ...c, signals: [...(c.signals || []), ...signals] }));
    }
    if (isMore) setIsLoadingMore(false); else setIsLoadingSignals(false);
  };

  useEffect(() => {
    if (!config.signals?.length && !isLoadingSignals && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchSignals();
    }
  }, []);

  const openSignal = async (signal) => {
    setSelectedSignal(signal); setSelectedPersonas([]); setImpactAnalysis(null); setGeneratedContent({}); setTldr(null);
    setEditedContent({}); setEditMode({}); setPmmInsight("");
    setIsLoadingTldr(true);
    const result = await aiStream(`Provide a concise TLDR analysis of this signal.\n\nSIGNAL: ${signal.title}\nDETAILS: ${signal.summary}\nDOMAIN: ${config.theme}\n\nFormat:\n## TLDR\nOne sentence.\n\n## Why It Matters\n2-3 sentences.\n\n## Key Details\n3-4 bullet points.\n\n## What to Watch\n1-2 things to monitor.`,
      (text) => { setTldr(text); });
    setIsLoadingTldr(false);
  };

  const analyzeImpact = async () => {
    if (!selectedSignal || selectedPersonas.length === 0) return;
    setIsAnalyzing(true); setImpactAnalysis(null);
    const personas = config.personas.filter(p => selectedPersonas.includes(p.id));
    const result = await aiStream(`You are a senior PMM strategist. Analyze this signal's impact on each persona.\n\nDOMAIN: ${config.theme}\nSIGNAL: ${selectedSignal.title}\nDETAILS: ${selectedSignal.summary}\n\nPERSONAS:\n${personas.map(p => `- ${p.name} (${p.title} at ${p.company})\n  Pain points: ${(p.painPoints || []).join("; ")}\n  Buying triggers: ${(p.buyingTriggers || []).join("; ")}\n  Sophistication: ${p.sophistication}\n  ${p.notes ? `Notes: ${p.notes}` : ""}`).join("\n\n")}\n${guidelinesBlock()}\n\nFor each persona:\n## [Persona Name]\n**Why this matters:** One sentence\n**Impact on decisions:** Specific\n**Urgency:** Act now / Plan ahead / Monitor\n**Key talking point:** One resonant message\n\nBe specific to THIS signal.`,
      (text) => { setImpactAnalysis(text); }, 1500);
    setIsAnalyzing(false);
  };

  const generateMessaging = async (channelId) => {
    if (!selectedSignal || selectedPersonas.length === 0) return;
    const key = `${selectedSignal.id}-${[...selectedPersonas].sort().join(",")}-${channelId}`;
    if (generatedContent[key] && !generatedContent[key].startsWith("\u26a0\ufe0f")) { setActiveChannel(channelId); return; }
    setActiveChannel(channelId); setIsGenerating(true);
    setGeneratedContent(prev => { const n = { ...prev }; delete n[key]; return n; });

    const ch = CHANNELS[channelId];
    const personas = config.personas.filter(p => selectedPersonas.includes(p.id));
    const guides = { email: "Ready-to-send email with subject line. Clear CTA. 150-250 words.", linkedin: "LinkedIn post, first person. Hook, insight, question. 100-180 words.", blog: "Blog outline: title, 4-5 sections, key points, CTA.", web: "Landing page: hero headline, subheadline, 3 value props, CTA." };
    const channelNotes = voice?.channelNotes?.[channelId] ? `\nCHANNEL NOTES: ${voice.channelNotes[channelId]}` : "";

    const insightBlock = pmmInsight.trim() ? `\n\nPMM'S ADDED CONTEXT (incorporate this — it's firsthand knowledge the AI wouldn't have):\n${pmmInsight.trim()}` : "";

    const result = await aiStream(`You are an expert B2B copywriter. Generate ${ch.name} content.\n\nDOMAIN: ${config.theme}\nSIGNAL: ${selectedSignal.title}\nDETAILS: ${selectedSignal.summary}\nTAGS: ${(selectedSignal.tags || []).join(", ")}\n\nPERSONAS:\n${personas.map(p => `- ${p.name} (${p.title} at ${p.company})\n  Pain points: ${(p.painPoints || []).join("; ")}\n  Sophistication: ${p.sophistication}`).join("\n\n")}\n\nCHANNEL: ${ch.name}\n${guides[channelId]}${channelNotes}\n${guidelinesBlock()}${insightBlock}\n\nWrite actual, specific copy. Not a template.`,
      (text) => { setGeneratedContent(prev => ({ ...prev, [key]: text })); }, 1200);
    if (!result) {
      setGeneratedContent(prev => ({ ...prev, [key]: "\u26a0\ufe0f Generation failed. Click the channel again to retry." }));
    }
    setIsGenerating(false);
  };

  const contentKey = selectedSignal ? `${selectedSignal.id}-${[...selectedPersonas].sort().join(",")}-${activeChannel}` : null;
  const rawContent = contentKey ? generatedContent[contentKey] : null;
  const currentContent = contentKey ? (editedContent[contentKey] ?? rawContent) : null;
  const hasBeenEdited = contentKey ? (editedContent[contentKey] !== undefined && editedContent[contentKey] !== rawContent) : false;

  const handleCopy = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const addSignalManual = () => {
    setConfig(c => ({ ...c, signals: [{ ...signalForm, id: `s_${uid()}`, tags: signalForm.tags || [] }, ...(c.signals || [])] }));
    setShowAddSignal(false);
    setSignalForm({ title: "", date: new Date().toISOString().slice(0, 10), source: "", summary: "", impact: "medium", tags: [] });
  };

  const sortedSignals = [...(config.signals || [])].sort((a, b) => {
    if (signalSort === "recent") return (b.date || "").localeCompare(a.date || "");
    const o = { high: 0, medium: 1, low: 2 };
    return (o[a.impact] ?? 2) - (o[b.impact] ?? 2);
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex" }}>

      {/* ─── Sidebar ──────────────────────────────────────────────────── */}
      <aside style={{ width: "380px", background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }}>
        {/* Sidebar header */}
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div onClick={onHome} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: onHome ? "pointer" : "default" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={13} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>Throughline</span>
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            <Btn onClick={onReconfigure} ghost small><Settings size={13} /></Btn>
            {onHome && <Btn onClick={onHome} ghost small><LayoutGrid size={13} /></Btn>}
          </div>
        </div>

        {/* Sort + actions */}
        <div style={{ padding: "12px 18px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "2px" }}>
            {[{ id: "recent", label: "Recent", Icon: Clock }, { id: "impact", label: "Impact", Icon: TrendingUp }].map(s => (
              <button key={s.id} onClick={() => setSignalSort(s.id)} style={{
                padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: 600, fontFamily: font,
                border: "none", background: signalSort === s.id ? C.accentLight : "transparent", color: signalSort === s.id ? C.accent : C.textTertiary,
                display: "flex", alignItems: "center", gap: "4px", transition: "all 0.12s"
              }}><s.Icon size={11} /> {s.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            <Btn onClick={() => fetchSignals(false)} ghost small disabled={isLoadingSignals}><RefreshCw size={12} /></Btn>
            <Btn onClick={() => setShowAddSignal(!showAddSignal)} ghost small>{showAddSignal ? <X size={12} /> : <Plus size={12} />}</Btn>
          </div>
        </div>

        {/* Add signal form */}
        {showAddSignal && (
          <div style={{ padding: "0 18px 12px" }}>
            <Card style={{ padding: "12px" }}>
              <input style={{ ...inputStyle, marginBottom: "6px", fontSize: "12px" }} value={signalForm.title} onChange={e => setSignalForm(f => ({ ...f, title: e.target.value }))} placeholder="Signal title..." />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginBottom: "6px" }}>
                <input type="date" style={{ ...inputStyle, fontSize: "11px", padding: "6px 8px" }} value={signalForm.date} onChange={e => setSignalForm(f => ({ ...f, date: e.target.value }))} />
                <input style={{ ...inputStyle, fontSize: "11px", padding: "6px 8px" }} value={signalForm.source} onChange={e => setSignalForm(f => ({ ...f, source: e.target.value }))} placeholder="Source" />
              </div>
              <textarea style={{ ...textareaStyle, minHeight: "40px", fontSize: "12px", marginBottom: "6px" }} value={signalForm.summary} onChange={e => setSignalForm(f => ({ ...f, summary: e.target.value }))} placeholder="Summary..." />
              <Btn onClick={addSignalManual} primary small full disabled={!signalForm.title.trim()}>Add signal</Btn>
            </Card>
          </div>
        )}

        {/* Signal list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 18px" }}>
          {isLoadingSignals && !config.signals?.length && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "36px 0", justifyContent: "center", color: C.textSecondary, fontSize: "13px" }}><Spinner /> Searching for signals...</div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {sortedSignals.map(signal => (
              <div
                key={signal.id}
                onClick={() => openSignal(signal)}
                style={{
                  padding: "12px 14px", borderRadius: "8px", cursor: "pointer", transition: "all 0.1s",
                  background: selectedSignal?.id === signal.id ? C.accentLight : "transparent",
                  border: selectedSignal?.id === signal.id ? `1px solid ${C.accentMuted}` : "1px solid transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", color: C.textTertiary, fontWeight: 500 }}>{signal.date}</span>
                  <ImpactDot level={signal.impact} withLabel />
                </div>
                <div style={{ fontWeight: 600, fontSize: "12.5px", lineHeight: 1.4, marginBottom: "3px", color: C.text }}>{signal.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: C.textTertiary }}>{signal.source}</span>
                  {signal.url && (
                    <a href={signal.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: C.textTertiary, display: "flex" }}>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sortedSignals.length > 0 && !isLoadingSignals && (
            <button onClick={() => fetchSignals(true)} disabled={isLoadingMore} style={{
              width: "100%", padding: "12px", borderRadius: "8px", cursor: isLoadingMore ? "default" : "pointer",
              border: `1px dashed ${C.border}`, background: "transparent", color: C.textSecondary,
              fontSize: "12px", fontWeight: 500, fontFamily: font, marginTop: "8px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
            }}>
              {isLoadingMore ? <><Spinner size={12} /> Searching...</> : <>Find more signals <ArrowRight size={12} /></>}
            </button>
          )}
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <main style={{ flex: 1, minHeight: "100vh" }}>
        {!selectedSignal ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "40px" }}>
            <div style={{ textAlign: "center", maxWidth: "380px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Radio size={22} color={C.accent} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px", color: C.text }}>Select a signal</h2>
              <p style={{ color: C.textSecondary, fontSize: "13.5px", margin: 0, lineHeight: 1.5 }}>
                Choose a signal from the feed to see a summary, map impact to your personas, and generate channel-ready messaging.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: "780px", margin: "0 auto", padding: "28px 32px" }}>

            {/* TLDR */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: C.textTertiary, fontWeight: 500 }}>{selectedSignal.date}</span>
                    <span style={{ color: C.border }}>·</span>
                    <span style={{ fontSize: "11px", color: C.textTertiary, fontWeight: 500 }}>{selectedSignal.source}</span>
                    <ImpactDot level={selectedSignal.impact} />
                  </div>
                  <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0, lineHeight: 1.35, color: C.text, letterSpacing: "-0.02em" }}>{selectedSignal.title}</h1>
                </div>
                {selectedSignal.url && (
                  <a href={selectedSignal.url} target="_blank" rel="noopener noreferrer" style={{
                    padding: "6px 12px", borderRadius: "7px", border: `1px solid ${C.border}`,
                    color: C.textSecondary, fontSize: "12px", fontWeight: 500, textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: "5px", marginLeft: "16px", flexShrink: 0, whiteSpace: "nowrap"
                  }}>
                    Read source <ExternalLink size={11} />
                  </a>
                )}
              </div>

              <Card style={{ padding: "20px" }}>
                {isLoadingTldr ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "20px 0", justifyContent: "center", color: C.textSecondary, fontSize: "13px" }}><Spinner /> Generating summary...</div>
                ) : tldr ? <RenderedMarkdown text={tldr} /> : null}
              </Card>
            </div>

            {/* Personas */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: C.text }}>Who does this impact?</div>
                  <div style={{ fontSize: "12px", color: C.textSecondary, marginTop: "2px" }}>Select personas to analyze</div>
                </div>
                {selectedPersonas.length > 0 && (
                  <Btn onClick={analyzeImpact} primary small disabled={isAnalyzing}>
                    {isAnalyzing ? <><Spinner size={12} /> Analyzing...</> : <>Analyze impact <ArrowRight size={13} /></>}
                  </Btn>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "6px" }}>
                {(config.personas || []).map(p => (
                  <div key={p.id} onClick={e => { e.stopPropagation(); togglePersona(p.id); }} style={{
                    padding: "10px 12px", borderRadius: "8px", cursor: "pointer", transition: "all 0.12s",
                    border: selectedPersonas.includes(p.id) ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`,
                    background: selectedPersonas.includes(p.id) ? C.accentLight : C.surface,
                    display: "flex", alignItems: "center", gap: "10px"
                  }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "7px", background: selectedPersonas.includes(p.id) ? C.accent : C.borderLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Target size={14} color={selectedPersonas.includes(p.id) ? "#fff" : C.textTertiary} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "12.5px", color: C.text }}>{p.name}</div>
                      <div style={{ fontSize: "11px", color: C.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                    </div>
                    {selectedPersonas.includes(p.id) && <Check size={14} color={C.accent} strokeWidth={3} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Analysis */}
            {(isAnalyzing || impactAnalysis) && (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>Impact Analysis</div>
                <Card style={{ padding: "20px" }}>
                  {isAnalyzing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "20px 0", justifyContent: "center", color: C.textSecondary, fontSize: "13px" }}><Spinner /> Mapping impact...</div>
                  ) : impactAnalysis ? <RenderedMarkdown text={impactAnalysis} /> : null}
                </Card>
              </div>
            )}

            {/* Channel Messaging */}
            {impactAnalysis && !isAnalyzing && (
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>Channel Messaging</div>

                {/* PMM Insight Field */}
                <Card style={{ padding: "16px", marginBottom: "12px", background: C.bg, border: `1px dashed ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <PenLine size={13} color={C.accent} />
                    <span style={{ fontSize: "12px", fontWeight: 700, color: C.text }}>What do you know that the AI doesn't?</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: C.textSecondary, marginBottom: "8px", lineHeight: 1.4 }}>
                    Recent customer conversation, internal data, competitive intel, specific positioning angle — anything that makes this better.
                  </div>
                  <textarea
                    style={{ ...textareaStyle, minHeight: "56px", fontSize: "12.5px", background: C.surface }}
                    value={pmmInsight}
                    onChange={e => setPmmInsight(e.target.value)}
                    placeholder='e.g. "Our largest customer just asked about this — they need to act before Q3 compliance deadline..."'
                  />
                </Card>

                {/* Channel Tabs */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
                  {Object.values(CHANNELS).map(ch => (
                    <button key={ch.id} onClick={() => generateMessaging(ch.id)} style={{
                      padding: "6px 14px", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: font,
                      border: activeChannel === ch.id ? `1px solid ${C.accent}` : `1px solid ${C.border}`,
                      background: activeChannel === ch.id ? C.accentLight : C.surface,
                      color: activeChannel === ch.id ? C.accent : C.textSecondary,
                      display: "flex", alignItems: "center", gap: "5px", transition: "all 0.12s"
                    }}><ch.Icon size={13} /> {ch.name}</button>
                  ))}
                </div>

                {/* Output */}
                <Card style={{ padding: "0", minHeight: "120px", overflow: "hidden" }}>
                  {/* Banner */}
                  {rawContent && !rawContent.startsWith("\u26a0\ufe0f") && (
                    <div style={{
                      padding: "10px 20px", background: "#fefce8", borderBottom: `1px solid #fef08a`,
                      display: "flex", alignItems: "center", justifyContent: "space-between"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <AlertTriangle size={13} color="#d97706" />
                        <span style={{ fontSize: "12px", color: "#92400e", fontWeight: 600 }}>
                          This is a first draft. You're the final draft. Make it yours.
                        </span>
                      </div>
                      {hasBeenEdited && (
                        <span style={{ fontSize: "10px", fontWeight: 600, color: C.accent, background: C.accentLight, padding: "2px 8px", borderRadius: "10px" }}>Edited</span>
                      )}
                    </div>
                  )}

                  <div style={{ padding: "20px" }}>
                    {isGenerating ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "30px 0", justifyContent: "center", color: C.textSecondary, fontSize: "13px" }}><Spinner /> Generating {CHANNELS[activeChannel].name}...</div>
                    ) : currentContent ? (
                      currentContent.startsWith("\u26a0\ufe0f") ? (
                        <div style={{ textAlign: "center", padding: "30px" }}>
                          <div style={{ fontSize: "13px", color: C.high, marginBottom: "10px" }}>{currentContent}</div>
                          <Btn onClick={() => generateMessaging(activeChannel)} small primary>Retry</Btn>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <Btn onClick={() => setEditMode(prev => ({ ...prev, [contentKey]: !prev[contentKey] }))} ghost small style={{ color: editMode[contentKey] ? C.accent : C.textSecondary }}>
                                <PenLine size={12} /> {editMode[contentKey] ? "Preview" : "Edit"}
                              </Btn>
                              {hasBeenEdited && (
                                <Btn onClick={() => setEditedContent(prev => { const n = { ...prev }; delete n[contentKey]; return n; })} ghost small style={{ color: C.textTertiary }}>
                                  Reset to AI draft
                                </Btn>
                              )}
                            </div>
                            <Btn onClick={() => handleCopy(currentContent)} ghost small>
                              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                            </Btn>
                          </div>

                          {editMode[contentKey] ? (
                            <textarea
                              value={currentContent}
                              onChange={e => setEditedContent(prev => ({ ...prev, [contentKey]: e.target.value }))}
                              style={{
                                width: "100%", minHeight: "280px", padding: "16px", borderRadius: "8px",
                                border: `1.5px solid ${C.accent}`, fontSize: "13px", fontFamily: "monospace",
                                lineHeight: 1.7, color: C.text, background: C.bg, resize: "vertical",
                                boxSizing: "border-box", outline: "none"
                              }}
                            />
                          ) : (
                            <div style={{ padding: "16px", borderRadius: "8px", background: C.bg, border: `1px solid ${C.border}` }}>
                              <RenderedMarkdown text={currentContent} />
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <div style={{ textAlign: "center", padding: "30px", color: C.textTertiary, fontSize: "13px" }}>Select a channel to generate messaging</div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── LANDING PAGE ────────────────────────────────────────────────────────────

function LandingPage({ onDemo, onStart }) {
  const features = [
    { Icon: Radio, title: "Find the right sources", desc: "Tell Throughline what you care about and it suggests the best news sources to watch — or add your own." },
    { Icon: Users, title: "Know your audience", desc: "Build out the personas you sell to, including what keeps them up at night and what makes them act." },
    { Icon: Target, title: "See who's affected", desc: "When news breaks, instantly see which of your customers are impacted and how urgent it is for each." },
    { Icon: MessageSquare, title: "Write the message", desc: "Get draft copy for email, LinkedIn, blog, or web — shaped by your brand voice and tailored to each persona." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{ padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: C.text }}>Throughline</span>
        </div>
        <Btn onClick={onStart} ghost small>Start from scratch <ArrowRight size={12} /></Btn>
      </nav>

      <div style={{ flex: 1 }}>
      {/* Hero */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "72px 24px 48px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "20px", background: C.accentLight, color: C.accent, fontSize: "12px", fontWeight: 600, marginBottom: "20px" }}>
          <Sparkles size={13} /> PMM Intelligence Engine
        </div>
        <h1 style={{ fontSize: "38px", fontWeight: 800, color: C.text, lineHeight: 1.2, margin: "0 0 16px", letterSpacing: "-0.03em" }}>
          From policy signal to<br />customer messaging in minutes
        </h1>
        <p style={{ fontSize: "16px", color: C.textSecondary, lineHeight: 1.6, margin: "0 0 32px", maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
          Throughline monitors policy and market signals, maps them to your customer personas, and generates channel-ready messaging — guided by your brand voice.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Btn onClick={onDemo} primary style={{ padding: "12px 28px", fontSize: "14px" }}>
            <Eye size={15} /> See the demo
          </Btn>
          <Btn onClick={onStart} style={{ padding: "12px 28px", fontSize: "14px" }}>
            Configure your own <ArrowRight size={14} />
          </Btn>
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ display: "flex", gap: "2px", alignItems: "stretch" }}>
          {["Find the best news sources", "Choose your audience", "Analyze impact per persona", "Generate tailored messaging"].map((step, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "20px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: i === 0 ? "10px 0 0 10px" : i === 3 ? "0 10px 10px 0" : "0", borderLeft: i > 0 ? "none" : undefined }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: C.accentLight, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, margin: "0 auto 8px" }}>{i + 1}</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {features.map((f, i) => (
            <Card key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <f.Icon size={16} color={C.accent} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "3px", color: C.text }}>{f.title}</div>
                <div style={{ fontSize: "12.5px", color: C.textSecondary, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "32px 24px", borderTop: `1px solid ${C.border}`, background: C.surface, marginTop: "auto" }}>
        <span style={{ fontSize: "12px", color: C.textTertiary }}>Throughline — built by <a href="https://www.linkedin.com/in/jaredhutchinson" target="_blank" rel="noopener noreferrer" style={{ color: C.textSecondary, textDecoration: "none", fontWeight: 600 }}>Jared Hutchinson</a> · PMM Intelligence Prototype</span>
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────

export default function ThroughlineApp() {
  const [appState, setAppState] = useState(null); // null=loading, "landing", "wizard", "workspace"
  const [wizardStep, setWizardStep] = useState(0);
  const [theme, setTheme] = useState("");
  const [sources, setSources] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [voice, setVoice] = useState({});
  const [sugSources, setSugSources] = useState([]);
  const [sugPersonas, setSugPersonas] = useState([]);
  const [loadSrc, setLoadSrc] = useState(false);
  const [loadPer, setLoadPer] = useState(false);
  const [workspaceConfig, setWorkspaceConfig] = useState(null);

  useEffect(() => {
    const s = loadState();
    if (s?.workspace) { setWorkspaceConfig(s.workspace); setAppState("workspace"); }
    else setAppState("landing");
  }, []);

  useEffect(() => { if (workspaceConfig) persistState({ workspace: workspaceConfig }); }, [workspaceConfig]);

  const [isDemo, setIsDemo] = useState(false);

  const launchDemo = () => {
    setTheme(DEMO_CONFIG.theme);
    setSources(DEMO_CONFIG.sources);
    setPersonas(DEMO_CONFIG.personas);
    setVoice(DEMO_CONFIG.voice);
    setSugSources([]);
    setSugPersonas([]);
    setIsDemo(true);
    setWizardStep(0);
    setAppState("wizard");
  };

  const startFresh = () => {
    setTheme(""); setSources([]); setPersonas([]); setVoice({});
    setSugSources([]); setSugPersonas([]);
    setIsDemo(false);
    setWizardStep(0); setAppState("wizard");
  };

  const finish = () => {
    const c = { theme, sources, personas, voice, signals: isDemo ? DEMO_CONFIG.signals : [] };
    setWorkspaceConfig(c); setAppState("workspace"); setIsDemo(false);
  };

  const reconfig = () => {
    if (workspaceConfig) {
      setTheme(workspaceConfig.theme || ""); setSources(workspaceConfig.sources || []);
      setPersonas(workspaceConfig.personas || []); setVoice(workspaceConfig.voice || {});
      setSugSources([]); setSugPersonas([]);
    }
    setWizardStep(0); setAppState("wizard");
  };

  const resetToLanding = () => {
    setWorkspaceConfig(null); persistState({});
    setAppState("landing");
  };

  if (!appState) return <div style={{ fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><Spinner /></div>;

  if (appState === "landing") return <LandingPage onDemo={launchDemo} onStart={startFresh} />;

  if (appState === "workspace" && workspaceConfig) return <Workspace config={workspaceConfig} setConfig={setWorkspaceConfig} onReconfigure={reconfig} onHome={resetToLanding} />;

  const steps = [
    { content: <StepTheme value={theme} onChange={setTheme} />, nextDisabled: !theme.trim(), nextLabel: "Sources" },
    { content: <StepSources sources={sources} setSources={setSources} theme={theme} suggestedSources={sugSources} setSuggestedSources={setSugSources} isLoading={loadSrc} setIsLoading={setLoadSrc} />, nextDisabled: sources.length === 0, nextLabel: "Personas" },
    { content: <StepPersonas personas={personas} setPersonas={setPersonas} theme={theme} suggestedPersonas={sugPersonas} setSuggestedPersonas={setSugPersonas} isLoading={loadPer} setIsLoading={setLoadPer} />, nextDisabled: personas.length === 0, nextLabel: "Voice" },
    { content: <StepVoice voice={voice} setVoice={setVoice} />, nextDisabled: !voice.tone, nextLabel: "Launch" }
  ];

  return (
    <WizardShell step={wizardStep} totalSteps={steps.length} nextDisabled={steps[wizardStep].nextDisabled} nextLabel={steps[wizardStep].nextLabel} onBack={wizardStep > 0 ? () => setWizardStep(wizardStep - 1) : undefined} onNext={() => { if (wizardStep < steps.length - 1) setWizardStep(wizardStep + 1); else finish(); }} onHome={resetToLanding}>
      {steps[wizardStep].content}
    </WizardShell>
  );
}
