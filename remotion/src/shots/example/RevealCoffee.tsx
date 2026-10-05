import React from 'react';
import { lib } from '../../lib/kit';
import { VSCodeSplitReveal } from '../../lib/vscode';

// 4.3 "Claude generates our PNG image. Perfect." — the real result INSIDE VS
// Code: chat left, coffee-shop-logo.webp opened in a split editor pane right.
export const compositionConfig = { id: 'RevealCoffee', durationInSeconds: 6.8, fps: 30, width: 1920, height: 1080 };

const RevealCoffee: React.FC = () => (
  <VSCodeSplitReveal
    prompt="generate a logo for a coffee shop with level-1-image-generator"
    filename="coffee-shop-logo.webp"
    folder="level-1-2-3-comparison"
    src={lib('projects/example/examples/coffee-shop-logo.webp')}
    doneLabel="Generated the PNG. Rendered from code, no AI model."
    imgW={560}
  />
);
export default RevealCoffee;
