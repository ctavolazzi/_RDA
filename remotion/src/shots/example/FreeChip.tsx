import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  AbsoluteFill,
} from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// =============================================================================
// COMPOSITION CONFIG  (transparent overlay — composites over the talking head)
// =============================================================================
export const compositionConfig = {
  id: 'FreeChip',
  durationInSeconds: 4,
  fps: 30,
  width: 1920,
  height: 1080,
  transparent: true,
};

// =============================================================================
// MAIN
// =============================================================================
const FreeChip: React.FC = () => {
  const frame = useCurrentFrame();

  const inOp = interpolate(frame, [4, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });
  const outOp = interpolate(frame, [100, 114], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeIn });
  const op = Math.min(inOp, outOp);
  const y = interpolate(frame, [4, 20], [26, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.easeOut });
  const checkScale = interpolate(frame, [12, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASINGS.overshoot });

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 130 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          background: COLORS.paper,
          border: `1px solid ${COLORS.line}`,
          borderRadius: RADIUS.pill,
          boxShadow: SHADOW.soft,
          padding: '20px 38px 20px 24px',
          opacity: op,
          transform: `translateY(${y}px)`,
        }}
      >
        {/* teal check */}
        <div
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: COLORS.signal,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${checkScale})`,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 18, letterSpacing: 2, color: COLORS.signal, margin: 0 }}>NO&nbsp;COST</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 40, color: COLORS.ink, margin: 0 }}>Totally for free</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default FreeChip;
