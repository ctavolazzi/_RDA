import vo from './_vo.json';

// =============================================================================
// VOICE LAYOUT · each scene's Voice: lines (videos/humanoid-2490/script/script.md),
// placed one after another from their measured lengths in _vo.json (written by
// tools/narrate.py): LEAD frames in, GAP between lines (plus any pause), TAIL out.
// Scene durations and cue frames come from here, so the picture follows the voice
// and a re-recorded line (CT's own voice) re-times its scene by itself.
// =============================================================================
type Line = { text: string; file: string; frames: number };
const LINES = vo.lines as Record<string, Line>;
export const LEAD = 12;
export const GAP = 9;
export const TAIL = 18;

export type Layout = { ids: string[]; texts: string[]; files: string[]; starts: number[]; ends: number[]; dur: number };

/** `pauses[i]` adds frames after line i; `tail` and `lead` override the defaults. */
export const layout = (scene: number, opts: { pauses?: Record<number, number>; tail?: number; lead?: number } = {}): Layout => {
  const ids = Object.keys(LINES).filter((k) => k.split('.')[0] === `S${scene}`);
  if (!ids.length) throw new Error(`No voice lines for S${scene}; run tools/narrate.py videos/humanoid-2490`);
  let t = opts.lead ?? LEAD;
  const starts: number[] = [];
  const ends: number[] = [];
  ids.forEach((id, i) => {
    starts.push(t);
    t += LINES[id].frames;
    ends.push(t);
    t += GAP + (opts.pauses?.[i] ?? 0);
  });
  return {
    ids,
    texts: ids.map((id) => LINES[id].text),
    files: ids.map((id) => LINES[id].file),
    starts,
    ends,
    dur: ends[ends.length - 1] + (opts.tail ?? TAIL),
  };
};

/**
 * About when `phrase` is spoken in line `i`: the line's start plus the share of its characters
 * before the phrase. Kokoro gives no word times, so this is an estimate for animation timing only
 * (within a few frames at its even pace); it is never shown as data.
 */
export const cueAt = (L: Layout, i: number, phrase: string) => {
  const text = L.texts[i];
  const k = text.indexOf(phrase);
  if (k < 0) throw new Error(`"${phrase}" is not in line ${i} of ${L.ids[0]}: ${text}`);
  return Math.round(L.starts[i] + (L.ends[i] - L.starts[i]) * (k / text.length));
};
