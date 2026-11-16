/** Live window: from 15 min before start until 2 h after. */
export const isLiveNow = (iso: string, now = Date.now()) => {
  const start = new Date(iso).getTime();
  return !Number.isNaN(start) && now >= start - 15 * 60_000 && now < start + 2 * 3_600_000;
};
