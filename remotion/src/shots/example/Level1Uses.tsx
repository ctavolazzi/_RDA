import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, Img } from 'remotion';
import { ArrowRight, X, Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP, lib } from '../../lib/kit';

// =============================================================================
// 4.4/4.5/4.6 — level-1 use-cases with REAL example images, revealed on their
// word cues (P1). NO skill wording — the skill is introduced later (P2).
// Master span 85.0–101.0. Cues (master s -> local f): diagrams 87.96->f89,
// charts 89.08->f122, social 89.56->f137, logos 91.31->f189,
// "no expensive AI models" 95.02->f301, "way more accurate" 99.60->f438.
// =============================================================================
export const compositionConfig = { id: 'Level1Uses', durationInSeconds: 16.2, fps: 30, width: 1920, height: 1080 };

const FLOW = ['prompt', 'code', 'image.png'];
const USES = [
  { img: 'projects/example/examples/l1_diagram.png', label: 'Diagrams', at: 89 },
  { img: 'projects/example/examples/l1_chart.png', label: 'Charts', at: 122 },
  { img: 'projects/example/examples/l1_logo.png', label: 'Logos', at: 189 },
];

const Level1Uses: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 150px' }}>
        <div style={{ ...rise(2, 14), fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.accent, marginBottom: 18 }}>LEVEL&nbsp;1&nbsp;·&nbsp;CODE-DRIVEN</div>
        <h1 style={{ ...rise(6), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 74, color: COLORS.ink, margin: 0, marginBottom: 40, textAlign: 'center' }}>Writes code, renders PNGs</h1>

        {/* flow: prompt -> code -> image.png (said 82.8–86.8, lands as we cut in) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 48 }}>
          {FLOW.map((f, i) => {
            const start = 2 + i * 10;
            const op = interpolate(frame, [start, start + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const sc = interpolate(frame, [start, start + 12], [0.9, 1], { ...CLAMP, easing: EASINGS.overshoot });
            const arrowOp = interpolate(frame, [start + 6, start + 16], [0, 1], { ...CLAMP });
            return (
              <React.Fragment key={f}>
                {i > 0 && <ArrowRight size={38} color={COLORS.accent} strokeWidth={2.4} style={{ opacity: arrowOp }} />}
                <div style={{
                  opacity: op, transform: `scale(${sc})`,
                  fontFamily: FONT_MONO, fontSize: 32, color: i === 2 ? '#fff' : COLORS.ink,
                  background: i === 2 ? COLORS.accent : COLORS.paper,
                  border: `1px solid ${i === 2 ? COLORS.accent : COLORS.line}`,
                  borderRadius: RADIUS.panel, boxShadow: SHADOW.soft, padding: '16px 28px',
                }}>{f}</div>
              </React.Fragment>
            );
          })}
        </div>

        {/* real example tiles, each on its word cue */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 48 }}>
          {USES.map((u) => {
            const op = interpolate(frame, [u.at, u.at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const y = interpolate(frame, [u.at, u.at + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
            return (
              <div key={u.label} style={{
                opacity: op, transform: `translateY(${y}px)`,
                width: 288, background: COLORS.paper,
                border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card,
                overflow: 'hidden',
              }}>
                <div style={{ height: 216, background: COLORS.cream }}>
                  <Img src={lib(u.img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px 18px 18px', textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 28, color: COLORS.ink }}>{u.label}</div>
              </div>
            );
          })}
        </div>

        {/* callouts, each on its word cue */}
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ ...rise(301, 18), display: 'flex', alignItems: 'center', gap: 12, background: `${COLORS.danger}14`, border: `1px solid ${COLORS.danger}44`, borderRadius: RADIUS.pill, padding: '14px 26px' }}>
            <X size={24} color={COLORS.danger} strokeWidth={3} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: COLORS.ink }}>No expensive AI models</span>
          </div>
          <div style={{ ...rise(438, 18), display: 'flex', alignItems: 'center', gap: 12, background: `${COLORS.signal}14`, border: `1px solid ${COLORS.signal}44`, borderRadius: RADIUS.pill, padding: '14px 26px' }}>
            <Check size={24} color={COLORS.signal} strokeWidth={3} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: COLORS.ink }}>Often more accurate</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Level1Uses;
