import collectionImgOne from "../../../assets/home/collection_img_one.png";
import collectionImgTwo from "../../../assets/home/collection_img_two.png";
import collectionImgThree from "../../../assets/home/collection_img_three.png";
import collectionImgFour from "../../../assets/home/collection_img_four.png";
import { NavLink } from "react-router-dom";

// Item heights alternate tall/short so each masonry column sums to the same
// total height (tall + short == short + tall), letting the browser's column
// balancing split the 4 items 2-and-2 with no leftover space at either column's end.
const sizeClasses = {
  tall: "h-[192px] md:h-[270px] lg:h-[400px]",
  short: "h-[130px] md:h-[170px] lg:h-[230px]",
};

const products = [
  {
    id: 1,
    img: collectionImgOne,
    linkTo: "/categories",
    title: "Luxury Hairs",
    size: "tall",
  },
  {
    id: 2,
    img: collectionImgThree,
    linkTo: "/categories",
    title: "Skin Care",
    size: "short",
  },
  {
    id: 3,
    img: collectionImgTwo,
    linkTo: "/categories",
    title: "Make-up",
    size: "short",
  },
  {
    id: 4,
    img: collectionImgFour,
    linkTo: "/categories",
    title: "Brushes",
    size: "tall",
  },
];

function Collections() {
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
          <div className="columns-2 gap-x-2 lg:gap-x-6">
            {products.map((product) => (
              <div
                key={product.id}
                className={`group flex flex-col ${sizeClasses[product.size]} p-1.5 lg:p-3 transition-all duration-300 break-inside-avoid`}
              >
                {/* Image Container Area */}
                <div className="relative flex-1 overflow-hidden bg-[#faf4eb]">
                  <img
                    src={product.img}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Shop Overlay - always visible on mobile, fades in on hover from lg upward */}
                  <div className="absolute inset-0 flex items-center justify-center bg-[#bf8322]/40 opacity-100 transition-opacity duration-300 ease-out lg:opacity-0 lg:group-hover:opacity-100">
                    <NavLink
                      to={product.linkTo}
                      className="transform translate-y-0 uppercase bg-white lg:px-5 px-4 py-2 lg:py-3 text-xs text-[10px] md:text-sm font-semibold text-(--primary-color) transition-all duration-300 hover:bg-gray-100 hover:scale-105 lg:translate-y-2 lg:group-hover:translate-y-0"
                    >
                      Shop Now
                    </NavLink>
                  </div>
                </div>

                {/* Title Section (Placed safely below the hover zoom area) */}
                <div className="mt-3 px-1">
                  <h3 className="text-sm md:text-base capitalize lg:uppercase font-semibold text-gray-800 line-clamp-1 group-hover:text-gray-900 transition-colors duration-200">
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
