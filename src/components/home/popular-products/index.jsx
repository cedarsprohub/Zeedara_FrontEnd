import { useState } from "react";
import CartItem from "../../ui/CartItem";
import sampleImg from "../../../assets/ui/sampleImg.png";

const tabs = [
  {
    id: "luxury-hairs",
    label: "Luxury Hairs",
    products: [
      {
        id: 1,
        img: sampleImg,
        name: "Brazilian Body Wave Wig",
        oldPrice: "120,000",
        newPrice: "95,000",
        discount: 20,
      },
      {
        id: 2,
        img: sampleImg,
        name: "Deep Curl Frontal Wig",
        oldPrice: "150,000",
        newPrice: "120,000",
        discount: 20,
      },
      {
        id: 3,
        img: sampleImg,
        name: "Straight Bone Wig",
        oldPrice: "100,000",
        newPrice: "80,000",
        discount: 20,
      },
      {
        id: 4,
        img: sampleImg,
        name: "Kinky Curly Bundles",
        oldPrice: "90,000",
        newPrice: "72,000",
        discount: 20,
      },
      {
        id: 5,
        img: sampleImg,
        name: "Kinky Curly Bundles",
        oldPrice: "90,000",
        newPrice: "72,000",
        discount: 20,
      },
      {
        id: 6,
        img: sampleImg,
        name: "Kinky Curly Bundles Omega Fire Star",
        oldPrice: "90,000",
        newPrice: "72,000",
        discount: 20,
      },
      {
        id: 7,
        img: sampleImg,
        name: "Kinky Curly Bundles",
        oldPrice: "90,000",
        newPrice: "72,000",
        discount: 20,
      },
      {
        id: 8,
        img: sampleImg,
        name: "Water Wave Closure Wig",
        oldPrice: "130,000",
        newPrice: "104,000",
        discount: 20,
      },
    ],
  },
  {
    id: "skin-care",
    label: "Skin Care",
    products: [
      {
        id: 1,
        img: sampleImg,
        name: "Vitamin C Serum",
        oldPrice: "25,000",
        newPrice: "18,000",
        discount: 28,
      },
      {
        id: 2,
        img: sampleImg,
        name: "Hydrating Moisturizer",
        oldPrice: "20,000",
        newPrice: "15,000",
        discount: 25,
      },
      {
        id: 3,
        img: sampleImg,
        name: "Gentle Foaming Cleanser",
        oldPrice: "18,000",
        newPrice: "13,500",
        discount: 25,
      },
      {
        id: 4,
        img: sampleImg,
        name: "SPF 50 Sunscreen",
        oldPrice: "22,000",
        newPrice: "16,000",
        discount: 27,
      },
      {
        id: 5,
        img: sampleImg,
        name: "Niacinamide Serum",
        oldPrice: "24,000",
        newPrice: "17,500",
        discount: 27,
      },
      {
        id: 6,
        img: sampleImg,
        name: "Retinol Night Cream",
        oldPrice: "32,000",
        newPrice: "24,000",
        discount: 25,
      },
      {
        id: 7,
        img: sampleImg,
        name: "Clay Purifying Mask",
        oldPrice: "16,000",
        newPrice: "12,000",
        discount: 25,
      },
      {
        id: 8,
        img: sampleImg,
        name: "Hyaluronic Acid Toner",
        oldPrice: "19,000",
        newPrice: "14,000",
        discount: 26,
      },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    products: [
      {
        id: 1,
        img: sampleImg,
        name: "Makeup Brush Set",
        oldPrice: "30,000",
        newPrice: "22,000",
        discount: 26,
      },
      {
        id: 2,
        img: sampleImg,
        name: "Beauty Blender Sponge",
        oldPrice: "8,000",
        newPrice: "5,500",
        discount: 31,
      },
      {
        id: 3,
        img: sampleImg,
        name: "LED Vanity Mirror",
        oldPrice: "45,000",
        newPrice: "35,000",
        discount: 22,
      },
      {
        id: 4,
        img: sampleImg,
        name: "Precision Tweezers",
        oldPrice: "6,000",
        newPrice: "4,000",
        discount: 33,
      },
      {
        id: 5,
        img: sampleImg,
        name: "Satin Hair Bonnet",
        oldPrice: "9,000",
        newPrice: "6,500",
        discount: 28,
      },
      {
        id: 6,
        img: sampleImg,
        name: "Wig Styling Stand",
        oldPrice: "15,000",
        newPrice: "11,000",
        discount: 27,
      },
      {
        id: 7,
        img: sampleImg,
        name: "Edge Control Brush Set",
        oldPrice: "7,500",
        newPrice: "5,000",
        discount: 33,
      },
      {
        id: 8,
        img: sampleImg,
        name: "Silk Pillowcase",
        oldPrice: "18,000",
        newPrice: "13,000",
        discount: 28,
      },
    ],
  },
];

function PopularProducts() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const sidePadding =
    "px-[clamp(1rem,6.25vw,7.5rem)] py-[clamp(3rem,6.25vw,7.5rem)]";
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="popular-products">
      <div
        className={`popular-products-inner mx-auto max-w-[1920px] ${sidePadding} flex flex-col gap-8 items-center`}
      >
        {/* Heading */}
        <div className="popular-products-content flex flex-col gap-4 w-[100%] lg:w-[70%] xl:w-[65%] items-center">
          <span className="popular-products-badge bg-transparent text-[12px] lg:text-[16px] w-fit text-black font-bold py-2 px-4 text-center uppercase border-2 border-black">
            Shop What Works
          </span>
          <h2 className="popular-products-title text-[32px] sm:text-[40px] text-center lg:text-[48px] uppercase font-medium leading-tight font-['Anton'] text-black">
            Popular Products
          </h2>
        </div>

        {/* Tabs */}
        <div className="popular-products-tabs flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-[12px] sm:text-[14px] font-normal uppercase px-2 py-2 border-b-2 cursor-pointer transition-colors duration-300 ${
                  isActive
                    ? "border-(--primary-color) text-(--primary-color)"
                    : "border-gray-300 text-[#667085] hover:text-(--primary-color)"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Catalog — 2 per row on phones, 4 from lg (as designed) */}
        <div className="popular-products-catalog w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {currentTab.products.map((product) => (
            <CartItem
              key={product.id}
              id={product.id}
              img={product.img}
              name={product.name}
              oldPrice={product.oldPrice}
              newPrice={product.newPrice}
              discount={product.discount}
            />
          ))}
        </div>

        {/* Show All */}
        <button
          type="button"
          className="popular-products-showall bg-black text-white text-[14px] font-bold uppercase px-10 py-3 cursor-pointer transition-opacity hover:opacity-90"
        >
          Show All
        </button>
      </div>
    </div>
  );
}

export default PopularProducts;
