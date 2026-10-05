import React from 'react';
import { Check, Loader, Circle } from 'lucide-react';
import { FONT_BODY, FONT_MONO } from '../../fonts';
import { VSCodeShell, ClaudeChatPanel, Sunburst, V } from '../../lib/kit';

// =============================================================================
// COMPOSITION CONFIG — full VS Code window (Claude Code extension panel)
// beats 2.2 + 2.3: type the story-pipeline prompt, then the 4 real skills run
// =============================================================================
export const compositionConfig = { id: 'StoryPipelinePrompt', durationInSeconds: 8.2, fps: 30, width: 1920, height: 1080 };

const STEPS = [
  { name: 'scene-splitter', detail: '10 scenes' },
  { name: 'story-illustrator', detail: '10 images · consistent characters' },
  { name: 'story-narrator', detail: 'generating voiceovers…' },
  { name: 'story-html-publisher', detail: 'building the HTML book…' },
];
const STEP_GAP = 24;

const StepRow: React.FC<{ name: string; detail: string; state: number; op: number; spin: number }> = ({ name, detail, state, op, spin }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: op, padding: '8px 0' }}>
    <div style={{ width: 28, display: 'flex', justifyContent: 'center' }}>
      {state === 2 ? <Check size={24} color={V.green} strokeWidth={3} />
        : state === 1 ? <div style={{ transform: `rotate(${spin}deg)`, display: 'flex' }}><Loader size={24} color={V.coral} strokeWidth={2.4} /></div>
        : <Circle size={20} color={V.faint} strokeWidth={2} />}
    </div>
    <span style={{ fontFamily: FONT_MONO, fontSize: 27, color: state === 0 ? V.faint : V.text, fontWeight: 500 }}>{name}</span>
    <span style={{ fontFamily: FONT_BODY, fontSize: 24, color: state === 2 ? V.green : state === 1 ? V.coral : V.faint }}>{detail}</span>
  </div>
);

const StoryPipelinePrompt: React.FC = () => (
  <VSCodeShell>
    <ClaudeChatPanel
      prompt="run the storybook pipeline on the-three-gardeners.md"
      renderResponse={({ frame, send, spin, r }) => {
        const STEP0 = send + 16;
        return (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <Sunburst size={24} color={V.coral} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 26, color: V.text, fontWeight: 600 }}>storybook-pipeline</span>
              <span style={{ fontSize: 22, color: V.dim }}>4 skills · in sequence</span>
            </div>
            <div style={{ background: '#232323', border: `1px solid ${V.border}`, borderRadius: 12, padding: '16px 28px' }}>
              {STEPS.map((s, i) => {
                const start = STEP0 + i * STEP_GAP;
                const op = r(start - 8, start + 6);
                let state = 0;
                if (frame >= start) state = 1;
                if (i < STEPS.length - 1 && frame >= start + STEP_GAP) state = 2;
                return <StepRow key={s.name} name={s.name} detail={s.detail} state={state} op={op} spin={spin} />;
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, opacity: r(STEP0 + 6, STEP0 + 20) }}>
              <div style={{ transform: `rotate(${spin}deg)`, display: 'flex' }}><Loader size={22} color={V.dim} strokeWidth={2.2} /></div>
              <span style={{ fontSize: 24, color: V.dim }}>Running the pipeline… this takes a few minutes</span>
            </div>
          </>
        );
      }}
    />
  </VSCodeShell>
);

export default StoryPipelinePrompt;
