import React from 'react';
import { COLORS } from '../../brand';
import { LevelTitleShot } from '../../lib/kit';

export const compositionConfig = { id: 'Level3Title', durationInSeconds: 3.8, fps: 30, width: 1920, height: 1080 };

const Level3Title: React.FC = () => (
  <LevelTitleShot n="03" title="Real AI" subtitle="Real image models — generated for free" color={COLORS.signal} />
);
export default Level3Title;
