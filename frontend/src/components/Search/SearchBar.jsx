import { useState } from 'react'
import { useStockData } from '../../hooks/useStockData'

const SUGGESTIONS = [
  'BBCA.JK', 'BBRI.JK', 'TLKM.JK', 'GOTO.JK', 'BMRI.JK',
  'ASII.JK', 'UNVR.JK', 'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL',
]

export function SearchBar() {
  const [value, setValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { search } = useStockData()

  const filtered = value.length >= 2
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    : []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    setShowSuggestions(false)
    search(value.trim())
  }

  const handleSelect = (ticker) => {
    setValue(ticker)
    setShowSuggestions(false)
    search(ticker)
  }

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setShowSuggestions(true) }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Cari saham… (contoh: BBCA.JK, AAPL)"
          className="flex-1 px-4 py-3 text-sm font-mono-data outline-none"
          style={{
            background:   'var(--surface)',
            border:       '1px solid var(--border)',
            borderRadius: '4px',
            color:        'var(--text)',
          }}
        />
        <button
          type="submit"
          className="px-5 py-3 text-sm font-mono-data font-bold transition-opacity hover:opacity-80"
          style={{
            background:   'var(--cyan)',
            color:        '#000',
            borderRadius: '4px',
          }}
        >
          ANALISIS
        </button>
      </form>

      {/* Autocomplete */}
      {showSuggestions && filtered.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-10"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}
        >
          {filtered.map(ticker => (
            <button
              key={ticker}
              onMouseDown={() => handleSelect(ticker)}
              className="w-full text-left px-4 py-2 text-sm font-mono-data hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text)' }}
            >
              {ticker}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
