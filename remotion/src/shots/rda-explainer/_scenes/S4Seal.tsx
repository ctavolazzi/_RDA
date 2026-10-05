import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { C, F, EASE, iio, rise, typed, Scene, Eyebrow, Headline } from '../_kit';

// =============================================================================
// S4 · Locking the exam (12s). exam.json goes through `rda exam freeze` and
// comes out as three files: the question sheet, the sealed key, the fingerprint.
// Then `rda exam check` proves it on camera.
// =============================================================================
export const S4_DUR = 360;
export const S4_CUES = { whoosh: 102, cards: [115, 145, 175], ok: 268 };

const HASH = '5dba9fcc8dd63c66366b875228283fa9…';
const ARROW = 'M 0 40 L 250 40';

const Tag: React.FC<{ text: string; solid?: boolean; color: string }> = ({ text, solid, color }) => (
  <span
    style={{
      alignSelf: 'flex-start',
      font: `600 20px/1 ${F.mono}`,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      padding: '8px 12px',
      borderRadius: 6,
      color: solid ? C.sheet : color,
      background: solid ? color : 'transparent',
      border: `2px solid ${color}`,
    }}
  >
    {text}
  </span>
);

const Lock: React.FC = () => (
  <svg width={34} height={40} viewBox="0 0 34 40" style={{ flexShrink: 0 }}>
    <path d="M 8 18 V 12 A 9 9 0 0 1 26 12 V 18" fill="none" stroke={C.pen} strokeWidth={4} />
    <rect x={3} y={18} width={28} height={20} rx={4} fill={C.pen} />
  </svg>
);

const Card: React.FC<{ name: string; children: React.ReactNode; style?: React.CSSProperties; strong?: boolean; dashed?: boolean }> = ({
  name,
  children,
  style,
  strong,
  dashed,
}) => (
  <div
    style={{
      background: C.sheet,
      border: `${strong ? 4 : 2}px ${dashed ? 'dashed' : 'solid'} ${strong ? C.form : C.rule}`,
      borderRadius: 12,
      padding: '22px 26px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxSizing: 'border-box',
      ...style,
    }}
  >
    <span style={{ font: `600 34px/1 ${F.mono}`, color: C.ink }}>{name}</span>
    {children}
  </div>
);

export const S4Seal: React.FC = () => {
  const f = useCurrentFrame();
  const arrow = evolvePath(iio(f, [100, 114], [0, 1], EASE.out), ARROW);
  const cmd = '$ rda exam freeze';
  const check = '$ rda exam check';

  return (
    <Scene dur={S4_DUR}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 150, left: 110, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Eyebrow style={rise(f, 6)}>Locking the exam</Eyebrow>
          <Headline style={rise(f, 12)}>One file in. Three files out.</Headline>
        </div>

        {/* input */}
        <Card name="exam.json" style={{ position: 'absolute', top: 470, left: 110, width: 470, ...rise(f, 30) }}>
          <span style={{ font: `400 32px/1.3 ${F.body}`, color: C.muted }}>Every question, plus the official answers.</span>
          <Tag text="You never open this" color={C.pen} />
        </Card>

        {/* the command and the arrow */}
        <div style={{ position: 'absolute', top: 500, left: 615, width: 300, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              background: C.termBg,
              color: C.termFg,
              font: `400 26px/1 ${F.mono}`,
              padding: '16px 18px',
              borderRadius: 10,
              whiteSpace: 'pre',
              opacity: iio(f, [62, 70], [0, 1]),
            }}
          >
            {typed(f, cmd, 70, 98) || ' '}
          </div>
          <svg width={300} height={80} viewBox="0 0 300 80">
            <path d={ARROW} fill="none" stroke={C.form} strokeWidth={6} strokeLinecap="round" strokeDasharray={arrow.strokeDasharray} strokeDashoffset={arrow.strokeDashoffset} />
            <path d="M 250 26 L 274 40 L 250 54 Z" fill={C.form} opacity={iio(f, [112, 116], [0, 1])} />
          </svg>
        </div>

        {/* outputs */}
        <div style={{ position: 'absolute', top: 330, left: 960, width: 850, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card name="questions.md" strong style={rise(f, S4_CUES.cards[0], 30)}>
            <span style={{ font: `400 32px/1.3 ${F.body}`, color: C.ink }}>Your test sheet. Questions only, no answers.</span>
            <Tag text="You read this" solid color={C.form} />
          </Card>
          <Card name="key.json" dashed style={rise(f, S4_CUES.cards[1], 30)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Lock />
              <span style={{ font: `400 32px/1.3 ${F.body}`, color: C.ink }}>The answers. Sealed, used only to score.</span>
            </div>
          </Card>
          <Card name="FROZEN.json" style={rise(f, S4_CUES.cards[2], 30)}>
            <span style={{ font: `400 32px/1.3 ${F.body}`, color: C.ink }}>A fingerprint of the exam, committed before you study.</span>
            <span style={{ font: `400 26px/1 ${F.mono}`, color: C.form, whiteSpace: 'pre' }}>{typed(f, HASH, 182, 214) || ' '}</span>
          </Card>
        </div>

        {/* proof on camera */}
        <div style={{ position: 'absolute', top: 905, left: 110, display: 'flex', alignItems: 'center', gap: 26, opacity: iio(f, [236, 244], [0, 1]) }}>
          <div style={{ background: C.termBg, color: C.termFg, font: `400 28px/1 ${F.mono}`, padding: '16px 20px', borderRadius: 10, whiteSpace: 'pre', display: 'flex', gap: 22 }}>
            <span>{typed(f, check, 244, 262) || ' '}</span>
            <span style={{ color: '#5fcf8c', fontWeight: 600, opacity: iio(f, [S4_CUES.ok, S4_CUES.ok + 4], [0, 1]) }}>OK</span>
          </div>
          <span style={{ font: `600 38px/1.2 ${F.body}`, color: C.ink, ...rise(f, 280, 14) }}>Run it on camera. Change one answer and it fails.</span>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
