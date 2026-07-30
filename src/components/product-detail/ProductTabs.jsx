import { useState } from "react";
import ReviewsPanel from "./ReviewsPanel";

function ProductTabs({ product, reviews }) {
  const reviewCount = reviews?.summary?.review_count ?? 0;

  const tabs = [
    { id: "description", label: "Description" },
    { id: "reviews", label: `Reviews (${reviewCount})` },
    { id: "shipping", label: "Shipping and Return" },
  ];
  const [activeTab, setActiveTab] = useState("description");

  // Care and authenticity notes are the product's own copy; they replace the
  // invented feature bullets the mock data used to supply.
  const notes = [
    product.care_notes && { title: "Care", body: product.care_notes },
    product.authenticity_note && {
      title: "Authenticity",
      body: product.authenticity_note,
    },
  ].filter(Boolean);

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
        <div className="flex flex-col gap-4 text-sm text-gray-600">
          <p className="whitespace-pre-line">
            {product.description || "No description provided for this product."}
          </p>
          {notes.map((note) => (
            <div key={note.title} className="flex flex-col gap-1">
              <h4 className="text-sm font-semibold text-black">{note.title}</h4>
              <p className="whitespace-pre-line">{note.body}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "reviews" && (
        <ReviewsPanel product={product} reviews={reviews} />
      )}

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
