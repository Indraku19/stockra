const LABEL_STYLE = {
  positif: { color: 'var(--green)', border: 'rgba(0,196,140,0.3)' },
  negatif: { color: 'var(--red)',   border: 'rgba(255,60,80,0.3)' },
  netral:  { color: 'var(--muted)', border: 'rgba(85,85,85,0.3)' },
}

export function NewsList({ news }) {
  if (!news?.length) return (
    <p className="text-sm" style={{ color: 'var(--muted)' }}>Berita tidak tersedia.</p>
  )

  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono-data text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        // berita_terkini
      </p>
      {news.slice(0, 6).map((item, i) => {
        const style = LABEL_STYLE[item.sentiment] ?? LABEL_STYLE.netral
        return (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 hover:opacity-80 transition-opacity"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}
          >
            {/* Sentiment badge */}
            <span
              className="font-mono-data text-xs px-2 py-0.5 shrink-0 mt-0.5"
              style={{ color: style.color, border: `1px solid ${style.border}`, borderRadius: 2 }}
            >
              {item.sentiment}
            </span>
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-sm leading-snug" style={{ color: 'var(--text)' }}>
                {item.title}
              </p>
              <p className="text-xs font-mono-data" style={{ color: 'var(--muted)' }}>
                {item.source} · {new Date(item.published_at).toLocaleDateString('id-ID')}
              </p>
            </div>
          </a>
        )
      })}
    </div>
  )
}
