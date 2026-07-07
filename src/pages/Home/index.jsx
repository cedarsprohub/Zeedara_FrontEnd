import CartItem from "../../components/ui/CartItem";
import Faq from "../../components/faq";
import CTA from "../../components/home/cta";
import sideImg from "../../assets/home/side_img.png";
import superDealImg from "../../assets/home/superdeal_img.png";
import Testimonials from "../../components/home/testimonials";
import Hero from "../../components/home/hero";
import Collections from "../../components/home/collections";

function Home() {
  return (
    <div>
      <Hero />
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
        sectionBtnText="Search"
        sectionDescColor="text-black"
        sectionBtnLink="/search"
      />
      <Collections />
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
    </div>
  );
}

export default Home;
