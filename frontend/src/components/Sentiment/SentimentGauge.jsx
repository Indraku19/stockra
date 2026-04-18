export function SentimentGauge({ score, label }) {
  // score: 0–1, 0.5 = netral
  const pct     = Math.round(score * 100)
  const color   = score > 0.65 ? 'var(--green)' : score < 0.35 ? 'var(--red)' : 'var(--muted)'
  // Bar fill: 0 = full red, 0.5 = center, 1 = full green
  const fillPct = Math.round(score * 100)

  return (
    <div className="flex flex-col gap-3 p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}
    >
      <p className="font-mono-data text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        // sentimen_berita
      </p>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-black font-mono-data" style={{ color }}>
          {label.toUpperCase()}
        </span>
        <span className="font-mono-data text-sm" style={{ color }}>
          {pct}%
        </span>
      </div>

      {/* Gauge bar */}
      <div style={{ background: 'var(--border)', borderRadius: 2, height: 6, position: 'relative' }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, #FF3C50, #555555, #00C48C)',
          borderRadius: 2, opacity: 0.3,
        }} />
        {/* Needle */}
        <div style={{
          position:  'absolute',
          left:      `calc(${fillPct}% - 4px)`,
          top:       -3,
          width:     8,
          height:    12,
          background: color,
          borderRadius: 2,
          transition: 'left 0.6s ease',
        }} />
      </div>

      <div className="flex justify-between text-xs font-mono-data" style={{ color: 'var(--muted)' }}>
        <span>Negatif</span>
        <span>Netral</span>
        <span>Positif</span>
      </div>
    </div>
  )
}
