import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, Img } from 'remotion';
import { Users, Film, Volume2, ArrowRight } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP, lib } from '../../lib/kit';

// v2 (#13): each element reveals ON ITS WORD CUE (P1). Master span 256.0 in:
// characters 260.35->f130 · scenes 261.58->f167 · voiceovers 266.62->f319 ·
// ElevenLabs 268.24->f367.
export const compositionConfig = { id: 'PipelineStages', durationInSeconds: 14, fps: 30, width: 1920, height: 1080 };

const CHARS = ['ref_mira.webp', 'ref_theo.webp', 'ref_rosa.webp'];
const CARD_AT = [130, 167, 319]; // characters · scenes · voiceovers
const ELEVEN_AT = 367;

const Waveform: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 120 }}>
      {Array.from({ length: 22 }).map((_, i) => {
        const h = 20 + Math.abs(Math.sin((frame + i * 9) / 7)) * 84;
        return <div key={i} style={{ width: 8, height: h, borderRadius: 6, background: COLORS.signal, opacity: 0.55 + 0.45 * Math.abs(Math.sin((frame + i * 9) / 7)) }} />;
      })}
    </div>
  );
};

const PipelineStages: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const card = (i: number) => {
    const s = CARD_AT[i];
    return {
      opacity: interpolate(frame, [s, s + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
      transform: `translateY(${interpolate(frame, [s, s + 16], [26, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
    };
  };

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.signal} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rise(4, 14), fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.accent, marginBottom: 16 }}>ONE&nbsp;DRAFT&nbsp;IN&nbsp;·&nbsp;A&nbsp;STORYBOOK&nbsp;OUT</div>
        <h1 style={{ ...rise(10), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 68, color: COLORS.ink, margin: 0, marginBottom: 48 }}>The skills generate everything</h1>

        <div style={{ display: 'flex', alignItems: 'stretch', gap: 22 }}>
          {/* Characters */}
          <div style={{ ...card(0), width: 420, padding: '30px', background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <Users size={30} color={COLORS.accent} strokeWidth={2.1} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 34, color: COLORS.ink }}>Full characters</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {CHARS.map((c) => (
                <div key={c} style={{ flex: 1, height: 190, borderRadius: RADIUS.panel, overflow: 'hidden', border: `1px solid ${COLORS.line}`, background: COLORS.cream }}>
                  <Img src={lib(`projects/example/storybook/${c}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 24, color: COLORS.muted, marginTop: 16 }}>consistent across every scene</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', ...card(1) }}><ArrowRight size={38} color={COLORS.muted} /></div>

          {/* Scenes */}
          <div style={{ ...card(1), width: 360, padding: '30px', background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <Film size={30} color={COLORS.accent2} strokeWidth={2.1} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 34, color: COLORS.ink }}>Full scenes</span>
            </div>
            <div style={{ height: 244, borderRadius: RADIUS.panel, overflow: 'hidden', border: `1px solid ${COLORS.line}`, background: COLORS.cream }}>
              <Img src={lib('projects/example/storybook/part_05.webp')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', ...card(2) }}><ArrowRight size={38} color={COLORS.muted} /></div>

          {/* Voiceover */}
          <div style={{ ...card(2), width: 360, padding: '30px', background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <Volume2 size={30} color={COLORS.signal} strokeWidth={2.1} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 34, color: COLORS.ink }}>Voiceovers</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Waveform /></div>
            {/* hidden until he says "ElevenLabs" (f367) */}
            <div style={{
              alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 10,
              background: COLORS.ink, color: COLORS.paper, borderRadius: RADIUS.pill, padding: '10px 20px', marginTop: 12,
              opacity: interpolate(frame, [ELEVEN_AT, ELEVEN_AT + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
              transform: `scale(${interpolate(frame, [ELEVEN_AT, ELEVEN_AT + 14], [0.85, 1], { ...CLAMP, easing: EASINGS.overshoot })})`,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.signalAlt }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 22 }}>ElevenLabs API</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default PipelineStages;
