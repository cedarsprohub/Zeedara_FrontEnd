import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Download,
  RotateCw,
  Wallet,
  ShoppingCart,
  CreditCard,
  Scissors,
  FlaskConical,
  TrendingUp,
} from "lucide-react";
import Seo from "../../../components/shared/Seo";
import QuickAddMenu from "../../../components/admin/QuickAddMenu";
import { formatCurrency, toAmount } from "../../../utils/formatCurrency";
import { CategoryDonut, RevenueTrendChart } from "./charts";
import { formatNairaShort } from "./formatNairaShort";
import { useDashboardData } from "./useDashboardData";
import {
  ACTIONABLE_ORDER_STATUSES,
  CATEGORY_COLORS,
  DATE_RANGES,
  DEFAULT_STATUS_STYLE,
  humaniseStatus,
  initialsFor,
  KPI_CARDS,
  ORDER_STATUS_STYLES,
} from "./data";

const ICONS = {
  revenue: Wallet,
  orders: ShoppingCart,
  aov: CreditCard,
  wig: Scissors,
  clinic: FlaskConical,
};

function Card({ className = "", children }) {
  return (
    <div className={`min-w-0 border border-[#f0f1f3] bg-white ${className}`}>
      {children}
    </div>
  );
}

function PanelHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f0f1f3] px-[18px] py-4">
      <div>
        <h2 className="text-[14px] font-bold text-[#262626]">{title}</h2>
        <p className="text-[12px] font-medium text-[#828a9b]">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function PanelLink({ to, children }) {
  return (
    <Link
      to={to}
      className="flex shrink-0 items-center gap-2 border border-[#f0f1f3] px-3 py-2 text-[12px] font-medium text-[#48505e] transition-colors hover:border-[#dadde2] hover:text-black"
    >
      {children}
      <ChevronRight className="size-4" strokeWidth={2} />
    </Link>
  );
}

function IconTile({ name, tint, iconColor }) {
  const Icon = ICONS[name];
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center shadow-[inset_0_3.333px_6.667px_0_rgba(0,0,0,0.05)]"
      style={{ backgroundColor: tint }}
    >
      <Icon className="size-6" style={{ color: iconColor }} strokeWidth={1.75} />
    </span>
  );
}

// Grey block standing in for a value that hasn't arrived. Deliberately not a
// number: a placeholder figure in a console people make decisions from is worse
// than an obviously-empty one.
function Skeleton({ className = "" }) {
  return <span className={`block animate-pulse bg-[#f0f1f3] ${className}`} />;
}

function EmptyRow({ children }) {
  return (
    <p className="px-[18px] py-10 text-center text-[12px] text-[#828a9b]">
      {children}
    </p>
  );
}

function Dashboard() {
  const [range, setRange] = useState("12 months");
  const {
    kpis,
    revenueTrend,
    categories,
    topProducts,
    lowStock,
    recentOrders,
    statusCounts,
    isLoading,
    error,
    reload,
  } = useDashboardData(range);

  const kpiValues = kpis && {
    revenue: formatCurrency(toAmount(kpis.total_revenue_ngn)),
    orders: kpis.total_orders?.toLocaleString("en-NG") ?? "—",
    aov: formatCurrency(toAmount(kpis.average_order_value_ngn)),
  };

  // Money arrives as decimal strings, so every series is parsed once here
  // rather than inside render.
  const trendData = useMemo(
    () =>
      revenueTrend.map((point) => ({
        label: point.date,
        value: toAmount(point.value),
      })),
    [revenueTrend],
  );

  const categoryData = useMemo(() => {
    const slices = categories.map((item) => ({
      label: item.label,
      value: toAmount(item.value),
    }));
    const total = slices.reduce((sum, slice) => sum + slice.value, 0);
    return {
      slices,
      total,
      withShare: slices.map((slice) => ({
        ...slice,
        share: total ? Math.round((slice.value / total) * 100) : 0,
      })),
    };
  }, [categories]);

  const ordersToProcess = useMemo(
    () =>
      statusCounts
        .filter((entry) => ACTIONABLE_ORDER_STATUSES.includes(entry.status))
        .reduce((sum, entry) => sum + entry.count, 0),
    [statusCounts],
  );

  // The queue cards below have no dedicated endpoint yet. Orders is derived
  // from the status breakdown; the two service queues have nothing to read, so
  // they show a dash rather than an invented figure.
  const queues = [
    {
      label: "Orders to process",
      value: statusCounts.length ? ordersToProcess.toString() : null,
      caption: "awaiting payment, packing or dispatch",
      icon: "orders",
      tint: "rgba(255,105,0,0.1)",
      iconColor: "#ff6900",
      to: "/admin/orders",
    },
    {
      label: "Custom wig briefs",
      value: null,
      caption: "No endpoint yet",
      icon: "wig",
      tint: "rgba(43,127,255,0.1)",
      iconColor: "#2b7fff",
      to: "/admin/custom-hair",
    },
    {
      label: "Skin Clinic Bookings",
      value: null,
      caption: "No endpoint yet",
      icon: "clinic",
      tint: "rgba(43,127,255,0.1)",
      iconColor: "#2b7fff",
      to: "/admin/skincare-clinic",
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-[21px]">
      <Seo title="Dashboard" description="Zeedara admin dashboard." noindex />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#262626]">Dashboard</h1>
          <p className="text-[12px] font-medium text-[#828a9b]">
            Store performance at a glance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Scrolls rather than wrapping — a segmented control that breaks
              onto two lines stops reading as one control. */}
          <div className="flex max-w-full items-center gap-0.5 overflow-x-auto border border-[#f0f1f3] bg-white p-[3px]">
            {DATE_RANGES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRange(option)}
                aria-pressed={range === option}
                className={`shrink-0 cursor-pointer px-3 py-1.5 text-[12px] transition-colors ${
                  range === option
                    ? "border border-[#f0f1f3] bg-white font-bold text-[#262626] shadow-sm"
                    : "font-medium text-[#828a9b] hover:text-[#262626]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 border border-[#f0f1f3] bg-white px-4 py-2.5 text-[14px] font-medium text-[#48505e] transition-colors hover:border-[#dadde2] hover:text-black"
          >
            <Download className="size-[17px]" strokeWidth={2} />
            Export
          </button>

          <QuickAddMenu />
        </div>
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-[#f3d3d2] bg-[#fdf2f2] px-4 py-3">
          <p className="text-[13px] font-medium text-[#cf251f]">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="flex cursor-pointer items-center gap-2 border border-[#f3d3d2] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#cf251f] transition-colors hover:bg-[#fdf2f2]"
          >
            <RotateCw className="size-3.5" strokeWidth={2.5} />
            Retry
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-[17px] sm:grid-cols-2 lg:grid-cols-3">
        {KPI_CARDS.map((card) => (
          <Card key={card.key} className="flex flex-col justify-between gap-4 p-[17px]">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[14px] font-medium text-[#667085]">
                {card.label}
              </p>
              <IconTile
                name={card.icon}
                tint={card.tint}
                iconColor={card.iconColor}
              />
            </div>
            <div className="flex flex-col items-start gap-1">
              {isLoading || !kpiValues ? (
                <Skeleton className="h-[34px] w-32" />
              ) : (
                <p className="text-[24px] font-bold text-[#262626]">
                  {kpiValues[card.key]}
                </p>
              )}
              {card.key === "orders" && kpis?.new_customers != null && (
                <span className="flex items-center gap-[3px] rounded-full bg-[#ecfdf3] py-0.5 pr-[7px] pl-[5px] text-[12px] font-semibold text-[#027a48]">
                  <TrendingUp className="size-[13px]" strokeWidth={2.5} />
                  {kpis.new_customers} new customers
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue trend + category share */}
      <div className="grid gap-[17px] lg:grid-cols-[1fr_331px]">
        <Card>
          <PanelHeader
            title="Revenue trend"
            subtitle="Paid orders, normalised to Nigerian Naira"
            action={
              <span className="flex items-center gap-2 text-[12px] font-medium text-[#48505e]">
                <span className="size-[9px] bg-(--primary-color)" />
                Revenue
              </span>
            }
          />
          <div className="p-[18px]">
            {isLoading ? (
              <Skeleton className="h-[214px] w-full" />
            ) : (
              <RevenueTrendChart data={trendData} />
            )}
          </div>
        </Card>

        <Card>
          <PanelHeader title="Top Sales by category" subtitle="Share of revenue" />
          <div className="flex flex-col items-center gap-4 p-[18px] sm:flex-row sm:gap-6">
            {isLoading ? (
              <Skeleton className="size-[104px] shrink-0 rounded-full" />
            ) : (
              <CategoryDonut
                slices={categoryData.slices}
                total={categoryData.total}
              />
            )}
            <ul className="flex w-full min-w-0 flex-col gap-3 sm:flex-1">
              {isLoading
                ? Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="h-3 w-full" />
                  ))
                : categoryData.withShare.map((slice, index) => (
                    <li
                      key={slice.label}
                      className="flex items-center gap-2 text-[12px] text-[#48505e]"
                    >
                      <span
                        className="size-[9px] shrink-0"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                        }}
                      />
                      <span className="flex-1 leading-[1.2]">{slice.label}</span>
                      <span className="font-semibold text-[#262626]">
                        {formatNairaShort(slice.value)}
                      </span>
                      <span className="w-7 text-right text-[#828a9b]">
                        {slice.share}%
                      </span>
                    </li>
                  ))}
              {!isLoading && !categoryData.withShare.length && (
                <li className="text-[12px] text-[#828a9b]">No category sales.</li>
              )}
            </ul>
          </div>
        </Card>
      </div>

      {/* Work queues */}
      <div className="grid gap-[17px] sm:grid-cols-2 lg:grid-cols-3">
        {queues.map((queue) => (
          <Link
            key={queue.label}
            to={queue.to}
            className="group flex flex-col gap-4 border border-[#f0f1f3] bg-white p-[17px] transition-colors hover:border-[#dadde2]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[14px] font-medium text-[#667085]">
                {queue.label}
              </p>
              <IconTile
                name={queue.icon}
                tint={queue.tint}
                iconColor={queue.iconColor}
              />
            </div>
            <div className="flex items-end justify-between gap-3">
              <div>
                {isLoading ? (
                  <Skeleton className="h-[34px] w-16" />
                ) : (
                  <p className="text-[24px] font-bold text-[#262626]">
                    {queue.value ?? "—"}
                  </p>
                )}
                <p className="text-[12px] font-medium text-[#828a9b]">
                  {queue.caption}
                </p>
              </div>
              <ArrowRight
                className="size-5 shrink-0 text-[#828a9b] transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <Card>
        <PanelHeader
          title="Recent orders"
          subtitle="Latest activity across all channels"
          action={<PanelLink to="/admin/orders">View all</PanelLink>}
        />
        {isLoading ? (
          <div className="flex flex-col gap-3 p-[18px]">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : !recentOrders.length ? (
          <EmptyRow>No orders yet.</EmptyRow>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f0f1f3]">
                  {["Order", "Customer", "Status", "Total", "Placed"].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className={`px-4 py-5 text-[12px] font-medium text-[#828a9b] ${
                          heading === "Total" ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const style =
                    ORDER_STATUS_STYLES[order.status] ?? DEFAULT_STATUS_STYLE;
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-[#f0f1f3] last:border-0"
                    >
                      <td className="px-4 py-3 text-[12px] font-medium text-[#262626]">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-(--primary-color) text-[11px] font-bold text-white">
                            {initialsFor(order.customer_name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold text-[#262626]">
                              {order.customer_name}
                            </p>
                            <p className="truncate text-[12px] text-[#828a9b]">
                              {order.customer_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap"
                          style={{ backgroundColor: style.bg, color: style.text }}
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: style.dot }}
                          />
                          {humaniseStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[12px] font-semibold text-[#262626]">
                        {formatCurrency(toAmount(order.total_ngn))}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#828a9b]">
                        {new Date(order.created_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Top products + low stock */}
      <div className="grid gap-[21px] lg:grid-cols-[385px_1fr]">
        <Card>
          <PanelHeader title="Top products" subtitle="By revenue this period" />
          {isLoading ? (
            <div className="flex flex-col gap-3 p-[18px]">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          ) : !topProducts.length ? (
            <EmptyRow>No sales in this period.</EmptyRow>
          ) : (
            <ul className="p-[18px]">
              {topProducts.map((product, index) => (
                <li
                  key={`${product.product_name}-${index}`}
                  className="flex items-center gap-3 border-b border-[#f0f1f3] py-3 last:border-0"
                >
                  <span className="flex size-[22px] shrink-0 items-center justify-center bg-[#f9fafb] text-[12px] font-semibold text-[#48505e]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[#262626]">
                      {product.product_name}
                    </p>
                    <p className="text-[12px] text-[#828a9b]">
                      {product.units_sold} units sold
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] font-semibold text-[#262626]">
                    {formatNairaShort(toAmount(product.revenue_ngn))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <PanelHeader
            title="Low stock alerts"
            subtitle={
              kpis?.low_stock_products != null
                ? `${kpis.low_stock_products} variant(s) at or below reorder point`
                : "Variants at or below reorder point"
            }
            action={<PanelLink to="/admin/products">Manage</PanelLink>}
          />
          {isLoading ? (
            <div className="flex flex-col gap-3 p-[18px]">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : !lowStock.length ? (
            <EmptyRow>Nothing below its reorder point.</EmptyRow>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#f0f1f3]">
                    {["Variant", "SKU", "Stock", ""].map((heading, index) => (
                      <th
                        key={heading || index}
                        scope="col"
                        className="px-3 py-3 text-[12px] font-medium text-[#828a9b]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((row) => (
                    <tr
                      key={row.sku}
                      className="border-b border-[#f0f1f3] last:border-0"
                    >
                      <td className="px-3 py-4 text-[12px] font-semibold text-[#262626]">
                        {row.variant_name}
                      </td>
                      <td className="px-3 py-4 text-[12px] text-[#828a9b]">
                        {row.sku}
                      </td>
                      <td className="px-3 py-4">
                        {row.stock_quantity === 0 ? (
                          <span className="inline-block rounded-full bg-[#fef3f2] px-2.5 py-1 text-[12px] font-semibold text-[#b42318]">
                            Out of stock
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#262626]">
                            {row.stock_quantity}
                            <span className="text-[#828a9b]">
                              {" "}
                              / {row.low_stock_threshold}
                            </span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <button
                          type="button"
                          className="inline-flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-(--primary-color) hover:underline"
                        >
                          Restock
                          <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
