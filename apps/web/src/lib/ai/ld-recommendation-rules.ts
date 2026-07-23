export function popularityScore(enrollmentCount: number, rating: number | null): number {
  return Math.min(100, Math.round((rating || 3) * 15 + Math.min(enrollmentCount, 100) * 0.4));
}

export function recommendationScore(
  courseSkills: string[],
  knownSkills: Set<string>,
  enrollmentCount: number,
  rating: number | null
): number {
  const normalized = courseSkills.map((skill) => skill.trim().toLowerCase()).filter(Boolean);
  const missingSkills = normalized.filter((skill) => !knownSkills.has(skill));
  if (!normalized.length || !knownSkills.size) return popularityScore(enrollmentCount, rating);

  // Prefer courses that close known skill gaps, while keeping catalog quality relevant.
  const gapRatio = missingSkills.length / normalized.length;
  return Math.min(100, Math.round(gapRatio * 70 + popularityScore(enrollmentCount, rating) * 0.3));
}

export function recommendationReason(
  skills: string[],
  score: number,
  targetsSkillGap = false
): string {
  if (targetsSkillGap && skills.length) {
    return `Targets current development gaps in ${skills.slice(0, 3).join(', ')} (${score}% match).`;
  }
  return skills.length
    ? `Builds ${skills.slice(0, 3).join(', ')} (${score}% catalog match).`
    : `Popular tenant learning option (${score}% catalog match).`;
}
