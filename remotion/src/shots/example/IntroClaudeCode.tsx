import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, Img, staticFile } from 'remotion';
import { Mic, Plus, Slash, Zap, ArrowUp, Square, Check } from 'lucide-react';
import { EASINGS } from '../../brand';
import { FONT_SERIF, FONT_MONO } from '../../fonts';
import { VSCodeShell, Sunburst, V, VSC, CLAMP } from '../../lib/kit';

// =============================================================================
// COMPOSITION CONFIG — VS Code window, pushing in on the Claude Code chat.
// open -> /model menu -> enable "Free Image Generator" -> type prompt -> reveal
// =============================================================================
export const compositionConfig = { id: 'IntroClaudeCode', durationInSeconds: 8.2, fps: 30, width: 1920, height: 1080 };

const { ED_X, ED_W, ED_CX } = VSC;
// narrow centered column so the zoomed frame keeps the menu toggles + dock in view
const IW = 1180, IL = ED_CX - IW / 2;
const PROMPT = 'a cute cat astronaut floating in space';
const T = { fade: [0, 16], zoom: [18, 60], menuIn: [34, 48], flip: [66, 82], menuOut: [94, 106] } as const;
const TYPE = [112, 112 + PROMPT.length * 1.05] as const;
const SEND = TYPE[1] + 8;
const IMG_IN = SEND + 34;

const Toggle: React.FC<{ progress: number; onColor: string }> = ({ progress, onColor }) => {
  const knobX = interpolate(progress, [0, 1], [3, 27], CLAMP);
  return (
    <div style={{ width: 56, height: 32, borderRadius: 999, background: progress > 0.5 ? onColor : '#3a3a3a', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 3, left: knobX, width: 26, height: 26, borderRadius: '50%', background: '#fff' }} />
    </div>
  );
};

const IntroClaudeCode: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, e = EASINGS.easeOut) => interpolate(frame, [a, b], [from, to], { ...CLAMP, easing: e });

  const appear = r(T.fade[0], T.fade[1]);
  const zoom = r(T.zoom[0], T.zoom[1], 1, 1.16, EASINGS.easeInOut);
  const menuOp = Math.min(r(T.menuIn[0], T.menuIn[1]), 1 - r(T.menuOut[0], T.menuOut[1]));
  const menuScale = interpolate(menuOp, [0, 1], [0.96, 1]);
  const flip = r(T.flip[0], T.flip[1]);

  const typedCount = Math.floor(r(TYPE[0], TYPE[1], 0, PROMPT.length, EASINGS.easeInOut));
  const typed = PROMPT.slice(0, typedCount);
  const sent = frame >= SEND;
  const cursorOn = Math.floor(frame / 15) % 2 === 0 && !sent;

  const emptyOp = Math.min(1 - r(SEND - 2, SEND + 10), 1 - r(T.menuIn[0], T.menuIn[1]) * 0.55);
  const chatOp = r(SEND, SEND + 12);
  const thinkOp = Math.min(r(SEND + 6, SEND + 16), 1 - r(IMG_IN - 6, IMG_IN + 4));
  const imgOp = r(IMG_IN, IMG_IN + 16);
  const imgScale = r(IMG_IN, IMG_IN + 20, 0.94, 1);

  const rows = [
    { label: 'Switch model…', right: 'Opus' as string | null, toggle: null as number | null, color: '', hi: false },
    { label: 'Thinking', right: null, toggle: 1, color: V.blue, hi: false },
    { label: 'Free Image Generator', right: null, toggle: flip, color: V.coral, hi: true },
    { label: 'Web search', right: null, toggle: 0, color: V.blue, hi: false },
  ];

  return (
    <AbsoluteFill style={{ opacity: appear, transform: `scale(${zoom})`, transformOrigin: '1173px 545px' }}>
      <VSCodeShell>
        {/* wordmark */}
        <div style={{ position: 'absolute', top: 132, left: ED_X, width: ED_W, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <Sunburst size={26} color={V.coral} /><span style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 36, color: V.coral }}>Claude Code</span>
        </div>

        {/* empty state */}
        <div style={{ position: 'absolute', top: 340, left: ED_X, width: ED_W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, opacity: emptyOp }}>
          <Img src={staticFile('library/logos/claude-code-bot.png')} style={{ width: 104, height: 104 }} />
          <span style={{ fontSize: 25, color: V.dim, textAlign: 'center' }}>Turn on the <span style={{ color: V.coral }}>Free Image Generator</span> to make images<br />right here — no AI model needed.</span>
        </div>

        {/* chat (after send) */}
        <div style={{ position: 'absolute', top: 190, left: IL, width: IW, opacity: chatOp }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 26 }}>
            <div style={{ background: V.input, border: `1px solid ${V.inputBorder}`, borderRadius: 12, padding: '15px 22px', color: V.text, fontFamily: FONT_MONO, fontSize: 25 }}>{PROMPT}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: thinkOp, marginBottom: 20 }}>
            <div style={{ transform: `rotate(${(frame * 9) % 360}deg)`, display: 'flex' }}><Sunburst size={24} color={V.coral} /></div>
            <span style={{ color: V.text, fontSize: 26, fontWeight: 600 }}>Generating image…</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: imgOp, transform: `scale(${imgScale})`, transformOrigin: 'left top' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Check size={20} color={V.coral} strokeWidth={3} />
              <span style={{ color: V.dim, fontSize: 22 }}>Generated with the Free Image Generator</span>
            </div>
            <Img src={staticFile('projects/example/cat-astronaut.png')} style={{ width: 680, borderRadius: 12, border: `1px solid ${V.border}` }} />
          </div>
        </div>

        {/* /model menu (popover above the dock) */}
        {menuOp > 0.01 && (
          <div style={{ position: 'absolute', bottom: 262, left: IL, width: IW, transform: `scale(${menuScale})`, transformOrigin: 'bottom center', opacity: menuOp }}>
            <div style={{ background: '#232323', border: `1px solid ${V.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.55)', paddingBottom: 12 }}>
              <div style={{ padding: '14px 22px 8px', color: V.faint, fontSize: 18, letterSpacing: 0.4 }}>Model &amp; tools</div>
              {rows.map((row) => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', background: row.hi ? '#2c2723' : 'transparent', borderLeft: row.hi ? `3px solid ${V.coral}` : '3px solid transparent' }}>
                  <span style={{ color: V.text, fontSize: 25 }}>{row.label}</span>
                  {row.right && <span style={{ color: V.dim, fontSize: 23 }}>{row.right}</span>}
                  {row.toggle !== null && <Toggle progress={row.toggle} onColor={row.color} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* input dock */}
        <div style={{ position: 'absolute', bottom: 86, left: IL, width: IW }}>
          <div style={{ background: V.input, border: `1px solid ${sent || menuOp > 0.5 ? V.coral : V.inputBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', minHeight: 30 }}>
              {sent ? <span style={{ flex: 1, color: V.faint, fontSize: 26 }}>Queue another message…</span>
                : typed.length ? <span style={{ flex: 1, color: V.text, fontFamily: FONT_MONO, fontSize: 26 }}>{typed}<span style={{ opacity: cursorOn ? 1 : 0, color: V.coral }}>▌</span></span>
                : <span style={{ flex: 1, color: V.faint, fontSize: 26 }}>ctrl esc to focus or unfocus Claude</span>}
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
                  {sent ? <Square size={18} color="#fff" fill="#fff" /> : <ArrowUp size={24} color="#fff" strokeWidth={2.4} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </VSCodeShell>
    </AbsoluteFill>
  );
};

export default IntroClaudeCode;
