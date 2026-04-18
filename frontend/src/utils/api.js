import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

export const api = {
  getStock:      (ticker)         => client.get(`/stock/${ticker}`),
  getHistory:    (ticker, period) => client.get(`/stock/${ticker}/history`, { params: { period } }),
  getIndicators: (ticker, period) => client.get(`/stock/${ticker}/indicators`, { params: { period } }),
  getSignal:     (ticker)         => client.get(`/stock/${ticker}/signal`),
  getSentiment:  (ticker)         => client.get(`/stock/${ticker}/sentiment`),
}
