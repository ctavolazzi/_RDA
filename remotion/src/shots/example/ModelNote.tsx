import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Sparkles } from 'lucide-react';
import { COLORS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise } from '../../lib/kit';

// 7.5 — v2 (#14): retimed to the actual line. Master span 276.8–280.5, model
// pills land on "Gemini and Seedream" (279.2/279.8 -> f66/f82). Cuts back to
// Presenter says this BEFORE "But the point isn't the model" (280.6) — no pre-empt (P2).
export const compositionConfig = { id: 'ModelNote', durationInSeconds: 3.8, fps: 30, width: 1920, height: 1080 };

const MODELS = [
  { name: 'Gemini', color: COLORS.accent, at: 66 },
  { name: 'Seedream', color: COLORS.danger, at: 82 },
];

const ModelNote: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.warn} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 180px' }}>
        <div style={{ ...rise(2, 14), fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.muted, marginBottom: 22 }}>AN&nbsp;HONEST&nbsp;NOTE</div>
        <h1 style={{ ...rise(6), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 66, color: COLORS.ink, margin: 0, marginBottom: 54, textAlign: 'center', lineHeight: 1.1 }}>
          For the exact quality here,<br />I use stronger models
        </h1>

        <div style={{ display: 'flex', gap: 26 }}>
          {MODELS.map((m) => (
            <div key={m.name} style={{
              ...rise(m.at, 18),
              display: 'flex', alignItems: 'center', gap: 14,
              background: COLORS.paper, border: `1px solid ${m.color}55`, borderRadius: RADIUS.pill,
              padding: '18px 34px', boxShadow: SHADOW.card,
            }}>
              <Sparkles size={30} color={m.color} strokeWidth={2} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 42, color: COLORS.ink }}>{m.name}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default ModelNote;
