import { NavLink } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import heroImg from "../../../assets/home/hero_bg.png";
import belowImg from "../../../assets/home/below-img.png";

import heroImg2 from "../../../assets/home/heroImg2.png";
import heroImg3 from "../../../assets/home/heroImg3.png";
import { useNavbarHeight } from "../../../context/NavbarHeightContext";

// The first slide's headline is the home page's <h1>; the rest are <h2>. All
// three slides are in the DOM at once, so making them all <h1> would leave the
// page with no single main heading — and making them all <h2> (as they were) left
// it with no <h1> at all.
function HeroHeading({ isPrimary, ...props }) {
  const Tag = isPrimary ? "h1" : "h2";
  return <Tag {...props} />;
}

function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  const navbarHeight = useNavbarHeight();

  // Monitor viewport width to match Tailwind's 'lg' breakpoint (1024px)
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Initialize Embla Carousel with Autoplay and conditional Fade configurations
  // Changing duration to 150ms-200ms gives a rapid, clean crossfade.
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    isMobile
      ? [
          Autoplay({ delay: 4000, stopOnInteraction: false }),
          Fade({ duration: 30 }),
        ]
      : [Autoplay({ delay: 4000, stopOnInteraction: false })],
  );

  // 2. Navigation handlers
  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  // Slides data configuration
  const slidesData = [
    {
      isFullBackground: true,
      imageAsset: heroImg,
      // Slide 1 has its own dedicated bottom graphic for mobile screens
      mobileImage: belowImg,
      // Slide 1 shows the primary-color background on mobile; the full image takes over at lg
      bgColorClass: "bg-[#c99964] lg:bg-transparent",
      alignClass: "items-center justify-start lg:justify-center text-center",
      header: (
        <>
          Beauty products <br />{" "}
          <span className="text-(--footer-background-color)">
            {" "}
            you can shop with{" "}
          </span>{" "}
          <br /> confidence.
        </>
      ),
      description:
        "Explore curated beauty, skincare, and self-care essentials for your everyday glow.",
      btnText: "Shop Now",
      // `/shop` and `/collections` aren't routes — they fell through the
      // catch-all to the homepage, so both now point at the catalog.
      btnLink: "/products",
    },
    {
      isFullBackground: false,
      imageAsset: heroImg2,
      // Slides 2 and 3 reuse their own side image as the mobile bottom graphic
      mobileImage: heroImg2,
      bgColorClass: "bg-[#faf4eb]", // 1. Custom background color for Slide 2 (Soft Rose/Clay Warmth)
      alignClass: "items-start justify-start lg:justify-center text-left",
      header: (
        <>
          <span className="text-(--primary-color)">Beauty Treatments</span>
          <br /> For Your body and soul
        </>
      ),
      description:
        "Discover our new 100% organic skincare line explicitly formulated for sensitive skin.",
      btnText: "Explore Skincare",
      btnLink: "/skincare",
    },
    {
      isFullBackground: false,
      imageAsset: heroImg3,
      mobileImage: heroImg3,
      bgColorClass: "bg-[#ebeae6]", // 2. Custom background color for Slide 3 (Clean Clean/Sage Gray Tint)
      alignClass: "items-start justify-start lg:justify-center text-left",
      header: (
        <>
          <span className="text-[#859072]">Beauty Treatments</span>
          <br />
          <span className="text-[#859072]"> For Your body and soul</span>
        </>
      ),
      description:
        "Premium self-care items curated exclusively to turn your bathroom into a luxury home spa.",
      btnText: "View Collection",
      btnLink: "/products",
    },
  ];

  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";
  return (
    <div
      className="relative group w-full overflow-hidden"
      style={{ height: `calc(100vh - ${navbarHeight}px)` }}
    >
      {/* Embla Viewport */}
      <div className="w-full h-full overflow-hidden" ref={emblaRef}>
        {/* Embla Container */}
        <div className="flex h-full">
          {slidesData.map((slide, index) => (
            <NavLink
              key={index}
              to={slide.btnLink}
              // 3. Dynamically apply slide.bgColorClass directly inside the layout string
              className={`flex-[0_0_100%] min-w-0 h-full relative flex items-start lg:items-center transition-colors duration-500 ${slide.bgColorClass}`}
            >
              {/* Desktop full-bleed background image (Slide 1 only, lg and up) */}
              {slide.isFullBackground && (
                <div
                  className="hidden lg:block absolute inset-0 z-0 bg-no-repeat bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.imageAsset})` }}
                />
              )}

              {/* Slide Content Box */}
              <div
                className={`mx-auto max-w-[1920px] w-full flex justify-between items-center h-full ${sidePadding} relative z-20 pt-15 lg:pt-0 pb-0 flex flex-col gap-3 ${slide.alignClass}`}
              >
                <HeroHeading
                  isPrimary={index === 0}
                  className="hero-header uppercase font-medium font-[Anton] leading-[1.1] text-[32px] sm:text-[40px] md:text-[50px] lg:text-5xl xl:text-6xl 2xl:text-[72px] data-[bg=true]:text-[#faf4eb] lg:data-[bg=true]:text-[#faf4eb]"
                  data-bg={slide.isFullBackground}
                >
                  {slide.header}
                </HeroHeading>
                <p
                  className="hero-desc text-[13px] sm:text-[14px] lg:text-[16px] max-w-[340px] sm:max-w-[420px] lg:max-w-[480px] text-black lg:data-[bg=true]:text-inherit"
                  data-bg={slide.isFullBackground}
                >
                  {slide.description}
                </p>
                {/* Styled as a button but rendered as a span: the whole slide is
                    already a link to this exact target, and an <a> inside an <a>
                    is invalid HTML (React warns, and browsers recover
                    unpredictably). The click still follows the slide's link. */}
                <span
                  className={`bg-(--footer-background-color) text-[12px] sm:text-[13px] lg:text-[14px] font-semibold text-white ${index == 0 ? "block" : "hidden"} uppercase w-fit mt-2 text-center px-8 lg:px-7 py-2.5 lg:py-3 tracking-[0.28px] transition-opacity hover:opacity-90`}
                >
                  {slide.btnText}
                </span>
              </div>

              {/* Standalone Right Image Element for Slides 2 and 3 (lg and up) */}
              {!slide.isFullBackground && (
                <div className="hidden lg:block absolute top-0 right-0 h-full w-[50%] z-0 pointer-events-none">
                  <img
                    src={slide.imageAsset}
                    className="w-full h-full object-cover object-center"
                    alt="Product showcase"
                  />
                </div>
              )}

              {/* Bottom-aligned graphic on mobile screens, keeping the content above it */}
              <div className="absolute bottom-0 lg:hidden left-0 h-auto w-full pointer-events-none z-0">
                <img
                  src={slide.mobileImage}
                  className="h-full w-full sm:object-cover object-contain"
                  alt=""
                />
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Navigation arrows — thin chevrons at the slide edges, desktop only
          (the mobile design has no arrows; the carousel autoplays there). */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 z-30 cursor-pointer p-2 text-[#faf4eb] transition-opacity hover:opacity-70 lg:block"
        aria-label="Previous slide"
      >
        <ChevronLeft className="size-8" strokeWidth={1.5} />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 z-30 cursor-pointer p-2 text-[#faf4eb] transition-opacity hover:opacity-70 lg:block"
        aria-label="Next slide"
      >
        <ChevronRight className="size-8" strokeWidth={1.5} />
      </button>
    </div>
  );
}

export default Hero;
