import { useId, useState } from "react";
import { Star } from "lucide-react";

function StarRow({ rating, size = "size-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`${size} ${
            index < rating
              ? "fill-[#feb954] text-[#feb954]"
              : "fill-transparent text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function CommentForm() {
  const nameId = useId();
  const emailId = useId();
  const titleId = useId();
  const bodyId = useId();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const inputWrapperClass =
    "flex h-[52px] items-center border border-[#dadde2] focus-within:border-(--primary-color)";
  const inputClass =
    "min-w-0 flex-1 bg-white h-full w-full px-[17px] text-[14px] text-black placeholder:text-[#9fa5b2] focus:outline-none";
  const labelClass = "text-[14px] font-medium text-[#575f71]";

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-black">Add a comment</h3>
        <div className="flex flex-col gap-2 border border-gray-200 bg-[#f7f8fa] p-6">
          <h4 className="text-lg font-semibold text-black">
            Thanks for your review!
          </h4>
          <p className="text-sm text-gray-500">
            Your comment has been received and will appear here shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-black">Add a comment</h3>
      <div className="flex flex-col gap-4 border border-gray-200 bg-[#f0f1f3] p-6">
        <p className="text-xs text-gray-500 italic">
          Your email address will not be published. Required fields are marked *
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className={labelClass}>
              Your Rating <span className="text-[#d84c47]">*</span>
            </span>
            <div
              className="flex w-fit gap-1"
              onMouseLeave={() => setHoverRating(0)}
            >
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                const isFilled = value <= (hoverRating || rating);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                    onMouseEnter={() => setHoverRating(value)}
                    onClick={() => setRating(value)}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`size-6 ${
                        isFilled
                          ? "fill-[#feb954] text-[#feb954]"
                          : "fill-transparent text-gray-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={titleId} className={labelClass}>
              Review title
            </label>
            <div className={inputWrapperClass}>
              <input id={titleId} type="text" className={inputClass} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={bodyId} className={labelClass}>
              Your Review <span className="text-[#d84c47]">*</span>
            </label>
            <div className={inputWrapperClass}>
              <input id={bodyId} type="text" required className={inputClass} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={nameId} className={labelClass}>
              Name <span className="text-[#d84c47]">*</span>
            </label>
            <div className={inputWrapperClass}>
              <input id={nameId} type="text" required className={inputClass} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={emailId} className={labelClass}>
              Email <span className="text-[#d84c47]">*</span>
            </label>
            <div className={inputWrapperClass}>
              <input
                id={emailId}
                type="email"
                required
                className={inputClass}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              defaultChecked
              className="size-4 accent-(--primary-color)"
            />
            Save my name, email, and website in this browser for the next time I
            comment.
          </label>

          <button
            type="submit"
            className="w-full cursor-pointer bg-black px-15 py-3 text-sm font-semibold uppercase text-white transition-opacity hover:opacity-90 lg:w-fit"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

function ReviewsPanel({ product }) {
  const maxCount = Math.max(
    ...product.ratingBreakdown.map((row) => row.count),
    1,
  );

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-semibold text-black">
          {product.reviewCount.toLocaleString()} Reviews
        </h3>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex shrink-0 flex-col items-center justify-center gap-1 bg-gray-100 px-6 py-4">
            <StarRow rating={Math.round(product.rating)} />
            <span className="text-2xl font-bold text-[#ffab00]">
              {product.rating}{" "}
              <span className="text-sm font-normal text-gray-500">
                out of 5
              </span>
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-1.5">
            {product.ratingBreakdown.map((row) => (
              <div
                key={row.stars}
                className="flex items-center gap-2 text-xs text-[#ffab00]"
              >
                <span className="w-2">{row.stars}</span>
                <div className="h-[15px] flex-1 bg-[#f8f8f8]">
                  <div
                    className="h-full bg-[#ffab00]"
                    style={{ width: `${(row.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-5 text-right text-[#ffab00]">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {product.reviews.map((review, index) => (
            <div key={index} className="border border-gray-200 p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-500">
                    {review.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-black">
                      {review.name}
                    </p>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                </div>
                <StarRow rating={review.rating} />
              </div>
              <h4 className="mb-1 text-sm font-semibold text-black">
                {review.title}
              </h4>
              <p className="text-sm text-gray-600">{review.body}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="lg:w-fit cursor-pointer bg-black w-full px-15 py-3 text-sm font-semibold uppercase text-white transition-opacity hover:opacity-90"
        >
          See All
        </button>
      </div>

      <CommentForm />
    </div>
  );
}

export default ReviewsPanel;
