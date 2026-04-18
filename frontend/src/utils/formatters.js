export function formatPrice(value, currency = 'IDR') {
  if (value == null) return '—'
  return new Intl.NumberFormat('id-ID', {
    style:    'currency',
    currency,
    maximumFractionDigits: currency === 'IDR' ? 0 : 2,
  }).format(value)
}

export function formatNumber(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('id-ID').format(value)
}

export function formatLargeNumber(value) {
  if (value == null) return '—'
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)} T`
  if (value >= 1e9)  return `${(value / 1e9).toFixed(2)} M`
  if (value >= 1e6)  return `${(value / 1e6).toFixed(2)} Jt`
  return formatNumber(value)
}

export function formatChangePct(value) {
  if (value == null) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}
