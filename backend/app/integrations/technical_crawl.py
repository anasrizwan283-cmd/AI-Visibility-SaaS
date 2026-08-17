from typing import Any, Dict, List
from urllib.parse import urlparse, urlunparse


def normalize_url(url: str) -> str:
    """
    Normalize URLs so duplicate query variations
    are treated as the same page.
    """

    parsed = urlparse(url)

    return urlunparse(
        (
            parsed.scheme.lower(),
            parsed.netloc.lower(),
            parsed.path or "/",
            "",
            "",
            "",
        )
    )


def count_words(markdown: str) -> int:
    """
    Count words from markdown content.
    """

    if not markdown:
        return 0

    return len(markdown.split())


def analyze_crawl(crawl_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert raw Firecrawl crawl data into
    structured technical crawl metrics.
    """

    pages: List[Dict[str, Any]] = crawl_data.get(
        "data",
        []
    )

    unique_pages = {}

    for page in pages:
        metadata = page.get(
            "metadata",
            {}
        )

        source_url = (
            metadata.get("url")
            or metadata.get("sourceURL")
            or ""
        )

        if not source_url:
            continue

        normalized = normalize_url(
            source_url
        )

        markdown = page.get(
            "markdown",
            ""
        )

        status_code = metadata.get(
            "statusCode"
        )

        title = metadata.get(
            "title",
            ""
        )

        unique_pages[normalized] = {
            "url": source_url,
            "normalized_url": normalized,
            "title": title,
            "status_code": status_code,
            "content_type": metadata.get(
                "contentType"
            ),
            "language": metadata.get(
                "language"
            ),
            "word_count": count_words(
                markdown
            ),
            "content": markdown,
        }

    analyzed_pages = list(
        unique_pages.values()
    )

    successful_pages = [
        page
        for page in analyzed_pages
        if page["status_code"]
        and 200 <= page["status_code"] < 300
    ]

    failed_pages = [
        page
        for page in analyzed_pages
        if page["status_code"]
        and page["status_code"] >= 400
    ]

    pages_without_title = [
        page
        for page in analyzed_pages
        if not page["title"]
    ]

    thin_content_pages = [
        page
        for page in analyzed_pages
        if page["word_count"] < 300
    ]

    total_words = sum(
        page["word_count"]
        for page in analyzed_pages
    )

    average_word_count = (
        round(
            total_words / len(analyzed_pages)
        )
        if analyzed_pages
        else 0
    )

    return {
        "summary": {
            "pages_crawled": len(pages),
            "unique_pages": len(
                analyzed_pages
            ),
            "successful_pages": len(
                successful_pages
            ),
            "failed_pages": len(
                failed_pages
            ),
            "pages_without_title": len(
                pages_without_title
            ),
            "thin_content_pages": len(
                thin_content_pages
            ),
            "total_words": total_words,
            "average_word_count": (
                average_word_count
            ),
        },

        "pages": analyzed_pages,

        "issues": {
            "failed_pages": failed_pages,
            "pages_without_title": (
                pages_without_title
            ),
            "thin_content_pages": (
                thin_content_pages
            ),
        },

        "crawl_metadata": {
            "success": crawl_data.get(
                "success"
            ),
            "status": crawl_data.get(
                "status"
            ),
            "total": crawl_data.get(
                "total"
            ),
            "completed": crawl_data.get(
                "completed"
            ),
            "credits_used": crawl_data.get(
                "creditsUsed"
            ),
            "duration": crawl_data.get(
                "duration"
            ),
            "created_at": crawl_data.get(
                "createdAt"
            ),
            "completed_at": crawl_data.get(
                "completedAt"
            ),
        },
    }