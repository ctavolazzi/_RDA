import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { BRAND, COLORS, EASINGS, GRADIENT, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

// =============================================================================
// BrandProof — NOT a video beat. A utility shot that renders the CURRENT brand
// back at you: wordmark, palette, type, depth, gradient, and the entrance easing.
// `/brand-setup` renders this as the last step so you SEE your brand before you
// build a video in it. Every value here is read from brand.ts / fonts.ts — this
// shot hardcodes nothing, so what you see is genuinely what your shots will use.
//
//   cd remotion && npx remotion still src/index.ts BrandProof out/brand.png --frame=70
// =============================================================================
export const compositionConfig = { id: 'BrandProof', durationInSeconds: 5, fps: 30, width: 1920, height: 1080 };

// Every role in brand.ts §3, in the order brand.md documents them.
const SWATCHES: readonly [string, string][] = [
  ['accent', COLORS.accent],
  ['accent2', COLORS.accent2],
  ['signal', COLORS.signal],
  ['warn', COLORS.warn],
  ['danger', COLORS.danger],
  ['ink', COLORS.ink],
  ['muted', COLORS.muted],
  ['line', COLORS.line],
];

const Swatch: React.FC<{ name: string; hex: string; i: number }> = ({ name, hex, i }) => {
  const frame = useCurrentFrame();
  const start = 30 + i * 3; // brand stagger: 3-4 frames between items
  const op = interpolate(frame, [start, start + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [start, start + 14], [16, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{ opacity: op, transform: `translateY(${y}px)`, textAlign: 'center' }}>
      <div style={{ width: 132, height: 88, borderRadius: RADIUS.panel, background: hex, border: `1px solid ${COLORS.line}`, boxShadow: SHADOW.soft }} />
      <div style={{ fontFamily: FONT_BODY, fontSize: 19, color: COLORS.ink, marginTop: 10 }}>{name}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 15, color: COLORS.muted }}>{hex}</div>
    </div>
  );
};

const BrandProof: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const barX = interpolate(frame, [16, 40], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', padding: '84px 96px' }}>

        {/* ---- the wordmark: middle part carries the accent ---- */}
        <div style={{ ...rise(2, 20), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 92, letterSpacing: -1, color: COLORS.ink }}>
          {BRAND.wordmark[0]}
          <span style={{ color: COLORS.accent }}>{BRAND.wordmark[1]}</span>
          {BRAND.wordmark[2]}
        </div>

        {/* ---- the signature gradient ---- */}
        <div style={{ width: 420, height: 8, borderRadius: RADIUS.pill, background: GRADIENT, marginTop: 20, transform: `scaleX(${barX})` }} />

        <div style={{ ...rise(20, 14), fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 2, color: COLORS.muted, marginTop: 26 }}>
          BRAND&nbsp;PROOF&nbsp;·&nbsp;brand.ts&nbsp;+&nbsp;fonts.ts
        </div>

        {/* ---- palette ---- */}
        <div style={{ display: 'flex', gap: 22, marginTop: 54 }}>
          {SWATCHES.map(([name, hex], i) => <Swatch key={name} name={name} hex={hex} i={i} />)}
        </div>

        {/* ---- the 3-font system, on a card so depth + radius show too ---- */}
        <div style={{
          ...rise(64, 22),
          marginTop: 54, width: '100%', maxWidth: 1360,
          background: COLORS.cream, border: `1px solid ${COLORS.line}`,
          borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '34px 44px',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 16, color: COLORS.muted, width: 108 }}>display</span>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 46, color: COLORS.ink }}>Headlines land here</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 16, color: COLORS.muted, width: 108 }}>body</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: 30, color: COLORS.ink }}>Body copy, labels, and lower-third detail.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 16, color: COLORS.muted, width: 108 }}>mono</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: COLORS.ink }}>terminal / code / file paths</span>
          </div>
        </div>

        {/* ---- accent-on-paper legibility, the pair most likely to fail ---- */}
        <div style={{ ...rise(76, 16), marginTop: 30, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 34, color: COLORS.ink }}>
          A key word rendered in <span style={{ color: COLORS.accent }}>your accent</span> — is it legible?
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default BrandProof;
