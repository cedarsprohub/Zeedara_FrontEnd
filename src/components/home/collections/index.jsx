import collectionImgOne from "../../../assets/home/collection_img_one.png";
import collectionImgTwo from "../../../assets/home/collection_img_two.png";
import collectionImgThree from "../../../assets/home/collection_img_three.png";
import collectionImgFour from "../../../assets/home/collection_img_four.png";
import { NavLink } from "react-router-dom";

function Collections() {
  const products = [
    {
      id: 1,
      img: collectionImgOne,
      linkTo: "/categories",
      title: "Luxry Hairs",
    },
    {
      id: 2,
      img: collectionImgThree,
      linkTo: "/categories",
      title: "Skin Care",
    },
    {
      id: 3,
      img: collectionImgTwo,
      linkTo: "/categories",
      title: "Make-up",
    },
    {
      id: 4,
      img: collectionImgFour,
      linkTo: "/categories",
      title: "Brushes",
    },
  ];

  const sidePadding =
    "px-[clamp(1rem,6.25vw,7.5rem)] py-[clamp(3rem,6.25vw,7.5rem)]";
  return (
    <div className="collections">
      <div
        className={`collections-inner mx-auto max-w-[1920px] ${sidePadding} flex flex-col gap-8 items-center`}
      >
        <div className="collections-content flex flex-col gap-4 w-[100%] lg:w-[70%] xl:w-[65%] items-center">
          <span className="collections-badge bg-transparent text-[12px] lg:text-[16px] w-fit text-black font-bold py-2 px-4 text-center uppercase border border-2 border-black">
            Shop What Works
          </span>
          <h2 className="collections-title text-[40px] text-center lg:text-[48px] uppercase font-medium leading-tight font-['Anton'] text-black">
            2026 Top Collections
          </h2>
        </div>

        <div className="collections-container w-full md:w-[80%] lg:w-[60%] mx-auto">
          <div className="columns-2">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`group flex flex-col h-[${index == 0 || index == 3 ? "192px" : "130px"}] lg:h-[${index == 0 || index == 3 ? "400px" : "230px"}] p-3 transition-all duration-300 break-inside-avoid`}
              >
                {/* Image Container Area */}
                <div className="relative overflow-hidden bg-[#faf4eb]">
                  <img
                    src={product.img}
                    alt={product.title}
                    className={`w-full h-full object-fit transition-transform duration-500 ease-out group-hover:scale-105`}
                    loading="lazy"
                  />

                  {/* Hover Fade-in Shop Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-[#bf8322]/40 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
                    <NavLink
                      to={product.linkTo}
                      className="transform translate-y-2 uppercase bg-white px-5 py-3 text-xs md:text-sm font-semibold text-(--primary-color) transition-all duration-300 hover:bg-gray-100 hover:scale-105 group-hover:translate-y-0"
                    >
                      Shop Now
                    </NavLink>
                  </div>
                </div>

                {/* Title Section (Placed safely below the hover zoom area) */}
                <div className="mt-3 px-1">
                  <h3 className="text-sm md:text-base uppercase font-semibold text-gray-800 line-clamp-1 group-hover:text-gray-900 transition-colors duration-200">
                    {product.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Collections;
