import { NavLink } from "react-router-dom";

function CTA({
  sectionBg,
  sectionSideImg,
  sectionTitle,
  sectionTitleColor,
  sectionDesc,
  sectionDescColor,
  sectionBtnText,
  sectionBtnLink,
  sectionBadge,
}) {
  const sidePadding =
    "px-[clamp(1rem,6.25vw,7.5rem)] py-[clamp(3rem,6.25vw,7.5rem)]";
  return (
    <div className={`cta ${sectionBg} py-16`}>
      <div
        className={`cta-inner flex max-w-[1920px] mx-auto ${sidePadding} flex-col gap-8 lg:flex-row lg:gap-4 items-center justify-between`}
      >
        <div className="cta-content flex flex-col gap-6 lg:items-start lg:text-left lg:mb-0 w-full lg:w-[40%] xl:w-[40%] 2xl:w-[30%]">
          <span className="cta-badge w-full lg:w-fit text-center bg-transparent py-2 border border-(--primary-color) border-2 order w-fit text-(--primary-color) text-lg font-bold px-3">
            {sectionBadge}
          </span>
          <h2
            className={`cta-title ${sectionTitleColor} text-[48px] font-medium leading-tight font-['Anton']`}
          >
            {sectionTitle}
          </h2>
          <p className={`cta-description ${sectionDescColor}`}>{sectionDesc}</p>
          <NavLink
            to={sectionBtnLink}
            className="cta-button w-full lg:w-fit text-center lg:text-start bg-(--primary-color) cursor-pointer text-white font-bold py-3 px-6 w-fit hover:bg-[#573b0f] transition-colors duration-300"
          >
            {sectionBtnText}
          </NavLink>
        </div>
        <div className="cta-image max-w-[100%] sm:max-w-[80%] lg:max-w-[50%] xl:max-w-[50%]">
          <img
            src={sectionSideImg}
            alt={sectionTitle}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default CTA;
