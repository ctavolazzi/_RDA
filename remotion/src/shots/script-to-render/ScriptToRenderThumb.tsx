import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, T } from '../../lib/rda';

// =============================================================================
// COMPOSITION CONFIG · thumbnail B ("13 STEPS", made in the video's own run) for "how this video
// was made" (1280x720, one frame). Thumbnail A, the face version, was made in Canva afterwards.
// Render: cd remotion && node scripts/render-one.mjs script-to-render ScriptToRenderThumb --still 0 --scale=1
// Rules (docs/style-bible.md 8): night ground, one signal hook ("13 STEPS", not in the
// title), a paper prop (the script), bottom-right clear for the timestamp, nothing the
// video does not show: the 13 stages are its step rail, the sheet is its real script.
// =============================================================================
export const compositionConfig = {
  id: 'ScriptToRenderThumb',
  durationInSeconds: 1,
  fps: 30,
  width: 1280,
  height: 720,
};

const LINES = ['### S1 Open (5 s)', 'On screen:', '- Claude Code made', '  this video.', '- Here is every step.', '- With receipts.'];

const Sheet: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 56,
      top: 92,
      width: 470,
      height: 500,
      background: T.paper,
      borderRadius: 14,
      transform: 'rotate(-5deg)',
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.55)',
      padding: '34px 38px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}
  >
    <div style={{ borderBottom: `3px solid ${C.ink}`, paddingBottom: 12, font: `600 26px/1 ${F.mono}`, letterSpacing: '0.12em', color: C.ink }}>SCRIPT.MD</div>
    {LINES.map((line, i) => (
      <span key={i} style={{ font: `${i === 0 ? 600 : 400} 31px/1.25 ${F.mono}`, color: i === 0 ? C.form : C.ink, whiteSpace: 'pre' }}>
        {line}
      </span>
    ))}
    <svg width={150} height={24} viewBox="0 0 296 24" preserveAspectRatio="none" style={{ marginTop: -16, marginLeft: 128 }}>
      <path d="M 0 10 C 90 2, 190 16, 286 6" fill="none" stroke={C.pen} strokeWidth={7} strokeLinecap="round" />
    </svg>
  </div>
);

const ScriptToRenderThumb: React.FC = () => (
  <AbsoluteFill style={{ background: T.night, overflow: 'hidden' }}>
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 70% 40%, rgba(62, 224, 138, 0.20), transparent 55%)' }} />

    <Sheet />

    {/* the hook */}
    <div style={{ position: 'absolute', left: 600, top: 70, display: 'flex', flexDirection: 'column' }}>
      <span style={{ font: `800 300px/0.9 ${F.display}`, letterSpacing: '-0.04em', color: T.signal }}>13</span>
      <span style={{ font: `800 150px/1 ${F.display}`, letterSpacing: '-0.02em', color: T.signal }}>STEPS</span>
    </div>

    {/* the step rail, all filled: the same 13 stages the video walks through */}
    <div style={{ position: 'absolute', left: 608, top: 530, display: 'flex', gap: 10 }}>
      {Array.from({ length: 13 }, (_, i) => (
        <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: T.signal }} />
      ))}
    </div>
  </AbsoluteFill>
);

export default ScriptToRenderThumb;
