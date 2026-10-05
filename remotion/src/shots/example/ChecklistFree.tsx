import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

export const compositionConfig = { id: 'ChecklistFree', durationInSeconds: 6.7, fps: 30, width: 1920, height: 1080 };

const ITEMS = ['The full project', 'The full guide', 'The skills'];

const ChecklistFree: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.signal} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rise(4, 14), fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.signal, marginBottom: 18 }}>LINKED&nbsp;BELOW</div>
        <h1 style={{ ...rise(10), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: COLORS.ink, margin: 0, marginBottom: 50 }}>Everything, free</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: 820 }}>
          {ITEMS.map((it, i) => {
            const s = 24 + i * 12;
            const op = interpolate(frame, [s, s + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const x = interpolate(frame, [s, s + 14], [-24, 0], { ...CLAMP, easing: EASINGS.easeOut });
            const chk = interpolate(frame, [s + 6, s + 20], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
            return (
              <div key={it} style={{ opacity: op, transform: `translateX(${x}px)`, display: 'flex', alignItems: 'center', gap: 24, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '24px 34px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: COLORS.signal, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${chk})` }}>
                  <Check size={32} color="#fff" strokeWidth={3.4} />
                </div>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 46, color: COLORS.ink }}>{it}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default ChecklistFree;
