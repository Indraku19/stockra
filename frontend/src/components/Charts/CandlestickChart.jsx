import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts'
import { useStockData } from '../../hooks/useStockData'

const PERIODS = [
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '1T', value: '1y' },
]

export function CandlestickChart({ history, indicators, period }) {
  const containerRef = useRef(null)
  const chartRef     = useRef(null)
  const { changePeriod } = useStockData()

  useEffect(() => {
    if (!containerRef.current || !history?.length) return

    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#0F0F0F' }, textColor: '#555555' },
      grid:   { vertLines: { color: '#1F1F1F' }, horzLines: { color: '#1F1F1F' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#1F1F1F' },
      timeScale: { borderColor: '#1F1F1F', timeVisible: true },
      width:  containerRef.current.clientWidth,
      height: 320,
    })
    chartRef.current = chart

    // Candlestick
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:   '#00C48C', downColor: '#FF3C50',
      borderUpColor: '#00C48C', borderDownColor: '#FF3C50',
      wickUpColor:   '#00C48C', wickDownColor:   '#FF3C50',
    })
    candleSeries.setData(history.map(d => ({
      time:  d.date,
      open:  d.open,
      high:  d.high,
      low:   d.low,
      close: d.close,
    })))

    // MA lines
    if (indicators?.dates) {
      const addMA = (values, color) => {
        const series = chart.addSeries(LineSeries, { color, lineWidth: 1, priceLineVisible: false })
        const data = indicators.dates
          .map((date, i) => values[i] != null ? { time: date, value: values[i] } : null)
          .filter(Boolean)
        series.setData(data)
      }
      addMA(indicators.ma7,  '#00F0FF')
      addMA(indicators.ma20, '#7000FF')
      addMA(indicators.ma50, '#FFC800')

      // Bollinger Bands
      const addBB = (values, color) => {
        const series = chart.addSeries(LineSeries, { color, lineWidth: 1, lineStyle: 2, priceLineVisible: false })
        const data = indicators.dates
          .map((date, i) => values[i] != null ? { time: date, value: values[i] } : null)
          .filter(Boolean)
        series.setData(data)
      }
      addBB(indicators.bb_upper,  'rgba(255,200,0,0.4)')
      addBB(indicators.bb_middle, 'rgba(255,200,0,0.2)')
      addBB(indicators.bb_lower,  'rgba(255,200,0,0.4)')
    }

    chart.timeScale().fitContent()

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [history, indicators])

  return (
    <div className="flex flex-col gap-3">
      {/* Period selector */}
      <div className="flex gap-2">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => changePeriod(p.value)}
            className="px-3 py-1 text-xs font-mono-data font-bold transition-all"
            style={{
              background:   period === p.value ? 'var(--cyan)' : 'var(--surface)',
              color:        period === p.value ? '#000' : 'var(--muted)',
              border:       `1px solid ${period === p.value ? 'var(--cyan)' : 'var(--border)'}`,
              borderRadius: '4px',
            }}
          >
            {p.label}
          </button>
        ))}
        {/* Legend */}
        <div className="ml-auto flex gap-3 items-center">
          {[['MA7','#00F0FF'],['MA20','#7000FF'],['MA50','#FFC800']].map(([l,c]) => (
            <span key={l} className="flex items-center gap-1 text-xs font-mono-data" style={{ color: c }}>
              <span style={{ width: 12, height: 2, background: c, display: 'inline-block' }} />
              {l}
            </span>
          ))}
        </div>
      </div>
      <div ref={containerRef} />
    </div>
  )
}
