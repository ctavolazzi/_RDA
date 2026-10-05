import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, T, Bubble, PaperChrome } from '../../lib/rda';

// =============================================================================
// COMPOSITION CONFIG · the RDA style card: palette, type and motifs on one page.
// Rendered from the live tokens in src/lib/rda.tsx, so it cannot drift from the code.
// Render: cd remotion && node scripts/render-one.mjs rda-brand RdaStyleCard --still 0 --scale=1
// Copy the PNG to docs/style/rda-style-card.png. Written guide: docs/style-bible.md.
// =============================================================================
export const compositionConfig = {
  id: 'RdaStyleCard',
  durationInSeconds: 1,
  fps: 30,
  width: 1920,
  height: 1080,
};

const VIDEO: Array<[string, string, string]> = [
  ['paper', C.paper, 'ground'],
  ['sheet', C.sheet, 'cards'],
  ['ink', C.ink, 'text'],
  ['muted', C.muted, 'secondary'],
  ['form', C.form, 'the accent'],
  ['formSoft', C.formSoft, 'highlight'],
  ['pen', C.pen, 'grading only'],
  ['pass', C.pass, 'pass verdict'],
  ['termBg', C.termBg, 'terminal'],
];
const THUMB: Array<[string, string, string]> = [
  ['night', T.night, 'ground'],
  ['signal', T.signal, 'the hook'],
  ['paper', T.paper, 'props'],
  ['flare', T.flare, 'tension'],
  ['sun', T.sun, 'rare'],
];

const Swatch: React.FC<{ name: string; hex: string; role: string; dark?: boolean }> = ({ name, hex, role, dark }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 168 }}>
    <div style={{ height: 96, borderRadius: 12, background: hex, border: `2px solid ${dark ? '#2a352f' : C.rule}` }} />
    <span style={{ font: `600 22px/1 ${F.mono}`, color: C.ink }}>{name}</span>
    <span style={{ font: `400 20px/1 ${F.mono}`, color: C.muted }}>{hex}</span>
    <span style={{ font: `400 20px/1.1 ${F.body}`, color: C.muted }}>{role}</span>
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ margin: 0, font: `600 22px/1 ${F.mono}`, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.form }}>{children}</p>
);

const RdaStyleCard: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper }}>
    <PaperChrome page={1} of={1} />
    <div style={{ position: 'absolute', top: 120, left: 110, right: 110, display: 'flex', flexDirection: 'column', gap: 26 }}>
      <h1 style={{ margin: 0, font: `800 64px/1 ${F.display}`, letterSpacing: '-0.02em', color: C.ink }}>RDA style card</h1>

      <Label>Video palette</Label>
      <div style={{ display: 'flex', gap: 22 }}>
        {VIDEO.map(([n, h, r]) => (
          <Swatch key={n} name={n} hex={h} role={r} />
        ))}
      </div>

      <Label>Thumbnail palette (louder)</Label>
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
        {THUMB.map(([n, h, r]) => (
          <Swatch key={n} name={n} hex={h} role={r} dark={n === 'night'} />
        ))}
        {/* type and motifs */}
        <div style={{ marginLeft: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ font: `800 58px/1 ${F.display}`, letterSpacing: '-0.02em', color: C.ink }}>Bricolage Grotesque</span>
          <span style={{ font: `400 34px/1 ${F.body}`, color: C.ink }}>Source Sans 3 for body and lists</span>
          <span style={{ font: `400 28px/1 ${F.mono}`, color: C.form }}>$ IBM Plex Mono for commands</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 10 }}>
            <Bubble fill={0} size={52} label="A" />
            <Bubble fill={1} size={52} label="B" />
            <div style={{ position: 'relative' }}>
              <Bubble fill={1} size={52} color={C.ink} label="C" />
              <svg width={92} height={80} viewBox="0 0 92 80" style={{ position: 'absolute', left: -20, top: -14 }}>
                <path d="M 46 6 C 78 4, 90 30, 82 52 C 72 76, 22 80, 8 56 C -2 36, 14 8, 52 10" fill="none" stroke={C.pen} strokeWidth={5} strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ font: `800 40px/1 ${F.display}`, color: C.pass, border: `4px solid ${C.pass}`, borderRadius: 8, padding: '6px 14px', transform: 'rotate(-4deg)', marginLeft: 14 }}>PASS</div>
            <div style={{ background: C.termBg, color: C.termFg, font: `400 24px/1 ${F.mono}`, padding: '12px 16px', borderRadius: 10, marginLeft: 14 }}>$ rda status</div>
          </div>
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

export default RdaStyleCard;
