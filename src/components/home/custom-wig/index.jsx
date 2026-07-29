import sideImg from "../../../assets/home/customWigImg.png";
import fourImg from "../../../assets/home/four.png";
import logo from "../../../assets/navbar/zeedara_logo.png";
import { NavLink } from "react-router-dom";

function CustomWig() {
  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";
  return (
    <div className="custom bg-[#faf4eb]">
      <div
        className={`custom-inner flex flex-col gap-4 relative lg:flex-row justify-end items-center mx-auto max-w-[1920px] ${sidePadding} pt-[clamp(3rem,6.25vw,7.5rem)]`}
      >
        <div className="custom-img w-full lg:absolute left-0 bottom-0 h-full lg:w-[50%] order-1 lg:order-0">
          <img
            src={sideImg}
            className="object-fit w-full h-full"
            alt="Custom Wig Image"
          />
        </div>

        <div className="custom-content pb-10 w-full lg:w-[40%] xl:w-[40%] 2xl:w-[30%] flex flex-col gap-3 md:gap-4 ">
          <div className="logo w-[116px] md:w-[140px] lg:w-[206px] h-[24px] md:h-[30px] lg:h-[43px]">
            <img
              src={logo}
              className="object-fit h-full w-full"
              alt="Zeedara Logo"
            />
          </div>
          <h1 className="text-black uppercase leading-tight text-[36px] sm:text-[48px] md:text-[60px] xl:text-[80px] font-medium font-[Anton]">
            Custom Wigs
            {/* "MADE 4 YOU" — the script 4 overlaps the gap between the words,
                so it is positioned as a share of the row width, not fixed px. */}
            <div className="flex text-black relative">
              <span>Made</span>
              <img
                src={fourImg}
                className="absolute -bottom-0 left-[45%] w-[26%] max-w-[120px] -translate-x-1/2 object-contain"
                alt=""
              />
              <span className="ms-[22%]">You</span>
            </div>
          </h1>
          <p className="text-[13px] sm:text-[14px] lg:text-[16px] text-black">
            The concentration of a perfume is the percentage of pure fragrance
            oil to stabilizing ingredients, which determines lasting power.
          </p>

          <NavLink
            to="/custom-wig"
            className="text-center uppercase text-[12px] sm:text-[13px] lg:text-[14px] lg:text-start bg-(--primary-color) cursor-pointer text-white font-semibold tracking-[0.28px] py-2.5 lg:py-3 px-6 w-fit hover:bg-[#573b0f] transition-colors duration-300"
          >
            Make A Request
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default CustomWig;
