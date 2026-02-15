from datetime import datetime, timedelta, UTC
from app.providers.base import NewsProvider


class MockNewsProvider(NewsProvider):
    def latest(self, ticker: str, days: int = 7) -> list[dict]:
        now = datetime.now(UTC)
        return [
            {
                "source": "MockWire",
                "title": f"{ticker} announces operational update",
                "url": f"https://example.com/{ticker}/1",
                "published_at": now - timedelta(days=1),
                "summary": "Operational metrics improved with stable demand in key segments.",
                "tag": "positive",
            },
            {
                "source": "MockWire",
                "title": f"{ticker} faces macro headwinds",
                "url": f"https://example.com/{ticker}/2",
                "published_at": now - timedelta(days=2),
                "summary": "Analysts flag currency and rate volatility as potential near-term risks.",
                "tag": "uncertain",
            },
        ]
