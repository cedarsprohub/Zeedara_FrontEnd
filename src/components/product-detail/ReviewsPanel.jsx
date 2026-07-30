import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { submitReview } from "../../api/catalog";
import { getOrder, listMyOrders } from "../../api/orders";

// Only a received order earns a review. `closed` is the state an order settles
// into after delivery, so it counts too.
const DELIVERED_STATUSES = new Set(["delivered", "closed"]);

// `OrderListItem` doesn't include line items, so each candidate order has to be
// read individually. Checking the most recent few keeps that bounded — someone
// reviewing a product they bought long ago will be caught by the server's own
// verified-purchase check instead.
const MAX_ORDERS_CHECKED = 10;

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

function formatReviewDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

/**
 * Has this account received an order containing this product?
 *
 * Order items identify their product by SKU, so eligibility is decided by
 * intersecting the product's variant SKUs with those on delivered orders. This
 * only gates the form: `POST /reviews` enforces verified purchase itself, so a
 * gap here can't be used to post a review the server wouldn't accept.
 */
function useCanReview(product, accessToken) {
  const skus = (product.variants ?? []).map((variant) => variant.sku);
  const requestKey = accessToken ? `${product.id}:${skus.join(",")}` : "";

  const [checked, setChecked] = useState({ key: "", eligible: false });

  useEffect(() => {
    if (!requestKey) return undefined;
    let active = true;

    listMyOrders({ limit: 50 }, accessToken)
      .then(async (rows) => {
        const delivered = (Array.isArray(rows) ? rows : [])
          .filter((order) => DELIVERED_STATUSES.has(order.status))
          .slice(0, MAX_ORDERS_CHECKED);

        const details = await Promise.all(
          delivered.map((order) =>
            getOrder(order.order_number, { accessToken }).catch(() => null),
          ),
        );

        const owned = new Set(
          details
            .filter(Boolean)
            .flatMap((order) => order.items.map((item) => item.sku)),
        );

        if (active) {
          setChecked({
            key: requestKey,
            eligible: skus.some((sku) => owned.has(sku)),
          });
        }
      })
      .catch(() => {
        // Couldn't tell — leave the form closed rather than inviting a review
        // the server will reject.
        if (active) setChecked({ key: requestKey, eligible: false });
      });

    return () => {
      active = false;
    };
    // `requestKey` covers the product and its SKUs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, accessToken]);

  return {
    isChecking: Boolean(requestKey) && checked.key !== requestKey,
    canReview: checked.key === requestKey && checked.eligible,
  };
}

/**
 * Review form. The API takes the author from the bearer token — there are no
 * name or email fields to send — and only accepts reviews from accounts that
 * actually bought the product, so a rejection here is expected and reported as
 * the server words it.
 */
function CommentForm({ product }) {
  const titleId = useId();
  const bodyId = useId();
  const location = useLocation();
  const { accessToken, isAuthenticated } = useAuth();
  const { isChecking, canReview } = useCanReview(product, accessToken);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const inputWrapperClass =
    "flex h-[52px] items-center border border-[#dadde2] focus-within:border-(--primary-color)";
  const inputClass =
    "min-w-0 flex-1 bg-white h-full w-full px-[17px] text-[14px] text-black placeholder:text-[#9fa5b2] focus:outline-none";
  const labelClass = "text-[14px] font-medium text-[#575f71]";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (rating < 1) {
      setError("Choose a star rating.");
      return;
    }

    setBusy(true);
    try {
      await submitReview(
        { productId: product.id, rating, title, body },
        accessToken,
      );
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-black">Add a comment</h3>
        <div className="flex flex-col gap-2 border border-gray-200 bg-[#f7f8fa] p-6">
          <h4 className="text-lg font-semibold text-black">
            Reviews are for verified buyers
          </h4>
          <p className="text-sm text-gray-500">
            <Link
              to="/login"
              state={{ from: location }}
              className="font-semibold text-(--primary-color) underline"
            >
              Sign in
            </Link>{" "}
            with the account you ordered on to leave a review.
          </p>
        </div>
      </div>
    );
  }

  // Signed in, but we're still working out whether they've received this item.
  if (isChecking) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-black">Add a comment</h3>
        <div className="border border-gray-200 bg-[#f7f8fa] p-6">
          <p className="text-sm text-gray-500">Checking your orders…</p>
        </div>
      </div>
    );
  }

  // The form opens only once a delivered order containing this product is found.
  if (!canReview && !submitted) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-black">Add a comment</h3>
        <div className="flex flex-col gap-2 border border-gray-200 bg-[#f7f8fa] p-6">
          <h4 className="text-lg font-semibold text-black">
            Reviews are for delivered orders
          </h4>
          <p className="text-sm text-gray-500">
            Once an order containing this product has been delivered to you, you
            can leave a review here.{" "}
            <Link
              to="/account/orders"
              className="font-semibold text-(--primary-color) underline"
            >
              View your orders
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-black">Add a comment</h3>
        <div className="flex flex-col gap-2 border border-gray-200 bg-[#f7f8fa] p-6">
          <h4 className="text-lg font-semibold text-black">
            Thanks for your review!
          </h4>
          <p className="text-sm text-gray-500">
            It&apos;s been received and will appear here once it&apos;s been
            approved.
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
          Reviews are published against your account name once approved.
          Required fields are marked *
        </p>

        {error && (
          <p className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
            {error}
          </p>
        )}

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
              <input
                id={titleId}
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={150}
                disabled={busy}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={bodyId} className={labelClass}>
              Your Review <span className="text-[#d84c47]">*</span>
            </label>
            <textarea
              id={bodyId}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              required
              rows={4}
              disabled={busy}
              className="w-full border border-[#dadde2] bg-white p-[17px] text-[14px] text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full cursor-pointer bg-black px-15 py-3 text-sm font-semibold uppercase text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 lg:w-fit"
          >
            {busy ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ReviewsPanel({ product, reviews }) {
  const summary = reviews?.summary;
  const list = reviews?.reviews ?? [];
  const average = summary?.average_rating ?? 0;
  const total = summary?.review_count ?? 0;

  // `RatingSummary` gives only an average and a count, so the star breakdown is
  // tallied from the reviews on this page — labelled as such rather than passed
  // off as the whole picture.
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: list.filter((review) => review.rating === stars).length,
  }));
  const maxCount = Math.max(...breakdown.map((row) => row.count), 1);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-semibold text-black">
          {total.toLocaleString()} {total === 1 ? "Review" : "Reviews"}
        </h3>

        {total > 0 && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex shrink-0 flex-col items-center justify-center gap-1 bg-gray-100 px-6 py-4">
              <StarRow rating={Math.round(average)} />
              <span className="text-2xl font-bold text-[#ffab00]">
                {average.toFixed(1)}{" "}
                <span className="text-sm font-normal text-gray-500">
                  out of 5
                </span>
              </span>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-1.5">
              {breakdown.map((row) => (
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
              <p className="text-[11px] text-gray-400">
                Breakdown covers the {list.length} most recent reviews.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {list.length === 0 ? (
            <p className="text-sm text-gray-500">
              No approved reviews for this product yet.
            </p>
          ) : (
            list.map((review) => (
              <div key={review.id} className="border border-gray-200 p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-500">
                      <Star className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-black">
                        {review.is_verified_purchase
                          ? "Verified buyer"
                          : "Customer"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatReviewDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  <StarRow rating={review.rating} />
                </div>
                {review.title && (
                  <h4 className="mb-1 text-sm font-semibold text-black">
                    {review.title}
                  </h4>
                )}
                <p className="text-sm text-gray-600">{review.body}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <CommentForm product={product} />
    </div>
  );
}

export default ReviewsPanel;
