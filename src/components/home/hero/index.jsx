import { NavLink } from "react-router-dom";
import heroImg from "../../../assets/home/hero_bg.png";
import belowImg from "../../../assets/home/below-img.png";

function Hero() {
  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";
  return (
    <div
      className="hero bg-no-repeat relative bg-cover flex items-start lg:items-center bg-center h-[calc(100vh-80px)] lg:h-[calc(100vh-270px)] xl:h-[calc(100vh-222px)]"
      style={{ backgroundImage: `url(${heroImg})` }}
    >
      <div
        className={`mx-auto max-w-[1920px] ${sidePadding} relative z-10 pt-15 lg:pt-0 pb-0 hero-inner flex flex-col gap-3 items-center justify-center text-center`}
      >
        <h2 className="hero-header uppercase font-medium font-[Anton] leading-11 md:leading-14 lg:leading-14 xl:leading-17 text-[40px] md:text-[50px] lg:text-5xl xl:text-6xl text-[#faf4eb]">
          Beauty products <br />{" "}
          <span className="text-(--footer-background-color)">
            you can shop with
          </span>{" "}
          <br /> confidence.
        </h2>
        <p className="hero-desc text-[14px] lg:text-[18px] w-full sm:w-[80%] md:w-[70%] lg:w-[60%] mx-auto">
          Explore curated beauty, skincare, and self-care essentials for your
          everyday glow.
        </p>
        <NavLink
          to="/"
          className="bg-(--footer-background-color) text-[14px] lg:text-[16px] font-semibold text-white uppercase w-fit mt-2 text-center px-9 lg:px-7 py-2 lg:py-3"
        >
          Shop Now
        </NavLink>
      </div>
      <div className="absolute bottom-0 lg:hidden left-0 lg:h-[50%] h-auto w-full">
        <img
          src={belowImg}
          className="h-[100%] w-full sm:object-cover object-contain"
        />
      </div>
    </div>
  );
}

export default Hero;
