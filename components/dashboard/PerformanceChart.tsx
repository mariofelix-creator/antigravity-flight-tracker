"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getLastNDays, formatDateShort } from "@/lib/utils";

interface PerformanceDataPoint {
  date: string;
  value: number;
}

function generateMockPerformanceData(): PerformanceDataPoint[] {
  const dates = getLastNDays(30);
  const startValue = 200;
  const endValue = 312;
  const points: PerformanceDataPoint[] = [];

  for (let i = 0; i < dates.length; i++) {
    const progress = i / (dates.length - 1);
    const trend = startValue + (endValue - startValue) * progress;
    const noise = Math.sin(i * 0.8) * 8 + Math.sin(i * 0.3) * 5 - 3;
    const value = Math.max(startValue - 10, trend + noise);
    points.push({ date: dates[i] ?? "", value: parseFloat(value.toFixed(2)) });
  }
  return points;
}

interface TooltipPayloadItem {
  value: number;
  payload: PerformanceDataPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  if (!item) return null;

  return (
    <div className="bg-white border border-border rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="text-muted-foreground text-xs mb-0.5">
        {formatDateShort(item.payload.date)}
      </p>
      <p className="font-bold text-brand-700">${item.value.toFixed(2)}</p>
    </div>
  );
}

interface PerformanceChartProps {
  data?: PerformanceDataPoint[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = useMemo(
    () => data ?? generateMockPerformanceData(),
    [data]
  );

  const tickDates = chartData
    .filter((_, i) => i % 5 === 0 || i === chartData.length - 1)
    .map((d) => d.date);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 4, left: -10, bottom: 0 }}
      >
        <defs>
          <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1da86a" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#1da86a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={(val: string) => formatDateShort(val)}
          ticks={tickDates}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val: number) => `$${val}`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#1da86a"
          strokeWidth={2.5}
          fill="url(#performanceGradient)"
          dot={false}
          activeDot={{ r: 5, fill: "#1da86a", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
