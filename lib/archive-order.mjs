/**
 * Return a new archive list ordered for the active collection and filter.
 * Canonical source order remains the final tie-breaker.
 *
 * @template {{
 *   emphasized: boolean,
 *   collectionMatch: boolean,
 *   filterMatch: boolean,
 *   slides: readonly unknown[],
 *   canonicalIndex: number
 * }} T
 * @param {readonly T[]} items
 * @param {boolean} hasFilter
 * @returns {T[]}
 */
export function orderArchiveProjects(items, hasFilter) {
  return [...items].sort((a, b) => {
    if (a.emphasized !== b.emphasized) return a.emphasized ? -1 : 1;
    if (a.collectionMatch !== b.collectionMatch) return a.collectionMatch ? -1 : 1;
    if (a.filterMatch !== b.filterMatch) return a.filterMatch ? -1 : 1;
    if (hasFilter && a.slides.length !== b.slides.length) return b.slides.length - a.slides.length;
    return a.canonicalIndex - b.canonicalIndex;
  });
}
