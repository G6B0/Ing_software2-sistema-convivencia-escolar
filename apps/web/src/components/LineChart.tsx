'use client';

import { useState } from 'react';

interface LineData {
  [key: string]: string | number;
}

interface LineDef {
  key: string;
  color: string;
  label?: string;
  showLabel?: boolean;
}

interface LineChartProps {
  data: LineData[];
  xKey: string;
  lines: LineDef[];
  height?: number;
  onPointClick?: (index: number, dataPoint: LineData) => void;
}

export default function LineChart({ data, xKey, lines, height = 220, onPointClick }: LineChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const allVals = lines.flatMap((l) => data.map((d) => Number(d[l.key]) || 0));
  const maxRaw = allVals.length > 0 ? Math.max(...allVals) : 0;
  const maxVal = isFinite(maxRaw) && maxRaw > 0 ? maxRaw * 1.18 : 1;

  const padL = 36;
  const padB = 32;
  const padT = 18;
  const padR = 36;
  const w = 660;
  const chartW = w - padL - padR;
  const chartH = height - padB - padT;

  const getX = (i: number) =>
    padL + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${height}`}
      style={{ display: 'block', overflow: 'visible' }}
      onMouseLeave={() => setHovered(null)}
    >
      {/* Grid lines */}
      {[0, 0.5, 1].map((p) => (
        <g key={p}>
          <line
            x1={padL} y1={padT + chartH * (1 - p)}
            x2={w - padR} y2={padT + chartH * (1 - p)}
            stroke="#e2e8f0" strokeWidth={1}
          />
          <text x={padL - 5} y={padT + chartH * (1 - p) + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
            {Math.round(maxVal * p)}
          </text>
        </g>
      ))}

      {/* Lines, area and circles */}
      {lines.map((l) => {
        const pts = data.map((d, i) => ({
          x: getX(i),
          y: padT + chartH - ((Number(d[l.key]) || 0) / maxVal) * chartH,
          val: Number(d[l.key]) || 0,
        }));

        if (pts.length === 0) return null;

        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
        const areaPath = `${path} L${pts[pts.length - 1].x},${padT + chartH} L${pts[0].x},${padT + chartH} Z`;

        return (
          <g key={l.key}>
            {l.showLabel && <path d={areaPath} fill={l.color} opacity={0.08} />}
            <path
              d={path} fill="none" stroke={l.color}
              strokeWidth={l.showLabel ? 2.5 : 1.5}
              strokeLinejoin="round" strokeLinecap="round"
            />
            {pts.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x} cy={p.y}
                  r={l.showLabel ? 5 : 3}
                  fill="#fff" stroke={l.color}
                  strokeWidth={l.showLabel ? 2.5 : 1.5}
                />
                {l.showLabel && hovered !== i && (
                  <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize={11} fill={l.color} fontWeight="700">
                    {p.val}
                  </text>
                )}
              </g>
            ))}
          </g>
        );
      })}

      {/* Invisible hit areas for hover */}
      {data.map((_, i) => {
        const x = getX(i);
        const slotW = data.length > 1 ? chartW / (data.length - 1) : chartW;
        return (
          <rect
            key={`hit-${i}`}
            x={x - slotW / 2}
            y={0}
            width={slotW}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHovered(i)}
            onClick={() => onPointClick?.(i, data[i])}
            style={{ cursor: onPointClick ? 'pointer' : 'default' }}
          />
        );
      })}

      {/* Hover vertical dashed line */}
      {hovered !== null && (
        <line
          x1={getX(hovered)} y1={padT}
          x2={getX(hovered)} y2={padT + chartH}
          stroke="#94a3b8" strokeWidth={1} strokeDasharray="4,3"
        />
      )}

      {/* Tooltip */}
      {hovered !== null && (() => {
        const x = getX(hovered);
        const d = data[hovered];
        const tooltipW = 160;
        const tooltipH = 30 + lines.length * 20;
        let tooltipX = x - tooltipW / 2;
        if (tooltipX < 2) tooltipX = 2;
        if (tooltipX + tooltipW > w - 2) tooltipX = w - tooltipW - 2;

        const mainLine = lines.find((l) => l.showLabel);
        const mainVal = mainLine ? Number(d[mainLine.key]) || 0 : 0;
        const mainY = padT + chartH - (mainVal / maxVal) * chartH;
        const showBelow = mainY < height / 2;
        const tooltipY = showBelow ? mainY + 18 : mainY - tooltipH - 12;

        return (
          <foreignObject
            x={tooltipX}
            y={Math.max(2, Math.min(tooltipY, height - tooltipH - 2))}
            width={tooltipW}
            height={tooltipH}
          >
            <div
              style={{
                background: '#1e293b',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#fff',
                fontSize: 11,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 12 }}>{d[xKey]}</div>
              {lines.map((l) => (
                <div key={l.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
                    {l.label || l.key.charAt(0).toUpperCase() + l.key.slice(1)}
                  </span>
                  <span style={{ fontWeight: 700 }}>{Number(d[l.key]) || 0}</span>
                </div>
              ))}
            </div>
          </foreignObject>
        );
      })()}

      {/* X axis labels */}
      {data.map((d, i) => {
        const x = getX(i);
        return (
          <text key={i} x={x} y={height - 8} textAnchor="middle" fontSize={9} fill="#64748b">
            {d[xKey]}
          </text>
        );
      })}
    </svg>
  );
}
