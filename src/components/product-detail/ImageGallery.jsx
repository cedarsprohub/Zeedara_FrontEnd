import { useState } from "react";
import { useNavbarHeight } from "../../context/NavbarHeightContext";

// Breadcrumb row + page vertical padding above the gallery on the product
// detail page — subtracted along with the navbar so the gallery fits the
// remaining viewport on large screens instead of overflowing it.
const CHROME_ALLOWANCE = 150;

function ImageGallery({ images, name }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const navbarHeight = useNavbarHeight();

  return (
    <div
      className="flex flex-col-reverse gap-3 sm:flex-row lg:h-[var(--pdp-gallery-h)] lg:min-h-[420px]"
      style={{
        "--pdp-gallery-h": `calc(100vh - ${navbarHeight + CHROME_ALLOWANCE}px)`,
      }}
    >
      <div className="flex gap-3 overflow-x-auto sm:flex-col sm:overflow-visible lg:h-full lg:justify-between lg:overflow-y-auto">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show image ${index + 1}`}
            aria-current={activeIndex === index}
            className={`h-20 w-20 shrink-0 overflow-hidden border bg-gray-100 transition-colors ${
              activeIndex === index
                ? "border-(--primary-color)"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <img
              src={image}
              alt={`${name} thumbnail ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="h-[320px] flex-1 overflow-hidden bg-gray-100 sm:h-[420px] lg:h-full">
        <img
          src={images[activeIndex]}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default ImageGallery;
