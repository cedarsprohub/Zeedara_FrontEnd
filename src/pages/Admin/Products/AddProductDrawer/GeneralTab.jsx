import { Field, SelectInput, TextArea, TextInput } from "./fields";
import { HAIR_ORIGINS, WEIGHT_BANDS } from "../data";
import { slugify } from "./product";

function GeneralTab({ form, errors, onChange, categories }) {
  const slug = slugify(form.name);

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
          required
          htmlFor="product-sku"
          error={errors.sku}
        >
          <TextInput
            id="product-sku"
            value={form.sku}
            invalid={Boolean(errors.sku)}
            onChange={(event) => onChange({ sku: event.target.value })}
            placeholder="ZD-134"
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
        <TextArea
          id="product-description"
          value={form.description}
          invalid={Boolean(errors.description)}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="Describe the unit — lace type, knots, styling potential…"
        />
      </Field>
    </div>
  );
}

export default GeneralTab;
