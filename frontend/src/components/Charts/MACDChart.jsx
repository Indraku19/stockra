import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip } from 'recharts'

export function MACDChart({ indicators }) {
  if (!indicators?.dates) return null

  const data = indicators.dates
    .map((date, i) => ({
      date,
      macd:      indicators.macd_line[i],
      signal:    indicators.macd_signal[i],
      histogram: indicators.macd_histogram[i],
    }))
    .filter(d => d.macd != null)

  return (
    <div>
      <p className="font-mono-data text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
        macd (12, 26, 9)
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <XAxis dataKey="date" hide />
          <YAxis tick={{ fontSize: 10, fill: '#555' }} />
          <Tooltip
            contentStyle={{ background: '#0F0F0F', border: '1px solid #1F1F1F', borderRadius: 4 }}
            labelStyle={{ color: '#555', fontSize: 10 }}
            formatter={(v, name) => [v?.toFixed(4), name]}
          />
          <Bar
            dataKey="histogram"
            fill="#00C48C"
            radius={[1, 1, 0, 0]}
            label={false}
            // Warna hijau jika positif, merah jika negatif
            cell={(entry) => entry.histogram >= 0 ? '#00C48C' : '#FF3C50'}
          />
          <Line type="monotone" dataKey="macd"   stroke="#00F0FF" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="signal" stroke="#FFC800" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2">
        {[['MACD','#00F0FF'],['Signal','#FFC800']].map(([l,c]) => (
          <span key={l} className="flex items-center gap-1 text-xs font-mono-data" style={{ color: c }}>
            <span style={{ width: 12, height: 2, background: c, display: 'inline-block' }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}
