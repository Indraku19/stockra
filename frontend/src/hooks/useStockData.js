import { useCallback } from 'react'
import { api } from '../utils/api'
import { useStockStore } from '../store/useStockStore'

export function useStockData() {
  const { setLoading, setResult, setError, setPeriod, period } = useStockStore()

  const search = useCallback(async (ticker) => {
    if (!ticker?.trim()) return
    const t = ticker.trim().toUpperCase()
    setLoading(t)

    try {
      // Fetch semua data secara paralel
      const [infoRes, histRes, indRes, sigRes, sentRes] = await Promise.allSettled([
        api.getStock(t),
        api.getHistory(t, period),
        api.getIndicators(t, period),
        api.getSignal(t),
        api.getSentiment(t),
      ])

      // Info dan history wajib ada
      if (infoRes.status === 'rejected') {
        const msg = infoRes.reason?.response?.data?.detail || 'Ticker tidak ditemukan'
        setError(msg)
        return
      }

      setResult(
        infoRes.value.data,
        histRes.status  === 'fulfilled' ? histRes.value.data.data        : [],
        indRes.status   === 'fulfilled' ? indRes.value.data              : null,
        sigRes.status   === 'fulfilled' ? sigRes.value.data              : null,
        sentRes.status  === 'fulfilled' ? sentRes.value.data             : null,
      )
    } catch {
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.')
    }
  }, [period, setLoading, setResult, setError])

  const changePeriod = useCallback(async (newPeriod) => {
    const { ticker } = useStockStore.getState()
    if (!ticker) return
    setPeriod(newPeriod)

    try {
      const [histRes, indRes] = await Promise.all([
        api.getHistory(ticker, newPeriod),
        api.getIndicators(ticker, newPeriod),
      ])
      const s = useStockStore.getState()
      setResult(s.stockInfo, histRes.data.data, indRes.data, s.signal, s.sentiment)
    } catch {
      // Biarkan data lama tetap tampil jika ganti period gagal
    }
  }, [setPeriod, setResult])

  return { search, changePeriod }
}
