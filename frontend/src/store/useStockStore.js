import { create } from 'zustand'

export const useStockStore = create((set) => ({
  status:     'idle',   // 'idle' | 'loading' | 'done' | 'error'
  ticker:     null,
  stockInfo:  null,
  history:    null,
  indicators: null,
  signal:     null,
  sentiment:  null,
  period:     '3mo',
  error:      null,

  setLoading: (ticker) => set({ status: 'loading', ticker, error: null }),

  setResult: (stockInfo, history, indicators, signal, sentiment) =>
    set({ status: 'done', stockInfo, history, indicators, signal, sentiment }),

  setError: (error) => set({ status: 'error', error }),

  setPeriod: (period) => set({ period }),

  reset: () => set({
    status: 'idle', ticker: null, stockInfo: null,
    history: null, indicators: null, signal: null,
    sentiment: null, error: null,
  }),
}))
