import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  AbsoluteFill,
} from 'remotion';
import { Lock } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';

// =============================================================================
// COMPOSITION CONFIG  (full-screen cutaway — replaces the talking head)
// beat 2.1 "There are 3 methods I want to show you" — ghosted teaser; the three
// cards mirror LevelsOverview (§3) so the reveal there pays this off.
// =============================================================================
export const compositionConfig = {
  id: 'MethodsTeaser',
  durationInSeconds: 4.4,
  fps: 30,
  width: 1920,
  height: 1080,
};

const CARDS = [
  { n: '01', color: COLORS.accent },
  { n: '02', color: COLORS.accent2 },
  { n: '03', color: COLORS.signal },
];

const MethodsTeaser: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const rise = (start: number, dist = 24) => ({
    opacity: interpolate(frame, [start, start + 14], [0, 1], { ...clamp, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [start, start + 14], [dist, 0], { ...clamp, easing: EASINGS.easeOut })}px)`,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, fontFamily: FONT_BODY }}>
      {/* brand backdrop */}
      <AbsoluteFill style={{ background: `radial-gradient(1200px 600px at 50% -10%, ${COLORS.accent}22, transparent 60%)` }} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${COLORS.line} 1.5px, transparent 1.5px)`, backgroundSize: '46px 46px', opacity: 0.5 }} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 140px' }}>
        {/* eyebrow */}
        <div
          style={{
            ...rise(6, 16),
            fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 3, color: COLORS.accent,
            background: `${COLORS.accent}14`, border: `1px solid ${COLORS.accent}33`,
            padding: '10px 22px', borderRadius: RADIUS.pill, marginBottom: 30,
          }}
        >
          COMING&nbsp;UP
        </div>

        {/* headline */}
        <h1 style={{ ...rise(14), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 132, lineHeight: 1, color: COLORS.ink, textAlign: 'center', margin: 0 }}>
          3&nbsp;methods
        </h1>
        <p style={{ ...rise(22), fontSize: 36, color: COLORS.muted, margin: 0, marginTop: 20, marginBottom: 64 }}>
          Three ways to generate images with Claude Code
        </p>

        {/* three ghosted cards (locked — revealed later) */}
        <div style={{ display: 'flex', gap: 34, width: '100%', justifyContent: 'center' }}>
          {CARDS.map((c, i) => {
            const start = 40 + i * 12;
            const op = interpolate(frame, [start, start + 16], [0, 1], { ...clamp, easing: EASINGS.easeOut });
            const y = interpolate(frame, [start, start + 16], [30, 0], { ...clamp, easing: EASINGS.easeOut });
            const sc = interpolate(frame, [start, start + 16], [0.96, 1], { ...clamp, easing: EASINGS.easeOut });
            const barX = interpolate(frame, [start + 8, start + 26], [0, 1], { ...clamp, easing: EASINGS.easeOut });
            return (
              <div
                key={c.n}
                style={{
                  flex: 1, maxWidth: 460, background: COLORS.paper,
                  border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card,
                  padding: '36px 36px 40px', opacity: op, transform: `translateY(${y}px) scale(${sc})`,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, height: 6, width: '100%', background: c.color, transform: `scaleX(${barX})`, transformOrigin: 'left' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 76, color: c.color, lineHeight: 1 }}>{c.n}</span>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={24} color={c.color} strokeWidth={2.2} />
                  </div>
                </div>
                {/* ghosted title placeholders */}
                <div style={{ height: 22, width: '78%', borderRadius: 999, background: COLORS.line, marginBottom: 14 }} />
                <div style={{ height: 22, width: '52%', borderRadius: 999, background: COLORS.cream, border: `1px solid ${COLORS.line}` }} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default MethodsTeaser;
