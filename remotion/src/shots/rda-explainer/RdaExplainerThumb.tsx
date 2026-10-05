import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, T } from '../../lib/rda';

// =============================================================================
// COMPOSITION CONFIG · thumbnail A for the RDA explainer (1280x720, one frame).
// Render: cd remotion && node scripts/render-one.mjs rda-explainer RdaExplainerThumb --still 0 --scale=1
// Rules followed (thumbnail skill + docs/style-bible.md): dark ground, one accent doing
// the work, ONE hook ("PASS?") that does not repeat the title, a two-step hierarchy
// (hook, then answer sheet), bottom-right kept clear for YouTube's timestamp, honest:
// the series is pass/fail, and no score is shown because the explainer has no real result.
// =============================================================================
export const compositionConfig = {
  id: 'RdaExplainerThumb',
  durationInSeconds: 1,
  fps: 30,
  width: 1280,
  height: 720,
};

// filled answer per row (index into A to D); rows 3 and 6 carry a red-pen circle
const ROWS = [1, 3, 0, 2, 2, 1, 3];
const CIRCLED = new Set([2, 5]);

const Sheet: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 64,
      top: 70,
      width: 520,
      height: 610,
      background: T.paper,
      borderRadius: 14,
      transform: 'rotate(-5deg)',
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.55)',
      padding: '34px 40px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `3px solid ${C.ink}`, paddingBottom: 12 }}>
      <span style={{ font: `600 24px/1 ${F.mono}`, letterSpacing: '0.12em', color: C.ink }}>ANSWER SHEET</span>
      <span style={{ font: `600 24px/1 ${F.mono}`, color: C.form }}>RDA</span>
    </div>
    {ROWS.map((filled, r) => (
      <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <span style={{ width: 34, font: `600 26px/1 ${F.mono}`, color: C.muted }}>{r + 1}</span>
        {['A', 'B', 'C', 'D'].map((letter, i) => (
          <div key={letter} style={{ position: 'relative' }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                border: `3px solid ${C.ink}`,
                background: i === filled ? C.ink : 'transparent',
                display: 'grid',
                placeItems: 'center',
                font: `600 20px/1 ${F.mono}`,
                color: i === filled ? T.paper : C.muted,
              }}
            >
              {letter}
            </div>
            {CIRCLED.has(r) && i === filled ? (
              <svg width={92} height={80} viewBox="0 0 92 80" style={{ position: 'absolute', left: -21, top: -15 }}>
                <path d="M 46 6 C 78 4, 90 30, 82 52 C 72 76, 22 80, 8 56 C -2 36, 14 8, 52 10" fill="none" stroke={C.pen} strokeWidth={6} strokeLinecap="round" />
              </svg>
            ) : null}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const RdaExplainerThumb: React.FC = () => (
  <AbsoluteFill style={{ background: T.night, overflow: 'hidden' }}>
    {/* soft form-green glow behind the sheet, for depth */}
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 30% 50%, rgba(62, 224, 138, 0.22), transparent 55%)' }} />

    <Sheet />

    {/* the hook: a grading stamp, overlapping the sheet's edge */}
    <div
      style={{
        position: 'absolute',
        left: 532,
        top: 190,
        transform: 'rotate(-8deg)',
        border: `16px solid ${T.signal}`,
        borderRadius: 26,
        padding: '4px 34px 16px',
        background: 'rgba(15, 22, 19, 0.86)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
      }}
    >
      <span style={{ font: `800 212px/1 ${F.display}`, letterSpacing: '-0.02em', color: T.signal }}>
        PASS<span style={{ color: T.flare }}>?</span>
      </span>
    </div>
  </AbsoluteFill>
);

export default RdaExplainerThumb;
