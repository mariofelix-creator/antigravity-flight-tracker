"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PortfolioSlice {
  name: string;
  value: number;
  color: string;
}

const DEFAULT_DATA: PortfolioSlice[] = [
  { name: "ETF", value: 150.0, color: "#1da86a" },
  { name: "Bonos", value: 80.0, color: "#3b82f6" },
  { name: "Reserva", value: 70.0, color: "#f59e0b" },
];

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: PortfolioSlice;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  if (!item) return null;

  const total = DEFAULT_DATA.reduce((sum, d) => sum + d.value, 0);
  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";

  return (
    <div className="bg-white border border-border rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-foreground">{item.name}</p>
      <p className="text-muted-foreground">
        ${item.value.toFixed(2)}{" "}
        <span className="text-brand-600 font-medium">({pct}%)</span>
      </p>
    </div>
  );
}

interface CustomLegendPayloadItem {
  value: string;
  color: string;
}

interface CustomLegendProps {
  payload?: CustomLegendPayloadItem[];
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

interface PortfolioChartProps {
  data?: PortfolioSlice[];
}

export function PortfolioChart({ data = DEFAULT_DATA }: PortfolioChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          outerRadius={100}
          innerRadius={56}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
