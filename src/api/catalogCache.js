// Short-lived cache for public catalog reads.
//
// Two jobs. It de-duplicates concurrent identical requests, so the four product
// cards that all ask for the same collection share one response instead of
// firing four. And it serves the last result for a few seconds, which makes
// going back to a listing — or reopening the search dropdown — instant rather
// than a fresh round trip.
//
// Deliberately scoped to unauthenticated catalog GETs. Nothing user-specific
// (cart, orders, addresses) is cached: those must always reflect the server, and
// caching them per-tab would risk showing one session's data after a switch.
const TTL_MS = 30_000;
const MAX_ENTRIES = 60;

const entries = new Map();

function prune() {
  // Insertion-ordered, so the oldest keys are first.
  while (entries.size > MAX_ENTRIES) {
    const oldest = entries.keys().next().value;
    entries.delete(oldest);
  }
}

/**
 * Runs `load()` unless a fresh result (or an in-flight request) for `key`
 * already exists.
 */
export function cachedRequest(key, load) {
  const hit = entries.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise;

  const promise = load().catch((error) => {
    // Failures aren't worth remembering — the next attempt should hit the API.
    entries.delete(key);
    throw error;
  });

  entries.set(key, { at: Date.now(), promise });
  prune();
  return promise;
}

// Called after anything that could change what the catalog returns.
export function clearCatalogCache() {
  entries.clear();
}
