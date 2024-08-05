export const isHappenWithProbality = (percent: number): boolean => {
  if (percent < 0 || percent > 1) throw new Error('percent must be smaller than 1 and bigger than 0');

  return Math.random() <= percent;
};
