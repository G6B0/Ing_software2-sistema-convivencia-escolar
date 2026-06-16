interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  height?: number;
}

export default function DonutChart({ data, height = 180 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 82;
  const cx = 105;
  const cy = 105;
  const sw = 28;
  const circ = 2 * Math.PI * r;

  let acc = 0;
  const segments = data.map((d) => {
    const dashLen = (d.value / total) * circ;
    const offset = dashLen + circ - (acc / total) * circ;
    acc += d.value;
    return { ...d, dashLen, offset };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={210} height={210} viewBox="0 0 210 210">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
        {segments.map((d, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={sw}
            strokeDasharray={`${d.dashLen} ${circ}`}
            strokeDashoffset={d.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={32} fontWeight="800" fill="#0f172a">
          {total}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize={14} fill="#94a3b8">
          total
        </text>
      </svg>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 9, marginTop: 6 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              <span style={{ color: '#64748b' }}>{d.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{d.value}</span>
              <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 28, textAlign: 'right' }}>
                {Math.round((d.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
