import Seo from "../../components/shared/Seo";

// Still a stub, and `noindex` for the same reason as pages/Categories: it's
// reachable from the primary nav, so an empty page would otherwise be indexed as
// thin content. Also excluded from the sitemap. Drop both once it has real copy.
function Consultation() {
  return (
    <>
      <Seo
        title="Consultation"
        description="Book a beauty, hair or skincare consultation with the Zeedara team."
        noindex
      />
      <div>Consultation</div>
    </>
  );
}

export default Consultation;
