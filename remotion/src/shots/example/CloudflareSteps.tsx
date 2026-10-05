import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Cloud, Cpu, Sparkles, ArrowRight } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

export const compositionConfig = { id: 'CloudflareSteps', durationInSeconds: 7.2, fps: 30, width: 1920, height: 1080 };

const CF = '#F38020';
const STEPS = [
  { icon: Cloud, name: 'Cloudflare', sub: 'free account', color: CF },
  { icon: Cpu, name: 'Workers AI', sub: 'the AI platform', color: COLORS.accent },
  { icon: Sparkles, name: 'Flux', sub: 'real image models', color: COLORS.signal },
];

const CloudflareSteps: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.signal} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rise(4, 14), fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.signal, marginBottom: 16 }}>LEVEL&nbsp;3&nbsp;·&nbsp;SETUP</div>
        <h1 style={{ ...rise(10), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 76, color: COLORS.ink, margin: 0, marginBottom: 60 }}>Real models, free tier</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {STEPS.map((s, i) => {
            const start = 24 + i * 20;
            const op = interpolate(frame, [start, start + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const y = interpolate(frame, [start, start + 14], [26, 0], { ...CLAMP, easing: EASINGS.easeOut });
            const arrowOp = interpolate(frame, [start - 6, start + 6], [0, 1], { ...CLAMP });
            const Icon = s.icon;
            return (
              <React.Fragment key={s.name}>
                {i > 0 && <ArrowRight size={44} color={COLORS.muted} strokeWidth={2.2} style={{ opacity: arrowOp }} />}
                <div style={{
                  opacity: op, transform: `translateY(${y}px)`,
                  width: 320, padding: '40px 28px', textAlign: 'center',
                  background: COLORS.paper, border: `1px solid ${COLORS.line}`,
                  borderRadius: RADIUS.card, boxShadow: SHADOW.card,
                }}>
                  <div style={{ width: 92, height: 92, borderRadius: '50%', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
                    <Icon size={44} color={s.color} strokeWidth={2} />
                  </div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink }}>{s.name}</div>
                  <div style={{ fontSize: 26, color: COLORS.muted, marginTop: 6 }}>{s.sub}</div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CloudflareSteps;
