export function normalizeSkills(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((skill) => String(skill).trim().toLowerCase()).filter(Boolean);
}

export function scoreSkillOverlap(candidateSkills: unknown, requiredSkills: unknown) {
  const candidate = new Set(normalizeSkills(candidateSkills));
  const required = normalizeSkills(requiredSkills);
  const skillsMatched = required.filter((skill) => candidate.has(skill));
  const skillsMissing = required.filter((skill) => !candidate.has(skill));
  const score = required.length ? Math.round((skillsMatched.length / required.length) * 100) : 0;
  return { score, skillsMatched, skillsMissing };
}
