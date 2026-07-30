/**
 * Shown while a route's chunk is downloading.
 *
 * Deliberately a soft skeleton rather than a spinner or the word "Loading":
 * blocks in roughly the shape of a page read as "content is arriving" and
 * don't flash a competing message for the split second most chunks take. It
 * fades in after a short delay (see `.skeleton-delayed`) so fast navigations —
 * anything already in the module cache — show nothing at all.
 */
function RouteFallback() {
  return (
    <div
      className="skeleton-delayed mx-auto max-w-[1920px] px-[clamp(1rem,6.25vw,7.5rem)] py-12"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex flex-col gap-6">
        <div className="skeleton h-8 w-[220px]" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3">
              <div className="skeleton aspect-[8/7] w-full" />
              <div className="skeleton h-3 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RouteFallback;
