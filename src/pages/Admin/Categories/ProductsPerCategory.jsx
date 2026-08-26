// Horizontal bar list of the top-level categories with the most products.
// Plain divs sized by percentage rather than a charting library — the same
// hand-rolled approach as the rest of the admin console's proportional bars.
function ProductsPerCategory({ categories }) {
  const max = Math.max(1, ...categories.map((category) => category.count));
  const ranked = [...categories].sort((a, b) => b.count - a.count);

  return (
    <div className="border border-[#f0f1f3] bg-white">
      <div className="border-b border-[#f0f1f3] px-[18px] py-4">
        <h2 className="text-[14px] font-bold text-[#262626]">Products per category</h2>
      </div>
      <div className="flex flex-col gap-4 p-[18px]">
        {ranked.length === 0 ? (
          <p className="text-[12px] text-[#828a9b]">No categories yet.</p>
        ) : (
          ranked.map((category) => (
            <div key={category.id} className="flex items-center gap-3">
              <span className="w-[110px] shrink-0 truncate text-[13px] font-medium text-[#48505e]">
                {category.name}
              </span>
              <span className="h-2 min-w-0 flex-1 bg-[#f0f1f3]">
                <span
                  className="block h-full bg-(--primary-color)"
                  style={{ width: `${Math.max(4, (category.count / max) * 100)}%` }}
                />
              </span>
              <span className="w-8 shrink-0 text-right text-[13px] font-semibold text-[#262626]">
                {category.count}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductsPerCategory;
