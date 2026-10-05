import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  AbsoluteFill,
  Img,
} from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { lib } from '../../lib/kit';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'LevelsOverview',
  durationInSeconds: 6,
  fps: 30,
  width: 1920,
  height: 1080,
};

// =============================================================================
// DATA
// =============================================================================
const LEVELS = [
  { n: '01', label: 'LEVEL 1', title: 'Code-driven', desc: 'Claude writes code that renders a PNG', color: COLORS.accent, img: 'projects/example/examples/level1.webp' },
  { n: '02', label: 'LEVEL 2', title: '3D · Code', desc: '3D renders via JavaScript (Three.js)', color: COLORS.accent2, img: 'projects/example/examples/l2_tree.webp' },
  { n: '03', label: 'LEVEL 3', title: 'Real AI', desc: 'Real image models, generated for free', color: COLORS.signal, img: 'projects/example/cat-astronaut.png' },
];

// =============================================================================
// MAIN
// =============================================================================
const LevelsOverview: React.FC = () => {
  const frame = useCurrentFrame();

  const rise = (start: number, dist = 24) => ({
    opacity: interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [start, start + 14], [dist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut })}px)`,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, fontFamily: FONT_BODY }}>
      {/* soft indigo glow, top */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 600px at 50% -10%, ${COLORS.accent}22, transparent 60%)`,
        }}
      />
      {/* faint dotted grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${COLORS.line} 1.5px, transparent 1.5px)`,
          backgroundSize: '46px 46px',
          opacity: 0.5,
        }}
      />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 140px' }}>
        {/* eyebrow */}
        <div
          style={{
            ...rise(6, 16),
            fontFamily: FONT_MONO,
            fontSize: 26,
            letterSpacing: 3,
            color: COLORS.accent,
            background: `${COLORS.accent}14`,
            border: `1px solid ${COLORS.accent}33`,
            padding: '10px 22px',
            borderRadius: RADIUS.pill,
            margin: 0,
            marginBottom: 34,
          }}
        >
          CLAUDE&nbsp;CODE
        </div>

        {/* headline */}
        <h1
          style={{
            ...rise(14),
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 104,
            lineHeight: 1.02,
            color: COLORS.ink,
            textAlign: 'center',
            margin: 0,
          }}
        >
          3 Levels of Image Generation
        </h1>

        {/* subhead */}
        <p
          style={{
            ...rise(22),
            fontSize: 34,
            color: COLORS.muted,
            margin: 0,
            marginTop: 22,
            marginBottom: 48,
          }}
        >
          All inside Claude Code — no expensive AI models required.
        </p>

        {/* three cards */}
        <div style={{ display: 'flex', gap: 34, width: '100%', justifyContent: 'center' }}>
          {LEVELS.map((lv, i) => {
            const start = 44 + i * 12;
            const cardOp = interpolate(frame, [start, start + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });
            const cardY = interpolate(frame, [start, start + 16], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });
            const cardScale = interpolate(frame, [start, start + 16], [0.96, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });
            const barX = interpolate(frame, [start + 8, start + 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });
            return (
              <div
                key={lv.n}
                style={{
                  flex: 1,
                  maxWidth: 470,
                  background: COLORS.paper,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  padding: '38px 36px 40px',
                  opacity: cardOp,
                  transform: `translateY(${cardY}px) scale(${cardScale})`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* top accent bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: 6,
                    width: '100%',
                    background: lv.color,
                    transform: `scaleX(${barX})`,
                    transformOrigin: 'left',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, color: lv.color, margin: 0, lineHeight: 1 }}>{lv.n}</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 2, color: COLORS.muted, margin: 0 }}>{lv.label}</span>
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 40, color: COLORS.ink, margin: 0, marginBottom: 10 }}>{lv.title}</div>
                <div style={{ fontSize: 27, lineHeight: 1.35, color: COLORS.muted, margin: 0 }}>{lv.desc}</div>
                {/* example image (#3) — contain so heterogeneous real examples fit fully */}
                <div style={{
                  marginTop: 20, height: 190, borderRadius: RADIUS.panel, overflow: 'hidden',
                  border: `1px solid ${COLORS.line}`, background: '#f6f1e3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: interpolate(frame, [start + 10, start + 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut }),
                }}>
                  <Img src={lib(lv.img)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default LevelsOverview;
