export function toGpaPoint(finalScore) {
  if (finalScore >= 8.5) return 4.0;
  if (finalScore >= 8.0) return 3.5;
  if (finalScore >= 7.0) return 3.0;
  if (finalScore >= 6.5) return 2.5;
  if (finalScore >= 5.5) return 2.0;
  if (finalScore >= 5.0) return 1.5;
  if (finalScore >= 4.0) return 1.0;
  return 0;
}

export function calculateWeightedFinalScore(components) {
  const totalWeight = components.reduce((sum, item) => sum + item.weight, 0);
  if (Math.abs(totalWeight - 1) > 0.001) {
    throw new Error("Total component weight must equal 1");
  }

  const score = components.reduce((sum, item) => sum + item.score * item.weight, 0);
  return Number(score.toFixed(2));
}
