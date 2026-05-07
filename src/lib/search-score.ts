export type SearchListEntry = {
  k: string;
  r: string;
  m: string;
  g: number;
  j?: string | null;
  s?: number | null;
};

/**
 * Score a search entry for ranking. Higher is better.
 * Used to pick the best entry when multiple entries map to the same canonical kanji.
 */
export const scoreSearchEntry = (
  entry: SearchListEntry,
  canonicalKanji: string,
) =>
  (entry.k === canonicalKanji ? 100 : 0) +
  (entry.g !== 3 ? 10 : 0) +
  (entry.m ? 5 : 0) +
  (entry.r ? 5 : 0) +
  (entry.j ? 3 : 0) +
  (typeof entry.s === "number" ? 2 : 0);
