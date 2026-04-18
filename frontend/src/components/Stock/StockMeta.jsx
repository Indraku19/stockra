import { formatNumber, formatLargeNumber } from '../../utils/formatters'

function MetaItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1 p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
      <p className="font-mono-data text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="font-mono-data text-base font-bold" style={{ color: 'var(--text)' }}>{value}</p>
    </div>
  )
}

export function StockMeta({ info }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetaItem label="volume"     value={formatLargeNumber(info.volume)} />
      <MetaItem label="market_cap" value={info.market_cap ? formatLargeNumber(info.market_cap) : '—'} />
      <MetaItem label="p/e_ratio"  value={info.pe_ratio ? info.pe_ratio.toFixed(2) : '—'} />
      <MetaItem label="currency"   value={info.currency} />
    </div>
  )
}
