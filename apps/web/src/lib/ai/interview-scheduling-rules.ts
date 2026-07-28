import type { InterviewSlot } from './interview-scheduling-types';

export function suggestInterviewSlots(
  duration = 60,
  reservedSlots: Array<{ start?: string; end?: string }> = []
): InterviewSlot[] {
  const slots: InterviewSlot[] = [];
  const day = new Date();
  day.setDate(day.getDate() + 1);
  for (let added = 0; added < 3; day.setDate(day.getDate() + 1)) {
    if (day.getDay() === 0 || day.getDay() === 6) continue;
    for (const hour of [10, 11, 14]) {
      const start = new Date(day);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start.getTime() + duration * 60000);
      const conflicts = reservedSlots.filter((reserved) => {
        const reservedStart = new Date(reserved.start ?? '').getTime();
        const reservedEnd = new Date(reserved.end ?? '').getTime();
        return (
          Number.isFinite(reservedStart) &&
          Number.isFinite(reservedEnd) &&
          start.getTime() < reservedEnd &&
          end.getTime() > reservedStart
        );
      }).length;
      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        duration,
        conflicts,
        score: Math.max(0, 100 - added * 3 - (hour === 14 ? 4 : 0) - conflicts * 50),
      });
    }
    added++;
  }
  return slots;
}
