import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, urlunparse
from typing import Any, Dict, List, Set
import re


USER_AGENT = "Mozilla/5.0 (AI-Visibility-SaaS/1.0)"


# ==========================================================
# URL NORMALIZATION
# ==========================================================

def normalize_url(url: str) -> str:
    """
    Normalize URLs so duplicate URL variations
    are treated as the same page.
    """

    parsed = urlparse(url)

    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    path = parsed.path or "/"

    if path != "/" and path.endswith("/"):
        path = path.rstrip("/")

    return urlunparse(
        (
            scheme,
            netloc,
            path,
            "",
            "",
            "",
        )
    )


# ==========================================================
# SAFE REQUEST
# ==========================================================

def safe_get(url: str, timeout: int = 8):

    try:
        return requests.get(
            url,
            timeout=timeout,
            headers={
                "User-Agent": USER_AGENT
            },
            allow_redirects=True,
        )

    except requests.RequestException:
        return None


# ==========================================================
# INTERNAL URL CHECK
# ==========================================================

def is_internal_url(
    url: str,
    base_domain: str,
) -> bool:

    parsed = urlparse(url)

    if parsed.scheme not in (
        "http",
        "https",
    ):
        return False

    domain = parsed.netloc.lower()

    return domain == base_domain


# ==========================================================
# EXTRACT INTERNAL LINKS
# ==========================================================

def extract_internal_links(
    page_url: str,
    html: str,
    base_domain: str,
) -> List[str]:

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    discovered_urls: Set[str] = set()

    for link in soup.find_all(
        "a",
        href=True,
    ):

        href = link.get(
            "href",
            "",
        ).strip()

        if not href:
            continue

        # Ignore anchors
        if href.startswith("#"):
            continue

        # Ignore javascript
        if href.lower().startswith(
            "javascript:"
        ):
            continue

        # Ignore mail
        if href.lower().startswith(
            "mailto:"
        ):
            continue

        # Ignore telephone
        if href.lower().startswith(
            "tel:"
        ):
            continue

        # Ignore data URLs
        if href.lower().startswith(
            "data:"
        ):
            continue

        full_url = urljoin(
            page_url,
            href,
        )

        normalized = normalize_url(
            full_url
        )

        if is_internal_url(
            normalized,
            base_domain,
        ):
            discovered_urls.add(
                normalized
            )

    return sorted(
        discovered_urls
    )


# ==========================================================
# PAGE ANALYZER
# ==========================================================

def analyze_page_html(
    page_url: str,
    html: str,
) -> Dict[str, Any]:
    """
    Analyze one HTML page.

    This function is used by both:
    1. Main website analysis
    2. Multi-page crawler
    """

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    parsed_url = urlparse(
        page_url
    )

    base_domain = (
        parsed_url.netloc.lower()
    )

    # ======================================================
    # TITLE
    # ======================================================

    title = ""

    if soup.title and soup.title.string:
        title = soup.title.string.strip()

    # ======================================================
    # META DESCRIPTION
    # ======================================================

    description_tag = soup.find(
        "meta",
        attrs={
            "name": re.compile(
                "^description$",
                re.I,
            )
        },
    )

    description = ""

    if description_tag:
        description = (
            description_tag.get(
                "content",
                "",
            ).strip()
        )

    # ======================================================
    # HEADINGS
    # ======================================================

    headings = {
        "h1": [
            h.get_text(
                " ",
                strip=True,
            )
            for h in soup.find_all("h1")
            if h.get_text(
                " ",
                strip=True,
            )
        ],

        "h2": [
            h.get_text(
                " ",
                strip=True,
            )
            for h in soup.find_all("h2")
            if h.get_text(
                " ",
                strip=True,
            )
        ],

        "h3": [
            h.get_text(
                " ",
                strip=True,
            )
            for h in soup.find_all("h3")
            if h.get_text(
                " ",
                strip=True,
            )
        ],
    }

    # ======================================================
    # CANONICAL
    # ======================================================

    canonical_tag = soup.find(
        "link",
        attrs={
            "rel": lambda value: (
                value
                and "canonical" in value
                if isinstance(
                    value,
                    list,
                )
                else value == "canonical"
            )
        },
    )

    canonical = ""

    if canonical_tag:
        canonical = (
            canonical_tag.get(
                "href",
                "",
            ).strip()
        )

    # ======================================================
    # ROBOTS META
    # ======================================================

    robots_tag = soup.find(
        "meta",
        attrs={
            "name": re.compile(
                "^robots$",
                re.I,
            )
        },
    )

    robots = ""

    if robots_tag:
        robots = (
            robots_tag.get(
                "content",
                "",
            ).strip()
        )

    # ======================================================
    # LANGUAGE
    # ======================================================

    html_tag = soup.find(
        "html"
    )

    language = ""

    if html_tag:
        language = (
            html_tag.get(
                "lang",
                "",
            ).strip()
        )

    # ======================================================
    # SCHEMA
    # ======================================================

    json_ld_scripts = soup.find_all(
        "script",
        attrs={
            "type": re.compile(
                r"application/ld\+json",
                re.I,
            )
        },
    )

    schema_types = []

    for script in json_ld_scripts:

        raw_schema = script.get_text(
            strip=True
        )

        if not raw_schema:
            continue

        matches = re.findall(
            r'"@type"\s*:\s*"([^"]+)"',
            raw_schema,
            flags=re.I,
        )

        for match in matches:

            if match not in schema_types:
                schema_types.append(
                    match
                )

    schema_count = len(
        json_ld_scripts
    )

    # ======================================================
    # IMAGES
    # ======================================================

    images = soup.find_all(
        "img"
    )

    image_count = len(
        images
    )

    images_without_alt = 0

    for image in images:

        alt = image.get(
            "alt"
        )

        if (
            alt is None
            or not str(alt).strip()
        ):
            images_without_alt += 1

    # ======================================================
    # LINKS
    # ======================================================

    links = soup.find_all(
        "a",
        href=True,
    )

    internal_links = 0
    external_links = 0

    internal_link_urls = []
    external_link_urls = []

    for link in links:

        href = link.get(
            "href",
            "",
        ).strip()

        if not href:
            continue

        if href.startswith("#"):
            continue

        if href.lower().startswith(
            "javascript:"
        ):
            continue

        if href.lower().startswith(
            "mailto:"
        ):
            continue

        if href.lower().startswith(
            "tel:"
        ):
            continue

        full_url = urljoin(
            page_url,
            href,
        )

        parsed_link = urlparse(
            full_url
        )

        link_domain = (
            parsed_link.netloc.lower()
        )

        if not link_domain:
            continue

        normalized_link = normalize_url(
            full_url
        )

        if link_domain == base_domain:

            internal_links += 1

            if normalized_link not in internal_link_urls:
                internal_link_urls.append(
                    normalized_link
                )

        else:

            external_links += 1

            if normalized_link not in external_link_urls:
                external_link_urls.append(
                    normalized_link
                )

    # ======================================================
    # OPEN GRAPH
    # ======================================================

    og_title = soup.find(
        "meta",
        attrs={
            "property": re.compile(
                "^og:title$",
                re.I,
            )
        },
    )

    og_description = soup.find(
        "meta",
        attrs={
            "property": re.compile(
                "^og:description$",
                re.I,
            )
        },
    )

    og_image = soup.find(
        "meta",
        attrs={
            "property": re.compile(
                "^og:image$",
                re.I,
            )
        },
    )

    open_graph = {
        "title": bool(
            og_title
        ),
        "description": bool(
            og_description
        ),
        "image": bool(
            og_image
        ),
    }

    # ======================================================
    # TWITTER
    # ======================================================

    twitter_card = soup.find(
        "meta",
        attrs={
            "name": re.compile(
                "^twitter:card$",
                re.I,
            )
        },
    )

    twitter_title = soup.find(
        "meta",
        attrs={
            "name": re.compile(
                "^twitter:title$",
                re.I,
            )
        },
    )

    social = {
        "twitter_card": bool(
            twitter_card
        ),
        "twitter_title": bool(
            twitter_title
        ),
    }

    # ======================================================
    # REMOVE NON CONTENT
    # ======================================================

    for element in soup(
        [
            "script",
            "style",
            "noscript",
            "template",
        ]
    ):
        element.decompose()

    text = soup.get_text(
        " ",
        strip=True,
    )

    words = text.split()

    word_count = len(
        words
    )

    # ======================================================
    # PARAGRAPHS
    # ======================================================

    paragraphs = soup.find_all(
        "p"
    )

    paragraph_count = len(
        [
            p
            for p in paragraphs
            if p.get_text(
                " ",
                strip=True,
            )
        ]
    )

    # ======================================================
    # FAQ
    # ======================================================

    faq_detected = False

    faq_keywords = [
        "faq",
        "frequently asked questions",
        "questions",
        "answers",
    ]

    page_lower = text.lower()

    for keyword in faq_keywords:

        if keyword in page_lower:
            faq_detected = True
            break

    # ======================================================
    # AUTHOR
    # ======================================================

    author_meta = soup.find(
        "meta",
        attrs={
            "name": re.compile(
                "^author$",
                re.I,
            )
        },
    )

    author_class = soup.find(
        class_=re.compile(
            r"author|byline",
            re.I,
        )
    )

    author_detected = bool(
        author_meta
        or author_class
    )

    # ======================================================
    # SEMANTIC HTML
    # ======================================================

    semantic_tags = [
        "main",
        "article",
        "section",
        "nav",
        "header",
        "footer",
    ]

    semantic_elements = {}

    for tag_name in semantic_tags:

        semantic_elements[
            tag_name
        ] = bool(
            soup.find(
                tag_name
            )
        )

    semantic_score = sum(
        1
        for value in semantic_elements.values()
        if value
    )

    # ======================================================
    # ENTITY SIGNALS
    # ======================================================

    entity_signals = {
        "author": author_detected,

        "organization_schema": (
            "Organization"
            in schema_types
        ),

        "website_schema": (
            "WebSite"
            in schema_types
        ),

        "article_schema": (
            "Article"
            in schema_types
            or "NewsArticle"
            in schema_types
            or "BlogPosting"
            in schema_types
        ),

        "faq_schema": (
            "FAQPage"
            in schema_types
        ),

        "breadcrumb_schema": (
            "BreadcrumbList"
            in schema_types
        ),
    }

    # ======================================================
    # AI READINESS
    # ======================================================

    ai_readiness = {

        "clear_title": bool(
            title
        ),

        "clear_description": bool(
            description
        ),

        "has_h1": (
            len(
                headings["h1"]
            ) > 0
        ),

        "structured_content": (
            len(
                headings["h2"]
            ) > 0
            and paragraph_count > 0
        ),

        "schema": (
            schema_count > 0
        ),

        "faq": faq_detected,

        "author": author_detected,

        "semantic_html": (
            semantic_score >= 3
        ),

        "canonical": bool(
            canonical
        ),

        # These are checked separately
        # by the website-level analyzer.
        "robots_txt": False,

        "sitemap": False,
    }

    ai_readiness_count = sum(
        1
        for value in ai_readiness.values()
        if value
    )

    ai_readiness_score = round(
        (
            ai_readiness_count
            / len(ai_readiness)
        )
        * 100
    )

    # ======================================================
    # CONTENT SIGNALS
    # ======================================================

    content_signals = {

        "word_count": word_count,

        "paragraph_count": paragraph_count,

        "has_h1": (
            len(
                headings["h1"]
            ) > 0
        ),

        "has_h2": (
            len(
                headings["h2"]
            ) > 0
        ),

        "has_h3": (
            len(
                headings["h3"]
            ) > 0
        ),

        "faq_detected": faq_detected,

        "author_detected": (
            author_detected
        ),

        "semantic_score": (
            semantic_score
        ),
    }

    # ======================================================
    # TECHNICAL SIGNALS
    # ======================================================

    technical_signals = {

        "title_present": bool(
            title
        ),

        "description_present": bool(
            description
        ),

        "canonical_present": bool(
            canonical
        ),

        "language_present": bool(
            language
        ),

        "schema_present": (
            schema_count > 0
        ),

        "open_graph": (
            bool(og_title)
            and bool(og_description)
        ),

        "twitter_card": bool(
            twitter_card
        ),
    }

    # ======================================================
    # PAGE RESULT
    # ======================================================

    return {

        "url": normalize_url(
            page_url
        ),

        "title": title,

        "description": description,

        "headings": headings,

        "word_count": word_count,

        "paragraph_count": paragraph_count,

        "canonical": canonical,

        "robots": robots,

        "language": language,

        "schema": {
            "count": schema_count,

            "present": (
                schema_count > 0
            ),

            "types": schema_types,
        },

        "images": {
            "total": image_count,

            "without_alt": (
                images_without_alt
            ),
        },

        "links": {
            "internal": internal_links,

            "external": external_links,

            "internal_urls": internal_link_urls,

            "external_urls": external_link_urls,
        },

        "open_graph": open_graph,

        "social": social,

        "content_signals": (
            content_signals
        ),

        "semantic_html": {

            "elements": (
                semantic_elements
            ),

            "score": semantic_score,
        },

        "entity_signals": (
            entity_signals
        ),

        "ai_readiness": (
            ai_readiness
        ),

        "ai_readiness_score": (
            ai_readiness_score
        ),

        "technical_signals": (
            technical_signals
        ),

        "faq_detected": faq_detected,

        "author_detected": (
            author_detected
        ),
    }


# ==========================================================
# WEBSITE CRAWLER + PAGE ANALYSIS
# ==========================================================

def crawl_website(
    start_url: str,
    max_pages: int = 20,
) -> Dict[str, Any]:

    start_url = normalize_url(
        start_url
    )

    parsed_start = urlparse(
        start_url
    )

    base_domain = (
        parsed_start.netloc.lower()
    )

    visited: Set[str] = set()

    queued: Set[str] = {
        start_url
    }

    queue: List[str] = [
        start_url
    ]

    pages: List[Dict[str, Any]] = []

    failed_pages: List[
        Dict[str, Any]
    ] = []

    while queue and len(
        pages
    ) < max_pages:

        current_url = queue.pop(
            0
        )

        if current_url in visited:
            continue

        visited.add(
            current_url
        )

        response = safe_get(
            current_url,
            timeout=8,
        )

        if response is None:

            failed_pages.append(
                {
                    "url": current_url,
                    "reason": "request_failed",
                }
            )

            continue

        if response.status_code != 200:

            failed_pages.append(
                {
                    "url": current_url,
                    "status_code": response.status_code,
                    "reason": "http_error",
                }
            )

            continue

        content_type = (
            response.headers.get(
                "content-type",
                "",
            ).lower()
        )

        if "text/html" not in content_type:

            failed_pages.append(
                {
                    "url": current_url,
                    "reason": "not_html",
                }
            )

            continue

        html = response.text

        # --------------------------------------------------
        # Analyze This Page
        # --------------------------------------------------

        try:

            page_analysis = analyze_page_html(
                current_url,
                html,
            )

        except Exception as error:

            failed_pages.append(
                {
                    "url": current_url,
                    "reason": "analysis_failed",
                    "error": str(error),
                }
            )

            continue

        # Add HTTP information

        page_analysis["status_code"] = (
            response.status_code
        )

        page_analysis["content_length"] = (
            len(html)
        )

        pages.append(
            page_analysis
        )

        # --------------------------------------------------
        # Discover More Internal Pages
        # --------------------------------------------------

        internal_links = (
            extract_internal_links(
                current_url,
                html,
                base_domain,
            )
        )

        for link in internal_links:

            if link in visited:
                continue

            if link in queued:
                continue

            if (
                len(queue)
                + len(pages)
                >= max_pages
            ):
                break

            queued.add(
                link
            )

            queue.append(
                link
            )

    # ======================================================
    # CRAWL SUMMARY
    # ======================================================

    crawled_count = len(
        pages
    )

    # Pages with important signals

    pages_with_title = sum(
        1
        for page in pages
        if page["technical_signals"][
            "title_present"
        ]
    )

    pages_with_description = sum(
        1
        for page in pages
        if page["technical_signals"][
            "description_present"
        ]
    )

    pages_with_h1 = sum(
        1
        for page in pages
        if page["content_signals"][
            "has_h1"
        ]
    )

    pages_with_schema = sum(
        1
        for page in pages
        if page["schema"]["present"]
    )

    pages_with_canonical = sum(
        1
        for page in pages
        if page["technical_signals"][
            "canonical_present"
        ]
    )

    pages_with_open_graph = sum(
        1
        for page in pages
        if page["technical_signals"][
            "open_graph"
        ]
    )

    pages_with_faq = sum(
        1
        for page in pages
        if page["faq_detected"]
    )

    pages_with_author = sum(
        1
        for page in pages
        if page["author_detected"]
    )

    # ======================================================
    # AVERAGE AI READINESS
    # ======================================================

    if crawled_count > 0:

        average_ai_readiness = round(
            sum(
                page[
                    "ai_readiness_score"
                ]
                for page in pages
            )
            / crawled_count
        )

    else:

        average_ai_readiness = 0

    # ======================================================
    # AVERAGE WORD COUNT
    # ======================================================

    if crawled_count > 0:

        average_word_count = round(
            sum(
                page["word_count"]
                for page in pages
            )
            / crawled_count
        )

    else:

        average_word_count = 0

    # ======================================================
    # TOTAL INTERNAL / EXTERNAL LINKS
    # ======================================================

    total_internal_links = sum(
        page["links"]["internal"]
        for page in pages
    )

    total_external_links = sum(
        page["links"]["external"]
        for page in pages
    )

    # ======================================================
    # CRAWL RESULT
    # ======================================================

    return {

        "start_url": start_url,

        "domain": base_domain,

        "max_pages": max_pages,

        "pages_discovered": len(
            visited
        ),

        "pages_crawled": crawled_count,

        "failed_pages": failed_pages,

        "pages": pages,

        # ==================================================
        # AGGREGATED WEBSITE DATA
        # ==================================================

        "summary": {

            "pages_with_title": (
                pages_with_title
            ),

            "pages_with_description": (
                pages_with_description
            ),

            "pages_with_h1": (
                pages_with_h1
            ),

            "pages_with_schema": (
                pages_with_schema
            ),

            "pages_with_canonical": (
                pages_with_canonical
            ),

            "pages_with_open_graph": (
                pages_with_open_graph
            ),

            "pages_with_faq": (
                pages_with_faq
            ),

            "pages_with_author": (
                pages_with_author
            ),

            "average_ai_readiness": (
                average_ai_readiness
            ),

            "average_word_count": (
                average_word_count
            ),

            "total_internal_links": (
                total_internal_links
            ),

            "total_external_links": (
                total_external_links
            ),
        },
    }


# ==========================================================
# MAIN WEBSITE ANALYZER
# ==========================================================

def analyze_website(
    url: str,
):

    # ======================================================
    # NORMALIZE
    # ======================================================

    normalized_url = normalize_url(
        url
    )

    # ======================================================
    # MAIN REQUEST
    # ======================================================

    response = requests.get(
        normalized_url,
        timeout=15,
        headers={
            "User-Agent": USER_AGENT
        },
        allow_redirects=True,
    )

    response.raise_for_status()

    html = response.text

    # ======================================================
    # ANALYZE MAIN PAGE
    # ======================================================

    page_analysis = analyze_page_html(
        normalized_url,
        html,
    )

    # ======================================================
    # ROBOTS.TXT
    # ======================================================

    robots_txt_url = urljoin(
        normalized_url,
        "/robots.txt",
    )

    robots_txt_found = False
    robots_txt_content = ""

    robots_response = safe_get(
        robots_txt_url,
        timeout=5,
    )

    if robots_response is not None:

        if robots_response.status_code == 200:

            robots_txt_found = True

            robots_txt_content = (
                robots_response.text[:10000]
            )

    # ======================================================
    # SITEMAP
    # ======================================================

    sitemap_url = urljoin(
        normalized_url,
        "/sitemap.xml",
    )

    sitemap_found = False

    sitemap_response = safe_get(
        sitemap_url,
        timeout=5,
    )

    if sitemap_response is not None:

        if sitemap_response.status_code == 200:
            sitemap_found = True

    # ======================================================
    # UPDATE MAIN PAGE AI READINESS
    # ======================================================

    page_analysis[
        "ai_readiness"
    ]["robots_txt"] = (
        robots_txt_found
    )

    page_analysis[
        "ai_readiness"
    ]["sitemap"] = (
        sitemap_found
    )

    ai_readiness = page_analysis[
        "ai_readiness"
    ]

    ai_readiness_count = sum(
        1
        for value in ai_readiness.values()
        if value
    )

    ai_readiness_score = round(
        (
            ai_readiness_count
            / len(ai_readiness)
        )
        * 100
    )

    page_analysis[
        "ai_readiness_score"
    ] = ai_readiness_score

    # ======================================================
    # UPDATE TECHNICAL SIGNALS
    # ======================================================

    page_analysis[
        "technical_signals"
    ]["robots_txt"] = (
        robots_txt_found
    )

    page_analysis[
        "technical_signals"
    ]["sitemap"] = (
        sitemap_found
    )

    # ======================================================
    # CRAWL WEBSITE
    # ======================================================

    crawl = crawl_website(
        normalized_url,
        max_pages=20,
    )

    # ======================================================
    # FINAL RESULT
    # ======================================================

    return {

        # Basic
        "url": normalized_url,

        # Main page
        "title": page_analysis[
            "title"
        ],

        "description": page_analysis[
            "description"
        ],

        "headings": page_analysis[
            "headings"
        ],

        "word_count": page_analysis[
            "word_count"
        ],

        "paragraph_count": page_analysis[
            "paragraph_count"
        ],

        # Technical
        "canonical": page_analysis[
            "canonical"
        ],

        "robots": page_analysis[
            "robots"
        ],

        "language": page_analysis[
            "language"
        ],

        # Schema
        "schema": page_analysis[
            "schema"
        ],

        # Images
        "images": page_analysis[
            "images"
        ],

        # Links
        "links": page_analysis[
            "links"
        ],

        # Social
        "open_graph": page_analysis[
            "open_graph"
        ],

        "social": page_analysis[
            "social"
        ],

        # Crawlability
        "robots_txt": robots_txt_found,

        "robots_txt_content": (
            robots_txt_content
        ),

        "sitemap": sitemap_found,

        # Crawl
        "crawl": crawl,

        # Main page intelligence
        "content_signals": page_analysis[
            "content_signals"
        ],

        "semantic_html": page_analysis[
            "semantic_html"
        ],

        "entity_signals": page_analysis[
            "entity_signals"
        ],

        "ai_readiness": page_analysis[
            "ai_readiness"
        ],

        "ai_readiness_score": (
            ai_readiness_score
        ),

        "technical_signals": page_analysis[
            "technical_signals"
        ],

        "faq_detected": page_analysis[
            "faq_detected"
        ],

        "author_detected": page_analysis[
            "author_detected"
        ],
    }