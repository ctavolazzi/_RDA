import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { ThumbsUp } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// transparent overlay — quick "like" nudge over the talking head
// beat 8.3 "smash the like button"
export const compositionConfig = { id: 'LikePrompt', durationInSeconds: 2.4, fps: 30, width: 1920, height: 1080, transparent: true };

const LikePrompt: React.FC = () => {
  const frame = useCurrentFrame();
  const OUT = compositionConfig.durationInSeconds * compositionConfig.fps;
  const op = Math.min(
    interpolate(frame, [2, 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    interpolate(frame, [OUT - 10, OUT - 2], [1, 0], { ...CLAMP, easing: EASINGS.easeIn }),
  );
  const y = interpolate(frame, [2, 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
  // two taps
  const tap = 1 - 0.12 * (Math.max(0, Math.sin(frame / 5)) > 0.5 ? 1 : 0);

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: COLORS.accent, borderRadius: RADIUS.pill, boxShadow: SHADOW.card, padding: '18px 34px', opacity: op, transform: `translateY(${y}px)` }}>
        <div style={{ transform: `scale(${tap})`, display: 'flex' }}>
          <ThumbsUp size={40} color="#fff" strokeWidth={2.2} fill="#fff" />
        </div>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: '#fff' }}>Smash Like</span>
      </div>
    </AbsoluteFill>
  );
};
export default LikePrompt;
