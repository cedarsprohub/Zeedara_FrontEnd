import Seo from "../../components/shared/Seo";

// This page is still a stub, but it's routed and linked from the primary nav, so
// crawlers will reach it. `noindex` until it has content: an empty page that
// Google indexes gets classified as thin content or a soft 404, which is a
// sitewide quality signal, not just a wasted URL. It's also kept out of
// `scripts/generate-sitemap.mjs` for the same reason. Remove both exclusions once
// the category grid is built.
function Categories() {
  return (
    <>
      <Seo
        title="Categories"
        description="Browse Zeedara by category — wigs and hair, beauty, makeup, skincare and personal care."
        noindex
      />
      <div>Categories</div>
    </>
  );
}

export default Categories;
