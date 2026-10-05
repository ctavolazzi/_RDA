// V2 VS Code surface — same window chrome as kit's VSCodeShell but fully
// parameterized: custom explorer trees (expand/insert/highlight rows on cues),
// multiple editor groups (split view), an image-viewer pane and a typed code
// editor pane. Used by the split reveals (#4), skill pointer (#8), .env edit
// (#9) and the skills-in-project clip (#11). Frame-based only.
import React from 'react';
import { AbsoluteFill, interpolate, Img, useCurrentFrame } from 'remotion';
import {
  Files, Search, GitBranch, Play, LayoutGrid, Folder, FolderOpen, Settings, FileText, Braces,
  Image as ImageIcon, Info, MoreHorizontal, Lock, SplitSquareHorizontal, Clock, X, Plus,
  ChevronRight, ChevronDown, Check,
} from 'lucide-react';
import { FONT_BODY, FONT_MONO } from '../fonts';
import { Sunburst, V, VSC, CLAMP, lib, ClaudeChatPanel } from './kit';

// ---------------------------------------------------------------- explorer
export type ExplorerRow = {
  name: string;
  kind: 'folder' | 'file';
  depth?: number; // 0 = project root level
  open?: boolean; // folder expanded (chevron down)
  icon?: 'settings' | 'file' | 'braces' | 'image' | 'info' | 'markdown';
  iconColor?: string;
  mark?: string | null; // git letter
  dot?: boolean; // green activity dot (folders)
  appearAt?: number; // frame the row fades in (expanding folder)
  highlightAt?: number; // frame the row gets the selected/highlight treatment
};

const FILE_ICONS = {
  settings: { Icon: Settings, color: V.dim },
  file: { Icon: FileText, color: V.dim },
  braces: { Icon: Braces, color: '#c9a26b' },
  image: { Icon: ImageIcon, color: '#4ec98f' },
  info: { Icon: Info, color: '#4a9ee6' },
  markdown: { Icon: Info, color: '#4a9ee6' },
} as const;

// The default project tree (matches kit's VSCodeShell). Options let a shot
// expand one folder and splice extra rows right after it.
export const baseExplorer = (opts?: {
  expand?: string;
  insertAfter?: string;
  inserted?: ExplorerRow[];
}): ExplorerRow[] => {
  const folders = ['.claude\\skills', 'level-1-2-3-comparison', 'level1-examples', 'level2-examples', 'level3-examples', 'stories'];
  const files: ExplorerRow[] = [
    { name: '.env', kind: 'file', icon: 'settings' },
    { name: '.env.example', kind: 'file', icon: 'file', iconColor: '#c9a26b', mark: 'U' },
    { name: '.gitattributes', kind: 'file', icon: 'file', mark: 'U' },
    { name: '.gitignore', kind: 'file', icon: 'file', mark: 'U' },
    { name: '.mcp.json', kind: 'file', icon: 'braces', mark: 'U' },
    { name: 'out.jpg', kind: 'file', icon: 'image' },
    { name: 'README.md', kind: 'file', icon: 'info', mark: 'U' },
  ];
  const rows: ExplorerRow[] = [];
  for (const f of folders) {
    rows.push({ name: f, kind: 'folder', open: opts?.expand === f, dot: true });
    if (opts?.insertAfter === f && opts.inserted) rows.push(...opts.inserted);
  }
  rows.push(...files);
  return rows;
};

const ExplorerRowView: React.FC<{ row: ExplorerRow; frame: number }> = ({ row, frame }) => {
  const op = row.appearAt === undefined ? 1 : interpolate(frame, [row.appearAt, row.appearAt + 8], [0, 1], CLAMP);
  const hi = row.highlightAt === undefined ? 0 : interpolate(frame, [row.highlightAt, row.highlightAt + 8], [0, 1], CLAMP);
  const depth = row.depth ?? 0;
  const fi = row.icon ? FILE_ICONS[row.icon] : FILE_ICONS.file;
  const Icon = fi.Icon;
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
      padding: `5px 14px 5px ${(row.kind === 'folder' ? 22 : 40) + depth * 18}px`, opacity: op,
    }}>
      {hi > 0 && <div style={{ position: 'absolute', inset: 0, background: `rgba(205,128,100,${0.22 * hi})`, borderLeft: `3px solid ${V.coral}`, opacity: hi }} />}
      {row.kind === 'folder' ? (
        <>
          {row.open
            ? <ChevronDown size={15} color={V.dim} strokeWidth={2} style={{ position: 'relative' }} />
            : <span style={{ color: V.dim, fontSize: 16, width: 12, position: 'relative' }}>›</span>}
          {row.open
            ? <FolderOpen size={17} color="#c0a06a" strokeWidth={1.7} style={{ position: 'relative' }} />
            : <Folder size={17} color="#c0a06a" strokeWidth={1.7} style={{ position: 'relative' }} />}
        </>
      ) : (
        <Icon size={17} color={row.iconColor ?? fi.color} strokeWidth={1.7} style={{ position: 'relative' }} />
      )}
      <span style={{ fontSize: 18, color: hi > 0.5 ? '#fff' : V.text, flex: 1, position: 'relative', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</span>
      {row.mark && <span style={{ fontSize: 15, color: V.green, fontWeight: 600, position: 'relative' }}>{row.mark}</span>}
      {row.kind === 'folder' && row.dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: V.green, position: 'relative' }} />}
    </div>
  );
};

// ---------------------------------------------------------------- window
export type EditorGroup = {
  x: number; w: number;
  tab: { label: string; icon?: 'claude' | 'image' | 'file'; appearAt?: number };
  breadcrumb?: string[];
  children?: React.ReactNode;
};

const ActIcon: React.FC<{ Icon: React.FC<any>; active?: boolean; badge?: string }> = ({ Icon, active, badge }) => (
  <div style={{ position: 'relative', width: VSC.ACT_W, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: `2px solid ${active ? V.text : 'transparent'}` }}>
    <Icon size={26} color={active ? V.text : V.faint} strokeWidth={1.6} />
    {badge && <span style={{ position: 'absolute', bottom: 8, right: 9, background: V.blue, color: '#fff', fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, borderRadius: 8, padding: '0 5px', lineHeight: '16px' }}>{badge}</span>}
  </div>
);

const TabIcon: React.FC<{ icon?: 'claude' | 'image' | 'file' }> = ({ icon }) => {
  if (icon === 'image') return <ImageIcon size={17} color="#4ec98f" strokeWidth={1.8} />;
  if (icon === 'file') return <FileText size={17} color={V.dim} strokeWidth={1.8} />;
  return <Sunburst size={18} color={V.coral} />;
};

export const VSCodeWindow: React.FC<{
  rows: ExplorerRow[];
  groups: EditorGroup[];
  projectName?: string;
  // animated sidebar width (px). Pass a frame-derived value to collapse the
  // explorer (Ctrl+B style) and reclaim the room for editor content.
  sidebarW?: number;
  children?: React.ReactNode;
}> = ({ rows, groups, projectName = 'claude-image-generation', sidebarW = VSC.SB_W, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: V.editor, fontFamily: FONT_BODY }}>
      {/* title bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: VSC.TITLE_H, background: V.chrome, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${V.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingLeft: 16 }}>
          <Img src={lib('library/logos/vscode.webp')} style={{ width: 26, height: 26 }} />
          {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map((m) => (
            <span key={m} style={{ fontSize: 18, color: V.text, opacity: 0.85 }}>{m}</span>
          ))}
        </div>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10, width: 620, height: 30, background: '#2a2a2a', border: `1px solid ${V.border}`, borderRadius: 7, justifyContent: 'center' }}>
          <Search size={16} color={V.faint} />
          <span style={{ fontSize: 17, color: V.dim }}>{projectName}</span>
          <span style={{ fontSize: 17, color: V.faint }}>[Administrator]</span>
        </div>
        <div style={{ position: 'absolute', right: 0, display: 'flex', alignItems: 'center', gap: 26, paddingRight: 22, color: V.dim, fontSize: 18 }}>
          <LayoutGrid size={17} color={V.dim} /><span>—</span><span style={{ fontSize: 15 }}>▢</span><span>✕</span>
        </div>
      </div>
      {/* activity bar */}
      <div style={{ position: 'absolute', top: VSC.TITLE_H, left: 0, width: VSC.ACT_W, bottom: 0, background: V.chrome, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
          <ActIcon Icon={Files} active /><ActIcon Icon={Search} /><ActIcon Icon={GitBranch} badge="163" /><ActIcon Icon={Play} /><ActIcon Icon={LayoutGrid} />
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 6 }}><Sunburst size={26} color={V.coral} /></div>
        </div>
        <Settings size={26} color={V.faint} strokeWidth={1.6} />
      </div>
      {/* sidebar / explorer (width animatable; content stays fixed and clips) */}
      {sidebarW > 6 && (
        <div style={{ position: 'absolute', top: VSC.TITLE_H, left: VSC.SB_X, width: sidebarW, bottom: 0, background: V.sidebar, borderRight: `1px solid ${V.border}`, overflow: 'hidden' }}>
          <div style={{ width: VSC.SB_W, paddingTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 12px' }}>
              <span style={{ fontSize: 15, letterSpacing: 1, color: V.dim }}>EXPLORER</span><MoreHorizontal size={18} color={V.dim} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: V.text, padding: '6px 14px', letterSpacing: 0.4 }}>{projectName.toUpperCase()}</div>
            {rows.map((row, i) => <ExplorerRowView key={`${row.name}-${i}`} row={row} frame={frame} />)}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: VSC.SB_W, borderTop: `1px solid ${V.border}`, background: V.sidebar }}>
            {['OUTLINE', 'TIMELINE'].map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}><span style={{ color: V.dim }}>›</span><span style={{ fontSize: 15, letterSpacing: 1, color: V.dim }}>{s}</span></div>
            ))}
          </div>
        </div>
      )}
      {/* editor groups */}
      {groups.map((g, gi) => {
        const at = g.tab.appearAt ?? 0;
        const op = interpolate(frame, [at, at + 10], [0, 1], CLAMP);
        return (
          <React.Fragment key={gi}>
            {gi > 0 && <div style={{ position: 'absolute', top: VSC.TITLE_H, left: g.x, bottom: 0, width: 1, background: V.border, zIndex: 2 }} />}
            {/* tab bar */}
            <div style={{ position: 'absolute', top: VSC.TITLE_H, left: g.x, width: g.w, height: 40, background: V.chrome, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '100%', padding: '0 20px', background: V.editor, borderTop: `1px solid ${V.coral}`, borderRight: `1px solid ${V.border}`, opacity: op }}>
                <TabIcon icon={g.tab.icon} />
                <span style={{ fontSize: 18, color: V.text, whiteSpace: 'nowrap' }}>{g.tab.label}</span>
                <X size={17} color={V.dim} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingRight: 20 }}>
                {gi === groups.length - 1 && <><Sunburst size={18} color={V.coral} /><SplitSquareHorizontal size={18} color={V.dim} /><Lock size={17} color={V.coral} /></>}
                <MoreHorizontal size={18} color={V.dim} />
              </div>
            </div>
            {/* breadcrumb */}
            <div style={{ position: 'absolute', top: VSC.TITLE_H + 40, left: g.x, width: g.w, height: 34, background: V.editor, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', borderBottom: `1px solid ${V.border}`, opacity: op }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                {(g.breadcrumb ?? ['Untitled']).map((b, bi) => (
                  <React.Fragment key={bi}>
                    {bi > 0 && <ChevronRight size={14} color={V.faint} />}
                    <span style={{ fontSize: 17, color: V.dim, whiteSpace: 'nowrap' }}>{b}</span>
                  </React.Fragment>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16 }}><Clock size={16} color={V.dim} /><Plus size={16} color={V.dim} /></div>
            </div>
            {g.children}
          </React.Fragment>
        );
      })}
      {children}
    </AbsoluteFill>
  );
};

// content region below a group's tab + breadcrumb rows
export const GROUP_TOP = VSC.TITLE_H + 40 + 34;

// ---------------------------------------------------------------- image viewer pane
// VS Code image preview: checker backdrop behind the image, zoom badge.
export const ImageViewerPane: React.FC<{
  x: number; w: number; src: string; openAt?: number; imgW?: number; imgH?: number; caption?: string;
}> = ({ x, w, src, openAt = 0, imgW = 560, imgH, caption }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [openAt, openAt + 12], [0, 1], CLAMP);
  const sc = interpolate(frame, [openAt, openAt + 16], [0.96, 1], CLAMP);
  const checker = {
    backgroundImage:
      'linear-gradient(45deg, #262626 25%, transparent 25%), linear-gradient(-45deg, #262626 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #262626 75%), linear-gradient(-45deg, transparent 75%, #262626 75%)',
    backgroundSize: '26px 26px',
    backgroundPosition: '0 0, 0 13px, 13px -13px, -13px 0',
  } as const;
  return (
    <div style={{ position: 'absolute', top: GROUP_TOP, left: x, width: w, bottom: 0, background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: op }}>
      <div style={{ position: 'relative', transform: `scale(${sc})` }}>
        <div style={{ ...checker, position: 'absolute', inset: -18, borderRadius: 4, background: '#1a1a1a' }} />
        <Img src={src} style={{ position: 'relative', width: imgW, height: imgH, display: 'block', boxShadow: '0 18px 60px rgba(0,0,0,0.5)' }} />
      </div>
      <div style={{ position: 'absolute', right: 22, bottom: 18, fontFamily: FONT_MONO, fontSize: 17, color: V.dim, background: '#252525', border: `1px solid ${V.border}`, borderRadius: 6, padding: '4px 12px' }}>
        {caption ?? '100%'}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- split reveal
// Real-generation payoff INSIDE VS Code (#4): Claude chat left, the generated
// image opened as a file in a second editor group right, explorer shows the
// new file appear + highlight. Matches the reference screenshot.
export const VSCodeSplitReveal: React.FC<{
  prompt: string;
  filename: string;
  folder: string;
  src: string;
  doneLabel: string;
  imgW?: number;
  caption?: string;
  openAt?: number;
}> = ({ prompt, filename, folder, src, doneLabel, imgW = 560, caption, openAt = 42 }) => {
  const frame = useCurrentFrame();
  const LX = VSC.ED_X, LW = 747, RX = VSC.ED_X + LW, RW = 1920 - RX;
  const rows = baseExplorer({
    expand: folder,
    insertAfter: folder,
    inserted: [{ name: filename, kind: 'file', icon: 'image', depth: 1, appearAt: openAt - 4, highlightAt: openAt + 8 }],
  });
  const spinOp = interpolate(frame, [openAt - 10, openAt - 2], [1, 0], CLAMP);
  const doneOp = interpolate(frame, [openAt - 4, openAt + 8], [0, 1], CLAMP);
  return (
    <VSCodeWindow
      rows={rows}
      groups={[
        { x: LX, w: LW, tab: { label: 'Claude Code', icon: 'claude' }, breadcrumb: ['Claude Code'] },
        {
          x: RX, w: RW, tab: { label: filename, icon: 'image', appearAt: openAt }, breadcrumb: [folder, filename],
          children: <ImageViewerPane x={RX} w={RW} src={src} openAt={openAt + 4} imgW={imgW} caption={caption} />,
        },
      ]}
    >
      {/* chat panel in the LEFT group (prompt already sent — continues the prompt shot) */}
      <ClaudeChatPanel
        prompt={prompt}
        typeStart={-9999}
        region={{ x: LX, w: LW }}
        renderResponse={({ spin }) => (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: spinOp, marginBottom: 16 }}>
              <div style={{ transform: `rotate(${spin}deg)`, display: 'flex' }}><Sunburst size={24} color={V.coral} /></div>
              <span style={{ fontSize: 27, color: V.text, fontWeight: 600 }}>Generating image…</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: doneOp }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Check size={22} color={V.green} strokeWidth={3} />
                <span style={{ fontSize: 24, color: V.text }}>{doneLabel}</span>
              </div>
              <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 10, background: '#232323', border: `1px solid ${V.border}`, borderRadius: 10, padding: '10px 18px' }}>
                <ImageIcon size={20} color="#4ec98f" strokeWidth={1.8} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 22, color: V.text }}>{folder}/{filename}</span>
              </div>
              <span style={{ fontSize: 21, color: V.dim }}>Opened in the editor →</span>
            </div>
          </>
        )}
      />
    </VSCodeWindow>
  );
};

// ---------------------------------------------------------------- typed code pane
export type CodeSeg = [text: string, color: string];
export type CodeLine = CodeSeg[];

// Editor pane with line numbers; characters appear left-to-right across all
// lines (typing). typeStart/cps control the write-on; pass cps=Infinity-like
// large values for "fast writing".
export const CodeEditorPane: React.FC<{
  x: number; w: number; lines: CodeLine[]; typeStart?: number; cps?: number;
  fontSize?: number; appearAt?: number;
}> = ({ x, w, lines, typeStart = 10, cps = 30, fontSize = 26, appearAt = 0 }) => {
  const frame = useCurrentFrame();
  const paneOp = interpolate(frame, [appearAt, appearAt + 8], [0, 1], CLAMP);
  const shown = Math.max(0, Math.floor((frame - typeStart) * (cps / 30)));
  let used = 0;
  const lineH = fontSize * 1.62;
  const done = shown >= lines.reduce((n, l) => n + l.reduce((m, s) => m + s[0].length, 0), 0);
  const cursorOn = Math.floor(frame / 14) % 2 === 0;
  return (
    <div style={{ position: 'absolute', top: GROUP_TOP, left: x, width: w, bottom: 0, background: V.editor, padding: '18px 0', opacity: paneOp, overflow: 'hidden' }}>
      {lines.map((line, li) => {
        const chars = line.reduce((n, s) => n + s[0].length, 0);
        const from = used;
        used += chars;
        const visible = Math.max(0, Math.min(chars, shown - from));
        let left = visible;
        const isCursorLine = !done && shown >= from && shown < from + chars + 1;
        return (
          <div key={li} style={{ display: 'flex', height: lineH, alignItems: 'center' }}>
            <span style={{ width: 78, textAlign: 'right', paddingRight: 26, fontFamily: FONT_MONO, fontSize: fontSize - 5, color: '#5a5a5a', flexShrink: 0 }}>{li + 1}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize, whiteSpace: 'pre' }}>
              {line.map((seg, si) => {
                const take = Math.max(0, Math.min(seg[0].length, left));
                left -= take;
                return <span key={si} style={{ color: seg[1] }}>{seg[0].slice(0, take)}</span>;
              })}
              {isCursorLine && <span style={{ color: V.coral, opacity: cursorOn ? 1 : 0 }}>▌</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
};
