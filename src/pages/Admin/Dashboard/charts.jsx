import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORY_SHARE, REVENUE_TREND } from "./data";

const AXIS_TICK = { fill: "#828a9b", fontSize: 12 };

// ₦10M / ₦7.5M / ₦2.5M — the design drops the trailing zero on whole millions
// but keeps one decimal on halves, which `toLocaleString` won't do on its own.
function formatNaira(value) {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `₦${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}K`;
  return `₦${value}`;
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#262626] px-2 py-1.5 text-[11px] leading-[1.4] text-white">
      <p>{label}</p>
      <p>Revenue = {formatNaira(payload[0].value)}</p>
    </div>
  );
}

export function RevenueTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={214}>
      <AreaChart
        data={REVENUE_TREND}
        margin={{ top: 6, right: 8, bottom: 0, left: 0 }}
      >
        <defs>
          {/* The design fades the fill out to nothing well before the axis. */}
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ca9949" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#ca9949" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#f0f1f3" vertical={false} />
        <XAxis
          dataKey="month"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          // Aug, Oct, Dec, Feb, Apr, Jun — the design labels every other month.
          interval={1}
          dy={8}
        />
        <YAxis
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={56}
          domain={[0, 10_000_000]}
          ticks={[0, 2_500_000, 5_000_000, 7_500_000, 10_000_000]}
          tickFormatter={formatNaira}
        />
        <Tooltip
          content={<RevenueTooltip />}
          cursor={{ stroke: "#ca9949", strokeDasharray: "4 4" }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#ca9949"
          strokeWidth={2}
          fill="url(#revenueFill)"
          activeDot={{ r: 4, fill: "#ca9949", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut() {
  return (
    <div className="relative size-[104px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={CATEGORY_SHARE.slices}
            dataKey="share"
            innerRadius={34}
            outerRadius={52}
            paddingAngle={1}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            {CATEGORY_SHARE.slices.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Centre label sits over the hole rather than inside the SVG, so it can
          use the page's font stack instead of SVG text metrics. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[14px] font-bold text-[#262626]">
          {CATEGORY_SHARE.total}
        </span>
        <span className="text-[9px] font-medium text-[#828a9b]">Revenue</span>
      </div>
    </div>
  );
}
