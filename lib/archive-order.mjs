const curatedProjectOrder = [
  "ping",
  "molekule-go",
  "luma",
  "niche",
  "hyphae",
  "mode",
];

const curatedProjectRanks = new Map(
  curatedProjectOrder.map((slug, index) => [slug, index]),
);

/**
 * Keep the public portfolio's work sequence, then preserve source order for
 * projects that do not yet appear there.
 *
 * @param {string} slug
 * @param {number} canonicalIndex
 */
export function curatedArchiveIndex(slug, canonicalIndex) {
  return curatedProjectRanks.get(slug) ?? curatedProjectOrder.length + canonicalIndex;
}

/**
 * Return a new archive list ordered for the active collection, filter, and
 * selected sort mode. Matching projects remain grouped before receded ones.
 *
 * @template {{
 *   emphasized: boolean,
 *   collectionMatch: boolean,
 *   filterMatch: boolean,
 *   slides: readonly unknown[],
 *   canonicalIndex: number,
 *   curatedIndex: number,
 *   year: number
 * }} T
 * @param {readonly T[]} items
 * @param {{ hasFilter: boolean, sort: "curated" | "newest" | "relevance" }} options
 * @returns {T[]}
 */
export function orderArchiveProjects(items, { hasFilter, sort }) {
  return [...items].sort((a, b) => {
    if (a.emphasized !== b.emphasized) return a.emphasized ? -1 : 1;
    if (a.collectionMatch !== b.collectionMatch) return a.collectionMatch ? -1 : 1;
    if (a.filterMatch !== b.filterMatch) return a.filterMatch ? -1 : 1;

    if (sort === "newest" && a.year !== b.year) return b.year - a.year;
    if (sort === "relevance" && hasFilter && a.slides.length !== b.slides.length) {
      return b.slides.length - a.slides.length;
    }
    if (a.curatedIndex !== b.curatedIndex) return a.curatedIndex - b.curatedIndex;
    return a.canonicalIndex - b.canonicalIndex;
  });
}
