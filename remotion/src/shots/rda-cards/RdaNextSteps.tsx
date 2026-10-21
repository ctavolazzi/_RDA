import React from 'react';
import { Scene, StepsCard, Step } from '../../lib/rda';

// =============================================================================
// COMPOSITION CONFIG · the close of every video: "My next few steps" (D22).
// A SAMPLE preview of the kit's StepsCard. For an episode, render StepsCard with that episode's real
// steps; the next video opens with RdaStepsCheckIn, grading the same steps.
// Render: cd remotion && node scripts/render-one.mjs rda-cards RdaNextSteps --still 150 --scale=1
// =============================================================================
export const compositionConfig = {
  id: 'RdaNextSteps',
  durationInSeconds: 9,
  fps: 30,
  width: 1920,
  height: 1080,
};

// Illustrative only, and labeled on screen as a sample.
const SAMPLE: Step[] = [
  { text: 'Set the stakes for episode 001', when: 'this week' },
  { text: 'Book a volunteer examiner session', when: 'this week' },
  { text: 'Film the hook and the baseline', when: 'before studying' },
];

const RdaNextSteps: React.FC = () => (
  <Scene dur={compositionConfig.durationInSeconds * compositionConfig.fps}>
    <StepsCard mode="next" steps={SAMPLE} sample />
  </Scene>
);

export default RdaNextSteps;
