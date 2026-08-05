import { Card, Field, TextArea, TextInput, Toggle } from "./fields";
import { slugify } from "./product";

function SeoTab({ form, onChange }) {
  const slug = slugify(form.name) || "product-slug";
  const title = form.seoTitle || `${form.name || "Product name"} | Zeedara`;

  return (
    <div className="flex w-full flex-col gap-4">
      <Field
        label="SEO title"
        htmlFor="product-seo-title"
        hint="Recommended 50–60 characters"
      >
        <TextInput
          id="product-seo-title"
          value={form.seoTitle}
          onChange={(event) => onChange({ seoTitle: event.target.value })}
          placeholder="Zeedara"
        />
      </Field>

      <Field
        label="Meta description"
        htmlFor="product-meta-description"
        hint="Recommended 140–160 characters"
      >
        <TextArea
          id="product-meta-description"
          rows={3}
          value={form.metaDescription}
          onChange={(event) => onChange({ metaDescription: event.target.value })}
        />
      </Field>

      {/* Mirrors a search result, so the fields above can be judged against the
          thing they actually produce. */}
      <Card title="Google preview">
        <div className="flex flex-col gap-1 px-5 py-4">
          <p className="text-[12px] font-medium text-[#0b8043]">
            zeedara.com › products › {slug}
          </p>
          <p className="text-[16px] font-medium text-[#1a0dab]">{title}</p>
          <p className="text-[12px] font-medium text-[#48505e]">
            {form.metaDescription ||
              "Add a meta description to control how this product appears in search results."}
          </p>
        </div>
      </Card>

      <Card title="Visibility">
        <div className="flex flex-col gap-3 px-5 py-4">
          <Toggle
            id="product-published"
            checked={form.isPublished}
            onChange={(isPublished) => onChange({ isPublished })}
            label="Published on the storefront"
          />
          <Toggle
            id="product-featured"
            checked={form.isFeatured}
            onChange={(isFeatured) => onChange({ isFeatured })}
            label="Featured — eligible for Top Collections"
          />
        </div>
      </Card>
    </div>
  );
}

export default SeoTab;
