import React from 'react';
import { V, VSC } from '../../lib/kit';
import { VSCodeWindow, CodeEditorPane, baseExplorer, CodeLine } from '../../lib/vscode';

// =============================================================================
// #9 — "…set your Cloudflare keys in the .env file" (203.0–205). Real UI for
// config (P4): .env open in VS Code, the two keys typed in. Replaces the old
// EnvChip overlay. Master span ~202.5–208.0.
// =============================================================================
export const compositionConfig = { id: 'EnvEdit', durationInSeconds: 5.6, fps: 30, width: 1920, height: 1080 };

const C_COMMENT = '#6a9955', C_KEY = '#4ec98f', C_EQ = V.dim, C_VAL = '#ce9178';
const LINES: CodeLine[] = [
  [['# Cloudflare Workers AI keys (level 3)', C_COMMENT]],
  [['CLOUDFLARE_ACCOUNT_ID', C_KEY], ['=', C_EQ], ['9a41f6c2d8e07b53a1c4', C_VAL]],
  [['CLOUDFLARE_API_TOKEN', C_KEY], ['=', C_EQ], ['cf-Xq81LmR4vN7wKp2Ye6Tz', C_VAL]],
];

const EnvEdit: React.FC = () => {
  const rows = baseExplorer().map((r) => (r.name === '.env' ? { ...r, highlightAt: 8 } : r));
  return (
    <VSCodeWindow
      rows={rows}
      groups={[{
        x: VSC.ED_X, w: VSC.ED_W,
        tab: { label: '.env', icon: 'file' },
        breadcrumb: ['.env'],
        children: <CodeEditorPane x={VSC.ED_X + 20} w={VSC.ED_W - 40} lines={LINES} typeStart={22} cps={26} fontSize={30} />,
      }]}
    />
  );
};
export default EnvEdit;
