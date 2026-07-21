import { useState } from "react";
import ReviewsPanel from "./ReviewsPanel";

function ProductTabs({ product }) {
  const tabs = [
    { id: "description", label: "Description" },
    { id: "reviews", label: `Reviews (${product.reviewCount})` },
    { id: "shipping", label: "Shipping and Return" },
  ];
  const [activeTab, setActiveTab] = useState("reviews");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-4 sm:gap-8 lg:justify-center">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-2 py-3 text-[12px] font-normal uppercase transition-colors duration-300 cursor-pointer sm:text-[14px] ${
                isActive
                  ? "border-(--primary-color) text-(--primary-color)"
                  : "border-transparent text-[#667085] hover:text-(--primary-color)"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "description" && (
        <div className="flex flex-col gap-3 text-sm text-gray-600">
          <p>{product.description}</p>
          <ul className="flex flex-col gap-1.5">
            {product.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span aria-hidden="true">&bull;</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "reviews" && <ReviewsPanel product={product} />}

      {activeTab === "shipping" && (
        <div className="flex flex-col gap-3 text-sm text-gray-600">
          <p>
            Orders are processed within 1-2 business days. Estimated delivery is
            up to 4 business days from dispatch, depending on your location.
            Delivery fees are calculated at checkout and shown before payment.
          </p>
          <p>
            If you&apos;re not satisfied with your order, items can be returned
            within 7 days of delivery provided they are unused and in their
            original packaging. Contact customer support to start a return or
            exchange.
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductTabs;
