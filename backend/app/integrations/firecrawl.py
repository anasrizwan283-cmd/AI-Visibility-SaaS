from typing import Any, Dict

import requests


class FirecrawlClient:
    """
    Client for Firecrawl API.
    """

    BASE_URL = "https://api.firecrawl.dev/v2"

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("Firecrawl API key is required.")

        self.api_key = api_key

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def crawl(
        self,
        url: str,
        limit: int = 20,
        max_discovery_depth: int = 2,
    ) -> Dict[str, Any]:
        """
        Start a Firecrawl website crawl.
        """

        payload = {
            "url": url,
            "limit": limit,
            "maxDiscoveryDepth": max_discovery_depth,
            "crawlEntireDomain": True,
            "allowExternalLinks": False,
            "allowSubdomains": False,
            "scrapeOptions": {
                "formats": ["markdown"],
                "onlyMainContent": True,
                "blockAds": True,
            },
        }

        response = requests.post(
            f"{self.BASE_URL}/crawl",
            headers=self._headers(),
            json=payload,
            timeout=60,
        )

        if response.status_code == 401:
            raise RuntimeError(
                "Firecrawl API key is invalid or unauthorized."
            )

        if response.status_code == 402:
            raise RuntimeError(
                "Firecrawl account requires payment or has insufficient credits."
            )

        if response.status_code == 429:
            raise RuntimeError(
                "Firecrawl rate limit exceeded."
            )

        if not response.ok:
            try:
                error_data = response.json()
            except ValueError:
                error_data = response.text

            raise RuntimeError(
                f"Firecrawl API error ({response.status_code}): "
                f"{error_data}"
            )

        return response.json()

    def get_crawl_status(
        self,
        crawl_id: str,
    ) -> Dict[str, Any]:
        """
        Get the status and results of a Firecrawl crawl job.
        """

        response = requests.get(
            f"{self.BASE_URL}/crawl/{crawl_id}",
            headers=self._headers(),
            timeout=60,
        )

        if response.status_code == 401:
            raise RuntimeError(
                "Firecrawl API key is invalid or unauthorized."
            )

        if response.status_code == 429:
            raise RuntimeError(
                "Firecrawl rate limit exceeded."
            )

        if not response.ok:
            try:
                error_data = response.json()
            except ValueError:
                error_data = response.text

            raise RuntimeError(
                f"Firecrawl API error ({response.status_code}): "
                f"{error_data}"
            )

        return response.json()