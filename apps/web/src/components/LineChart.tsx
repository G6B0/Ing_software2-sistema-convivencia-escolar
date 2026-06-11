interface LineData {
  [key: string]: string | number;
}

interface LineDef {
  key: string;
  color: string;
  showLabel?: boolean;
}

interface LineChartProps {
  data: LineData[];
  xKey: string;
  lines: LineDef[];
  height?: number;
}

export default function LineChart({ data, xKey, lines, height = 210 }: LineChartProps) {
  const allVals = lines.flatMap((l) => data.map((d) => Number(d[l.key]) || 0));
  const maxVal = Math.max(...allVals) * 1.18 || 1;
  const padL = 36;
  const padB = 28;
  const padT = 18;
  const padR = 20;
  const w = 600;
  const chartW = w - padL - padR;
  const chartH = height - padB - padT;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      {[0, 0.5, 1].map((p) => (
        <g key={p}>
          <line
            x1={padL} y1={padT + chartH * (1 - p)}
            x2={w - padR} y2={padT + chartH * (1 - p)}
            stroke="#e2e8f0" strokeWidth={1}
          />
          <text x={padL - 5} y={padT + chartH * (1 - p) + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
            {Math.round(maxVal * p)}
          </text>
        </g>
      ))}
      {lines.map((l) => {
        const pts = data.map((d, i) => ({
          x: padL + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2),
          y: padT + chartH - ((Number(d[l.key]) || 0) / maxVal) * chartH,
          val: Number(d[l.key]) || 0,
        }));
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
                {l.showLabel && (
                  <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize={11} fill={l.color} fontWeight="700">
                    {p.val}
                  </text>
                )}
              </g>
            ))}
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = padL + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2);
        return (
          <text key={i} x={x} y={height - 7} textAnchor="middle" fontSize={11} fill="#64748b">
            {d[xKey]}
          </text>
        );
      })}
    </svg>
  );
}
