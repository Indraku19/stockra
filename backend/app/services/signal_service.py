from app.models.schemas import SignalResponse, SignalFactor


def generate_signal(
    ticker: str,
    rsi_values: list,
    macd_hist_values: list,
    sentiment_score: float = 0.5,
) -> SignalResponse:
    """
    Hitung sinyal BELI/TAHAN/JUAL dari indikator teknikal + sentimen.
    Semua list sudah difilter dari None oleh caller.
    """
    # Ambil nilai terbaru
    rsi  = _last_valid(rsi_values)
    hist = _last_valid(macd_hist_values)
    prev = _second_last_valid(macd_hist_values)

    score = 0
    factors: dict[str, SignalFactor] = {}

    # ── RSI ──────────────────────────────────────────────────────
    if rsi is not None:
        if rsi < 30:
            score += 2
            factors["rsi"] = SignalFactor(
                value=f"{rsi:.1f}",
                contribution="positif",
                note="Oversold — harga kemungkinan akan rebound",
            )
        elif rsi < 45:
            score += 1
            factors["rsi"] = SignalFactor(
                value=f"{rsi:.1f}",
                contribution="netral",
                note="RSI rendah, momentum mulai membaik",
            )
        elif rsi > 70:
            score -= 2
            factors["rsi"] = SignalFactor(
                value=f"{rsi:.1f}",
                contribution="negatif",
                note="Overbought — harga berisiko koreksi",
            )
        elif rsi > 55:
            score -= 1
            factors["rsi"] = SignalFactor(
                value=f"{rsi:.1f}",
                contribution="netral",
                note="RSI tinggi, waspadai kejenuhan beli",
            )
        else:
            factors["rsi"] = SignalFactor(
                value=f"{rsi:.1f}",
                contribution="netral",
                note="RSI dalam zona normal",
            )
    else:
        rsi = 50.0

    # ── MACD ─────────────────────────────────────────────────────
    if hist is not None and prev is not None:
        if prev < 0 and hist > 0:
            score += 2
            factors["macd"] = SignalFactor(
                value="bullish crossover",
                contribution="positif",
                note="Histogram baru berubah positif — sinyal beli kuat",
            )
        elif prev > 0 and hist < 0:
            score -= 2
            factors["macd"] = SignalFactor(
                value="bearish crossover",
                contribution="negatif",
                note="Histogram baru berubah negatif — sinyal jual kuat",
            )
        elif hist > 0:
            score += 1
            factors["macd"] = SignalFactor(
                value=f"+{hist:.2f}",
                contribution="positif",
                note="Momentum bullish",
            )
        else:
            score -= 1
            factors["macd"] = SignalFactor(
                value=f"{hist:.2f}",
                contribution="negatif",
                note="Momentum bearish",
            )
    else:
        factors["macd"] = SignalFactor(
            value="N/A",
            contribution="netral",
            note="Data MACD tidak cukup",
        )

    # ── Sentimen ─────────────────────────────────────────────────
    if sentiment_score > 0.65:
        score += 1
        sent_label = "positif"
        sent_note  = f"Berita cenderung positif ({int(sentiment_score * 100)}%)"
    elif sentiment_score < 0.35:
        score -= 1
        sent_label = "negatif"
        sent_note  = f"Berita cenderung negatif ({int((1 - sentiment_score) * 100)}% negatif)"
    else:
        sent_label = "netral"
        sent_note  = "Sentimen berita netral"

    factors["sentimen"] = SignalFactor(
        value=f"{int(sentiment_score * 100)}%",
        contribution=sent_label,
        note=sent_note,
    )

    # ── Mapping score → signal ────────────────────────────────────
    if score >= 3:
        signal     = "BELI"
        confidence = min(95, 60 + score * 8)
    elif score <= -3:
        signal     = "JUAL"
        confidence = min(95, 60 + abs(score) * 8)
    else:
        signal     = "TAHAN"
        confidence = 50 + abs(score) * 5

    summary = _build_summary(signal, rsi, hist, sentiment_score, factors)

    return SignalResponse(
        ticker=ticker.upper(),
        signal=signal,
        confidence=int(confidence),
        factors=factors,
        summary=summary,
    )


def _build_summary(signal, rsi, macd_hist, sentiment_score, factors) -> str:
    rsi_desc = (
        f"RSI di {rsi:.0f} (oversold)" if rsi < 30
        else f"RSI di {rsi:.0f} (overbought)" if rsi > 70
        else f"RSI di {rsi:.0f} (normal)"
    )

    macd_desc = factors.get("macd", {})
    macd_note = macd_desc.note if hasattr(macd_desc, "note") else "momentum tidak tersedia"

    sent_pct  = int(sentiment_score * 100)
    sent_desc = "positif" if sent_pct > 65 else "negatif" if sent_pct < 35 else "netral"

    action = {
        "BELI": "Kondisi teknikal dan sentimen mendukung untuk masuk posisi.",
        "JUAL": "Kondisi teknikal menunjukkan risiko penurunan lebih lanjut.",
        "TAHAN": "Belum ada sinyal kuat. Disarankan menunggu konfirmasi lebih lanjut.",
    }[signal]

    return (
        f"{rsi_desc}. {macd_note.capitalize()}. "
        f"Sentimen berita {sent_desc} ({sent_pct}%). {action}"
    )


def _last_valid(values: list):
    for v in reversed(values):
        if v is not None:
            return v
    return None


def _second_last_valid(values: list):
    count = 0
    for v in reversed(values):
        if v is not None:
            count += 1
            if count == 2:
                return v
    return None
