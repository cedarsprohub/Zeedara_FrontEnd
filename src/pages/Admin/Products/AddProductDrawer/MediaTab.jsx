import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Card } from "./fields";

function MediaTab({ images, onChange }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Previews are object URLs, so each one is revoked as its image is dropped
  // rather than left to leak for the life of the page.
  const accept = (files) => {
    const picked = [...(files ?? [])].filter((file) =>
      file.type.startsWith("image/"),
    );
    if (picked.length === 0) return;
    onChange([
      ...images,
      ...picked.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    ]);
  };

  const remove = (id) => {
    const going = images.find((image) => image.id === id);
    if (going) URL.revokeObjectURL(going.url);
    onChange(images.filter((image) => image.id !== id));
  };

  return (
    <Card
      title="Product images"
      action={
        <p className="text-[12px] font-medium text-[#828a9b]">
          First image is the primary thumbnail on the storefront
        </p>
      }
    >
      <div className="flex flex-col gap-4 p-5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            accept(event.dataTransfer.files);
          }}
          className={`flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[4px] border-[1.333px] border-dashed px-[22px] py-8 transition-colors ${
            isDragging
              ? "border-(--primary-color) bg-[#faf4eb]"
              : "border-[#dadde2] bg-[#fcfcfc]"
          }`}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-[#f2f4f7]">
            <Upload
              className="size-[19px] text-[#667085]"
              strokeWidth={2}
              aria-hidden="true"
            />
          </span>
          {/* The frame carries the import dialog's CSV copy here; images are
              what this control takes, so the copy says so. */}
          <span className="pt-[3px] text-[12px] font-semibold">
            <span className="text-(--primary-color)">Choose an image</span>{" "}
            <span className="text-[#48505e]">or drag it here</span>
          </span>
          <span className="text-[12px] font-medium text-[#828a9b]">
            PNG, JPG or WebP — the first one becomes the thumbnail
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => accept(event.target.files)}
        />

        {images.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <li
                key={image.id}
                className="relative aspect-square overflow-hidden border border-[#f0f1f3]"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="size-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-(--primary-color) px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(image.id)}
                  aria-label={`Remove ${image.name}`}
                  className="absolute top-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center bg-black/60 text-white transition-colors hover:bg-black/80"
                >
                  <X className="size-3.5" strokeWidth={2.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

export default MediaTab;
