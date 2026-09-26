import React, { useState } from 'react';
import { PriceHistoryPoint } from '../types/stock';

interface PriceChartProps {
  history: PriceHistoryPoint[];
  ticker: string;
  currency: string;
  period: string;
  targetPrice?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  history,
  ticker,
  currency,
  period,
  targetPrice,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PriceHistoryPoint | null>(null);

  if (!history || history.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
        Insufficient price data to render chart.
      </div>
    );
  }

  // Calculate scales
  const closes = history.map((pt) => pt.close);
  let minPrice = Math.min(...closes);
  let maxPrice = Math.max(...closes);

  // If targetPrice is within reasonable vicinity (within 25% of range), include it in chart scale
  if (targetPrice && targetPrice > 0) {
    if (targetPrice < minPrice && minPrice - targetPrice < (maxPrice - minPrice) * 0.4) {
      minPrice = targetPrice;
    } else if (targetPrice > maxPrice && targetPrice - maxPrice < (maxPrice - minPrice) * 0.4) {
      maxPrice = targetPrice;
    }
  }

  const priceRange = maxPrice - minPrice || 1;

  // Add 5% padding to top and bottom
  const chartMin = minPrice - priceRange * 0.05;
  const chartMax = maxPrice + priceRange * 0.05;
  const chartRange = chartMax - chartMin;

  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 24;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const points = history.map((pt, i) => {
    const x = paddingX + (i / (history.length - 1)) * innerWidth;
    const y = height - paddingY - ((pt.close - chartMin) / chartRange) * innerHeight;
    return { x, y, point: pt };
  });

  const pathD = points.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`,
    ''
  );

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)},${height - paddingY} L ${points[0].x.toFixed(1)},${height - paddingY} Z`;

  // Start price reference line
  const startPrice = history[0].close;
  const startY = height - paddingY - ((startPrice - chartMin) / chartRange) * innerHeight;

  // Target price reference line
  const targetY =
    targetPrice && targetPrice >= chartMin && targetPrice <= chartMax
      ? height - paddingY - ((targetPrice - chartMin) / chartRange) * innerHeight
      : null;

  const isNetPositive = history[history.length - 1].close >= startPrice;
  const strokeColor = isNetPositive ? '#059669' : '#e11d48';
  const fillColor = isNetPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Price Action &amp; Trend ({period})
          </h3>
          <p className="text-xs text-slate-500">
            Real prices from market feeds ({history.length} data points)
          </p>
        </div>

        {/* Hover readout or latest info */}
        <div className="text-right">
          {hoveredPoint ? (
            <div>
              <span className="text-xs font-mono font-bold text-slate-950">
                ${hoveredPoint.close.toFixed(2)} {currency}
              </span>
              <p className="text-[11px] text-slate-500">{hoveredPoint.date}</p>
            </div>
          ) : (
            <div>
              <span className="text-xs font-mono font-bold text-slate-950">
                ${history[history.length - 1].close.toFixed(2)} {currency}
              </span>
              <p className="text-[11px] text-slate-500">Latest close</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isNetPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.2" />
              <stop offset="100%" stopColor={isNetPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Start price baseline */}
          <line
            x1={paddingX}
            y1={startY}
            x2={width - paddingX}
            y2={startY}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Target Price line */}
          {targetY !== null && targetPrice && (
            <g>
              <line
                x1={paddingX}
                y1={targetY}
                x2={width - paddingX}
                y2={targetY}
                stroke="#6366f1"
                strokeDasharray="6 3"
                strokeWidth="1.5"
              />
              <text
                x={width - paddingX - 4}
                y={targetY - 5}
                textAnchor="end"
                fill="#4f46e5"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                Target: ${targetPrice.toFixed(2)}
              </text>
            </g>
          )}

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Price Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive invisible hover triggers */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="6"
              fill="transparent"
              className="cursor-pointer hover:stroke-slate-900 hover:stroke-2"
              onMouseEnter={() => setHoveredPoint(p.point)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Active hover dot */}
          {hoveredPoint && (
            (() => {
              const activePt = points.find((p) => p.point.timestamp === hoveredPoint.timestamp);
              if (!activePt) return null;
              return (
                <g>
                  <line
                    x1={activePt.x}
                    y1={paddingY}
                    x2={activePt.x}
                    y2={height - paddingY}
                    stroke="#475569"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                  />
                  <circle
                    cx={activePt.x}
                    cy={activePt.y}
                    r="4.5"
                    fill={strokeColor}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              );
            })()
          )}
        </svg>

        {/* Chart Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-2">
          <span>{history[0].date}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-slate-400 border-dashed inline-block" />
              <span>Base (${startPrice.toFixed(2)})</span>
            </span>
            {targetPrice && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-indigo-500 border-dashed inline-block" />
                <span>Target (${targetPrice.toFixed(2)})</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: strokeColor }}
              />
              <span>Trend Close</span>
            </span>
          </div>
          <span>{history[history.length - 1].date}</span>
        </div>
      </div>
    </div>
  );
};
