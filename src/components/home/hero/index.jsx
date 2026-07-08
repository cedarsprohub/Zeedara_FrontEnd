import { NavLink } from "react-router-dom";
import heroImg from "../../../assets/home/hero_bg.png";

function Hero() {
  const sidePadding =
    "px-[clamp(1rem,6.25vw,7.5rem)] py-[clamp(3rem,6.25vw,7.5rem)]";
  return (
    <div
      className="hero bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImg})` }}
    >
      <div
        className={`mx-auto max-w-[1920px] ${sidePadding} hero-inner flex flex-col gap-3 items-center justify-center text-center`}
      >
        <h2 className="hero-header uppercase font-medium font-[Anton] leading-20 text-6xl xl:text-7xl text-white">
          Beauty products <br />{" "}
          <span className="text-(--footer-background-color)">
            you can shop with
          </span>{" "}
          <br /> conFidence.
        </h2>
        <p className="hero-desc text-[18px] w-full md:w-[45%] mx-auto">
          Explore curated beauty, skincare, and self-care essentials for your
          everyday glow.
        </p>
        <NavLink
          to="/"
          className="bg-(--footer-background-color) text-white uppercase w-full sm:w-fit text-center px-7 py-3"
        >
          Shop Now
        </NavLink>
      </div>
    </div>
  );
}

export default Hero;
