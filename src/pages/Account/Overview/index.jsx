import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";
import { listAddresses } from "../../../api/addresses";
import { listMyOrders } from "../../../api/orders";
import { formatAmount } from "../../../utils/formatCurrency";
import { ORDER_STATUS_LABEL } from "../../../utils/orderStatus";

// TODO(api): these counts have no endpoint behind them. Reviews-outstanding
// would need the delivered orders cross-referenced against submitted reviews,
// and returns/custom-hair/skincare have no customer-facing list routes at all,
// so the figures stay illustrative until the API can supply them.
const pendingActions = [
  { count: "12", text: "products waiting for review" },
  { count: "1", text: "return request under review" },
  { count: "2", text: "custom hair quote awaiting response" },
  { count: "1", text: "skincare consultation response available" },
];

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

function Card({ title, children, className = "" }) {
  return (
    <div
      className={`flex flex-col border border-[#dadde2] px-5 py-4 ${className}`}
    >
      <div className="flex flex-col gap-3">
        <h2 className="text-[14px] font-semibold leading-[1.4] text-black">
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
    <div className="flex items-center justify-between gap-4 text-[13px] font-medium">
      <span className="text-[#667085]">{label}</span>
      <span className="text-black">{value}</span>
    </div>
  );
}

function Overview() {
  const { user, accessToken } = useAuth();
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");

  // Both cards are tagged with the session they were loaded for, so "loading" is
  // derived rather than tracked, and an account switch can't show the previous
  // one's address or order.
  const [loaded, setLoaded] = useState({
    token: null,
    address: null,
    order: null,
  });

  const isLoading = Boolean(accessToken) && loaded.token !== accessToken;
  const address = isLoading ? null : loaded.address;
  const recentOrder = isLoading ? null : loaded.order;

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;

    // One card each, fetched together. Either failing leaves that card in its
    // empty state rather than taking the page down.
    Promise.all([
      listAddresses(accessToken).catch(() => []),
      listMyOrders({ limit: 1 }, accessToken).catch(() => []),
    ]).then(([addresses, orders]) => {
      if (!active) return;
      const list = Array.isArray(addresses) ? addresses : [];
      setLoaded({
        token: accessToken,
        address: list.find((entry) => entry.is_default) ?? list[0] ?? null,
        order: (Array.isArray(orders) ? orders : [])[0] ?? null,
      });
    });

    return () => {
      active = false;
    };
  }, [accessToken]);

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      <div className="hidden flex-col gap-1 lg:flex">
        <h1 className="flex flex-wrap items-center gap-2 text-[16px] font-semibold leading-[1.4]">
          <span className="text-black">Welcome back,</span>
          <span className="text-(--primary-color)">
            {user?.first_name || "there"}
          </span>
        </h1>
        <p className="text-[13px] text-[#667085]">
          Here&rsquo;s a quick look at your latest account activity.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-10 md:gap-y-6">
        {/* Account Details */}
        <Card title="Account Details" className="gap-4">
          <div className="mt-1 flex flex-col gap-3">
            <DetailRow label="Name" value={fullName || "—"} />
            <DetailRow label="Email" value={user?.email || "—"} />
            <DetailRow
              label="Phone number"
              value={user?.phone_number || "—"}
            />
          </div>
        </Card>

        {/* Default Delivery Address — the saved default, or the first address on
            file if none is flagged. */}
        <Card title="Default Delivery Address" className="justify-between gap-4">
          {isLoading ? (
            <div className="skeleton-delayed mt-1 flex flex-col gap-2">
              <div className="skeleton h-3 w-[160px]" />
              <div className="skeleton h-3 w-[200px]" />
              <div className="skeleton h-3 w-[120px]" />
            </div>
          ) : address ? (
            <div className="mt-1 text-[13px] font-medium leading-[1.4] text-[#667085]">
              <p className="font-semibold text-[#48505e]">
                {address.recipient_name}
              </p>
              <p>{address.delivery_address}</p>
              {(address.city || address.state) && (
                <p>{[address.city, address.state].filter(Boolean).join(", ")}</p>
              )}
              <p>{address.phone}</p>
            </div>
          ) : (
            <p className="mt-1 text-[13px] font-medium leading-[1.4] text-[#667085]">
              No delivery address saved yet.
              <br />
              Add an address to checkout faster next time.
            </p>
          )}

          {/* Always the address book's add-new form, whether or not there's
              already a default on file. Editing an existing address lives on the
              address book itself, next to the address it belongs to. */}
          <Link
            to="/account/address-book/new"
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#faf4eb] px-4 text-[13px] font-semibold text-(--primary-color) transition-colors hover:bg-[#f3e7d2]"
          >
            ADD NEW ADDRESS
          </Link>
        </Card>

        {/* Most Recent Order — the newest row from `GET /orders`. */}
        <Card title="Most Recent Order" className="justify-between gap-4">
          {isLoading ? (
            <div className="skeleton-delayed mt-1 flex flex-col gap-2">
              <div className="skeleton h-4 w-[140px]" />
              <div className="skeleton h-3 w-[180px]" />
              <div className="skeleton h-3 w-[120px]" />
            </div>
          ) : recentOrder ? (
            <>
              <p className="mt-1 text-[14px] font-medium text-black">
                Order #{recentOrder.order_number}
              </p>
              <div className="flex items-end justify-between gap-4">
                <p className="text-[13px] font-medium leading-[1.4] text-[#667085]">
                  Placed on {formatOrderDate(recentOrder.created_at)}
                  <br />
                  Status:{" "}
                  {ORDER_STATUS_LABEL[recentOrder.status] ?? recentOrder.status}
                  <br />
                  Total: {formatAmount(recentOrder.total_ngn)}
                </p>
                {/* The design's second link was "Edit Address" — an order's
                    delivery address can't be changed once placed (the API has no
                    route for it), so this goes to the order instead. */}
                <div className="flex shrink-0 gap-3 text-[13px] font-semibold text-(--primary-color)">
                  <Link
                    to={`/account/orders/${recentOrder.order_number}`}
                    className="cursor-pointer underline"
                  >
                    Track Order
                  </Link>
                  <Link to="/account/orders" className="cursor-pointer underline">
                    All Orders
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-[13px] font-medium leading-[1.4] text-[#667085]">
                You haven&rsquo;t placed an order yet.
              </p>
              <Link
                to="/products"
                className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#faf4eb] px-4 text-[13px] font-semibold text-(--primary-color) transition-colors hover:bg-[#f3e7d2]"
              >
                START SHOPPING
              </Link>
            </>
          )}
        </Card>

        {/* Pending Actions */}
        <Card title="Pending Actions" className="gap-3">
          <div className="mt-1 flex flex-col gap-3 text-[13px] font-medium text-[#667085]">
            {pendingActions.map(({ count, text }) => (
              <p key={text} className="leading-[1.4]">
                <span className="font-semibold text-(--primary-color)">
                  {count}
                </span>{" "}
                {text}
              </p>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Overview;
