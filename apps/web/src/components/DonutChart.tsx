interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  height?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function DonutChart({ data, height = 180 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = 105;
  const cy = 105;
  const rOuter = 82;
  const rInner = 54;
  const gap = 2;

  let accAngle = 0;
  const segments = data
    .filter(d => d.value > 0)
    .map(d => {
      const angle = (d.value / total) * 360;
      const startAngle = accAngle + gap / 2;
      const endAngle = accAngle + angle - gap / 2;
      accAngle += angle;
      return { ...d, startAngle, endAngle };
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={210} height={210} viewBox="0 0 210 210">
        {/* Fondo gris */}
        <circle cx={cx} cy={cy} r={rOuter} fill="#f1f5f9" />
        <circle cx={cx} cy={cy} r={rInner} fill="#fff" />

        {segments.map((d, i) => {
          const outerStart = polarToCartesian(cx, cy, rOuter, d.startAngle);
          const outerEnd = polarToCartesian(cx, cy, rOuter, d.endAngle);
          const innerStart = polarToCartesian(cx, cy, rInner, d.startAngle);
          const innerEnd = polarToCartesian(cx, cy, rInner, d.endAngle);
          const largeArc = d.endAngle - d.startAngle > 180 ? 1 : 0;

          const path = [
            `M ${outerStart.x} ${outerStart.y}`,
            `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
            `L ${innerEnd.x} ${innerEnd.y}`,
            `A ${rInner} ${rInner} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
            'Z'
          ].join(' ');

          return <path key={i} d={path} fill={d.color} />;
        })}

        {/* Texto central */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={32} fontWeight="800" fill="#0f172a">
          {total}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize={14} fill="#94a3b8">
          total
        </text>
      </svg>

      {/* Leyenda */}
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