import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  AbsoluteFill,
} from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// =============================================================================
// COMPOSITION CONFIG  (full-screen cutaway — dark terminal)
// =============================================================================
export const compositionConfig = {
  id: 'TerminalLogoPrompt',
  durationInSeconds: 6,
  fps: 30,
  width: 1920,
  height: 1080,
};

// =============================================================================
// DATA
// =============================================================================
const PROMPT = 'generate a logo for a coffee shop';
const TYPE_START = 22;
const TYPE_PER_CHAR = 1.4;
const TYPE_END = TYPE_START + PROMPT.length * TYPE_PER_CHAR;

// =============================================================================
// MAIN
// =============================================================================
const TerminalLogoPrompt: React.FC = () => {
  const frame = useCurrentFrame();

  const winOp = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });
  const winY = interpolate(frame, [0, 16], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });

  const typedCount = Math.floor(interpolate(frame, [TYPE_START, TYPE_END], [0, PROMPT.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const typed = PROMPT.slice(0, typedCount);
  const cursorOn = Math.floor(frame / 15) % 2 === 0;

  const respOp = interpolate(frame, [TYPE_END + 10, TYPE_END + 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });
  const doneOp = interpolate(frame, [TYPE_END + 30, TYPE_END + 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900 }}>
      {/* soft indigo glow */}
      <AbsoluteFill style={{ background: `radial-gradient(1100px 600px at 50% 0%, ${COLORS.accent}22, transparent 60%)` }} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: 1240,
            background: COLORS.d800,
            border: `1px solid ${COLORS.d600}`,
            borderRadius: RADIUS.window,
            overflow: 'hidden',
            boxShadow: '0 30px 90px rgba(0,0,0,0.5)',
            opacity: winOp,
            transform: `translateY(${winY}px)`,
          }}
        >
          {/* title bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', background: '#1b2230', borderBottom: `1px solid ${COLORS.d600}` }}>
            <span style={{ width: 15, height: 15, borderRadius: '50%', background: COLORS.danger }} />
            <span style={{ width: 15, height: 15, borderRadius: '50%', background: COLORS.warn }} />
            <span style={{ width: 15, height: 15, borderRadius: '50%', background: COLORS.signal }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.d400, marginLeft: 14 }}>
              <span style={{ color: COLORS.accent }}>✦</span>&nbsp;Claude Code
            </span>
          </div>

          {/* body */}
          <div style={{ padding: '40px 44px 48px', fontFamily: FONT_MONO, fontSize: 34, lineHeight: 1.7 }}>
            <div style={{ color: COLORS.d400, fontSize: 24, marginBottom: 14 }}>~/claude-image-generation</div>
            <div style={{ color: COLORS.d300 }}>
              <span style={{ color: COLORS.accent }}>&gt;&nbsp;</span>
              {typed}
              <span style={{ opacity: cursorOn ? 1 : 0, color: COLORS.d300 }}>▌</span>
            </div>
            <div style={{ color: COLORS.d400, marginTop: 26, opacity: respOp }}>
              ● Running <span style={{ color: COLORS.accent2 }}>level-1-image-generator</span>…
            </div>
            <div style={{ color: COLORS.signal, marginTop: 8, opacity: doneOp }}>
              ✓ wrote outputs/coffee-shop-logo.webp
            </div>
          </div>
        </div>

        {/* caption under window */}
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: COLORS.d400, marginTop: 34, opacity: winOp }}>
          Level 1 — Claude writes code that renders a PNG
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default TerminalLogoPrompt;
