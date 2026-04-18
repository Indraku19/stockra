import { motion, AnimatePresence } from 'framer-motion'
import { useStockStore } from './store/useStockStore'
import { SearchBar } from './components/Search/SearchBar'
import { StockHeader } from './components/Stock/StockHeader'
import { StockMeta } from './components/Stock/StockMeta'
import { CandlestickChart } from './components/Charts/CandlestickChart'
import { RSIChart } from './components/Charts/RSIChart'
import { MACDChart } from './components/Charts/MACDChart'
import { SignalCard } from './components/Signal/SignalCard'
import { SentimentGauge } from './components/Sentiment/SentimentGauge'
import { NewsList } from './components/Sentiment/NewsList'
import './index.css'

export default function App() {
  const { status, stockInfo, history, indicators, signal, sentiment, period, error, reset } = useStockStore()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button onClick={reset}
          className="font-mono-data font-black text-xl tracking-tight hover:opacity-70 transition-opacity"
          style={{ color: 'var(--cyan)' }}
        >
          STOCKRA
        </button>
        <p className="font-mono-data text-xs hidden md:block" style={{ color: 'var(--muted)' }}>
          AI-powered stock analysis
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Search + hero text (idle only) */}
        <div className="flex flex-col gap-4 items-center text-center">
          {status === 'idle' && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2"
            >
              <p className="font-mono-data text-xs uppercase tracking-widest" style={{ color: 'var(--cyan)' }}>
                // stockra_v1
              </p>
              <h1 className="text-3xl md:text-4xl font-black" style={{ color: 'var(--text)' }}>
                Analisis Saham dengan AI
              </h1>
              <p className="text-sm max-w-md" style={{ color: 'var(--muted)' }}>
                Masukkan kode saham IDX (BBCA.JK) atau global (AAPL) untuk melihat
                chart interaktif, indikator teknikal, dan sinyal AI.
              </p>
            </motion.div>
          )}
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-16"
          >
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--cyan)' }}
            />
            <p className="font-mono-data text-sm" style={{ color: 'var(--muted)' }}>
              Mengambil data dan menganalisis…
            </p>
          </motion.div>
        )}

        {/* Error */}
        {status === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-12 flex flex-col gap-3 items-center"
          >
            <p className="font-mono-data text-3xl" style={{ color: 'var(--red)' }}>✕</p>
            <p className="text-sm" style={{ color: 'var(--text)' }}>{error}</p>
            <button onClick={reset}
              className="font-mono-data text-xs px-4 py-2 mt-2 hover:opacity-70 transition-opacity"
              style={{ border: '1px solid var(--border)', borderRadius: 4, color: 'var(--muted)' }}
            >
              Coba lagi
            </button>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {status === 'done' && stockInfo && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              <StockHeader info={stockInfo} />
              <StockMeta info={stockInfo} />

              {/* Main grid: charts (2/3) + signal (1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Charts */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="p-5"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}
                  >
                    <p className="font-mono-data text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>
                      // harga &amp; indikator
                    </p>
                    <CandlestickChart history={history} indicators={indicators} period={period} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}
                    >
                      <RSIChart indicators={indicators} />
                    </div>
                    <div className="p-5"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}
                    >
                      <MACDChart indicators={indicators} />
                    </div>
                  </div>
                </div>

                {/* Signal + Gauge */}
                <div className="flex flex-col gap-4">
                  {signal
                    ? <SignalCard signal={signal} />
                    : <div className="p-5 text-sm"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--muted)' }}
                      >
                        Sinyal tidak tersedia
                      </div>
                  }
                  {sentiment && (
                    <SentimentGauge score={sentiment.overall_score} label={sentiment.overall_label} />
                  )}
                </div>
              </div>

              {/* Berita */}
              {sentiment?.news?.length > 0 && (
                <NewsList news={sentiment.news} />
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}
