/** 11-char YouTube video id from watch / youtu.be / embed / shorts URLs, else null. */
export const youTubeId = (url: string | null | undefined) =>
  url?.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null;
