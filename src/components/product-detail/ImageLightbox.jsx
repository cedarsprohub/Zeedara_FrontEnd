import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Minimum horizontal travel before a touch drag counts as a swipe rather than
// a tap — below this, small finger movement on a tap would skip an image.
const SWIPE_THRESHOLD = 50;

function ImageLightbox({ images, name, index, onChangeIndex, onClose }) {
  const closeButtonRef = useRef(null);
  const touchStartX = useRef(null);

  const hasMultiple = images.length > 1;
  const step = (delta) =>
    onChangeIndex((index + delta + images.length) % images.length);

  // Lock the page behind the overlay for as long as the viewer is mounted.
  // Kept apart from the key handler below so a mere image change doesn't
  // release and retake the lock.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Re-bound on every index change: the handler steps relative to the image
  // showing now, so it has to see the current one.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight" && hasMultiple) step(1);
      else if (event.key === "ArrowLeft" && hasMultiple) step(-1);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || !hasMultiple) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) >= SWIPE_THRESHOLD) step(distance < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  // Portalled to <body> so the overlay covers the sticky navbar. Left in
  // place it renders inside `.page-enter`, whose transform/opacity animation
  // makes it a containing block — a `fixed` child would then be trapped in
  // that stacking context and paint *under* the nav no matter its z-index.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} image viewer`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
    >
      {/* Backdrop click closes. It sits behind the panel rather than wrapping
          it, so a click inside the panel never falls through to it. */}
      <div onClick={onClose} aria-hidden="true" className="absolute inset-0" />

      {/* Half the viewport on large screens; on smaller ones it takes the
          width it can get, since half of a phone is unreadable. */}
      {/* `overflow-hidden` so the header rule and thumbnail strip clip to the
          rounded corners instead of squaring them off. */}
      <div className="relative flex max-h-full w-full max-w-[560px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl lg:w-1/2 lg:max-w-none">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 text-gray-600 sm:px-6">
          <span className="text-sm font-medium tabular-nums">
            {index + 1} / {images.length}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close image viewer"
            className="-mr-2 cursor-pointer p-2 transition-colors hover:text-gray-900"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* A fixed flex basis rather than content height — otherwise the panel
            resizes every time you step from a portrait shot to a landscape one.
            It still shrinks to fit short viewports. */}
        <div
          className="relative flex min-h-0 flex-1 basis-[60vh] items-center justify-center p-4 sm:px-16"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* `contain` here, unlike the cropped thumbnail on the page — the
              point of opening the viewer is to see the whole image. */}
          <img
            key={images[index]}
            src={images[index]}
            alt={`${name} — image ${index + 1}`}
            decoding="async"
            className="media-in max-h-full max-w-full object-contain"
          />

          {/* Inset within the panel's own padding so they land on the white
              margin beside the image rather than on top of it. */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-1 cursor-pointer rounded-full border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-black sm:left-4"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-1 cursor-pointer rounded-full border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-black sm:right-4"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>

        {hasMultiple && (
          <div className="flex justify-center gap-2 overflow-x-auto border-t border-gray-100 px-4 py-4">
            {images.map((image, thumbIndex) => (
              <button
                key={thumbIndex}
                type="button"
                onClick={() => onChangeIndex(thumbIndex)}
                aria-label={`Show image ${thumbIndex + 1}`}
                aria-current={index === thumbIndex}
                className={`h-16 w-16 shrink-0 cursor-pointer overflow-hidden border transition-colors ${
                  index === thumbIndex
                    ? "border-(--primary-color)"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width="64"
                  height="64"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default ImageLightbox;
