import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Download,
  Wallet,
  ShoppingCart,
  CreditCard,
  Scissors,
  FlaskConical,
  TrendingUp,
} from "lucide-react";
import Seo from "../../../components/shared/Seo";
import QuickAddMenu from "../../../components/admin/QuickAddMenu";
import { CategoryDonut, RevenueTrendChart } from "./charts";
import {
  CATEGORY_SHARE,
  DATE_RANGES,
  KPIS,
  LOW_STOCK,
  LOW_STOCK_COUNT,
  ORDER_STATUS_STYLES,
  QUEUES,
  RECENT_ORDERS,
  TOP_PRODUCTS,
} from "./data";

const ICONS = {
  revenue: Wallet,
  orders: ShoppingCart,
  aov: CreditCard,
  wig: Scissors,
  clinic: FlaskConical,
};

// The bordered white box every panel on this page sits in. `min-w-0` matters:
// without it a card holding a min-width table grows past its grid/flex track
// and drags the whole page into a horizontal scroll instead of scrolling the
// table inside its own overflow container.
function Card({ className = "", children }) {
  return (
    <div className={`min-w-0 border border-[#f0f1f3] bg-white ${className}`}>
      {children}
    </div>
  );
}

// Title + subtitle on the left, optional action on the right, divider beneath.
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

// Tinted square behind a stat's icon. The tint and icon colour are per-card in
// the design, so they arrive as inline styles rather than classes.
function IconTile({ name, tint, iconColor, size = "size-6" }) {
  const Icon = ICONS[name];
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center shadow-[inset_0_3.333px_6.667px_0_rgba(0,0,0,0.05)]"
      style={{ backgroundColor: tint }}
    >
      <Icon className={size} style={{ color: iconColor }} strokeWidth={1.75} />
    </span>
  );
}

function Dashboard() {
  const [range, setRange] = useState("12 months");

  return (
    <div className="flex min-w-0 flex-col gap-[21px]">
      <Seo title="Dashboard" description="Zeedara admin dashboard." noindex />

      {/* Page header */}
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

      {/* KPI cards */}
      <div className="grid gap-[17px] sm:grid-cols-2 lg:grid-cols-3">
        {KPIS.map((kpi) => (
          <Card key={kpi.label} className="flex flex-col justify-between gap-4 p-[17px]">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[14px] font-medium text-[#667085]">{kpi.label}</p>
              <IconTile name={kpi.icon} tint={kpi.tint} iconColor={kpi.iconColor} />
            </div>
            <div className="flex flex-col items-start gap-1">
              <p className="text-[24px] font-bold text-[#262626]">{kpi.value}</p>
              <span className="flex items-center gap-[3px] rounded-full bg-[#ecfdf3] py-0.5 pr-[7px] pl-[5px] text-[12px] font-semibold text-[#027a48]">
                <TrendingUp className="size-[13px]" strokeWidth={2.5} />
                {kpi.delta}
              </span>
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
            <RevenueTrendChart />
          </div>
        </Card>

        <Card>
          <PanelHeader title="Top Sales by category" subtitle="Share of revenue" />
          <div className="flex flex-col items-center gap-4 p-[18px] sm:flex-row sm:gap-6">
            <CategoryDonut />
            <ul className="flex w-full min-w-0 flex-col gap-3 sm:flex-1">
              {CATEGORY_SHARE.slices.map((slice) => (
                <li
                  key={slice.name}
                  className="flex items-center gap-2 text-[12px] text-[#48505e]"
                >
                  <span
                    className="size-[9px] shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="flex-1 leading-[1.2]">{slice.name}</span>
                  <span className="font-semibold text-[#262626]">
                    {slice.amount}
                  </span>
                  <span className="w-7 text-right text-[#828a9b]">
                    {slice.share}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* Work queues */}
      <div className="grid gap-[17px] sm:grid-cols-2 lg:grid-cols-3">
        {QUEUES.map((queue) => (
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
                <p className="text-[24px] font-bold text-[#262626]">
                  {queue.value}
                </p>
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
              {RECENT_ORDERS.map((order, index) => {
                const status = ORDER_STATUS_STYLES[order.status];
                return (
                  <tr
                    // Order ids repeat across rows in the mock data, so the index
                    // is part of the key.
                    key={`${order.id}-${index}`}
                    className="border-b border-[#f0f1f3] last:border-0"
                  >
                    <td className="px-4 py-3 text-[12px] font-medium text-[#262626]">
                      {order.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-(--primary-color) text-[11px] font-bold text-white">
                          {order.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-[#262626]">
                            {order.name}
                          </p>
                          <p className="truncate text-[12px] text-[#828a9b]">
                            {order.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                        style={{ backgroundColor: status.bg, color: status.text }}
                      >
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: status.dot }}
                        />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[12px] font-semibold text-[#262626]">
                      {order.total}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#828a9b]">
                      {order.placed}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top products + low stock */}
      <div className="grid gap-[21px] lg:grid-cols-[385px_1fr]">
        <Card>
          <PanelHeader title="Top products" subtitle="By revenue this period" />
          <ul className="p-[18px]">
            {TOP_PRODUCTS.map((product, index) => (
              <li
                key={`${product.name}-${index}`}
                className="flex items-center gap-3 border-b border-[#f0f1f3] py-3 last:border-0"
              >
                <span className="flex size-[22px] shrink-0 items-center justify-center bg-[#f9fafb] text-[12px] font-semibold text-[#48505e]">
                  {product.rank}
                </span>
                <span className="text-[18px]" aria-hidden="true">
                  {product.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-[#262626]">
                    {product.name}
                  </p>
                  <p className="text-[12px] text-[#828a9b]">
                    {product.units} units sold
                  </p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold text-[#262626]">
                  {product.revenue}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <PanelHeader
            title="Low stock alerts"
            subtitle={`${LOW_STOCK_COUNT} variant(s) at or below reorder point`}
            action={<PanelLink to="/admin/products">Manage</PanelLink>}
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f0f1f3]">
                  {["Product", "Variant", "Stock", ""].map((heading, index) => (
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
                {LOW_STOCK.map((row) => (
                  <tr
                    key={row.sku}
                    className="border-b border-[#f0f1f3] last:border-0"
                  >
                    <td className="px-3 py-4">
                      <p className="text-[12px] font-semibold text-[#262626]">
                        {row.product}
                      </p>
                      <p className="text-[12px] text-[#828a9b]">{row.sku}</p>
                    </td>
                    <td className="px-3 py-4 text-[12px] text-[#48505e]">
                      {row.variant}
                    </td>
                    <td className="px-3 py-4">
                      {/* null stock is the design's "Out of stock" pill; a
                          number renders bare. */}
                      {row.stock === null ? (
                        <span className="inline-block rounded-full bg-[#fef3f2] px-2.5 py-1 text-[12px] font-semibold text-[#b42318]">
                          Out of stock
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#262626]">
                          {row.stock}
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
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
