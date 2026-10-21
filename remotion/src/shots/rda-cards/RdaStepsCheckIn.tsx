import React from 'react';
import { Scene, StepsCard, Step } from '../../lib/rda';

// =============================================================================
// COMPOSITION CONFIG · the check-in that opens the next video: last video's steps, graded (D22).
// A SAMPLE preview of the kit's StepsCard. A missed step gets a red-pen ring and NOT DONE, said out
// loud too: the honesty is the point. Use the real result, never the hoped-for one.
// Render: cd remotion && node scripts/render-one.mjs rda-cards RdaStepsCheckIn --still 180 --scale=1
// =============================================================================
export const compositionConfig = {
  id: 'RdaStepsCheckIn',
  durationInSeconds: 10,
  fps: 30,
  width: 1920,
  height: 1080,
};

// Illustrative only, and labeled on screen as a sample. One miss on purpose, to show both states.
const SAMPLE: Step[] = [
  { text: 'Set the stakes for episode 001', done: true },
  { text: 'Book a volunteer examiner session', done: true },
  { text: 'Film the hook and the baseline', done: false },
];

const RdaStepsCheckIn: React.FC = () => (
  <Scene dur={compositionConfig.durationInSeconds * compositionConfig.fps}>
    <StepsCard mode="check" steps={SAMPLE} sample />
  </Scene>
);

export default RdaStepsCheckIn;
