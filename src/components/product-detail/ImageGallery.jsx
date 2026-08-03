import { useState } from "react";
import { Expand } from "lucide-react";
import { useNavbarHeight } from "../../context/NavbarHeightContext";
import ImageLightbox from "./ImageLightbox";

// Breadcrumb row + page vertical padding above the gallery on the product
// detail page — subtracted along with the navbar so the gallery fits the
// remaining viewport on large screens instead of overflowing it.
const CHROME_ALLOWANCE = 150;

function ImageGallery({ images, name }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const navbarHeight = useNavbarHeight();

  return (
    <div
      className="flex flex-col-reverse gap-3 sm:flex-row lg:h-[var(--pdp-gallery-h)] lg:min-h-[420px]"
      style={{
        "--pdp-gallery-h": `calc(100vh - ${navbarHeight + CHROME_ALLOWANCE}px)`,
      }}
    >
      {/* Thumbnails stack from the top and scroll if they outrun the column,
          rather than spreading to fill its height. */}
      <div className="flex gap-3 overflow-x-auto sm:flex-col sm:overflow-visible lg:h-full lg:justify-start lg:overflow-y-auto">
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
              loading="lazy"
              decoding="async"
              width="80"
              height="80"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsViewerOpen(true)}
        aria-label="View larger image"
        aria-haspopup="dialog"
        className="group relative h-[320px] flex-1 cursor-zoom-in overflow-hidden bg-gray-100 sm:h-[420px] lg:h-full"
      >
        {/* The detail page's largest paint — fetched eagerly and at high
            priority, and keyed so switching thumbnails re-runs the fade. */}
        <img
          key={images[activeIndex]}
          src={images[activeIndex]}
          alt={name}
          decoding="async"
          fetchPriority="high"
          className="media-in h-full w-full object-cover"
        />
        {/* Affordance for the click target — the cursor alone isn't visible
            on touch, where this is the only cue that the image opens. */}
        <span className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 bg-black/55 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors group-hover:bg-black/75">
          <Expand className="size-3.5" />
          Tap to zoom
        </span>
      </button>

      {isViewerOpen && (
        <ImageLightbox
          images={images}
          name={name}
          index={activeIndex}
          onChangeIndex={setActiveIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
}

export default ImageGallery;
