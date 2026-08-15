import { Field, SelectInput, TextInput } from "./fields";
import { HAIR_ORIGINS, WEIGHT_BANDS } from "../data";
import { generateSku, slugify } from "./product";
import RichTextEditor from "./RichTextEditor";

// `formKey` forces the description editor to remount (and re-seed its
// contentEditable content) whenever the drawer opens for a different
// record — see RichTextEditor's own note on why it can't just resync from
// `value` on every render.
function GeneralTab({ form, errors, onChange, categories, isEditing, formKey }) {
  const slug = slugify(form.name);

  // Base SKU tracks the name the same way the URL does — live, and never
  // typed directly. Only while creating: once a product exists its SKU is
  // the persisted one, fixed regardless of later name edits.
  const changeName = (name) =>
    onChange(isEditing ? { name } : { name, sku: generateSku(name) });

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
          onChange={(event) => changeName(event.target.value)}
          placeholder="e.g. Bare Lace 13x6 Wig Lacefrontal"
        />
      </Field>

      <div className="flex flex-col gap-4 sm:flex-row">
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

        <Field
          label="Base SKU"
          htmlFor="product-sku"
          hint="Auto-generated from the name"
        >
          <TextInput
            id="product-sku"
            value={form.sku}
            disabled
            placeholder="Auto-generated from the name"
          />
        </Field>
      </div>

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
          label="Category"
          required
          htmlFor="product-category"
          error={errors.category}
        >
          <SelectInput
            id="product-category"
            value={form.category}
            invalid={Boolean(errors.category)}
            onChange={(event) => onChange({ category: event.target.value })}
            placeholder="Select Product category"
            options={categories}
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
          label="Weight"
          htmlFor="product-weight"
          hint="used to calculate shipping"
        >
          <SelectInput
            id="product-weight"
            value={form.weight}
            onChange={(event) => onChange({ weight: event.target.value })}
            placeholder="Select a weight band"
            options={WEIGHT_BANDS}
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
