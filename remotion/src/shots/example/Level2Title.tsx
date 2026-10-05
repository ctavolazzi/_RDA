import React from 'react';
import { COLORS } from '../../brand';
import { LevelTitleShot } from '../../lib/kit';

export const compositionConfig = { id: 'Level2Title', durationInSeconds: 3.8, fps: 30, width: 1920, height: 1080 };

const Level2Title: React.FC = () => (
  <LevelTitleShot n="02" title="3D · Code" subtitle="3D renders via JavaScript — still no AI model" color={COLORS.accent2} />
);
export default Level2Title;
