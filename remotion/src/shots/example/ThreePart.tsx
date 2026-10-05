import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Wrench, DollarSign, Key } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

export const compositionConfig = { id: 'ThreePart', durationInSeconds: 8, fps: 30, width: 1920, height: 1080 };

const ROWS = [
  { icon: Wrench, label: 'The tools', value: 'free', color: COLORS.signal, hero: false },
  { icon: DollarSign, label: 'The models', value: 'cheap', color: COLORS.signal, hero: false },
  { icon: Key, label: 'The rare skill', value: 'knowing how to combine them', color: COLORS.accent, hero: true },
];

const ThreePart: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rise(4, 14), fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.accent, marginBottom: 40 }}>WHERE&nbsp;THE&nbsp;VALUE&nbsp;IS</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, width: 1180 }}>
          {ROWS.map((r, i) => {
            const s = 20 + i * 18;
            const op = interpolate(frame, [s, s + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const x = interpolate(frame, [s, s + 14], [-30, 0], { ...CLAMP, easing: EASINGS.easeOut });
            const Icon = r.icon;
            return (
              <div key={r.label} style={{
                opacity: op, transform: `translateX(${x}px)`,
                display: 'flex', alignItems: 'center', gap: 26,
                background: r.hero ? COLORS.ink : COLORS.paper,
                border: `1px solid ${r.hero ? COLORS.ink : COLORS.line}`,
                borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '28px 40px',
              }}>
                <div style={{ width: 76, height: 76, borderRadius: '50%', background: r.hero ? `${COLORS.accent}33` : `${r.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={38} color={r.hero ? '#fff' : r.color} strokeWidth={2.1} />
                </div>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 48, color: r.hero ? COLORS.paper : COLORS.ink, flex: 1 }}>{r.label}</span>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: r.hero ? COLORS.warn : r.color, textAlign: 'right' }}>{r.value}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default ThreePart;
