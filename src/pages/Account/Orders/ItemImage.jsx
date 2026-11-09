import { useState } from "react";

// The product photo panel on order cards and item rows: the item's image
// contained on the design's grey tint, or its initial when the product has no
// image (or the image fails to load). `className` sizes the panel.
export default function ItemImage({ item, className = "", tint = "bg-[#f0f1f3]" }) {
  const [failed, setFailed] = useState(false);
  const src = !failed ? item?.image_url : null;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${tint} ${className}`}
    >
      {src ? (
        // Positioned out of flow so a tall photo fills the panel rather than
        // stretching the card it sits in.
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-[10%] size-[80%] object-contain"
        />
      ) : (
        <span className="text-[32px] font-semibold text-[#c9ccd3]">
          {item ? item.product_name.charAt(0).toUpperCase() : "•"}
        </span>
      )}
    </div>
  );
}
