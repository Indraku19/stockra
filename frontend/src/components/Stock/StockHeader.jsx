import { formatPrice, formatChangePct } from '../../utils/formatters'

export function StockHeader({ info }) {
  const positive = info.change_pct >= 0

  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono-data text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        // {info.ticker}
      </p>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
        {info.name}
      </h1>
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-4xl font-black font-mono-data" style={{ color: 'var(--cyan)' }}>
          {formatPrice(info.price, info.currency)}
        </span>
        <span
          className="font-mono-data text-base font-bold"
          style={{ color: positive ? 'var(--green)' : 'var(--red)' }}
        >
          {positive ? '▲' : '▼'} {formatChangePct(info.change_pct)}
        </span>
      </div>
    </div>
  )
}
