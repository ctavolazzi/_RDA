import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// transparent overlay — small technical aside over the talking head (bottom band)
// beat 6.8 "set your Cloudflare keys in the .env file"
export const compositionConfig = { id: 'EnvChip', durationInSeconds: 5.6, fps: 30, width: 1920, height: 1080, transparent: true };

const LINES = [
  ['CLOUDFLARE_ACCOUNT_ID', '••••••••••••'],
  ['CLOUDFLARE_API_TOKEN', '••••••••••••'],
];

const EnvChip: React.FC = () => {
  const frame = useCurrentFrame();
  const OUT = compositionConfig.durationInSeconds * compositionConfig.fps;
  const op = Math.min(
    interpolate(frame, [4, 18], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    interpolate(frame, [OUT - 14, OUT - 2], [1, 0], { ...CLAMP, easing: EASINGS.easeIn }),
  );
  const y = interpolate(frame, [4, 20], [26, 0], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 110 }}>
      <div style={{ opacity: op, transform: `translateY(${y}px)`, borderRadius: RADIUS.window, overflow: 'hidden', boxShadow: SHADOW.soft, border: `1px solid ${COLORS.d600}`, minWidth: 640 }}>
        {/* filename tab */}
        <div style={{ background: '#1b2230', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS.warn }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.d300 }}>.env</span>
        </div>
        {/* keys */}
        <div style={{ background: COLORS.d900, padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {LINES.map(([k, v], i) => {
            const lineOp = interpolate(frame, [16 + i * 8, 28 + i * 8], [0, 1], { ...CLAMP });
            return (
              <div key={k} style={{ fontFamily: FONT_MONO, fontSize: 28, opacity: lineOp }}>
                <span style={{ color: COLORS.signal }}>{k}</span>
                <span style={{ color: COLORS.d400 }}>=</span>
                <span style={{ color: COLORS.d300 }}>{v}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default EnvChip;
