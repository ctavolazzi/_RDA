import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { C, F, EASE, iio } from './rda';

// =============================================================================
// NEWS KIT · pieces for current-event videos in the RDA paper look, first used by
// shots/humanoid-2490 (2026-10-18). Read docs/current-event-video.md first.
//   Cutouts are paper: a white edge, a soft shadow, a slight tilt.
//   Every number on screen carries a SourceTag. Diagrams say they are diagrams.
//   The red pen (C.pen) still means grading: circles, underlines, strikes, NOT YET.
// =============================================================================

export const CUTOUT_SHADOW = 'drop-shadow(0 14px 22px rgba(20, 30, 25, 0.18)) drop-shadow(0 2px 3px rgba(20, 30, 25, 0.12))';

/** A slap: lands at `at` with a little overshoot. Returns 0..1+ for scale and opacity. */
export const useSlap = (at: number, damping = 11) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping, stiffness: 190, mass: 0.7 } });
};

/** Slow push in across a scene, so a still layout never sits dead. */
export const Drift: React.FC<{ dur: number; amount?: number; children: React.ReactNode }> = ({ dur, amount = 0.03, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ transform: `scale(${iio(f, [0, dur], [1, 1 + amount])})`, transformOrigin: '50% 45%' }}>{children}</AbsoluteFill>;
};

/** Price tag with a punched hole, slapped on at `at`. */
export const PriceTag: React.FC<{ text: string; at: number; size?: number; tilt?: number; style?: React.CSSProperties }> = ({
  text,
  at,
  size = 96,
  tilt = -8,
  style,
}) => {
  const s = useSlap(at);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.28,
        background: '#fff8e1',
        border: `3px solid ${C.ink}`,
        borderRadius: `${size * 0.16}px ${size * 0.5}px ${size * 0.5}px ${size * 0.16}px`,
        padding: `${size * 0.16}px ${size * 0.4}px ${size * 0.16}px ${size * 0.26}px`,
        font: `800 ${size}px/1 ${F.display}`,
        letterSpacing: '-0.02em',
        color: C.ink,
        filter: CUTOUT_SHADOW,
        opacity: Math.min(1, s * 1.5),
        transform: `rotate(${tilt + (1 - s) * 18}deg) scale(${1.7 - 0.7 * s})`,
        ...style,
      }}
    >
      <span style={{ width: size * 0.2, height: size * 0.2, borderRadius: '50%', border: `3px solid ${C.ink}`, background: C.paper }} />
      {text}
    </div>
  );
};

/** A headline cut out of a page: outlet in mono caps, the exact title, torn ends. Slides in from `from`. */
export const HeadlineStrip: React.FC<{
  outlet: string;
  title: React.ReactNode;
  at: number;
  tilt?: number;
  from?: 'left' | 'right';
  width?: number;
  style?: React.CSSProperties;
}> = ({ outlet, title, at, tilt = -2, from = 'right', width = 760, style }) => {
  const f = useCurrentFrame();
  const t = iio(f, [at, at + 12], [0, 1], EASE.out);
  const torn = 'polygon(0 4%, 2% 0, 98% 3%, 100% 0, 99% 50%, 100% 97%, 97% 100%, 3% 96%, 0 100%, 1% 50%)';
  return (
    <div style={{ width, filter: CUTOUT_SHADOW, opacity: t, transform: `translateX(${(1 - t) * (from === 'right' ? 260 : -260)}px) rotate(${tilt}deg)`, ...style }}>
      <div style={{ background: C.sheet, clipPath: torn, padding: '22px 34px 26px' }}>
        <div style={{ font: `600 18px/1 ${F.mono}`, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>{outlet}</div>
        <div style={{ font: `700 34px/1.18 ${F.display}`, letterSpacing: '-0.01em', color: C.ink }}>{title}</div>
      </div>
    </div>
  );
};

/** A receipt-style source line. Every number on screen gets one. */
export const SourceTag: React.FC<{ children: React.ReactNode; at: number; style?: React.CSSProperties }> = ({ children, at, style }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 12,
        background: C.sheet,
        borderTop: `2px dashed ${C.rule}`,
        borderBottom: `2px dashed ${C.rule}`,
        padding: '8px 14px',
        font: `400 19px/1.3 ${F.mono}`,
        color: C.muted,
        opacity: iio(f, [at, at + 8], [0, 1]),
        ...style,
      }}
    >
      <span style={{ fontWeight: 600, letterSpacing: '0.14em', color: C.form }}>SOURCE</span>
      <span>{children}</span>
    </div>
  );
};

/** A red-pen stroke drawn over 16 frames from `at`, along `d` in a `w` x `h` box. */
export const PenPath: React.FC<{ d: string; at: number; w: number; h: number; width?: number; dur?: number; style?: React.CSSProperties }> = ({
  d,
  at,
  w,
  h,
  width = 7,
  dur = 16,
  style,
}) => {
  const f = useCurrentFrame();
  const p = evolvePath(iio(f, [at, at + dur], [0, 1], EASE.out), d);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', width: w, height: h, overflow: 'visible', pointerEvents: 'none', ...style }}>
      <path d={d} fill="none" stroke={C.pen} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={p.strokeDasharray} strokeDashoffset={p.strokeDashoffset} />
    </svg>
  );
};

/** Loose hand-drawn ellipse for a `w` x `h` box. */
export const circlePath = (w: number, h: number) =>
  `M ${w * 0.52} ${h * 0.04} C ${w * 0.92} ${h * 0.02}, ${w * 1.02} ${h * 0.5}, ${w * 0.9} ${h * 0.8} C ${w * 0.76} ${h * 1.04}, ${w * 0.18} ${h * 1.02}, ${w * 0.05} ${h * 0.7} C ${w * -0.04} ${h * 0.38}, ${w * 0.2} ${h * 0.02}, ${w * 0.6} ${h * 0.08}`;
/** Slightly wavy underline for width `w`. */
export const underlinePath = (w: number) => `M 0 10 C ${w * 0.3} 2, ${w * 0.66} 16, ${w} 6`;

/** Count from `from` to `to` over `dur` frames starting at `at`. */
export const CountUp: React.FC<{ to: number; at: number; from?: number; dur?: number; format?: (n: number) => string }> = ({
  to,
  at,
  from = 0,
  dur = 24,
  format = (n) => Math.round(n).toLocaleString('en-US'),
}) => {
  const f = useCurrentFrame();
  return <>{format(iio(f, [at, at + dur], [from, to], EASE.out))}</>;
};

/** A drawn check mark that strokes in at `at`. */
export const Check: React.FC<{ at: number; size?: number; color?: string }> = ({ at, size = 44, color = C.form }) => {
  const f = useCurrentFrame();
  const d = 'M 6 24 L 18 36 L 40 8';
  const p = evolvePath(iio(f, [at, at + 10], [0, 1], EASE.out), d);
  return (
    <svg viewBox="0 0 46 44" width={size} height={size * 0.96} style={{ overflow: 'visible', flex: 'none' }}>
      <path d={d} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={p.strokeDasharray} strokeDashoffset={p.strokeDashoffset} />
    </svg>
  );
};

/** Full-frame paper sheet that slides across for a chapter: in at `at`, out at `out`. */
export const ChapterSlide: React.FC<{ text: string; kicker?: string; at: number; out: number }> = ({ text, kicker = 'Chapter', at, out }) => {
  const f = useCurrentFrame();
  const x = iio(f, [at, at + 12, out, out + 12], [1920, 0, 0, -1920], EASE.inOut);
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)`, background: C.form, justifyContent: 'center', padding: '0 110px', boxShadow: '-30px 0 60px rgba(20,30,25,0.25)' }}>
      <span style={{ font: `600 26px/1 ${F.mono}`, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.formSoft, marginBottom: 22 }}>{kicker}</span>
      <span style={{ font: `800 150px/1 ${F.display}`, letterSpacing: '-0.03em', color: C.paper }}>{text}</span>
    </AbsoluteFill>
  );
};

// =============================================================================
// DIAGRAMS · drawn, not photographed, and labeled as diagrams wherever they appear.
// =============================================================================

/**
 * A generic small humanoid (not any product's real look), `height` px tall, feet at the bottom.
 * `wave` 0..1 raises its right arm; `tip` 0..1 tips it over onto its back (rotation about the feet);
 * `joints` 0..1 lights its 20 joint dots (2 head, 6 arms, 12 legs).
 */
export const RobotFigure: React.FC<{ height: number; wave?: number; tip?: number; joints?: number; style?: React.CSSProperties }> = ({
  height,
  wave = 0,
  tip = 0,
  joints = 0,
  style,
}) => {
  const body = { fill: C.sheet, stroke: C.ink, strokeWidth: 3 } as const;
  const dot = (x: number, y: number, i: number) => (
    <circle key={`${x}-${y}`} cx={x} cy={y} r={3.6} fill={C.form} opacity={iio(joints, [i / 20, (i + 1) / 20], [0, 1])} />
  );
  const armTurn = `rotate(${wave * -150 + Math.sin(wave * Math.PI * 4) * wave * 12} 82 47)`;
  const J: Array<[number, number]> = [
    [50, 36], [50, 28], // head 2
    [18, 47], [18, 78], [18, 108], [82, 47], [82, 78], [82, 108], // arms 6
    [40, 102], [40, 125], [40, 148], [40, 170], [40, 186], [36, 194], // left leg 6
    [60, 102], [60, 125], [60, 148], [60, 170], [60, 186], [64, 194], // right leg 6
  ];
  return (
    <svg viewBox="-20 -60 140 260" height={height * (260 / 200)} style={{ overflow: 'visible', filter: CUTOUT_SHADOW, ...style }}>
      <g transform={`rotate(${tip * -84} 50 198)`}>
        <g stroke="#fff" strokeWidth={14} strokeLinejoin="round" fill="#fff">
          <rect x={30} y={2} width={40} height={32} rx={9} />
          <rect x={24} y={38} width={52} height={62} rx={11} />
          <rect x={11} y={42} width={14} height={72} rx={7} />
          <rect x={75} y={42} width={14} height={72} rx={7} transform={armTurn} />
          <rect x={32} y={98} width={16} height={94} rx={8} />
          <rect x={52} y={98} width={16} height={94} rx={8} />
        </g>
        <rect x={32} y={98} width={16} height={92} rx={8} {...body} />
        <rect x={52} y={98} width={16} height={92} rx={8} {...body} />
        <rect x={26} y={188} width={22} height={10} rx={4} {...body} />
        <rect x={52} y={188} width={22} height={10} rx={4} {...body} />
        <rect x={24} y={38} width={52} height={62} rx={11} {...body} />
        <rect x={36} y={52} width={28} height={18} rx={5} fill={C.formSoft} stroke={C.ink} strokeWidth={2} />
        <rect x={11} y={42} width={14} height={72} rx={7} {...body} />
        <rect x={75} y={42} width={14} height={72} rx={7} transform={armTurn} {...body} />
        <rect x={44} y={30} width={12} height={10} rx={3} {...body} />
        <rect x={30} y={2} width={40} height={32} rx={9} {...body} />
        <rect x={36} y={12} width={28} height={10} rx={5} fill={C.ink} />
        {J.map(([x, y], i) => (i >= 5 && i <= 7 ? <g key={i} transform={armTurn}>{dot(x, y, i)}</g> : dot(x, y, i)))}
      </g>
    </svg>
  );
};

/** A plain adult silhouette, `height` px tall, feet at the bottom. The knee sits about 0.29 of the height up. */
export const PersonFigure: React.FC<{ height: number; style?: React.CSSProperties }> = ({ height, style }) => (
  <svg viewBox="0 0 100 350" height={height} style={{ overflow: 'visible', ...style }}>
    <g fill="#c7cec8">
      <circle cx={50} cy={20} r={17} />
      <rect x={30} y={42} width={40} height={112} rx={16} />
      <rect x={15} y={46} width={13} height={118} rx={6.5} />
      <rect x={72} y={46} width={13} height={118} rx={6.5} />
      <rect x={32} y={146} width={16} height={204} rx={8} />
      <rect x={52} y={146} width={16} height={204} rx={8} />
    </g>
  </svg>
);

/** A vertical ruler in cm, `pxPerCm` scale, 0 at the bottom; labels every 25 cm. */
export const Ruler: React.FC<{ cm: number; pxPerCm: number; style?: React.CSSProperties }> = ({ cm, pxPerCm, style }) => {
  const h = cm * pxPerCm;
  const ticks = [];
  for (let c = 0; c <= cm; c += 5) {
    const major = c % 25 === 0;
    ticks.push(
      <div key={c} style={{ position: 'absolute', right: 0, bottom: c * pxPerCm - 1, width: major ? 34 : 16, height: 2, background: C.ink }}>
        {major ? <span style={{ position: 'absolute', right: 44, top: -12, font: `400 20px/1 ${F.mono}`, color: C.muted }}>{c}</span> : null}
      </div>,
    );
  }
  return (
    <div style={{ position: 'relative', width: 120, height: h, borderRight: `3px solid ${C.ink}`, ...style }}>
      {ticks}
      <span style={{ position: 'absolute', right: 44, top: -46, font: `600 20px/1 ${F.mono}`, color: C.muted }}>cm</span>
    </div>
  );
};

/** One horizontal bar that grows at `at`; value counted up; label and source under it. */
export const BarRow: React.FC<{ label: string; value: number; max: number; width: number; at: number; prefix?: string; source: string; accent?: boolean }> = ({
  label,
  value,
  max,
  width,
  at,
  prefix = '',
  source,
  accent = false,
}) => {
  const f = useCurrentFrame();
  const t = iio(f, [at, at + 22], [0, 1], EASE.out);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: iio(f, [at - 4, at + 4], [0, 1]) }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
        <span style={{ font: `700 34px/1 ${F.body}`, color: C.ink }}>{label}</span>
        <span style={{ font: `400 20px/1 ${F.mono}`, color: C.muted }}>{source}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: (value / max) * width * t, height: 64, background: accent ? C.form : C.ink, borderRadius: 8 }} />
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          {prefix ? <span style={{ font: `400 30px/1 ${F.body}`, color: C.muted }}>{prefix}</span> : null}
          <span style={{ font: `800 56px/1 ${F.display}`, color: C.ink, letterSpacing: '-0.02em' }}>
            <CountUp to={value} at={at} dur={22} />
          </span>
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// ICONS · simple line drawings in ink, for boards and lists
// =============================================================================
const icon = (size: number, children: React.ReactNode) => (
  <svg viewBox="0 0 64 64" width={size} height={size} style={{ flex: 'none' }} fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const IconVacuum: React.FC<{ size?: number }> = ({ size = 72 }) =>
  icon(size, <><circle cx={32} cy={36} r={22} fill={C.sheet} /><circle cx={32} cy={36} r={7} /><path d="M 14 26 Q 32 14 50 26" /></>);
export const IconMower: React.FC<{ size?: number }> = ({ size = 72 }) =>
  icon(size, <><path d="M 8 40 Q 10 22 32 20 Q 54 22 56 40 Z" fill={C.sheet} /><circle cx={16} cy={44} r={6} fill={C.sheet} /><circle cx={48} cy={44} r={6} fill={C.sheet} /><path d="M 4 56 L 8 50 M 14 56 L 16 50 M 26 56 L 28 50 M 38 56 L 40 50 M 50 56 L 52 50 M 60 56 L 60 50" stroke={C.form} /></>);
export const IconGardenBot: React.FC<{ size?: number }> = ({ size = 72 }) =>
  icon(size, <><path d="M 6 50 L 6 16 L 58 16 L 58 50" /><path d="M 26 16 L 26 28 L 38 28 L 38 16" fill={C.sheet} /><path d="M 32 28 L 32 36" /><rect x={4} y={48} width={56} height={10} rx={2} fill={C.formSoft} /><path d="M 16 48 Q 16 40 20 38 M 46 48 Q 46 40 50 38" stroke={C.form} /></>);
export const IconMilk: React.FC<{ size?: number }> = ({ size = 72 }) =>
  icon(size, <><path d="M 22 8 L 38 8 L 38 16 L 48 26 L 48 58 L 14 58 L 14 26 L 22 18 Z" fill={C.sheet} /><path d="M 44 30 Q 56 32 54 44 Q 52 52 48 50" /><path d="M 14 38 L 48 38" stroke={C.form} /></>);
