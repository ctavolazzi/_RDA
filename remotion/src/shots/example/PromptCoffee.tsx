import React from 'react';
import { VSCodeShell, ClaudeChatPanel } from '../../lib/kit';

export const compositionConfig = { id: 'PromptCoffee', durationInSeconds: 6.6, fps: 30, width: 1920, height: 1080 };

const PromptCoffee: React.FC = () => (
  <VSCodeShell>
    <ClaudeChatPanel prompt="generate a logo for a coffee shop with level-1-image-generator" responseLabel="Generating with the Level 1 skill…" />
  </VSCodeShell>
);
export default PromptCoffee;
