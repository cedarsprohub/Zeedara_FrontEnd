import customWigHeroImg from "../../assets/custom-wig/customRequestHeroImg.png";
import customWigImgOne from "../../assets/custom-wig/customWigImgOne.png";
import customWigImgTwo from "../../assets/custom-wig/customWigImgTwo.png";
import HowItWorksSteps from "../../components/custom-wig/HowItWorksSteps";
import RequestForm from "../../components/custom-wig/RequestForm";
import Faq from "../../components/faq";
import { useNavbarHeight } from "../../context/NavbarHeightContext";

function CustomWig() {
  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";
  const navbarHeight = useNavbarHeight();

  return (
    <div className="custom-wig-page">
      {/* Hero band - heading + banner + disclaimer together fill exactly the
          viewport height left after the navbar, so no scrolling is needed to
          see the whole hero */}
      <div
        className="flex flex-col"
        style={{ height: `calc(100dvh - ${navbarHeight}px)` }}
      >
        <section className="shrink-0 bg-[#faf4eb] py-13 text-center">
          <h1 className="font-['Anton'] text-[40px] uppercase leading-8 md:leading-12 text-black md:text-[56px] lg:text-[70px]">
            Custom Wig
            <br />
            <span className="text-(--primary-color) font-[Abhaya_Libre]">
              Requests
            </span>
          </h1>
        </section>

        {/* Photo banner - flexes to fill whatever height remains */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <img
            src={customWigHeroImg}
            alt="Zeedara custom wig clients"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="shrink-0 bg-black px-4 py-3 text-center text-xs font-medium text-white sm:text-sm">
          IMPORTANT NOTE: This page is solely for sending a request of Custom
          Wig orders. Our VIP representative will follow up for details and send
          you the final quote.
        </div>
      </div>

      <div
        className={`mx-auto max-w-[1920px] ${sidePadding} py-16 [--wig-pad:clamp(1rem,6.25vw,7.5rem)]`}
      >
        {/* How It Works */}
        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2 relative">
          <div className="h-[420px] relative overflow-hidden order-2 lg:order-0 md:h-[600px] lg:h-auto -mx-(--wig-pad) w-[calc(100%+2*var(--wig-pad))] lg:mx-0 lg:w-auto">
            <img
              src={customWigImgOne}
              alt="Braided custom wig"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div className="border-none lg:border border-gray-200 p-0 lg:p-6 sm:p-8">
            <h2 className="mb-6 font-['Anton'] text-[40px] lg:text-[48px] capitalize text-black">
              How It Works
            </h2>
            <HowItWorksSteps />
          </div>
        </div>

        {/* Custom Wig Request Form */}
        <div>
          <h2 className="mb-6 font-['Anton'] text-[40px] lg:text-[48px] capitalize text-black leading-tight">
            Custom Wig <br className="md:hidden" /> Request Form
          </h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <RequestForm />
            <div className="hidden overflow-hidden lg:block">
              <img
                src={customWigImgTwo}
                alt="Custom wig inspiration"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <Faq />
    </div>
  );
}

export default CustomWig;
