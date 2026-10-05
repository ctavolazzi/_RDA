import React from 'react';
import { lib } from '../../lib/kit';
import { VSCodeSplitReveal } from '../../lib/vscode';

// 5.3 "here we are, the generated PNG … look at this output" — the 3D render
// opened as a file next to the chat.
export const compositionConfig = { id: 'RevealRocket', durationInSeconds: 8.4, fps: 30, width: 1920, height: 1080 };

const RevealRocket: React.FC = () => (
  <VSCodeSplitReveal
    prompt="a rocket launch station, Pixar style, 16:9 aspect ratio"
    filename="rocket.webp"
    folder="level2-examples"
    src={lib('projects/example/examples/rocket.webp')}
    doneLabel="Generated the PNG. A 3D render via Three.js."
    imgW={680}
  />
);
export default RevealRocket;
