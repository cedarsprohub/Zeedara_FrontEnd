import { Field, SelectInput, TextInput } from "./fields";
import { HAIR_ORIGINS } from "../data";
import { buildCategoryOptions, slugify } from "./product";
import RichTextEditor from "./RichTextEditor";

// `formKey` forces the description editor to remount (and re-seed its
// contentEditable content) whenever the drawer opens for a different
// record — see RichTextEditor's own note on why it can't just resync from
// `value` on every render.
function GeneralTab({ form, errors, onChange, categories, formKey }) {
  const slug = slugify(form.name);

  // `form.category` always carries the id that actually gets submitted —
  // a top-level category, or one of its subcategories. The Category select
  // below shows that selection's top-level ancestor (itself, if it has
  // none); Subcategory, when the chosen category has any, shows the deeper
  // id or blank.
  const categoryTree = buildCategoryOptions(categories);
  const selectedCategory = categories.find((category) => category.id === form.category);
  const topCategoryId = selectedCategory?.parent_id || form.category;
  const subcategoryOptions =
    categoryTree.find((node) => node.value === topCategoryId)?.children ?? [];
  const subcategoryValue = selectedCategory?.parent_id ? form.category : "";

  const changeCategory = (value) => onChange({ category: value });
  const changeSubcategory = (value) => onChange({ category: value || topCategoryId });

  return (
    <div className="flex w-full flex-col gap-4">
      <Field
        label="Product name"
        required
        htmlFor="product-name"
        error={errors.name}
      >
        <TextInput
          id="product-name"
          value={form.name}
          invalid={Boolean(errors.name)}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="e.g. Bare Lace 13x6 Wig Lacefrontal"
        />
      </Field>

      <Field
        label="URL"
        htmlFor="product-url"
        hint={`zeedara.com/products/${slug || "…"}`}
      >
        {/* Derived, not entered — disabled rather than hidden so the shape of
            the URL is visible while the name is being typed. */}
        <TextInput
          id="product-url"
          value={slug}
          disabled
          placeholder="Auto-generated from the name"
        />
      </Field>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Field label="Brand" htmlFor="product-brand" hint="Defaults to Zeedara">
          <TextInput
            id="product-brand"
            value={form.brand}
            onChange={(event) => onChange({ brand: event.target.value })}
            placeholder="Zeedara"
          />
        </Field>

        <Field
          label="Hair origin"
          htmlFor="product-hair-origin"
          hint="Leave blank for skincare, fragrance and tools"
        >
          <SelectInput
            id="product-hair-origin"
            value={form.hairOrigin}
            onChange={(event) => onChange({ hairOrigin: event.target.value })}
            options={HAIR_ORIGINS}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Field
          label="Category"
          required
          htmlFor="product-category"
          error={errors.category}
        >
          <SelectInput
            id="product-category"
            value={topCategoryId}
            invalid={Boolean(errors.category)}
            onChange={(event) => changeCategory(event.target.value)}
            placeholder="Select Product category"
            options={categoryTree}
          />
        </Field>

        {/* Only present once the chosen category actually has subcategories —
            a category with none leaves this out rather than showing a select
            with nothing but "No subcategory" to pick. */}
        {subcategoryOptions.length > 0 && (
          <Field
            label="Subcategory"
            htmlFor="product-subcategory"
            hint="Optional — narrows the product to a specific subcategory"
          >
            <SelectInput
              id="product-subcategory"
              value={subcategoryValue}
              onChange={(event) => changeSubcategory(event.target.value)}
              options={[{ value: "", label: "No subcategory" }, ...subcategoryOptions]}
            />
          </Field>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Field
          label="Weight (kg)"
          htmlFor="product-weight"
          hint="Used to calculate shipping"
        >
          <TextInput
            id="product-weight"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={form.weight}
            onChange={(event) => onChange({ weight: event.target.value })}
            placeholder="e.g. 0.75"
          />
        </Field>

        <Field
          label="Tags"
          htmlFor="product-tags"
          hint="Used for storefront filtering and search"
        >
          <TextInput
            id="product-tags"
            value={form.tags}
            onChange={(event) => onChange({ tags: event.target.value })}
            placeholder="e.g. HD Lace, bestseller, human hair,"
          />
        </Field>
      </div>

      <Field
        label="Description"
        required
        htmlFor="product-description"
        error={errors.description}
      >
        <RichTextEditor
          key={formKey}
          id="product-description"
          value={form.description}
          invalid={Boolean(errors.description)}
          onChange={(html) => onChange({ description: html })}
          placeholder="Describe the unit — lace type, knots, styling potential…"
        />
      </Field>
    </div>
  );
}

export default GeneralTab;
