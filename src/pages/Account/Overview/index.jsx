import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";
import { getPendingActions } from "../../../api/auth";
import { listAddresses } from "../../../api/addresses";
import { listMyOrders } from "../../../api/orders";
import { formatAmount } from "../../../utils/formatCurrency";
import { ORDER_STATUS_LABEL } from "../../../utils/orderStatus";

// `GET /users/me/pending-actions` fields → the card's wording.
const PENDING_ACTIONS = [
  {
    key: "products_awaiting_review",
    one: "product waiting for review",
    many: "products waiting for review",
  },
  {
    key: "returns_under_review",
    one: "return request under review",
    many: "return requests under review",
  },
  {
    key: "custom_hair_quotes_awaiting_response",
    one: "custom hair quote awaiting response",
    many: "custom hair quotes awaiting response",
  },
  {
    key: "skincare_responses_available",
    one: "skincare consultation response available",
    many: "skincare consultation responses available",
  },
];

const linkClasses =
  "cursor-pointer text-[12px] font-semibold leading-[1.4] text-(--primary-color) underline lg:text-[14px]";

const softButtonClasses =
  "flex h-10 w-full cursor-pointer items-center justify-center bg-[#faf4eb] px-4 text-[12px] font-semibold leading-[1.4] text-(--primary-color) transition-colors hover:bg-[#f3e7d2] lg:text-[14px]";

function formatOrderDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

// Mobile cards stack their content 8px apart; on desktop the title sits at the
// top and the body is pushed to the bottom, so cards sharing a row line up.
function Card({ title, children }) {
  return (
    <div className="flex flex-col gap-2 border border-[#dadde2] px-4 py-3 lg:justify-between lg:gap-4 lg:px-5 lg:py-4">
      <div className="flex flex-col gap-3">
        <h2 className="text-[16px] font-semibold leading-[1.4] text-black lg:text-[18px]">
          {title}
        </h2>
        <span className="h-px w-full bg-[#dadde2]" />
      </div>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[14px] font-medium leading-[1.4]">
      <span className="shrink-0 text-[#48505e]">{label}</span>
      <span className="min-w-0 text-right text-black [overflow-wrap:anywhere]">{value}</span>
    </div>
  );
}

// Long addresses wrap at the "@" rather than mid-word on narrow screens.
function breakableEmail(email) {
  if (!email) return "—";
  const at = email.indexOf("@");
  if (at < 1) return email;
  return (
    <>
      {email.slice(0, at)}
      <wbr />
      {email.slice(at)}
    </>
  );
}

function SkeletonLines({ widths }) {
  return (
    <div className="skeleton-delayed flex flex-col gap-2">
      {widths.map((width, index) => (
        <div key={index} className="skeleton h-3" style={{ width }} />
      ))}
    </div>
  );
}

function Overview() {
  const { user, accessToken } = useAuth();
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");

  // Every card is tagged with the session it was loaded for, so "loading" is
  // derived rather than tracked, and an account switch can't show the previous
  // one's address, order or counts.
  const [loaded, setLoaded] = useState({
    token: null,
    address: null,
    order: null,
    pending: null,
  });

  const isLoading = Boolean(accessToken) && loaded.token !== accessToken;
  const address = isLoading ? null : loaded.address;
  const recentOrder = isLoading ? null : loaded.order;
  const pending = isLoading ? null : loaded.pending;

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;

    // One request per card, fetched together. Any one failing leaves that card
    // in its empty/error state rather than taking the page down.
    Promise.all([
      listAddresses(accessToken).catch(() => []),
      listMyOrders({ limit: 1 }, accessToken).catch(() => []),
      getPendingActions(accessToken).catch(() => null),
    ]).then(([addresses, orders, pendingActions]) => {
      if (!active) return;
      const list = Array.isArray(addresses) ? addresses : [];
      setLoaded({
        token: accessToken,
        address: list.find((entry) => entry.is_default) ?? list[0] ?? null,
        order: (Array.isArray(orders) ? orders : [])[0] ?? null,
        pending: pendingActions,
      });
    });

    return () => {
      active = false;
    };
  }, [accessToken]);

  // Shared by the address card and the order card's "Edit Address".
  const editAddressRoute = address
    ? `/account/address-book/${address.id}/edit`
    : "/account/address-book/new";

  const pendingRows = pending
    ? PENDING_ACTIONS.map((row) => ({ ...row, count: pending[row.key] ?? 0 }))
        .filter((row) => row.count > 0)
    : [];

  return (
    <div className="flex flex-col gap-[25px] lg:p-8">
      <div className="hidden flex-col lg:flex">
        <h1 className="flex flex-wrap items-center gap-x-2 text-[24px] font-semibold leading-[1.4]">
          <span className="text-black">Welcome back,</span>
          <span className="text-(--primary-color)">
            {user?.first_name || "there"}
          </span>
        </h1>
        <p className="text-[16px] leading-[1.4] text-[#48505e]">
          Here&rsquo;s a quick look at your latest account activity.
        </p>
      </div>

      {/* One column on phones and in the narrow content panel at `lg` (where the
          rail eats the width); two side by side when there's room for them. */}
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-10 md:gap-y-[25px] lg:grid-cols-1 xl:grid-cols-2">
        {/* Account Details */}
        <Card title="Account Details">
          <div className="flex flex-col gap-2 lg:gap-4">
            <DetailRow label="Name" value={fullName || "—"} />
            <DetailRow label="Email" value={breakableEmail(user?.email)} />
            <DetailRow
              label="Phone number"
              value={user?.phone_number || "—"}
            />
          </div>
        </Card>

        {/* Default Delivery Address — the saved default, or the first address on
            file if none is flagged. */}
        <Card title="Default Delivery Address">
          {isLoading ? (
            <SkeletonLines widths={[160, 200, 120]} />
          ) : address ? (
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0 text-[14px] font-medium leading-[1.4] text-[#667085]">
                <p className="mb-2 font-semibold text-[#48505e] lg:mb-[14px]">
                  {address.recipient_name}
                </p>
                <p>{address.delivery_address}</p>
                {(address.city || address.state) && (
                  <p>
                    {[address.city, address.state].filter(Boolean).join(", ")}
                  </p>
                )}
                <p>{address.phone}</p>
              </div>
              <Link
                to={editAddressRoute}
                className={`${linkClasses} shrink-0`}
              >
                Edit Address
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[14px] font-medium leading-[1.4] text-[#48505e]">
                No delivery address saved yet.
                <br />
                Add an address to checkout faster next time.
              </p>
              <Link to="/account/address-book/new" className={softButtonClasses}>
                ADD ADDRESS
              </Link>
            </>
          )}
        </Card>

        {/* Most Recent Order — the newest row from `GET /orders`. */}
        <Card title="Most Recent Order">
          {isLoading ? (
            <SkeletonLines widths={[140, 180, 120]} />
          ) : recentOrder ? (
            <>
              <p className="text-[14px] font-semibold leading-[1.4] text-black lg:text-[16px] lg:font-medium">
                Order #{recentOrder.order_number}
              </p>
              <div className="flex flex-wrap items-end justify-between gap-x-1 gap-y-2">
                <p className="text-[14px] font-medium leading-[1.4] text-[#48505e]">
                  Placed on {formatOrderDate(recentOrder.created_at)}
                  <br />
                  Status:{" "}
                  {ORDER_STATUS_LABEL[recentOrder.status] ?? recentOrder.status}
                  <br />
                  Total: {formatAmount(recentOrder.total_ngn)}
                </p>
                {/* "Edit Address" edits the same default delivery address as
                    the card above — the one used for orders — or adds one if
                    none is saved yet. */}
                <div className="flex shrink-0 gap-2 lg:gap-3">
                  <Link
                    to={`/account/orders/${recentOrder.order_number}`}
                    className={linkClasses}
                  >
                    Track Order
                  </Link>
                  <Link to={editAddressRoute} className={linkClasses}>
                    Edit Address
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-[14px] font-medium leading-[1.4] text-[#48505e]">
                You haven&rsquo;t placed an order yet.
              </p>
              <Link to="/products" className={softButtonClasses}>
                START SHOPPING
              </Link>
            </>
          )}
        </Card>

        {/* Pending Actions — live counts from `GET /users/me/pending-actions`;
            zero rows are dropped rather than shown as "0 …". */}
        <Card title="Pending Actions">
          {isLoading ? (
            <SkeletonLines widths={[200, 180, 220, 190]} />
          ) : !pending ? (
            <p className="text-[14px] font-medium leading-[1.4] text-[#48505e]">
              We couldn&rsquo;t load your pending actions right now.
            </p>
          ) : pendingRows.length === 0 ? (
            <p className="text-[14px] font-medium leading-[1.4] text-[#48505e]">
              You&rsquo;re all caught up — nothing needs your attention.
            </p>
          ) : (
            <ul className="flex flex-col gap-2 text-[14px] font-medium leading-[1.4] text-[#48505e] lg:gap-1">
              {pendingRows.map(({ key, count, one, many }) => (
                <li key={key}>
                  <span className="font-semibold text-(--primary-color)">
                    {count}
                  </span>{" "}
                  {count === 1 ? one : many}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Overview;
