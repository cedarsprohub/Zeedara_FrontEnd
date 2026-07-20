import CheckboxFilterGroup from "./CheckboxFilterGroup";
import PriceRangeFilter from "./PriceRangeFilter";
import ColorFilter from "./ColorFilter";
import RatingFilter from "./RatingFilter";

const categoryOptions = [
  { label: "Hairs and Wigs", count: 256 },
  { label: "Skincare", count: 59 },
  { label: "Makeup", count: 37 },
  { label: "Body Care", count: 94 },
  { label: "Organic and Natural", count: 864 },
  { label: "Nails", count: 33 },
  { label: "Accessories", count: 15 },
];

const brandOptions = [
  { label: "Lush", count: 256 },
  { label: "Darling", count: 59 },
  { label: "X-Pression", count: 37 },
  { label: "Crave", count: 94 },
  { label: "Zeedara", count: 864 },
];

function FilterSidebar() {
  return (
    // Outer box stretches to match the product column's height (default flex
    // "stretch"), giving the inner sticky wrapper room to travel before it
    // un-sticks right at the bottom of the grid/pagination.
    <aside className="filter-sidebar w-full shrink-0 lg:w-[280px]">
      <div
        style={{ scrollbarWidth: "thin" }}
        className="border border-gray-300 px-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <CheckboxFilterGroup
          title="Shop by Category"
          options={categoryOptions}
        />
        <CheckboxFilterGroup title="Shop by Brand" options={brandOptions} />
        <PriceRangeFilter />
        <ColorFilter />
        <RatingFilter />
      </div>
    </aside>
  );
}

export default FilterSidebar;
