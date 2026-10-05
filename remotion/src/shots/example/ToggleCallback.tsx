import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, Img, staticFile } from 'remotion';
import { Mic, Plus, Slash, Zap, ArrowUp } from 'lucide-react';
import { EASINGS } from '../../brand';
import { FONT_SERIF } from '../../fonts';
import { VSCodeShell, Sunburst, V, VSC, CLAMP } from '../../lib/kit';

// =============================================================================
// #2 — quick zoomed callback to the Free Image Generator toggle, right before
// the 3-levels overview. Cue: "…understand how to enable image generation in
// Claude Code…" (58.5–60.7). Just the flip, hard cut out. ~2.4s.
// =============================================================================
export const compositionConfig = { id: 'ToggleCallback', durationInSeconds: 2.4, fps: 30, width: 1920, height: 1080 };

const { ED_X, ED_W, ED_CX } = VSC;
const IW = 1180, IL = ED_CX - IW / 2;
const FLIP = [18, 32] as const;

const Toggle: React.FC<{ progress: number; onColor: string }> = ({ progress, onColor }) => {
  const knobX = interpolate(progress, [0, 1], [3, 27], CLAMP);
  return (
    <div style={{ width: 56, height: 32, borderRadius: 999, background: progress > 0.5 ? onColor : '#3a3a3a', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 3, left: knobX, width: 26, height: 26, borderRadius: '50%', background: '#fff' }} />
    </div>
  );
};

const ToggleCallback: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, e = EASINGS.easeOut) => interpolate(frame, [a, b], [from, to], { ...CLAMP, easing: e });

  const flip = r(FLIP[0], FLIP[1]);
  // hard cut in, slight push for life (keeps the whole menu + dock in frame)
  const zoom = r(0, 70, 1.26, 1.32, EASINGS.easeInOut);
  const glow = Math.min(r(FLIP[1], FLIP[1] + 8), 1 - r(FLIP[1] + 26, FLIP[1] + 40));

  const rows = [
    { label: 'Switch model…', right: 'Opus' as string | null, toggle: null as number | null, color: '', hi: false },
    { label: 'Thinking', right: null, toggle: 1, color: V.blue, hi: false },
    { label: 'Free Image Generator', right: null, toggle: flip, color: V.coral, hi: true },
    { label: 'Web search', right: null, toggle: 0, color: V.blue, hi: false },
  ];

  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: '1200px 640px' }}>
      <VSCodeShell>
        {/* wordmark + dimmed empty state behind the menu */}
        <div style={{ position: 'absolute', top: 132, left: ED_X, width: ED_W, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <Sunburst size={26} color={V.coral} /><span style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 36, color: V.coral }}>Claude Code</span>
        </div>
        <div style={{ position: 'absolute', top: 340, left: ED_X, width: ED_W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, opacity: 0.4 }}>
          <Img src={staticFile('library/logos/claude-code-bot.png')} style={{ width: 104, height: 104 }} />
          <span style={{ fontSize: 25, color: V.dim, textAlign: 'center' }}>Turn on the <span style={{ color: V.coral }}>Free Image Generator</span> to make images<br />right here — no AI model needed.</span>
        </div>

        {/* /model menu, already open (this is a callback, not the full sequence) */}
        <div style={{ position: 'absolute', bottom: 262, left: IL, width: IW }}>
          <div style={{ background: '#232323', border: `1px solid ${V.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.55)', paddingBottom: 12 }}>
            <div style={{ padding: '14px 22px 8px', color: V.faint, fontSize: 18, letterSpacing: 0.4 }}>Model &amp; tools</div>
            {rows.map((row) => (
              <div key={row.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px',
                background: row.hi ? '#2c2723' : 'transparent',
                borderLeft: row.hi ? `3px solid ${V.coral}` : '3px solid transparent',
                boxShadow: row.hi && glow > 0 ? `inset 0 0 0 2px rgba(205,128,100,${0.55 * glow})` : 'none',
              }}>
                <span style={{ color: V.text, fontSize: 25 }}>{row.label}</span>
                {row.right && <span style={{ color: V.dim, fontSize: 23 }}>{row.right}</span>}
                {row.toggle !== null && <Toggle progress={row.toggle} onColor={row.color} />}
              </div>
            ))}
          </div>
        </div>

        {/* input dock */}
        <div style={{ position: 'absolute', bottom: 86, left: IL, width: IW }}>
          <div style={{ background: V.input, border: `1px solid ${V.coral}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', minHeight: 30 }}>
              <span style={{ flex: 1, color: V.faint, fontSize: 26 }}>ctrl esc to focus or unfocus Claude</span>
              <Mic size={24} color={V.dim} strokeWidth={2} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Plus size={26} color={V.dim} strokeWidth={2} />
                <div style={{ width: 36, height: 30, borderRadius: 8, border: `1px solid ${V.inputBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Slash size={18} color={V.coral} strokeWidth={2} /></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <Zap size={20} color={V.dim} strokeWidth={2} /><span style={{ color: V.dim, fontSize: 24 }}>Auto mode</span>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: V.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUp size={24} color="#fff" strokeWidth={2.4} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </VSCodeShell>
    </AbsoluteFill>
  );
};

export default ToggleCallback;
