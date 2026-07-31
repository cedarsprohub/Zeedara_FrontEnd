import { Link } from "react-router-dom";
import Seo from "../../components/shared/Seo";

/**
 * Unknown URLs used to redirect to the home page. That's a "soft 404": the
 * server answers 200, the crawler sees home-page content at a URL that doesn't
 * exist, and Google indexes the duplicate or flags it. A real not-found page
 * carrying `noindex` is what tells it the URL is genuinely gone.
 *
 * The HTTP status is still 200 — a static host rewrites every path to
 * `index.html`, so it can't know this route didn't match. `noindex` is the part
 * that matters for indexing; returning a true 404 would need the host to render
 * the app, which this deployment doesn't do.
 */
function NotFound() {
  return (
    <>
      <Seo
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
        noindex
      />
      <div className="mx-auto flex max-w-[1920px] flex-col items-center gap-4 px-[clamp(1rem,6.25vw,7.5rem)] py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-(--primary-color)">
          404
        </p>
        <h1 className="text-2xl font-semibold text-black">Page not found</h1>
        <p className="max-w-[460px] text-sm text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/products"
            className="bg-(--primary-color) px-6 py-3 text-[13px] font-semibold uppercase text-white transition-opacity hover:opacity-90"
          >
            Shop all products
          </Link>
          <Link
            to="/"
            className="border border-(--primary-color) px-6 py-3 text-[13px] font-semibold uppercase text-(--primary-color) transition-colors hover:bg-[#faf4eb]"
          >
            Back home
          </Link>
        </div>
      </div>
    </>
  );
}

export default NotFound;
