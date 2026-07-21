import { useState } from "react";

function ImageGallery({ images, name }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row lg:h-full">
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
