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
import { CATEGORY_COLORS } from "./data";
import { formatNairaShort } from "./formatNairaShort";

const AXIS_TICK = { fill: "#828a9b", fontSize: 12 };

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#262626] px-2 py-1.5 text-[11px] leading-[1.4] text-white">
      <p>{label}</p>
      <p>Revenue = {formatNairaShort(payload[0].value)}</p>
    </div>
  );
}

export function RevenueTrendChart({ data }) {
  if (!data.length) {
    return (
      <p className="flex h-[214px] items-center justify-center text-[12px] text-[#828a9b]">
        No revenue in this period.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={214}>
      <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
        <defs>
          {/* The design fades the fill out to nothing well before the axis. */}
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ca9949" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#ca9949" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#f0f1f3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          // Labelling every point crowds the axis once a 365-day range comes
          // back daily; this keeps roughly six labels at any range.
          interval={Math.max(0, Math.ceil(data.length / 6) - 1)}
          dy={8}
        />
        <YAxis
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={formatNairaShort}
        />
        <Tooltip
          content={<RevenueTooltip />}
          cursor={{ stroke: "#ca9949", strokeDasharray: "4 4" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#ca9949"
          strokeWidth={2}
          fill="url(#revenueFill)"
          activeDot={{ r: 4, fill: "#ca9949", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut({ slices, total }) {
  if (!slices.length) {
    return (
      <div className="flex size-[104px] shrink-0 items-center justify-center text-[11px] text-[#828a9b]">
        No data
      </div>
    );
  }

  return (
    <div className="relative size-[104px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            innerRadius={34}
            outerRadius={52}
            paddingAngle={1}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            {slices.map((slice, index) => (
              <Cell
                key={slice.label}
                fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Centre label sits over the hole rather than inside the SVG, so it can
          use the page's font stack instead of SVG text metrics. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[14px] font-bold text-[#262626]">
          {formatNairaShort(total)}
        </span>
        <span className="text-[9px] font-medium text-[#828a9b]">Revenue</span>
      </div>
    </div>
  );
}
