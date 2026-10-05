import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { ScrollText, Plug, Plus } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP, Sunburst } from '../../lib/kit';

// =============================================================================
// 7.6 — v2 (#15): two stages on cue. Master span 282.5–295.4.
// Stage 1 "the point is in the combination" (f0+): combination TSX — Claude
// Code (f86) + Skills (f127) + APIs (f172) join on "working together" (f199).
// Stage 2 "that's the engine" (290.51 -> f240): the big engine reveal.
// =============================================================================
export const compositionConfig = { id: 'BigStatement', durationInSeconds: 13, fps: 30, width: 1920, height: 1080 };

const CHIPS = [
  { label: 'Claude Code', at: 86, kind: 'claude' as const, color: COLORS.ink },
  { label: 'Skills', at: 127, kind: 'scroll' as const, color: COLORS.accent },
  { label: 'APIs', at: 172, kind: 'plug' as const, color: COLORS.signal },
];
const TOGETHER = 199; // "working together"
const ENGINE = 240; // "that's the engine"

const BigStatement: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  // stage 1 -> stage 2 handoff
  const phase1Op = 1 - interpolate(frame, [ENGINE - 6, ENGINE + 8], [0, 1], { ...CLAMP, easing: EASINGS.easeIn });
  const phase1Y = interpolate(frame, [ENGINE - 6, ENGINE + 10], [0, -46], { ...CLAMP, easing: EASINGS.easeIn });
  const together = interpolate(frame, [TOGETHER, TOGETHER + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const gap = interpolate(together, [0, 1], [30, 14]);

  // stage 2
  const engineOp = interpolate(frame, [ENGINE, ENGINE + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const engineY = interpolate(frame, [ENGINE, ENGINE + 16], [34, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const sweep = interpolate(frame, [ENGINE + 14, ENGINE + 34], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* ============ stage 1: the combination ============ */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 160px', opacity: phase1Op, transform: `translateY(${phase1Y}px)` }}>
        <div style={{ ...rise(2, 14), fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 4, color: COLORS.muted, marginBottom: 36 }}>IT&rsquo;S&nbsp;NOT&nbsp;THE&nbsp;MODEL</div>
        <h1 style={{ ...rise(8, 24), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 108, lineHeight: 1.05, color: COLORS.ink, textAlign: 'center', margin: 0, marginBottom: 70 }}>
          The point is the <span style={{ color: COLORS.accent }}>combination</span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap }}>
          {CHIPS.map((c, i) => {
            const op = interpolate(frame, [c.at, c.at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const y = interpolate(frame, [c.at, c.at + 14], [26, 0], { ...CLAMP, easing: EASINGS.easeOut });
            const plusOp = interpolate(frame, [c.at - 4, c.at + 8], [0, 1], { ...CLAMP });
            return (
              <React.Fragment key={c.label}>
                {i > 0 && <Plus size={42} color={COLORS.muted} strokeWidth={2.6} style={{ opacity: plusOp }} />}
                <div style={{
                  opacity: op, transform: `translateY(${y}px)`,
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: COLORS.paper, border: `2px solid ${c.color}`,
                  borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '24px 36px',
                }}>
                  {c.kind === 'claude' ? <Sunburst size={40} color="#cd8064" />
                    : c.kind === 'scroll' ? <ScrollText size={40} color={c.color} strokeWidth={2} />
                    : <Plug size={40} color={c.color} strokeWidth={2} />}
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 50, color: COLORS.ink }}>{c.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* "working together" — the join line draws under the chips */}
        <div style={{ marginTop: 40, height: 8, width: 760, borderRadius: 999, background: COLORS.line, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accent2}, ${COLORS.signal})`, transform: `scaleX(${together})`, transformOrigin: 'left' }} />
        </div>
        <div style={{ marginTop: 22, fontSize: 34, color: COLORS.muted, opacity: together }}>working together</div>
      </AbsoluteFill>

      {/* ============ stage 2: that's the engine ============ */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 160px', opacity: engineOp, transform: `translateY(${engineY}px)` }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 170, lineHeight: 1.05, color: COLORS.ink, textAlign: 'center', margin: 0 }}>
          That&rsquo;s the{' '}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{ position: 'absolute', left: -8, right: -8, bottom: 14, height: 30, background: `${COLORS.signal}66`, borderRadius: 8, transform: `scaleX(${sweep})`, transformOrigin: 'left', zIndex: 0 }} />
            <span style={{ position: 'relative', zIndex: 1 }}>engine</span>
          </span>
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default BigStatement;
