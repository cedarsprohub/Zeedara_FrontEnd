import sideImg from "../../../assets/home/customWigImg.png";
import fourImg from "../../../assets/home/four.png";
import logo from "../../../assets/navbar/zeedara_logo.png";
import { NavLink } from "react-router-dom";

function CustomWig() {
  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";
  return (
    <div className="custom bg-[#faf4eb]">
      <div
        className={`custom-inner flex flex-col gap-4 lg:flex-row justify-center mx-auto max-w-1920 ${sidePadding} pt-[clamp(3rem,6.25vw,7.5rem)]`}
      >
        <div className="custom-img w-full h-auto lg:w-[50%] order-1 lg:order-0">
          <img
            src={sideImg}
            className="object-fit w-full h-full"
            alt="Custom Wig Image"
          />
        </div>

        <div className="custom-content w-full lg:w-[50%] flex flex-col gap-3 md:gap-4">
          <div className="logo w-[116px] md:w-[140px] lg:w-[206px] h-[24px] md:h-[30px] lg:h-[43px]">
            <img
              src={logo}
              className="object-fit h-full w-full"
              alt="Zeedara Logo"
            />
          </div>
          <h1 className="text-black uppercase leading-tight text-[40px] md:text-[60px] lg:text-[80px] 2xl:text-[80px] font-medium font-[Anton]">
            Custom Wigs
            <div className="flex text-black relative">
              <span>Made</span>
              <img
                src={fourImg}
                className="object-fit w-[60px] left-20 md:w-[90px] lg:w-[120px] absolute md:left-30 lg:left-39 -bottom-0"
                alt="Four Image"
              />
              <span className="ms-10 md:ms-20">You</span>
            </div>
          </h1>
          <p className="text-[14px] lg:text-[16px] text-black">
            The concentration of a perfume is the percentage of pure fragrance
            oil to stabilizing ingredients, which determines lasting power.
          </p>

          <NavLink
            to="custom-wig"
            className="text-center uppercase text-[14px] lg:text-[16px] lg:text-start bg-(--primary-color) cursor-pointer text-white font-semibold py-2 lg:py-3 px-6 w-fit hover:bg-[#573b0f] transition-colors duration-300"
          >
            Make A Request
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default CustomWig;
