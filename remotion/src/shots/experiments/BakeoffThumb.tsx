import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, T } from '../../lib/rda';

// =============================================================================
// COMPOSITION CONFIG · thumbnail for the HyperFrames vs Remotion comparison clip
// (2026-10-18), made after the fact: CT's rule covers every video, comparisons included.
// Render: cd remotion && node scripts/render-one.mjs experiments BakeoffThumb --still 0 --scale=1
// Saved as experiments/hyperframes/thumb-A.jpg. Hook "SAME?": the clip's question; the
// answer it shows is yes (SSIM 0.994). The cards show no score: the clip's score is sample data.
// =============================================================================
export const compositionConfig = {
  id: 'BakeoffThumb',
  durationInSeconds: 1,
  fps: 30,
  width: 1280,
  height: 720,
};

const Card: React.FC<{ label: string; top: number; left: number; tilt: number }> = ({ label, top, left, tilt }) => (
  <div
    style={{
      position: 'absolute',
      top,
      left,
      width: 420,
      height: 236,
      background: T.paper,
      borderRadius: 14,
      transform: `rotate(${tilt}deg)`,
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.55)',
      padding: '22px 28px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}
  >
    <span style={{ font: `600 24px/1 ${F.mono}`, letterSpacing: '0.12em', color: C.ink, borderBottom: `3px solid ${C.ink}`, paddingBottom: 10 }}>{label}</span>
    <span style={{ font: `600 44px/1 ${F.mono}`, color: C.ink }}>$ rda score</span>
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ height: 14, width: 220, background: C.form, borderRadius: 7 }} />
      <div style={{ height: 14, width: 100, background: C.formSoft, borderRadius: 7 }} />
    </div>
  </div>
);

const BakeoffThumb: React.FC = () => (
  <AbsoluteFill style={{ background: T.night, overflow: 'hidden' }}>
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 30% 50%, rgba(62, 224, 138, 0.18), transparent 55%)' }} />
    <Card label="HYPERFRAMES" top={90} left={70} tilt={-5} />
    <Card label="REMOTION" top={380} left={110} tilt={3} />
    <span style={{ position: 'absolute', left: 600, top: 220, font: `800 190px/1 ${F.display}`, letterSpacing: '-0.03em', color: T.signal }}>
      SAME<span style={{ color: T.flare }}>?</span>
    </span>
  </AbsoluteFill>
);

export default BakeoffThumb;
