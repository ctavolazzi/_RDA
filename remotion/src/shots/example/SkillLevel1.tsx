import React from 'react';
import { V, VSC } from '../../lib/kit';
import { VSCodeWindow, CodeEditorPane, baseExplorer, CodeLine } from '../../lib/vscode';

// =============================================================================
// #5 payoff (1:42) — "And what I did is I turned this into a Claude skill. You
// can see it here." (100.97–105.36). VS Code points at the LEVEL-1 skill:
// explorer expands .claude\skills -> level-1-image-generator, SKILL.md opens
// and fast-writes. Master span 101.0–108.8. "you can see it here" 104.40 ->
// local f102, so the SKILL.md is open + highlighted by then.
// =============================================================================
export const compositionConfig = { id: 'SkillLevel1', durationInSeconds: 7.8, fps: 30, width: 1920, height: 1080 };

const MD_KEY = '#4a9ee6', MD_HEAD = '#c9a26b', MD_TEXT = V.text, MD_DIM = V.faint;
const LINES: CodeLine[] = [
  [['---', MD_DIM]],
  [['name: ', MD_KEY], ['level-1-image-generator', MD_TEXT]],
  [['description: ', MD_KEY], ['Generate images by writing code that', MD_TEXT]],
  [['  renders a PNG — diagrams, charts, graphics, logos.', MD_TEXT]],
  [['---', MD_DIM]],
  [['', MD_TEXT]],
  [['# Level 1 · Code-Driven Image Generation', MD_HEAD]],
  [['', MD_TEXT]],
  [['## Steps', MD_HEAD]],
  [['1. Read the prompt and choose the renderer (SVG / canvas).', MD_TEXT]],
  [['2. Write code that draws the graphic.', MD_TEXT]],
  [['3. Render it to a PNG and open it. No AI model needed.', MD_TEXT]],
];

const SkillLevel1: React.FC = () => {
  const rows = baseExplorer({
    expand: '.claude\\skills',
    insertAfter: '.claude\\skills',
    inserted: [
      { name: 'level-1-image-generator', kind: 'folder', depth: 1, open: true, appearAt: 8, highlightAt: 60 },
      { name: 'SKILL.md', kind: 'file', icon: 'info', depth: 2, appearAt: 14, highlightAt: 92 },
    ],
  });
  return (
    <VSCodeWindow
      rows={rows}
      groups={[{
        x: VSC.ED_X, w: VSC.ED_W,
        tab: { label: 'SKILL.md', icon: 'file', appearAt: 92 },
        breadcrumb: ['.claude\\skills', 'level-1-image-generator', 'SKILL.md'],
        children: <CodeEditorPane x={VSC.ED_X + 20} w={VSC.ED_W - 40} lines={LINES} typeStart={104} cps={150} appearAt={92} />,
      }]}
    />
  );
};
export default SkillLevel1;
