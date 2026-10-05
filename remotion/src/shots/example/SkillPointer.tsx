import React from 'react';
import { V, VSC } from '../../lib/kit';
import { VSCodeWindow, CodeEditorPane, baseExplorer, CodeLine } from '../../lib/vscode';

// =============================================================================
// #8 — "…I created the implementation as a skill in the project so you can
// consume easily." (180.5–184.6). VS Code pointing at the level-3 skill:
// explorer expands .claude\skills -> level-3-image-generator, SKILL.md opens
// and fast-writes. Master span ~180.0–185.8.
// =============================================================================
export const compositionConfig = { id: 'SkillPointer', durationInSeconds: 6, fps: 30, width: 1920, height: 1080 };

const MD_KEY = '#4a9ee6', MD_HEAD = '#c9a26b', MD_TEXT = V.text, MD_DIM = V.faint;
const LINES: CodeLine[] = [
  [['---', MD_DIM]],
  [['name: ', MD_KEY], ['level-3-image-generator', MD_TEXT]],
  [['description: ', MD_KEY], ['Generate real AI images with Cloudflare', MD_TEXT]],
  [['  Workers AI (Flux). Free tier: 10,000 neurons per day.', MD_TEXT]],
  [['---', MD_DIM]],
  [['', MD_TEXT]],
  [['# Level 3 · Real AI Image Generation', MD_HEAD]],
  [['', MD_TEXT]],
  [['## Steps', MD_HEAD]],
  [['1. Read the prompt and the desired aspect ratio.', MD_TEXT]],
  [['2. Call Workers AI (flux-1-schnell) with the keys in .env.', MD_TEXT]],
  [['3. Save the PNG into the project and open it.', MD_TEXT]],
];

const SkillPointer: React.FC = () => {
  const rows = baseExplorer({
    expand: '.claude\\skills',
    insertAfter: '.claude\\skills',
    inserted: [
      { name: 'level-3-image-generator', kind: 'folder', depth: 1, open: true, appearAt: 10, highlightAt: 46 },
      { name: 'SKILL.md', kind: 'file', icon: 'info', depth: 2, appearAt: 16, highlightAt: 58 },
    ],
  });
  return (
    <VSCodeWindow
      rows={rows}
      groups={[{
        x: VSC.ED_X, w: VSC.ED_W,
        tab: { label: 'SKILL.md', icon: 'file', appearAt: 58 },
        breadcrumb: ['.claude\\skills', 'level-3-image-generator', 'SKILL.md'],
        children: <CodeEditorPane x={VSC.ED_X + 20} w={VSC.ED_W - 40} lines={LINES} typeStart={66} cps={130} appearAt={58} />,
      }]}
    />
  );
};
export default SkillPointer;
