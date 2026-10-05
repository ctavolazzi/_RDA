import React from 'react';
import { VSCodeShell, ClaudeChatPanel } from '../../lib/kit';

export const compositionConfig = { id: 'PromptBookstore', durationInSeconds: 6.8, fps: 30, width: 1920, height: 1080 };

const PromptBookstore: React.FC = () => (
  <VSCodeShell>
    <ClaudeChatPanel
      prompt="Generate an image of a cozy bookstore cafe on a rainy evening, warm light in the window"
      perChar={1.0}
      responseLabel="Generating with Flux…"
    />
  </VSCodeShell>
);
export default PromptBookstore;
