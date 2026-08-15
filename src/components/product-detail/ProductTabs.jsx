import { useState } from "react";
import ReviewsPanel from "./ReviewsPanel";
import { sanitizeDescriptionHtml } from "../../utils/sanitizeHtml";

function ProductTabs({ product, reviews }) {
  const reviewCount = reviews?.summary?.review_count ?? 0;

  const tabs = [
    { id: "description", label: "Description" },
    { id: "reviews", label: `Reviews (${reviewCount})` },
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
          {product.description ? (
            // The admin's description editor produces a small, whitelisted
            // set of tags (p/strong/em/ul/ol/li/a) — sanitized again here
            // regardless, since this renders to every visitor and the write
            // side isn't a boundary this component can trust on its own.
            <div
              className="flex flex-col gap-3 [&_a]:text-(--primary-color) [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{
                __html: sanitizeDescriptionHtml(product.description),
              }}
            />
          ) : (
            <p>No description provided for this product.</p>
          )}
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
    </div>
  );
}

export default ProductTabs;
