// Screencast — turn a list of static SCREENSHOTS into a simulated screen
// recording. Builds on WebBrowserFrame (persistent chrome + a URL bar that
// updates per page). Generic + reusable across videos: feed it `pages` (each an
// image with a URL, optional scroll, optional ken-burns zoom, a constant "alive"
// drift, and a cut/crossfade on arrival) plus a global animated `cursor` path and
// `clicks`. A custom SVG pointer eases along the path and ripples on each click.
//
// Coordinate convention: cursor keys + zoom/scroll focal points are FRACTIONS.
//   cursor x/y  -> fraction (0..1) of the VIEWPORT (the page area under the URL bar)
//   zoom fx/fy  -> fraction (0..1) of the IMAGE (transform-origin of the push)
// Fractions survive any resize of the browser box. Frame-based only.
import React from 'react';
import {
  AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import { COLORS, EASINGS } from '../brand';
import { FONT_BODY } from '../fonts';
import { WebBrowserFrame } from './browser';
import { BrandBg, CLAMP } from './kit';

// chrome heights inside WebBrowserFrame (tab strip + nav/URL bar)
const CHROME_H = 46 + 56;
const DRIFT = 0.02; // default constant slow push per page (never perfectly static)

export type ScreencastPage = {
  img?: string;           // staticFile-relative path, e.g. 'projects/video-1/myapp/dashboard.png'
  // v3: a page can be a live DOM tree instead of a screenshot (TSX clone of a UI).
  // All page machinery (drift, zoom, scroll, transitions, cursor) applies the same.
  node?: React.ReactNode;
  url: string;            // URL bar text for this page
  tabTitle: string;       // browser tab label for this page
  favicon?: React.ReactNode; // per-page tab icon (multi-site walkthroughs); falls back to the global
  enterAt: number;        // absolute frame this page becomes the active/top layer
  transition?: 'cut' | 'crossfade'; // how we ARRIVE at this page (default 'cut')
  transitionFrames?: number;         // crossfade length in frames (default 5)
  // subtle in-page scroll (image px, translateY) eased over [a,b] absolute frames
  scroll?: { to: number; range: [number, number]; from?: number };
  // ken-burns push: scale from->to about focal (fx,fy) fraction-of-image, over [a,b]
  zoom?: { from: number; to: number; fx: number; fy: number; range: [number, number] };
  // constant slow "alive" zoom while this page is on (scale amplitude); default DRIFT
  drift?: number;
};

export type CursorKey = { frame: number; x: number; y: number }; // x,y = viewport fraction

// sample a piecewise cursor path (eased per segment) at `frame`
export const sampleCursor = (frame: number, keys: CursorKey[]) => {
  if (!keys.length) return { x: 0.5, y: 0.5 };
  if (frame <= keys[0].frame) return { x: keys[0].x, y: keys[0].y };
  const last = keys[keys.length - 1];
  if (frame >= last.frame) return { x: last.x, y: last.y };
  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].frame <= frame) i++;
  const a = keys[i], b = keys[i + 1];
  const t = interpolate(frame, [a.frame, b.frame], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
};

// classic macOS-style arrow pointer; hotspot (tip) ~ (0.16, 0.10) of the box
export const CursorPointer: React.FC<{ size?: number; press?: number }> = ({ size = 30, press = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{
    transform: `scale(${press})`, transformOrigin: '16% 10%',
    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))', display: 'block',
  }}>
    <path
      d="M4.2 2.6 L4.2 18.9 L8.7 14.7 L11.9 21.6 L14.6 20.3 L11.4 13.6 L17.6 13.6 Z"
      fill="#111318" stroke="#ffffff" strokeWidth={1.4} strokeLinejoin="round"
    />
  </svg>
);

export const Screencast: React.FC<{
  pages: ScreencastPage[];
  cursor?: CursorKey[];
  clicks?: number[];
  box?: { x: number; y: number; w: number; h: number };
  glow?: string;
  appearAt?: number;
  favicon?: React.ReactNode; // tab icon for the whole walkthrough (one site); default = Cloudflare cloud
}> = ({
  pages, cursor = [], clicks = [], glow = COLORS.signal, appearAt = 0,
  favicon = <CloudFavicon />,
  box = { x: 60, y: 63, w: 1800, h: 954 },
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // viewport (page area under the chrome), in absolute canvas px
  const region = { x: box.x, y: box.y + CHROME_H, w: box.w, h: box.h - CHROME_H };

  // active (top) page = last one whose enterAt <= frame → drives the URL bar
  let activeIdx = 0;
  for (let i = 0; i < pages.length; i++) if (frame >= pages[i].enterAt) activeIdx = i;
  const active = pages[activeIdx];

  const cur = sampleCursor(frame, cursor);
  // brief pointer press around each click
  const press = clicks.reduce((p, cf) => {
    if (frame < cf - 4 || frame > cf + 8) return p;
    return interpolate(frame, [cf - 4, cf, cf + 8], [1, 0.8, 1], { ...CLAMP });
  }, 1);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={glow} />
      <WebBrowserFrame url={active.url} tabTitle={active.tabTitle} favicon={active.favicon ?? favicon} box={box} appearAt={appearAt}>
        {pages.map((p, i) => {
          const start = p.enterAt;
          const end = pages[i + 1]?.enterAt ?? durationInFrames;
          if (frame < start && !(p.transition === 'crossfade')) {
            // future page: don't paint (crossfade handled by opacity below anyway)
          }
          // appearance opacity (painter's order lets later pages cover earlier ones)
          const tf = p.transitionFrames ?? 5;
          const op = i === 0
            ? 1
            : p.transition === 'crossfade'
              ? interpolate(frame, [start, start + tf], [0, 1], { ...CLAMP })
              : frame >= start ? 1 : 0;
          if (op <= 0) return null;

          // constant slow "alive" drift for the page's whole life
          const driftAmt = p.drift ?? DRIFT;
          const driftScale = interpolate(frame, [start, end], [1, 1 + driftAmt], { ...CLAMP });
          // ken-burns push (multiplies the drift)
          let scale = driftScale;
          let origin = '50% 46%';
          if (p.zoom) {
            const z = interpolate(frame, p.zoom.range, [p.zoom.from, p.zoom.to], { ...CLAMP, easing: EASINGS.easeInOut });
            scale = z * driftScale;
            origin = `${p.zoom.fx * 100}% ${p.zoom.fy * 100}%`;
          }
          const scrollY = p.scroll
            ? interpolate(frame, p.scroll.range, [p.scroll.from ?? 0, p.scroll.to], { ...CLAMP, easing: EASINGS.easeInOut })
            : 0;

          return (
            // explicit region dims: WebBrowserFrame's translateY wrapper is a
            // transformed (zero-height) containing block, so inset:0 would collapse
            <div key={p.img ?? `node-${i}`} style={{ position: 'absolute', top: 0, left: 0, width: region.w, height: region.h, opacity: op, overflow: 'hidden', background: '#ffffff' }}>
              <div style={{ width: '100%', height: '100%', transform: `translateY(${-scrollY}px) scale(${scale})`, transformOrigin: origin }}>
                {p.node ?? (p.img
                  ? <Img src={staticFile(p.img)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : null)}
              </div>
            </div>
          );
        })}
      </WebBrowserFrame>

      {/* click ripples (drawn at the cursor position at each click frame) */}
      {clicks.map((cf) => {
        if (frame < cf || frame > cf + 18) return null;
        const at = sampleCursor(cf, cursor);
        const cx = region.x + at.x * region.w;
        const cy = region.y + at.y * region.h;
        const sc = interpolate(frame, [cf, cf + 18], [0, 2.4], { ...CLAMP, easing: EASINGS.easeOut });
        const ro = interpolate(frame, [cf, cf + 18], [0.5, 0], { ...CLAMP });
        return (
          <div key={cf} style={{
            position: 'absolute', left: cx, top: cy, width: 34, height: 34, marginLeft: -17, marginTop: -17,
            borderRadius: '50%', border: `2px solid ${COLORS.accent}`, opacity: ro,
            transform: `scale(${sc})`, pointerEvents: 'none',
          }} />
        );
      })}

      {/* the pointer */}
      {cursor.length > 0 && (
        <div style={{
          position: 'absolute',
          left: region.x + cur.x * region.w,
          top: region.y + cur.y * region.h,
          transform: 'translate(-4px, -3px)',
        }}>
          <CursorPointer press={press} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// small Cloudflare cloud favicon for the tab
export const CloudFavicon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 64 40">
    <path fill="#F38020" d="M44 34H14c-5 0-10-4.3-10-10 0-5 3.8-9.1 8.6-9.9C14.3 7.6 19.9 3.5 26.5 3.5c7.5 0 13.8 5.2 15.7 12.2 1.1-.5 2.4-.8 3.6-.8 5.1 0 9.4 4.1 9.4 9.2 0 .6 0 1.3-.1 1.8H44v8z" />
    <path fill="#FBAD41" d="M52.8 24.3c-.5 0-1 0-1.4.1-.3.1-.6.3-.7.6l-1 3.4c-.1.4 0 .8.3 1 .2.1.4.2.6.2h11c.4 0 .8-.3.9-.7.1-.5.2-1 .2-1.5 0-1.8-1.5-3.1-3.3-3.1-.3 0-.6 0-.9.1-1-1.4-2.6-2.3-4.3-2.3-.5 0-.9.1-1.3.2z" />
  </svg>
);
