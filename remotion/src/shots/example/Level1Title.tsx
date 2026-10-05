import React from 'react';
import { COLORS } from '../../brand';
import { LevelTitleShot } from '../../lib/kit';

export const compositionConfig = { id: 'Level1Title', durationInSeconds: 3.6, fps: 30, width: 1920, height: 1080 };

const Level1Title: React.FC = () => (
  <LevelTitleShot n="01" title="Code-driven" subtitle="Claude writes code that renders a PNG" color={COLORS.accent} />
);
export default Level1Title;
