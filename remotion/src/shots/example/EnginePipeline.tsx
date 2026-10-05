import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { FileText, Scissors, Image, Mic, Code, BookOpen, ArrowRight, Plus, ScrollText, Sparkles } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP, Sunburst } from '../../lib/kit';

// =============================================================================
// 7.1 — v2 staging (#11): FIRST the combination lockup ("Claude Code + Skills
// + Image Models", each part on its word cue), THEN the pipeline chain below
// on "running as a full pipeline". Master span 228.0–235.9.
// Cues local: custom skills 229.45->f44 · image models 231.62->f109 ·
// full pipeline 233.28->f158.
// =============================================================================
export const compositionConfig = { id: 'EnginePipeline', durationInSeconds: 8, fps: 30, width: 1920, height: 1080 };

const COMBO = [
  { label: 'Claude Code', icon: 'claude' as const, color: COLORS.ink, at: 4 },
  { label: 'Skills', icon: 'scroll' as const, color: COLORS.accent, at: 44 },
  { label: 'Image Models', icon: 'sparkles' as const, color: COLORS.signal, at: 109 },
];
const PIPE_IN = 158;
const NODES = [
  { icon: FileText, name: 'story draft', kind: 'io', color: COLORS.muted },
  { icon: Scissors, name: 'scene-splitter', kind: 'skill', color: COLORS.accent },
  { icon: Image, name: 'story-illustrator', kind: 'skill', color: COLORS.accent2 },
  { icon: Mic, name: 'story-narrator', kind: 'skill', color: COLORS.signal },
  { icon: Code, name: 'story-html-publisher', kind: 'skill', color: COLORS.accent },
  { icon: BookOpen, name: 'storybook', kind: 'io', color: COLORS.ink },
];

const EnginePipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rise(4, 14), fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.accent, marginBottom: 40 }}>THE&nbsp;ENGINE</div>

        {/* stage 1 — the combination, each part on its cue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginBottom: 64 }}>
          {COMBO.map((c, i) => {
            const op = interpolate(frame, [c.at, c.at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const y = interpolate(frame, [c.at, c.at + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
            const plusOp = interpolate(frame, [c.at - 4, c.at + 8], [0, 1], { ...CLAMP });
            return (
              <React.Fragment key={c.label}>
                {i > 0 && <Plus size={44} color={COLORS.muted} strokeWidth={2.6} style={{ opacity: plusOp }} />}
                <div style={{
                  opacity: op, transform: `translateY(${y}px)`,
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: COLORS.paper, border: `2px solid ${c.color}`,
                  borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '22px 34px',
                }}>
                  {c.icon === 'claude' ? <Sunburst size={38} color="#cd8064" />
                    : c.icon === 'scroll' ? <ScrollText size={38} color={c.color} strokeWidth={2} />
                    : <Sparkles size={38} color={c.color} strokeWidth={2} />}
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 46, color: COLORS.ink }}>{c.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* stage 2 — "running as a full pipeline": the chain reveals below */}
        <div style={{ ...rise(PIPE_IN, 16), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 34, color: COLORS.muted, marginBottom: 30 }}>
          running as one full pipeline
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {NODES.map((n, i) => {
            const start = PIPE_IN + 8 + i * 7;
            const appear = interpolate(frame, [start, start + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const y = interpolate(frame, [start, start + 12], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });
            const lit = interpolate(frame, [start + 10, start + 22], [0, 1], CLAMP);
            const Icon = n.icon;
            return (
              <React.Fragment key={n.name}>
                {i > 0 && <ArrowRight size={32} color={COLORS.muted} strokeWidth={2.2} style={{ opacity: appear }} />}
                <div style={{
                  width: 224, opacity: appear, transform: `translateY(${y}px)`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  padding: '22px 12px', borderRadius: RADIUS.card,
                  background: n.kind === 'io' ? COLORS.cream : COLORS.paper,
                  border: `${n.kind === 'skill' ? 2 : 1}px solid ${lit > 0.5 ? n.color : COLORS.line}`,
                  boxShadow: lit > 0.5 ? SHADOW.card : 'none',
                }}>
                  <div style={{ width: 58, height: 58, borderRadius: '50%', background: `${n.color}${lit > 0.5 ? '18' : '0c'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={28} color={lit > 0.5 ? n.color : COLORS.d400} strokeWidth={2.1} />
                  </div>
                  <span style={{ fontFamily: n.kind === 'skill' ? FONT_MONO : FONT_DISPLAY, fontWeight: n.kind === 'skill' ? 500 : 600, fontSize: n.kind === 'skill' ? 20 : 23, color: COLORS.ink, textAlign: 'center' }}>{n.name}</span>
                  {n.kind === 'skill' && <span style={{ fontFamily: FONT_MONO, fontSize: 14, letterSpacing: 1, color: n.color, opacity: lit }}>SKILL</span>}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default EnginePipeline;
