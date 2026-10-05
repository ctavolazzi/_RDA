import React from 'react';
import { VSCodeShell, ClaudeChatPanel } from '../../lib/kit';

export const compositionConfig = { id: 'PromptRocket', durationInSeconds: 7.8, fps: 30, width: 1920, height: 1080 };

const PromptRocket: React.FC = () => (
  <VSCodeShell>
    <ClaudeChatPanel prompt="a rocket launch station, Pixar style, 16:9 aspect ratio" responseLabel="Generating with the Level 2 skill…" />
  </VSCodeShell>
);
export default PromptRocket;
