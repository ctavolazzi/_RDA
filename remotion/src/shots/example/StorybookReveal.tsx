import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  AbsoluteFill,
  Img,
  staticFile,
} from 'remotion';
import { BookOpen, Play, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { WebBrowserFrame } from '../../lib/browser';

// =============================================================================
// COMPOSITION CONFIG  (full-screen cutaway — the storybook result reveal)
// beats 2.4 (full story) + 2.5 (consistent characters) + 2.6 (full HTML book)
// v2: at "turned into a complete full HTML book" (39.16 on master, ~f206 local)
// the REAL generated HTML player appears in a browser (TSX clone of
// the-three-gardeners.html: cream bg, serif narration, dots + play controls).
// =============================================================================
export const compositionConfig = {
  id: 'StorybookReveal',
  durationInSeconds: 13,
  fps: 30,
  width: 1920,
  height: 1080,
};

const SB = (name: string) => staticFile(`projects/example/storybook/${name}`);

// pages the player card flips through (phase A)
const PAGES = ['part_01.webp', 'part_03.webp', 'part_06.webp'];
const CHARS = [
  { file: 'ref_mira.webp', name: 'Mira' },
  { file: 'ref_theo.webp', name: 'Theo' },
  { file: 'ref_rosa.webp', name: 'Rosa' },
];
const THUMBS = ['part_02.webp', 'part_04.webp', 'part_05.webp', 'part_07.webp', 'part_10.webp'];

const FLIP_START = 26;
const SEG = 62; // frames per page in the card player

// phase B — browser clone of the real HTML player
const BOOK_IN = 204; // "…complete full HTML book" 39.16 -> (39.16-32.2)*30 ≈ 209
// real page copy from the-three-gardeners.html
const HTML_PAGES = [
  { img: 'part_01.webp', text: null }, // cover — image only
  { img: 'part_02.webp', text: 'But the garden looked sad. The sun was hot, and every flower drooped low. “Oh dear,” said Grandma Rosa. “My poor garden is much too thirsty today.”' },
  { img: 'part_03.webp', text: '“We can help!” said Mira. Theo nodded so fast his cap nearly fell off. Grandma smiled at them both. “Then let us be three gardeners,” she said.' },
];
const PAGE_AT = [BOOK_IN + 14, BOOK_IN + 66, BOOK_IN + 128]; // when each page shows

const HB = { bg: '#fbf7ee', bg2: '#f4ead3', ink: '#3a3326', soft: '#6b5f49', accent: '#d98a3d', accent2: '#b9692a' } as const;
const SERIF = 'Georgia, "Palatino Linotype", serif';

const HtmlBookPage: React.FC<{ frame: number }> = ({ frame }) => {
  // which page is showing (cross-fades, like the real player's 350ms fade)
  const pageAlpha = (i: number) => {
    const a = interpolate(frame, [PAGE_AT[i], PAGE_AT[i] + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const b = i < HTML_PAGES.length - 1 ? interpolate(frame, [PAGE_AT[i + 1], PAGE_AT[i + 1] + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
    return Math.min(a, b);
  };
  const current = frame >= PAGE_AT[2] ? 2 : frame >= PAGE_AT[1] ? 1 : 0;
  return (
    <div style={{
      width: 1758, height: 888, fontFamily: FONT_BODY,
      background: `radial-gradient(ellipse at top, rgba(217,138,61,0.10) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(185,105,42,0.08) 0%, transparent 60%), ${HB.bg}`,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* header: centered title + auto-play pill (clone of the real player) */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 26px', borderBottom: '1px solid rgba(180,140,70,0.18)' }}>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, color: HB.ink }}>The Three Gardeners</span>
        <div style={{ position: 'absolute', right: 26, display: 'flex', alignItems: 'center', gap: 9, color: HB.soft, fontSize: 19 }}>
          <span style={{ width: 19, height: 19, borderRadius: 4, background: HB.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={13} color="#fff" strokeWidth={3.4} />
          </span>
          Auto-play
        </div>
      </div>
      {/* stage */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0, padding: '26px 40px' }}>
        {HTML_PAGES.map((p, i) => {
          const op = pageAlpha(i);
          if (op <= 0.001) return null;
          const cover = p.text === null;
          return (
            <div key={p.img} style={{ position: 'absolute', inset: '26px 40px', opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: cover ? 'center' : 'flex-end', flex: cover ? undefined : 1.1 }}>
                <Img src={SB(p.img)} style={{ height: '100%', borderRadius: 22, boxShadow: '0 10px 30px rgba(120,88,38,0.14)', background: '#fff' }} />
              </div>
              {!cover && (
                <div style={{ flex: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 30px' }}>
                  <p style={{ margin: 0, textAlign: 'center', lineHeight: 1.7, color: HB.ink, fontFamily: SERIF, fontSize: 32, maxWidth: '30ch' }}>{p.text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* footer: dots + prev/play/next (clone of the real controls) */}
      <div style={{ padding: '10px 26px 20px', borderTop: '1px solid rgba(180,140,70,0.18)', background: 'rgba(251,247,238,0.92)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 9, margin: '6px 0 14px' }}>
          {Array.from({ length: 11 }).map((_, i) => {
            const active = i === current;
            const done = i < current;
            return <span key={i} style={{
              width: active ? 15 : 11, height: active ? 15 : 11, borderRadius: '50%',
              background: active ? HB.accent2 : done ? HB.accent : 'rgba(180,140,70,0.3)',
              boxShadow: active ? '0 0 0 4px rgba(217,138,61,0.25)' : 'none',
            }} />;
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(180,140,70,0.35)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: current === 0 ? 0.35 : 1 }}>
            <ChevronLeft size={26} color={HB.ink} strokeWidth={2.4} />
          </div>
          <div style={{ width: 70, height: 70, borderRadius: '50%', background: HB.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(180,110,40,0.4)' }}>
            <svg width={30} height={30} viewBox="0 0 24 24"><path fill="#fff" d="M6 5h4v14H6zm8 0h4v14h-4z" /></svg>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(180,140,70,0.35)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={26} color={HB.ink} strokeWidth={2.4} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StorybookReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...clamp, easing });

  // phase A: player card enters, then slides left when the character panel comes in
  const playerIn = r(6, 24);
  const playerY = r(6, 24, 40, 0);
  const slide = r(84, 108, 0, 1, EASINGS.easeInOut);
  const playerX = interpolate(slide, [0, 1], [680, 150]);
  const playerScale = interpolate(slide, [0, 1], [1, 0.92]);
  const phaseAOp = 1 - r(BOOK_IN - 8, BOOK_IN + 6); // fade out as the browser lands

  const pageIdx = Math.min(PAGES.length - 1, Math.max(0, Math.floor((frame - FLIP_START) / SEG)));
  const counter = [1, 3, 6][pageIdx];

  const panelOp = r(96, 116);
  const panelY = r(96, 116, 24, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, fontFamily: FONT_BODY }}>
      {/* brand backdrop: soft indigo glow + dotted grid */}
      <AbsoluteFill style={{ background: `radial-gradient(1300px 700px at 30% -10%, ${COLORS.accent}22, transparent 60%)` }} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${COLORS.line} 1.5px, transparent 1.5px)`, backgroundSize: '46px 46px', opacity: 0.45 }} />

      {/* ================= PHASE A: BOOK PLAYER + CHARACTERS ================= */}
      <div style={{ position: 'absolute', inset: 0, opacity: phaseAOp }}>
        <div
          style={{
            position: 'absolute',
            top: 150,
            left: playerX,
            width: 560,
            opacity: playerIn,
            transform: `translateY(${playerY}px) scale(${playerScale})`,
            transformOrigin: 'top center',
          }}
        >
          <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, overflow: 'hidden' }}>
            {/* title bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${COLORS.line}`, background: COLORS.cream }}>
              <BookOpen size={24} color={COLORS.accent} strokeWidth={2.2} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 28, color: COLORS.ink, flex: 1 }}>The Three Gardeners</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>{counter}/10</span>
            </div>
            {/* page (flips) */}
            <div style={{ position: 'relative', width: '100%', height: 636, background: COLORS.cream }}>
              {PAGES.map((p, i) => {
                const start = FLIP_START + i * SEG;
                const opIn = interpolate(frame, [start, start + 16], [0, 1], clamp);
                const opOut = i < PAGES.length - 1 ? interpolate(frame, [start + SEG, start + SEG + 16], [1, 0], clamp) : 1;
                const op = Math.min(opIn, opOut as number);
                return (
                  <Img key={p} src={SB(p)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: op }} />
                );
              })}
            </div>
            {/* footer controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 22px', borderTop: `1px solid ${COLORS.line}` }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={18} color="#fff" fill="#fff" />
              </div>
              <div style={{ display: 'flex', gap: 8, flex: 1, justifyContent: 'center' }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} style={{ width: i === counter - 1 ? 22 : 8, height: 8, borderRadius: 999, background: i === counter - 1 ? COLORS.accent : COLORS.line }} />
                ))}
              </div>
              <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: COLORS.muted }}>read-along</span>
            </div>
          </div>
        </div>

        {/* consistent-characters panel */}
        <div style={{ position: 'absolute', top: 196, left: 800, width: 980, opacity: panelOp, transform: `translateY(${panelY}px)` }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: `${COLORS.signal}18`, border: `1px solid ${COLORS.signal}55`, borderRadius: RADIUS.pill, padding: '10px 22px', marginBottom: 26 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: COLORS.signal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={16} color="#fff" strokeWidth={3.2} />
            </div>
            <span style={{ fontFamily: FONT_MONO, fontSize: 22, letterSpacing: 1, color: COLORS.signal, fontWeight: 500 }}>CONSISTENT&nbsp;CHARACTERS</span>
          </div>

          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: COLORS.ink, lineHeight: 1.05, marginBottom: 8 }}>
            The same three,<br />in every scene
          </div>
          <div style={{ fontSize: 28, color: COLORS.muted, marginBottom: 30 }}>Locked from reference art across all 10 pages.</div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 34 }}>
            {CHARS.map((c, i) => {
              const s = 120 + i * 8;
              const cOp = interpolate(frame, [s, s + 14], [0, 1], clamp);
              const cY = interpolate(frame, [s, s + 14], [18, 0], clamp);
              return (
                <div key={c.name} style={{ width: 168, opacity: cOp, transform: `translateY(${cY}px)` }}>
                  <div style={{ width: 168, height: 200, borderRadius: RADIUS.panel, overflow: 'hidden', border: `1px solid ${COLORS.line}`, background: COLORS.cream, boxShadow: SHADOW.soft }}>
                    <Img src={SB(c.file)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 22%' }} />
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 12, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 26, color: COLORS.ink }}>{c.name}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {THUMBS.map((t, i) => {
              const s = 150 + i * 7;
              const tOp = interpolate(frame, [s, s + 12], [0, 1], clamp);
              return (
                <div key={t} style={{ width: 116, height: 116, borderRadius: 12, overflow: 'hidden', border: `1px solid ${COLORS.line}`, opacity: tOp }}>
                  <Img src={SB(t)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= PHASE B: THE REAL HTML BOOK, IN A BROWSER ================= */}
      {frame >= BOOK_IN - 4 && (
        <WebBrowserFrame
          url="file:///D:/stories/the-three-gardeners/the-three-gardeners.html"
          tabTitle="The Three Gardeners"
          favicon={<BookOpen size={17} color={HB.accent2} strokeWidth={2.4} />}
          appearAt={BOOK_IN}
          box={{ x: 80, y: 44, w: 1760, h: 992 }}
          pageBg={HB.bg}
        >
          <HtmlBookPage frame={frame} />
        </WebBrowserFrame>
      )}
    </AbsoluteFill>
  );
};

export default StorybookReveal;
