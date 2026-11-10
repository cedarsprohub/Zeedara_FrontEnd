import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.js";
import { useStickyNavHeight } from "../../../context/NavbarHeightContext";
import { listMyReviews } from "../../../api/reviews";
import Pager from "../../../components/account/Pager";
import ItemImage from "../Orders/ItemImage";

const PAGE_SIZE = 10;

// Moderation status → what the customer is told about their review.
const REVIEW_STATUS = {
  pending: { label: "AWAITING APPROVAL", className: "bg-[#fbf4e8] text-[#d99116]" },
  approved: { label: "PUBLISHED", className: "bg-[#eefeec] text-[#298d1c]" },
  rejected: { label: "NOT PUBLISHED", className: "bg-[#fae9e9] text-[#cf251f]" },
  hidden: { label: "NOT PUBLISHED", className: "bg-[#fae9e9] text-[#cf251f]" },
};

const solidButton =
  "flex h-10 w-full shrink-0 items-center justify-center whitespace-nowrap bg-(--primary-color) px-4 text-[14px] font-semibold leading-[1.4] tracking-[0.28px] text-white transition-colors hover:bg-[#a06e1c] @xl:w-[207px]";
const softButton =
  "flex h-10 w-full shrink-0 items-center justify-center whitespace-nowrap bg-[#faf4eb] px-4 text-[14px] font-semibold leading-[1.4] tracking-[0.28px] text-(--primary-color) transition-colors hover:bg-[#f3e7d2] @xl:w-[207px]";

function formatDay(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
}

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={`size-4 ${
            index < rating
              ? "fill-[#feb954] text-[#feb954]"
              : "fill-transparent text-[#dadde2]"
          }`}
        />
      ))}
    </span>
  );
}

// The design's order-style card: product image flush left, a header row, the
// product, and the action on the right. Stacked when the card is narrow.
function Card({ item, header, children, action }) {
  return (
    <article className="@container border border-[#dadde2] bg-white">
      <div className="flex">
        <ItemImage item={item} className="w-[88px] self-stretch @xl:w-[163px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 py-4 @xl:py-5">
          <div className="flex flex-col gap-1 text-[14px] font-medium leading-[1.4] text-[#48505e] @xl:flex-row @xl:items-start @xl:justify-between @xl:gap-4">
            {header}
          </div>
          <span className="h-px w-full bg-[#dadde2]" />
          <div className="flex flex-col gap-4 @xl:flex-row @xl:items-center @xl:justify-between">
            <div className="flex min-w-0 flex-col gap-2">{children}</div>
            {action}
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductName({ item }) {
  return item.product_slug ? (
    <Link
      to={`/products/${item.product_slug}`}
      className="text-[16px] font-semibold leading-[1.4] text-black hover:text-(--primary-color)"
    >
      {item.product_name}
    </Link>
  ) : (
    <h3 className="text-[16px] font-semibold leading-[1.4] text-black">
      {item.product_name}
    </h3>
  );
}

function AwaitingCard({ item }) {
  return (
    <Card
      item={item}
      header={
        <>
          <p>Order ID: {item.order_number}</p>
          <p className="@xl:shrink-0 @xl:text-right">
            Delivered on {formatDay(item.delivered_at)}
          </p>
        </>
      }
      action={
        item.product_slug ? (
          <Link to={`/products/${item.product_slug}#reviews`} className={solidButton}>
            LEAVE REVIEW
          </Link>
        ) : (
          <p className="text-[13px] font-medium text-[#9fa5b2] @xl:max-w-[207px] @xl:text-right">
            This product is no longer sold, so it can&rsquo;t be reviewed.
          </p>
        )
      }
    >
      <ProductName item={item} />
      <div className="flex flex-wrap gap-x-2 gap-y-1 text-[14px] font-medium leading-[1.4] text-[#667085]">
        <span>{item.variant_name}</span>
        <span>Qty: {item.quantity}</span>
      </div>
      <span className="w-fit min-w-[78px] bg-[#eefeec] px-2 py-1 text-center text-[9.6px] font-bold uppercase leading-[1.4] text-[#298d1c]">
        Delivered
      </span>
    </Card>
  );
}

function ReviewedCard({ review }) {
  const status = REVIEW_STATUS[review.status] ?? REVIEW_STATUS.pending;
  return (
    <Card
      item={review}
      header={
        <>
          <Stars rating={review.rating} />
          <p className="@xl:shrink-0 @xl:text-right">
            Reviewed on {formatDay(review.created_at)}
          </p>
        </>
      }
      action={
        review.product_slug && (
          <Link to={`/products/${review.product_slug}#reviews`} className={softButton}>
            VIEW PRODUCT
          </Link>
        )
      }
    >
      <ProductName item={review} />
      {review.title && (
        <p className="text-[14px] font-semibold leading-[1.4] text-[#48505e]">
          {review.title}
        </p>
      )}
      <p className="line-clamp-3 text-[14px] font-medium leading-[1.4] text-[#667085]">
        {review.body}
      </p>
      <span
        className={`w-fit px-2 py-1 text-[9.6px] font-bold leading-[1.4] ${status.className}`}
      >
        {status.label}
      </span>
    </Card>
  );
}

function Reviews() {
  const { accessToken } = useAuth();
  const stickyNavHeight = useStickyNavHeight();
  const [tab, setTab] = useState("awaiting");
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState({ token: null, data: null, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  const isLoading =
    Boolean(accessToken) && (loaded.token !== accessToken || loaded.stale);

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    listMyReviews(accessToken)
      .then((data) => active && setLoaded({ token: accessToken, data, error: null }))
      .catch(
        (err) =>
          active && setLoaded({ token: accessToken, data: null, error: err.message }),
      );
    return () => {
      active = false;
    };
  }, [accessToken, reloadKey]);

  const awaiting = loaded.data?.awaiting ?? [];
  const reviewed = loaded.data?.reviewed ?? [];
  const list = tab === "awaiting" ? awaiting : reviewed;
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const visible = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tabs = [
    { key: "awaiting", label: "To Review", count: awaiting.length },
    { key: "reviewed", label: "My Reviews", count: reviewed.length },
  ];

  return (
    <div className="flex flex-col gap-[25px] lg:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[20px] font-semibold leading-[1.4] text-black lg:text-[24px]">
          Reviews
        </h1>
        <p className="text-[14px] leading-[1.4] text-[#48505e] lg:text-[16px]">
          Share what you think of products you&rsquo;ve received, and see the
          reviews you&rsquo;ve written.
        </p>
      </div>

      {/* Tabs — pinned below the main nav, like the orders screen. */}
      <div
        className="sticky z-10 -mb-5 bg-white pb-5"
        style={{ top: `${stickyNavHeight}px` }}
      >
        <div role="tablist" className="flex w-full border-b border-[#dadde2] sm:w-fit">
          {tabs.map(({ key, label, count }) => {
            const selected = key === tab;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setTab(key);
                  setPage(1);
                }}
                className={`relative -mb-px shrink-0 cursor-pointer px-4 py-3 text-[14px] font-semibold uppercase leading-[1.4] transition-colors ${
                  selected
                    ? "text-(--primary-color) after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-(--primary-color)"
                    : "text-[#667085] hover:text-(--primary-color)"
                }`}
              >
                {label}
                {!isLoading && !loaded.error && ` (${count})`}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="flex flex-col gap-5">
        {isLoading ? (
          <div className="skeleton-delayed flex flex-col gap-5">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="skeleton h-[150px] w-full" />
            ))}
          </div>
        ) : loaded.error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-[14px] font-medium text-[#48505e]">
              We couldn&rsquo;t load your reviews. {loaded.error}
            </p>
            <button
              type="button"
              onClick={() => {
                setLoaded((prev) => ({ ...prev, stale: true }));
                setReloadKey((key) => key + 1);
              }}
              className="cursor-pointer text-[14px] font-semibold text-(--primary-color) underline"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col gap-5 border border-[#dadde2] bg-white p-4 lg:p-[21px]">
            <p className="text-[18px] font-bold leading-[1.4] text-(--primary-color)">
              {tab === "awaiting"
                ? "Nothing to review right now."
                : "You haven’t written any reviews yet."}
            </p>
            <span className="h-px w-full bg-[#dadde2]" />
            <p className="text-[14px] font-medium leading-[1.4] text-black">
              {tab === "awaiting"
                ? "Products from your delivered orders will appear here so you can tell other shoppers what you think."
                : "Once you review a product you’ve received, it will appear here with its status."}
            </p>
          </div>
        ) : tab === "awaiting" ? (
          visible.map((item) => <AwaitingCard key={item.product_id} item={item} />)
        ) : (
          visible.map((review) => <ReviewedCard key={review.id} review={review} />)
        )}
      </div>

      <Pager
        page={page}
        pageCount={pageCount}
        onChange={(next) => {
          setPage(next);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}

export default Reviews;
