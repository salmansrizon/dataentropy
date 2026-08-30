export interface WeeklyConsistency {
  completedSessions: number;
  goal: number;
  remaining: number;
  message: string;
}

export function weeklyConsistency(activeDates: string[], goal: number, now = new Date(), timeZone = 'Asia/Dhaka'): WeeklyConsistency {
  const day = (value: Date) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(value);
  const localToday = day(now);
  const todayNumber = Math.floor(Date.parse(`${localToday}T00:00:00Z`) / 86_400_000);
  const weekday = new Date(`${localToday}T00:00:00Z`).getUTCDay();
  const mondayOffset = weekday === 0 ? 6 : weekday - 1;
  const weekStart = todayNumber - mondayOffset;
  const completedSessions = new Set(activeDates.map((date) => day(new Date(date))).filter((date) => {
    const value = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
    return value >= weekStart && value <= todayNumber;
  })).size;
  const remaining = Math.max(0, goal - completedSessions);
  const message = remaining === 0
    ? 'Weekly goal complete. Any extra practice is optional.'
    : completedSessions === 0
      ? 'A fresh week is a clean start—one useful session is enough today.'
      : `${remaining} session${remaining === 1 ? '' : 's'} left this week. Missing a day never resets your progress.`;
  return { completedSessions, goal, remaining, message };
}
