import React from 'react';
import {
  AbsoluteFill,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

// =============================================================================
// RDA EXPLAINER KIT
// Shared look for the rda-explainer scenes. No compositionConfig on purpose:
// the registry skips this file. The look matches the RDA Episode Kit page:
// exam-booklet paper, answer-sheet bubbles, one form-green accent, and a
// red pen used only for grading marks. Defined LOCALLY: this is a series
// look, the repo's long-form brand.ts must not leak in.
// =============================================================================

export const P = (name: string) => staticFile(`projects/rda-explainer/${name}`);
export const SFX = (id: string) => staticFile(`library/sfx/clips/${id}.mp3`);
export const MUSIC = (id: string) => staticFile(`library/music/clips/${id}.mp3`);

export const C = {
  paper: '#f6f7f3',
  sheet: '#ffffff',
  ink: '#1c2320',
  muted: '#5a655f',
  rule: '#d9ded8',
  form: '#1d6b58',
  formSoft: '#e3efe9',
  pen: '#c03d29',
  pass: '#1d7a43',
  termBg: '#18201c',
  termFg: '#d7e4dc',
  termDim: '#8ba096',
} as const;

// =============================================================================
// FONTS (local woff2 in media/projects/rda-explainer/fonts, so the render never
// waits on the network)
// =============================================================================
export const F = {
  display: '"RDA Display", "Segoe UI", system-ui, sans-serif',
  body: '"RDA Body", "Segoe UI", system-ui, sans-serif',
  mono: '"RDA Mono", ui-monospace, Menlo, Consolas, monospace',
} as const;

const FONT_FILES: Array<[string, string, string]> = [
  ['RDA Display', 'fonts/BricolageGrotesque-var.woff2', '200 800'],
  ['RDA Body', 'fonts/SourceSans3-var.woff2', '200 900'],
  ['RDA Mono', 'fonts/IBMPlexMono-400.woff2', '400'],
  ['RDA Mono', 'fonts/IBMPlexMono-600.woff2', '600'],
];

if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
  // Generous timeout: with many render tabs starting at once, the default 30s can expire
  // before every tab has loaded the fonts. Failing loudly beats rendering in fallback fonts.
  const handle = delayRender('rda-explainer fonts', { timeoutInMilliseconds: 120000 });
  Promise.all(
    FONT_FILES.map(([family, file, weight]) => {
      const face = new FontFace(family, `url('${P(file)}') format('woff2')`, { weight });
      // FontFaceSet.add exists at runtime; this repo's TS lib does not declare it
      return face.load().then((loaded) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(loaded));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('rda-explainer font load failed', err);
      continueRender(handle);
    });
}

// =============================================================================
// MOTION
// =============================================================================
export const EASE = {
  out: Easing.bezier(0.22, 0.72, 0.28, 1),
  inOut: Easing.bezier(0.5, 0, 0.2, 1),
  overshoot: Easing.bezier(0.34, 1.56, 0.64, 1),
} as const;

export const iio = (f: number, inR: number[], outR: number[], easing?: (n: number) => number) =>
  interpolate(f, inR, outR, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

/** fade + rise entrance starting at `at`, over ~14 frames */
export const rise = (frame: number, at: number, dist = 24, dur = 14): React.CSSProperties => ({
  opacity: iio(frame, [at, at + dur], [0, 1], EASE.out),
  transform: `translateY(${iio(frame, [at, at + dur], [dist, 0], EASE.out)}px)`,
});

/** number of characters of `text` visible when typing from `a` to `b` */
export const typed = (frame: number, text: string, a: number, b: number) =>
  text.slice(0, Math.round(iio(frame, [a, b], [0, text.length])));

// =============================================================================
// PIECES
// =============================================================================

/** Scene wrapper: fades its content in at the start and out at the end. */
export const Scene: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const opacity = iio(frame, [0, 8, dur - 8, dur], [0, 1, 1, 0]);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const Eyebrow: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <p style={{ margin: 0, font: `600 26px/1 ${F.mono}`, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.form, ...style }}>
    {children}
  </p>
);

export const Headline: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({
  children,
  size = 76,
  style,
}) => (
  <h1 style={{ margin: 0, font: `800 ${size}px/1.08 ${F.display}`, letterSpacing: '-0.02em', color: C.ink, ...style }}>{children}</h1>
);

/** An answer-sheet bubble that fills with ink as `fill` goes 0 to 1. */
export const Bubble: React.FC<{ fill: number; size?: number; color?: string; label?: string }> = ({
  fill,
  size = 44,
  color = C.form,
  label,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: `3px solid ${color}`,
      position: 'relative',
      flexShrink: 0,
      display: 'grid',
      placeItems: 'center',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 4,
        borderRadius: '50%',
        background: color,
        transform: `scale(${fill})`,
      }}
    />
    {label ? (
      <span style={{ position: 'relative', font: `600 ${size * 0.42}px/1 ${F.mono}`, color: fill > 0.5 ? C.sheet : color }}>{label}</span>
    ) : null}
  </div>
);

/** A grading stamp that lands at `at` (scale down + slight rotation). */
export const Stamp: React.FC<{ at: number; text: string; color?: string; size?: number; style?: React.CSSProperties }> = ({
  at,
  text,
  color = C.pass,
  size = 56,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = iio(frame, [at, at + 9], [0, 1], EASE.out);
  return (
    <div
      style={{
        display: 'inline-block',
        font: `800 ${size}px/1 ${F.display}`,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color,
        border: `${Math.max(4, size / 12)}px solid ${color}`,
        borderRadius: 10,
        padding: `${size * 0.2}px ${size * 0.34}px`,
        opacity: t,
        transform: `rotate(-4deg) scale(${iio(frame, [at, at + 9], [1.6, 1], EASE.out)})`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Dark terminal window with a title bar. Children are the lines. */
export const Terminal: React.FC<{ title?: string; width: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  title = 'rda',
  width,
  children,
  style,
}) => (
  <div
    style={{
      width,
      background: C.termBg,
      borderRadius: 14,
      boxShadow: '0 18px 48px rgba(20, 30, 25, 0.22)',
      overflow: 'hidden',
      ...style,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid #2a352f' }}>
      {['#e06c5a', '#e2b04a', '#5fcf8c'].map((c) => (
        <span key={c} style={{ width: 13, height: 13, borderRadius: '50%', background: c, display: 'inline-block' }} />
      ))}
      <span style={{ marginLeft: 10, font: `400 20px/1 ${F.mono}`, color: C.termDim }}>{title}</span>
    </div>
    <div style={{ padding: '22px 26px', font: `400 27px/1.55 ${F.mono}`, color: C.termFg, whiteSpace: 'pre' }}>{children}</div>
  </div>
);

/** Thin top strip, like the header of an exam paper. `page` is the real scene index. */
export const PaperChrome: React.FC<{ page: number; of: number }> = ({ page, of }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <div
      style={{
        position: 'absolute',
        top: 54,
        left: 110,
        right: 110,
        display: 'flex',
        justifyContent: 'space-between',
        font: `600 20px/1 ${F.mono}`,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: C.muted,
        paddingBottom: 16,
        borderBottom: `2px solid ${C.ink}`,
      }}
    >
      <span>RDA Challenge · Episode kit</span>
      <span>
        Page {page} / {of}
      </span>
    </div>
  </AbsoluteFill>
);
