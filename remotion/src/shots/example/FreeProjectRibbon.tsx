import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  AbsoluteFill,
} from 'remotion';
import { Gift } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// =============================================================================
// COMPOSITION CONFIG  (transparent overlay — bottom band, over the talking head)
// beat 2.7 "you are going to get this exact project for free by the end of this video"
// =============================================================================
export const compositionConfig = {
  id: 'FreeProjectRibbon',
  durationInSeconds: 5,
  fps: 30,
  width: 1920,
  height: 1080,
  transparent: true,
};

const FreeProjectRibbon: React.FC = () => {
  const frame = useCurrentFrame();
  const OUT = compositionConfig.durationInSeconds * compositionConfig.fps; // 150

  const inOp = interpolate(frame, [4, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });
  const outOp = interpolate(frame, [OUT - 14, OUT - 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeIn });
  const op = Math.min(inOp, outOp);
  const y = interpolate(frame, [4, 20], [26, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });
  const iconScale = interpolate(frame, [12, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.overshoot });

  // "free" badge pulses in a touch after the label lands
  const freeIn = interpolate(frame, [28, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 120 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          background: COLORS.paper,
          border: `1px solid ${COLORS.line}`,
          borderRadius: RADIUS.pill,
          boxShadow: SHADOW.soft,
          padding: '18px 26px 18px 22px',
          opacity: op,
          transform: `translateY(${y}px)`,
        }}
      >
        <div
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: COLORS.signal,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${iconScale})`,
          }}
        >
          <Gift size={30} color="#fff" strokeWidth={2.2} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 2, color: COLORS.signal }}>THE&nbsp;FULL&nbsp;PROJECT</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 40, color: COLORS.ink, whiteSpace: 'nowrap' }}>
            Yours by the end of this video
          </span>
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, letterSpacing: 1,
            color: '#fff', background: COLORS.signal,
            padding: '8px 20px', borderRadius: RADIUS.pill, marginLeft: 6,
            opacity: freeIn,
            transform: `scale(${interpolate(freeIn, [0, 1], [0.8, 1])})`,
          }}
        >
          FREE
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default FreeProjectRibbon;
