import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ScrollText } from 'lucide-react';
import { COLORS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise } from '../../lib/kit';

// v2 (#12): starts immediately after SkillsInProject (no camera gap) — master
// span 241.0–254.8, so the comp runs 14s.
export const compositionConfig = { id: 'SkillDefinition', durationInSeconds: 14, fps: 30, width: 1920, height: 1080 };

const SkillDefinition: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent2} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 200px' }}>
        <div style={{ ...rise(4, 14), fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.accent2, marginBottom: 26 }}>WHAT&nbsp;IS&nbsp;A&nbsp;SKILL?</div>

        <div style={{ ...rise(10, 20), display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
          <div style={{ width: 96, height: 96, borderRadius: RADIUS.card, background: `${COLORS.accent2}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ScrollText size={48} color={COLORS.accent2} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 108, color: COLORS.ink, lineHeight: 1 }}>skill</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 28, color: COLORS.muted, marginTop: 4 }}>/ a recipe you save /</div>
          </div>
        </div>

        <div style={{ ...rise(22, 18), fontSize: 46, lineHeight: 1.4, color: COLORS.ink, textAlign: 'center', maxWidth: 1300, marginTop: 24 }}>
          A set of <span style={{ color: COLORS.accent2, fontWeight: 600 }}>prompts + instructions</span> you save for Claude Code, so it follows the same steps every time.
        </div>

        <div style={{ ...rise(40, 16), marginTop: 44, fontFamily: FONT_MONO, fontSize: 26, color: COLORS.muted, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill, padding: '14px 28px', boxShadow: SHADOW.soft }}>
          here → generating a full storybook
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SkillDefinition;
