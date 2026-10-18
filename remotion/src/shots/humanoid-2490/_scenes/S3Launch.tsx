import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, EASE, iio, rise, Scene, Eyebrow, Headline } from '../../../lib/rda';
import { Check, Drift, PriceTag, RobotFigure, SourceTag } from '../../../lib/news';
import { cueAt, layout } from '../_layout';

// =============================================================================
// S3 · What launched. One line per sentence. The robot is a generic diagram,
// drawn large here on purpose (product shots make it look big); S4 shows its real
// size. Its 20 joints light up, it waves, and it tips over and gets back up when
// the voice says so.
// =============================================================================
export const S3_L = layout(3);
const WAVE = cueAt(S3_L, 1, 'it waves');
const TIP = cueAt(S3_L, 1, 'and it gets');
export const S3_DUR = S3_L.dur;
export const S3_CUES = {
  vo: S3_L.starts,
  maker: cueAt(S3_L, 0, 'Faraday'),
  lines: [S3_L.starts[1], cueAt(S3_L, 1, 'It walks'), S3_L.starts[2], S3_L.starts[3], S3_L.starts[4]],
  joints: S3_L.starts[1],
  wave: WAVE,
  tip: TIP,
  miniTag: cueAt(S3_L, 4, 'costs'),
};

const SPECS = ['20 joints: 2 head, 6 arms, 12 legs', 'Walks, waves, gets back up', 'Runs ROS 2', 'First 100 units: invitation only', 'Nova Mini, for kids'];

export const S3Launch: React.FC = () => {
  const f = useCurrentFrame();
  const wave = iio(f, [WAVE - 4, WAVE + 5, WAVE + 11, WAVE + 18], [0, 1, 1, 0], EASE.inOut);
  const tip = iio(f, [TIP + 2, TIP + 12, TIP + 20, TIP + 38], [0, 1, 1, 0], EASE.inOut);
  return (
    <Scene dur={S3_DUR}>
      <Drift dur={S3_DUR} amount={0.02}>
        <AbsoluteFill>
          <div style={{ position: 'absolute', top: 150, left: 110, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Eyebrow style={rise(f, 6)}>What launched</Eyebrow>
            <Headline size={120} style={rise(f, 12, 30)}>FF Nova</Headline>
            <span style={{ font: `400 36px/1.3 ${F.body}`, color: C.muted, ...rise(f, S3_CUES.maker) }}>Faraday Future and its robotics sister company</span>
          </div>
          <div style={{ position: 'absolute', top: 470, left: 110, display: 'flex', flexDirection: 'column', gap: 26 }}>
            {SPECS.map((text, i) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 18, ...rise(f, S3_CUES.lines[i], 16) }}>
                <Check at={S3_CUES.lines[i] + 4} size={40} />
                <span style={{ font: `600 46px/1.1 ${F.body}`, color: C.ink }}>{text}</span>
                {i === 4 ? <PriceTag text="$299" at={S3_CUES.miniTag} size={46} tilt={-6} style={{ marginLeft: 12 }} /> : null}
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', right: 230, bottom: 150, ...rise(f, 20, 40, 20) }}>
            <RobotFigure height={600} wave={wave} tip={tip} joints={iio(f, [S3_CUES.joints, S3_CUES.joints + 36], [0, 1])} />
          </div>
          <span style={{ position: 'absolute', right: 300, bottom: 44, font: `400 20px/1 ${F.mono}`, color: C.muted, opacity: iio(f, [20, 30], [0, 1]) }}>
            Diagram, not the product's look
          </span>
          <SourceTag at={S3_L.starts[1]} style={{ position: 'absolute', left: 110, bottom: 70 }}>
            Product page, via Unite.AI and TNW · Oct 2026
          </SourceTag>
        </AbsoluteFill>
      </Drift>
    </Scene>
  );
};
