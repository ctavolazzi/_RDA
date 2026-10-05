import React from 'react';
import { Check, Loader, Circle } from 'lucide-react';
import { FONT_BODY, FONT_MONO } from '../../fonts';
import { ClaudeChatPanel, Sunburst, V, VSC } from '../../lib/kit';
import { VSCodeWindow, baseExplorer } from '../../lib/vscode';

// =============================================================================
// #11 stage 2 — "In this project, I built multiple skills that run in a
// sequence. You can see them here." (235.9–240.9). The ACTUAL skills in the
// project: explorer shows .claude\skills expanded, each skill highlighting in
// order while the chat shows the pipeline running (echoes the 0:25 beat).
// Master span 235.9–241.0.
// =============================================================================
export const compositionConfig = { id: 'SkillsInProject', durationInSeconds: 5.2, fps: 30, width: 1920, height: 1080 };

const SKILLS = ['scene-splitter', 'story-illustrator', 'story-narrator', 'story-html-publisher'];
const STEP0 = 58, STEP_GAP = 20; // "run in a sequence" 238.5 -> f77; "see them here" 240.05 -> f124

const STEPS = [
  { name: 'scene-splitter', detail: '10 scenes' },
  { name: 'story-illustrator', detail: '10 images · consistent characters' },
  { name: 'story-narrator', detail: 'voiceovers' },
  { name: 'story-html-publisher', detail: 'the HTML book' },
];

const SkillsInProject: React.FC = () => {
  const rows = baseExplorer({
    expand: '.claude\\skills',
    insertAfter: '.claude\\skills',
    inserted: SKILLS.map((s, i) => ({
      name: s, kind: 'folder' as const, depth: 1,
      appearAt: 10 + i * 6, highlightAt: STEP0 + i * STEP_GAP,
    })),
  });
  return (
    <VSCodeWindow
      rows={rows}
      groups={[{ x: VSC.ED_X, w: VSC.ED_W, tab: { label: 'Claude Code', icon: 'claude' }, breadcrumb: ['Claude Code'] }]}
    >
      <ClaudeChatPanel
        prompt="run the storybook pipeline on the-three-gardeners.md"
        typeStart={-9999}
        renderResponse={({ frame, spin, r }) => (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <Sunburst size={24} color={V.coral} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 26, color: V.text, fontWeight: 600 }}>storybook-pipeline</span>
              <span style={{ fontSize: 22, color: V.dim }}>4 skills · in sequence</span>
            </div>
            <div style={{ background: '#232323', border: `1px solid ${V.border}`, borderRadius: 12, padding: '16px 28px' }}>
              {STEPS.map((s, i) => {
                const start = STEP0 + i * STEP_GAP;
                const op = r(10 + i * 6, 22 + i * 6);
                let state = 0;
                if (frame >= start) state = 1;
                if (frame >= start + STEP_GAP && i < STEPS.length - 1) state = 2;
                return (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: op, padding: '8px 0' }}>
                    <div style={{ width: 28, display: 'flex', justifyContent: 'center' }}>
                      {state === 2 ? <Check size={24} color={V.green} strokeWidth={3} />
                        : state === 1 ? <div style={{ transform: `rotate(${spin}deg)`, display: 'flex' }}><Loader size={24} color={V.coral} strokeWidth={2.4} /></div>
                        : <Circle size={20} color={V.faint} strokeWidth={2} />}
                    </div>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 27, color: state === 0 ? V.faint : V.text, fontWeight: 500 }}>{s.name}</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 24, color: state === 2 ? V.green : state === 1 ? V.coral : V.faint }}>{s.detail}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, opacity: r(STEP0 + 60, STEP0 + 74) }}>
              <span style={{ fontSize: 24, color: V.dim }}>Each skill lives in <span style={{ fontFamily: FONT_MONO, color: V.text }}>.claude\skills</span> ← right here</span>
            </div>
          </>
        )}
      />
    </VSCodeWindow>
  );
};
export default SkillsInProject;
