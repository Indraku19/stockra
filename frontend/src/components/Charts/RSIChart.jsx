import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceArea } from 'recharts'

export function RSIChart({ indicators }) {
  if (!indicators?.dates) return null

  const data = indicators.dates
    .map((date, i) => ({ date, rsi: indicators.rsi[i] }))
    .filter(d => d.rsi != null)

  return (
    <div>
      <p className="font-mono-data text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
        rsi (14)
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <XAxis dataKey="date" hide />
          <YAxis domain={[0, 100]} tickCount={5} tick={{ fontSize: 10, fill: '#555' }} />
          <Tooltip
            contentStyle={{ background: '#0F0F0F', border: '1px solid #1F1F1F', borderRadius: 4 }}
            labelStyle={{ color: '#555', fontSize: 10 }}
            formatter={(v) => [v?.toFixed(2), 'RSI']}
          />
          {/* Overbought area */}
          <ReferenceArea y1={70} y2={100} fill="rgba(255,60,80,0.08)" />
          {/* Oversold area */}
          <ReferenceArea y1={0}  y2={30}  fill="rgba(0,196,140,0.08)" />
          <ReferenceLine y={70} stroke="#FF3C50" strokeDasharray="3 3" strokeWidth={1} />
          <ReferenceLine y={30} stroke="#00C48C" strokeDasharray="3 3" strokeWidth={1} />
          <Line
            type="monotone" dataKey="rsi"
            stroke="#00F0FF" strokeWidth={1.5}
            dot={false} activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
