import React from 'react';
import { lib } from '../../lib/kit';
import { VSCodeSplitReveal } from '../../lib/vscode';

// 6.7 "That's a real AI image from a real model generated for free" — the Flux
// result opened as a file next to the chat.
export const compositionConfig = { id: 'RevealBookstore', durationInSeconds: 8.8, fps: 30, width: 1920, height: 1080 };

const RevealBookstore: React.FC = () => (
  <VSCodeSplitReveal
    prompt="Generate an image of a cozy bookstore cafe on a rainy evening. Warm light in the window."
    filename="bookstore-cafe.webp"
    folder="level3-examples"
    src={lib('projects/example/examples/bookstore-cafe.webp')}
    doneLabel="Generated with Workers AI (Flux). Totally free."
    imgW={600}
  />
);
export default RevealBookstore;
