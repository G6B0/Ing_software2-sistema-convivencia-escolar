interface BarData {
  [key: string]: string | number;
}

interface BarDef {
  key: string;
  color: string;
}

interface BarChartProps {
  data: BarData[];
  xKey: string;
  bars: BarDef[];
  height?: number;
}

export default function BarChart({ data, xKey, bars, height = 220 }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => bars.reduce((s, b) => s + (Number(d[b.key]) || 0), 0)), 1);
  const barW = 38;
  const gap = 18;
  const padL = 36;
  const padB = 28;
  const padT = 12;
  const padR = 12;
  const totalW = data.length * (barW + gap) + padL + padR;
  const chartH = height - padB - padT;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${totalW} ${height}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <g key={p}>
          <line
            x1={padL} y1={padT + chartH * (1 - p)}
            x2={totalW - padR} y2={padT + chartH * (1 - p)}
            stroke="#e2e8f0" strokeWidth={1}
          />
          <text x={padL - 5} y={padT + chartH * (1 - p) + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
            {Math.round(maxVal * p)}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = padL + i * (barW + gap);
        let stackY = padT + chartH;
        return (
          <g key={i}>
            {bars.map((b) => {
              const val = Number(d[b.key]) || 0;
              const bh = maxVal > 0 ? (val / maxVal) * chartH : 0;
              stackY -= bh;
              return (
                <rect
                  key={b.key}
                  x={x} y={stackY}
                  width={barW} height={bh}
                  fill={b.color}
                  rx={bh > 4 ? 3 : 0}
                />
              );
            })}
            <text x={x + barW / 2} y={height - 7} textAnchor="middle" fontSize={10} fill="#64748b">
              {d[xKey]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
