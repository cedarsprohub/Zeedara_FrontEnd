import { Outlet } from "react-router-dom";
import Seo from "./Seo";

/**
 * A pathless layout route that marks everything under it `noindex`.
 *
 * Account, auth and order screens are all private or transactional — there's
 * nothing on them to rank, and several would expose one customer's data as a
 * search result if they ever were indexed. Applying it once per group beats
 * repeating a `<Seo noindex>` in fifteen page components and forgetting it in the
 * sixteenth.
 *
 * Pages nested under this must NOT render their own `<Seo>`: React runs child
 * effects before parent ones, so this wrapper would overwrite whatever the page
 * set. A page that needs its own title belongs outside the wrapper, setting
 * `noindex` itself (see pages/Auth/Login).
 */
function NoIndexRoutes({ title, description }) {
  return (
    <>
      <Seo title={title} description={description} noindex />
      <Outlet />
    </>
  );
}

export default NoIndexRoutes;
