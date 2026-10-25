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
// RDA KIT: the series look as code, shared by every RDA video and thumbnail.
// The written guide is docs/style-bible.md; change the two together.
// Exam-booklet paper, answer-sheet bubbles, one form-green accent, a red pen used
// only for grading marks. Not the repo brand contract (brand.md / brand.ts /
// fonts.ts still hold the upstream house style until /brand-setup adopts this).
// =============================================================================

export const P = (project: string, name: string) => staticFile(`projects/${project}/${name}`);
const FONT = (name: string) => staticFile(`library/fonts/rda/${name}`);
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

/**
 * Thumbnail palette: deliberately louder than the video palette (thumbnails compete at browse
 * size). Measured WCAG contrast: signal on night 10.7, paper on night 17.7, flare on night 6.0.
 * Never put signal on paper (1.65) or flare on paper (2.97); marks on paper use C.pen (4.95).
 */
export const T = {
  night: '#0f1613',
  signal: '#3ee08a',
  paper: '#fbfbf5',
  flare: '#ff5b3d',
  sun: '#ffd23f',
} as const;

// =============================================================================
// FONTS (local woff2 in media/library/fonts/rda, so the render never waits on the
// network)
// =============================================================================
export const F = {
  display: '"RDA Display", "Segoe UI", system-ui, sans-serif',
  body: '"RDA Body", "Segoe UI", system-ui, sans-serif',
  mono: '"RDA Mono", ui-monospace, Menlo, Consolas, monospace',
} as const;

const FONT_FILES: Array<[string, string, string]> = [
  ['RDA Display', 'BricolageGrotesque-var.woff2', '200 800'],
  ['RDA Body', 'SourceSans3-var.woff2', '200 900'],
  ['RDA Mono', 'IBMPlexMono-400.woff2', '400'],
  ['RDA Mono', 'IBMPlexMono-600.woff2', '600'],
];

// The font files start loading as soon as this module runs, but the hold on rendering
// (delayRender) is taken by useRdaFonts() on the first render of a kit component, never at
// module level. Why (2026-10-18): the bundle carries two copies of Remotion's delay-render
// module (`remotion` and `remotion/no-react`, the latter pulled in by @remotion/google-fonts),
// and the second one to load resets the list of holds. A hold taken at module level before
// that was orphaned: it never blocked a frame, and its timer fired at 118 s, killing any render
// longer than about two minutes. By the first render every module has loaded, so nothing can
// reset the hold after that.
const canLoadFonts = typeof document !== 'undefined' && typeof FontFace !== 'undefined';
let fontsReady = false;
let fontsLoading: Promise<void> | null = null;
let fontHold: number | null = null;
const loadFonts = () => {
  if (!fontsLoading) {
    fontsLoading = Promise.all(
      FONT_FILES.map(([family, file, weight]) => {
        const face = new FontFace(family, `url('${FONT(file)}') format('woff2')`, { weight });
        // FontFaceSet.add exists at runtime; this repo's TS lib does not declare it
        return face.load().then((loaded) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(loaded));
      }),
    )
      .then(() => {
        fontsReady = true;
      })
      .catch((err) => {
        console.error('rda font load failed', err);
        fontsReady = true;
      });
  }
  return fontsLoading;
};
if (canLoadFonts) loadFonts();

/**
 * Hold rendering until the RDA fonts have loaded. PaperChrome and Scene call it, so every RDA
 * video is covered; a composition that uses none of the kit's components (a thumbnail) calls it
 * itself. Once per page; a no-op after the fonts are in. The timeout is generous because many
 * render tabs start at once; failing loudly beats rendering in fallback fonts.
 */
export const useRdaFonts = () => {
  if (!canLoadFonts || fontsReady || fontHold !== null) return;
  const hold = delayRender('rda fonts', { timeoutInMilliseconds: 120000 });
  fontHold = hold;
  loadFonts().then(() => continueRender(hold));
};

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
  useRdaFonts();
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

/**
 * Thin top strip, like the header of an exam paper. `page` is the real scene index; leave it out on a
 * standalone card that has none (never show a made-up page number).
 */
export const PaperChrome: React.FC<{ page?: number; of?: number; label?: string }> = ({
  page,
  of,
  label = 'RDA Challenge · Episode kit',
}) => {
  useRdaFonts();
  return (
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
      <span>{label}</span>
      {page !== undefined && of !== undefined ? (
        <span>
          Page {page} / {of}
        </span>
      ) : null}
    </div>
  </AbsoluteFill>
  );
};

// =============================================================================
// THE NEXT FEW STEPS (D22): the close of every video, and the check-in that opens the next one
// =============================================================================

/** `when` is shown exactly as written: 'by Friday', 'this week', 'before studying'. */
export type Step = { text: string; when?: string; done?: boolean };

const ROW_GAP = 30; // frames between rows: read one at a time (style bible 6)

/** A red-pen ring drawn around a missed step's bubble, starting at `at`. Red means a grade. */
const PenRing: React.FC<{ at: number; size: number }> = ({ at, size }) => {
  const frame = useCurrentFrame();
  const len = 320;
  return (
    <svg
      width={size + 40}
      height={size + 34}
      viewBox="0 0 92 80"
      style={{ position: 'absolute', left: -20, top: -17, overflow: 'visible' }}
    >
      <path
        d="M 46 6 C 78 4, 90 30, 82 52 C 72 76, 22 80, 8 56 C -2 36, 14 8, 52 10"
        fill="none"
        stroke={C.pen}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={iio(frame, [at, at + 12], [len, 0], EASE.out)}
      />
    </svg>
  );
};

/**
 * The steps card. `mode="next"` closes a video: up to three steps, bubbles empty, each with an optional
 * `when`. `mode="check"` opens the next video with the same steps graded: a filled bubble and DONE,
 * or a red-pen ring and NOT DONE. The word always carries the verdict, never color alone (style bible 2.3).
 * `sample` labels illustrative steps on screen (style bible 2.5). Rows enter from frame `start`.
 */
export const StepsCard: React.FC<{
  mode: 'next' | 'check';
  steps: Step[];
  label?: string;
  sample?: boolean;
  start?: number;
}> = ({ mode, steps, label = 'RDA Challenge', sample = false, start = 20 }) => {
  const frame = useCurrentFrame();
  const next = mode === 'next';
  const last = start + (steps.length - 1) * ROW_GAP;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <PaperChrome label={`${label} · Next few steps`} />
      <div style={{ position: 'absolute', top: 150, left: 110, right: 110, display: 'flex', flexDirection: 'column' }}>
        <div style={rise(frame, 0)}>
          <Eyebrow>{next ? 'Before the next video' : 'Last video I said'}</Eyebrow>
          <Headline size={96} style={{ marginTop: 18 }}>
            {next ? 'My next few steps' : 'Did I do them?'}
          </Headline>
        </div>
        {sample ? (
          <p style={{ margin: '34px 0 0', font: `600 22px/1 ${F.mono}`, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, ...rise(frame, 6) }}>
            Sample steps, for illustration
          </p>
        ) : null}
        <div
          style={{
            marginTop: sample ? 14 : 48,
            background: C.sheet,
            border: `2px solid ${C.rule}`,
            borderRadius: 14,
            padding: '8px 44px',
          }}
        >
          {steps.map((s, i) => {
            const at = start + i * ROW_GAP;
            const mark = at + 18; // the grade lands after the row is read
            const fill = !next && s.done ? iio(frame, [mark, mark + 10], [0, 1], EASE.out) : 0;
            const verdict = next ? s.when ?? '' : s.done ? 'Done' : 'Not done';
            const vColor = next ? C.muted : s.done ? C.form : C.pen;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 36,
                  minHeight: 132,
                  borderTop: i === 0 ? 'none' : `2px solid ${C.rule}`,
                  ...rise(frame, at),
                }}
              >
                <div style={{ position: 'relative' }}>
                  <Bubble fill={fill} size={64} label={String(i + 1)} />
                  {!next && !s.done ? <PenRing at={mark} size={64} /> : null}
                </div>
                <span style={{ flex: 1, font: `600 50px/1.15 ${F.body}`, color: C.ink }}>{s.text}</span>
                {verdict ? (
                  <span
                    style={{
                      font: `600 ${next ? 26 : 30}px/1 ${F.mono}`,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: vColor,
                      whiteSpace: 'nowrap',
                      opacity: next ? 1 : iio(frame, [mark + 8, mark + 16], [0, 1]),
                    }}
                  >
                    {verdict}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <p style={{ margin: '40px 0 0', font: `400 34px/1.3 ${F.body}`, color: C.muted, ...rise(frame, last + 36) }}>
          {next ? 'The next video opens by checking these.' : 'Then the next few steps.'}
        </p>
      </div>
    </AbsoluteFill>
  );
};
