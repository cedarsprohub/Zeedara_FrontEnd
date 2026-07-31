import Faq from "../../components/faq";
import Seo from "../../components/shared/Seo";
import { storeSchema } from "../../utils/structuredData";
import CTA from "../../components/home/cta";
import sideImg from "../../assets/home/side_img.png";
import superDealImg from "../../assets/home/superdeal_img.png";
import Testimonials from "../../components/home/testimonials";
import Hero from "../../components/home/hero";
import Collections from "../../components/home/collections";
import PopularProducts from "../../components/home/popular-products";
import CustomWig from "../../components/home/custom-wig";
import WhatsappFab from "../../components/home/whatsapp-fab";

function Home() {
  return (
    <div>
      {/* `exactTitle` because the home page's title is the brand line itself —
          appending "| Zeedara" to it would repeat the name twice. */}
      <Seo
        title="Zeedara | Authentic Wigs, Beauty & Skincare in Nigeria"
        exactTitle
        description="Shop authentic wigs, hair, beauty, skincare and personal care products in Nigeria. Clear pricing in naira, secure Paystack checkout and reliable delivery."
        canonical="/"
        jsonLd={storeSchema()}
      />
      <Hero />
      <PopularProducts />
      <CTA
        sectionBg="bg-(--grey-color)"
        sectionSideImg={sideImg}
        sectionBadge="STOP AND WEAR"
        sectionTitle={
          <>
            Medicube Deep Vita C
            <br /> Capsule Cream
          </>
        }
        sectionTitleColor="text-black"
        sectionDesc="The concentration of a perfume is the percentage of pure fragrance oil to stabilizing ingredients, which determines lasting power."
        sectionBtnText="view product"
        sectionDescColor="text-black"
        sectionBtnLink="/products"
      />
      <Collections />
      <CustomWig />
      <CTA
        sectionBg="bg-black"
        sectionSideImg={superDealImg}
        sectionBadge="SUPER DEAL TODAY ONLY!"
        sectionTitle={
          <>
            BEST COSMETICS
            <br /> JUST<span className="text-(--primary-color)"> 80,000</span>
          </>
        }
        sectionTitleColor="text-white"
        sectionDesc="The concentration of a perfume is the percentage of pure fragrance oil to stabilizing ingredients, which determines lasting power."
        sectionBtnText="SHOP NOW"
        sectionDescColor="text-gray-300"
        sectionBtnLink="/categories"
      />
      <Testimonials />
      <Faq />
      <WhatsappFab />
    </div>
  );
}

export default Home;
