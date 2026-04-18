import { motion } from 'framer-motion'

const CONFIG = {
  BELI:  { color: 'var(--green)',  bg: 'rgba(0,196,140,0.08)',  border: 'rgba(0,196,140,0.35)',  icon: '▲' },
  JUAL:  { color: 'var(--red)',    bg: 'rgba(255,60,80,0.08)',  border: 'rgba(255,60,80,0.35)',  icon: '▼' },
  TAHAN: { color: 'var(--muted)',  bg: 'rgba(85,85,85,0.08)',   border: 'rgba(85,85,85,0.35)',   icon: '■' },
}

export function SignalCard({ signal }) {
  const cfg = CONFIG[signal.signal] ?? CONFIG.TAHAN

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-4 p-6"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '4px' }}
    >
      {/* Label */}
      <p className="font-mono-data text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        // sinyal_ai
      </p>

      {/* Signal */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-black font-mono-data" style={{ color: cfg.color }}>
          {cfg.icon}
        </span>
        <span className="text-5xl font-black" style={{ color: cfg.color }}>
          {signal.signal}
        </span>
      </div>

      {/* Confidence */}
      <div>
        <div className="flex justify-between text-xs font-mono-data mb-1" style={{ color: 'var(--muted)' }}>
          <span>confidence</span>
          <span style={{ color: cfg.color }}>{signal.confidence}%</span>
        </div>
        <div style={{ background: 'var(--border)', borderRadius: 2, height: 4 }}>
          <div
            style={{
              width:        `${signal.confidence}%`,
              height:       '100%',
              background:   cfg.color,
              borderRadius: 2,
              transition:   'width 0.6s ease',
            }}
          />
        </div>
      </div>

      {/* Faktor */}
      <div className="flex flex-col gap-2">
        {Object.entries(signal.factors).map(([key, factor]) => (
          <div key={key} className="flex justify-between text-xs font-mono-data gap-2">
            <span style={{ color: 'var(--muted)' }}>{key}</span>
            <span style={{
              color: factor.contribution === 'positif' ? 'var(--green)'
                   : factor.contribution === 'negatif' ? 'var(--red)'
                   : 'var(--muted)',
            }}>
              {factor.value}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        {signal.summary}
      </p>

      {/* Disclaimer */}
      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        ⚠ Bukan saran investasi. Selalu lakukan riset mandiri.
      </p>
    </motion.div>
  )
}
