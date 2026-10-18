import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { C, F, P, iio, rise, Scene, Eyebrow, Headline, Bubble } from '../../../lib/rda';

// =============================================================================
// S8 · Steps 9 and 10, thumbnail and package (6s). The thumbnail made in this video's
// own run ("13 STEPS", now packaging/thumb-B.jpg; its copy here keeps the name
// thumb-A.jpg so the render is unchanged), large, then at a true 320 px,
// the width it was checked at. Under it, the working title from packaging.md.
// =============================================================================
export const S8_DUR = 180;
export const S8_CUES = { in: 0, rail: [10, 18], thumb: 20, small: 80, title: 112 };

const THUMB = P('script-to-render', 'thumb-A.jpg');
export const WORKING_TITLE = 'How an AI Agent Made This Video, From Script to Render';

export const S8Thumb: React.FC = () => {
  const f = useCurrentFrame();
  const frame = { display: 'block', borderRadius: 10, border: `2px solid ${C.rule}`, boxSizing: 'border-box' } as const;

  return (
    <Scene dur={S8_DUR}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 150, left: 110, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Eyebrow style={rise(f, 6)}>Steps 9 and 10 · Thumbnail, then package</Eyebrow>
          <Headline style={rise(f, 12)}>Every video ships with a thumbnail.</Headline>
        </div>

        <Img src={THUMB} style={{ ...frame, position: 'absolute', top: 340, left: 110, width: 768, height: 432, ...rise(f, S8_CUES.thumb, 30) }} />

        <Img src={THUMB} style={{ ...frame, position: 'absolute', top: 592, left: 940, width: 320, height: 180, ...rise(f, S8_CUES.small, 16) }} />
        <div style={{ position: 'absolute', top: 600, left: 1300, display: 'flex', flexDirection: 'column', gap: 12, ...rise(f, S8_CUES.small + 8) }}>
          <span style={{ font: `800 44px/1 ${F.display}`, color: C.ink, letterSpacing: '-0.01em' }}>320 px wide.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Bubble fill={iio(f, [S8_CUES.small + 14, S8_CUES.small + 20], [0, 1])} size={40} />
            <span style={{ font: `400 38px/1 ${F.body}`, color: C.ink }}>Still reads.</span>
          </div>
        </div>

        <div style={{ position: 'absolute', top: 806, left: 110, display: 'flex', alignItems: 'baseline', gap: 22, ...rise(f, S8_CUES.title) }}>
          <span style={{ font: `600 22px/1 ${F.mono}`, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>Working title</span>
          <span style={{ font: `600 38px/1.2 ${F.body}`, color: C.ink }}>{WORKING_TITLE}</span>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
