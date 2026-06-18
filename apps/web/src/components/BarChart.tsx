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

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= maxCharsPerLine) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default function BarChart({ data, xKey, bars, height = 220 }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => bars.reduce((s, b) => s + (Number(d[b.key]) || 0), 0)), 1);
  const barW = 38;
  const gap = 18;
  const padL = 36;
  const lineH = 12;
  const maxLines = 2;
  const padB = 10 + maxLines * lineH;
  const padT = 12;
  const padR = 12;
  const slotW = barW + gap;
  const innerPadL = 10; // gap between y-axis and first bar
  // ~5.5px per char at fontSize 10
  const maxLabelChars = Math.max(3, Math.floor(slotW / 5.5));
  const totalW = data.length * slotW + padL + innerPadL + padR;
  const chartH = height - padB - padT;
  const labelStartY = padT + chartH + 14;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${totalW} ${height}`}
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
        const x = padL + innerPadL + i * slotW;
        let stackY = padT + chartH;
        const lines = wrapText(String(d[xKey]), maxLabelChars);
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
            <text textAnchor="middle" fontSize={10} fill="#64748b">
              {lines.map((line, li) => (
                <tspan key={li} x={x + barW / 2} y={labelStartY + li * lineH}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
