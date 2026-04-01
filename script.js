import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are a script writer for a short-form video creator named Privu. He is a 19-year-old Bangladeshi youth creator making reels and short videos about agriculture, environment, green technology, and climate — targeting a young international audience.

His style rules (NON-NEGOTIABLE):
- Conversational, like explaining to a friend face-to-face. Never academic, never stiff.
- Use day-to-day life analogies to explain complex things. Real, relatable examples.
- Light sarcasm and humor — not forced jokes, just a natural wit woven in.
- Hook in the FIRST line. Must make someone stop scrolling.
- No jargon without immediate explanation.
- Short punchy sentences. No long paragraphs.
- End with something that makes the viewer think or feel something — not a generic "like and subscribe."
- Voice is young, curious, slightly irreverent. Not a professor. Not an NGO brochure.
- English only.

Script format:
- Start with [HOOK] — the first 3-5 seconds, make it impossible to scroll past
- Then [BODY] — the explanation broken into short beats
- End with [OUTRO] — a thought, a challenge, a provocation. Not a CTA.
- Add (pause), (cut), (show footage of X) as production notes in brackets where relevant
- Estimate the read-aloud duration at the end

Write ONLY the script. No preamble, no "here is your script", no explanation. Just the script.`;

const DURATIONS = [
  { value: "30", label: "30s" },
  { value: "60", label: "60s" },
  { value: "90", label: "90s" },
  { value: "120", label: "2 min" },
  { value: "180", label: "3 min" },
];

export default function ScriptAgent() {
  const [topic, setTopic] = useState("");
  const [research, setResearch] = useState("");
  const [duration, setDuration] = useState("60");
  const [extra, setExtra] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(0);
  const scriptRef = useRef(null);

  useEffect(() => {
    if (script && scriptRef.current) {
      setTimeout(() => scriptRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [script]);

  const generate = async () => {
    if (!topic.trim()) { setError("Topic is required."); return; }
    setError(""); setScript(""); setLoading(true);
    const userPrompt = `Topic: ${topic}\n\n${research.trim() ? `Research / Notes:\n${research}\n\n` : ""}Duration target: ~${duration} seconds\n\n${extra.trim() ? `Extra instructions: ${extra}` : ""}\n\nWrite the script now.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      if (!text) throw new Error("Empty");
      setScript(text);
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "linear-gradient(145deg, #0a1a4a 0%, #0d2a6e 35%, #0a4a6e 65%, #0a7a7a 100%)", padding: "2.5rem 1.25rem", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Syne:wght@700&display=swap');

        .sa-wrap { max-width: 620px; margin: 0 auto; position: relative; z-index: 2; }

        .orb1 { position: absolute; width: 340px; height: 340px; border-radius: 50%; background: radial-gradient(circle, rgba(0,180,255,0.18) 0%, transparent 70%); top: -60px; right: -80px; pointer-events: none; }
        .orb2 { position: absolute; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(0,220,200,0.12) 0%, transparent 70%); bottom: 80px; left: -60px; pointer-events: none; }

        .glass-card { background: rgba(255,255,255,0.07); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.13); border-radius: 20px; padding: 1.5rem; }

        .glass-input { width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.07) !important; border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 12px !important; color: #fff !important; font-size: 15px !important; font-family: 'DM Sans', sans-serif !important; transition: border-color 0.2s, box-shadow 0.2s; }
        .glass-input::placeholder { color: rgba(255,255,255,0.35) !important; }
        .glass-input:focus { outline: none !important; border-color: rgba(0,200,180,0.5) !important; box-shadow: 0 0 0 3px rgba(0,200,180,0.1) !important; }

        .glass-textarea { width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.07) !important; border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 12px !important; color: #fff !important; font-size: 14px !important; font-family: 'DM Sans', sans-serif !important; min-height: 100px; resize: vertical; line-height: 1.7; transition: border-color 0.2s, box-shadow 0.2s; }
        .glass-textarea::placeholder { color: rgba(255,255,255,0.35) !important; }
        .glass-textarea:focus { outline: none !important; border-color: rgba(0,200,180,0.5) !important; box-shadow: 0 0 0 3px rgba(0,200,180,0.1) !important; }

        .dur-pill { cursor: pointer; padding: 7px 14px; border-radius: 99px; font-size: 13px; font-weight: 500; transition: all 0.15s; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); user-select: none; }
        .dur-pill:hover { border-color: rgba(0,200,180,0.4); color: rgba(255,255,255,0.85); }
        .dur-pill.active { background: rgba(0,200,180,0.18); border-color: rgba(0,200,180,0.55); color: #00e8d0; }

        .gen-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; background: linear-gradient(135deg, #00c8b0, #00a896); border: none; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: transform 0.12s, box-shadow 0.12s, opacity 0.12s; letter-spacing: 0.01em; }
        .gen-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,200,180,0.35); }
        .gen-btn:active:not(:disabled) { transform: scale(0.98); }
        .gen-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .copy-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 500; padding: 5px 14px; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
        .copy-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .copy-btn.ok { color: #00e8d0; border-color: rgba(0,232,208,0.4); }

        .lbl { font-size: 11px; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; color: rgba(255,255,255,0.45); display: block; margin-bottom: 8px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .anim-in { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff; border-radius: 50%; animation: spin 0.65s linear infinite; flex-shrink: 0; }

        .section-gap { display: flex; flex-direction: column; gap: 1.25rem; }
        .opt-badge { font-size: 11px; color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 99px; }
      `}</style>

      <div className="orb1" />
      <div className="orb2" />

      <div className="sa-wrap">

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(0,200,180,0.15)", border: "1px solid rgba(0,200,180,0.25)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 17C3 17 6 10 11 8C16 6 18 3 18 3C18 3 16 9 10 11.5C7 13 3 17 3 17Z" fill="#00e8d0" opacity="0.9"/>
              <path d="M3 17C5.5 13.5 8 11.5 10 11.5" stroke="#00c8b0" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, margin: "0 0 6px", color: "#fff", letterSpacing: "-0.4px" }}>Script Agent</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>Built for Privu's voice. Nobody else's.</p>
        </div>

        {/* Main card */}
        <div className="glass-card section-gap">

          {/* Topic */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="lbl" style={{ margin: 0 }}>Topic <span style={{ color: "#ff6b6b" }}>*</span></span>
            </div>
            <input
              className="glass-input"
              type="text"
              value={topic}
              onChange={e => { setTopic(e.target.value); setError(""); }}
              placeholder="e.g. How natural gas is formed underground"
            />
            {error && <p style={{ fontSize: 12, color: "#ff6b6b", margin: "6px 0 0" }}>{error}</p>}
          </div>

          {/* Research */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="lbl" style={{ margin: 0 }}>Research & notes</span>
              <span className="opt-badge">optional</span>
            </div>
            <textarea
              className="glass-textarea"
              value={research}
              onChange={e => setResearch(e.target.value)}
              placeholder="Paste facts, stats, your own notes. More input = better script."
            />
          </div>

          {/* Duration */}
          <div>
            <span className="lbl">Duration</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DURATIONS.map(d => (
                <div key={d.value} className={`dur-pill${duration === d.value ? " active" : ""}`} onClick={() => setDuration(d.value)}>
                  {d.label}
                </div>
              ))}
            </div>
          </div>

          {/* Extra */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="lbl" style={{ margin: 0 }}>Extra instructions</span>
              <span className="opt-badge">optional</span>
            </div>
            <input
              className="glass-input"
              type="text"
              value={extra}
              onChange={e => setExtra(e.target.value)}
              placeholder="e.g. end with a Bangladesh angle, more sarcastic"
            />
          </div>

          {/* Button */}
          <div style={{ paddingTop: 4 }}>
            <button className="gen-btn" onClick={generate} disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Writing your script..." : "Generate script"}
            </button>
          </div>
        </div>

        {/* Output */}
        {script && (
          <div ref={scriptRef} className="anim-in" style={{ marginTop: "1.5rem" }}>
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.1px" }}>Your script</span>
                <button className={`copy-btn${copied ? " ok" : ""}`} onClick={copy}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div style={{ height: "0.5px", background: "rgba(255,255,255,0.1)", marginBottom: "1.25rem" }} />
              <pre style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.9, whiteSpace: "pre-wrap", color: "rgba(255,255,255,0.88)" }}>{script}</pre>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: "1rem 0 0", textAlign: "right", fontStyle: "italic" }}>Review it. Make it yours. Then record.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
