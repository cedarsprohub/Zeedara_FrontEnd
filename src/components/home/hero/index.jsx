import { NavLink } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import heroImg from "../../../assets/home/hero_bg.png";
import belowImg from "../../../assets/home/below-img.png";

import heroImg2 from "../../../assets/home/heroImg2.png";
import heroImg3 from "../../../assets/home/heroImg3.png";
import { useNavbarHeight } from "../../../context/NavbarHeightContext";

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
      btnLink: "/shop",
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
      btnLink: "/collections",
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
                <h2
                  className="hero-header uppercase font-medium font-[Anton] leading-11 md:leading-14 lg:leading-14 xl:leading-17 text-[40px] md:text-[50px] lg:text-5xl xl:text-6xl data-[bg=true]:text-[#faf4eb] lg:data-[bg=true]:text-[#faf4eb]"
                  data-bg={slide.isFullBackground}
                >
                  {slide.header}
                </h2>
                <p
                  className="hero-desc text-[14px] lg:text-[18px] w-full sm:w-[80%] md:w-[60%] xl:w-[40%] text-black lg:data-[bg=true]:text-inherit"
                  data-bg={slide.isFullBackground}
                >
                  {slide.description}
                </p>
                <NavLink
                  to={slide.btnLink}
                  className={`bg-(--footer-background-color) text-[14px] lg:text-[16px] font-semibold text-white ${index == 0 ? "block" : "hidden"} uppercase w-fit mt-2 text-center px-9 lg:px-7 py-2 lg:py-3`}
                >
                  {slide.btnText}
                </NavLink>
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

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-gray-800 lg:text-white rounded-full p-3 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-gray-800 lg:text-white rounded-full p-3 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Next slide"
      >
        ❯
      </button>
    </div>
  );
}

export default Hero;
