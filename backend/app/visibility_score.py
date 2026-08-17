from typing import Any, Dict


def calculate_visibility_score(
    analysis: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate an AI Visibility Score from 0-100.

    The score evaluates:
    - Content quality
    - Technical SEO
    - Structured data
    - Crawlability
    - Semantic HTML
    - Entity signals
    - Social metadata
    - AI readiness
    """

    # ==========================================================
    # GET ANALYSIS SECTIONS
    # ==========================================================

    title = analysis.get("title", "")
    description = analysis.get("description", "")

    headings = analysis.get(
        "headings",
        {}
    )

    h1 = headings.get("h1", [])
    h2 = headings.get("h2", [])
    h3 = headings.get("h3", [])

    word_count = analysis.get(
        "word_count",
        0
    )

    paragraph_count = analysis.get(
        "paragraph_count",
        0
    )

    canonical = analysis.get(
        "canonical",
        ""
    )

    language = analysis.get(
        "language",
        ""
    )

    schema = analysis.get(
        "schema",
        {}
    )

    schema_present = schema.get(
        "present",
        False
    )

    schema_types = schema.get(
        "types",
        []
    )

    images = analysis.get(
        "images",
        {}
    )

    image_count = images.get(
        "total",
        0
    )

    images_without_alt = images.get(
        "without_alt",
        0
    )

    links = analysis.get(
        "links",
        {}
    )

    internal_links = links.get(
        "internal",
        0
    )

    external_links = links.get(
        "external",
        0
    )

    open_graph = analysis.get(
        "open_graph",
        {}
    )

    social = analysis.get(
        "social",
        {}
    )

    robots_txt = analysis.get(
        "robots_txt",
        False
    )

    sitemap = analysis.get(
        "sitemap",
        False
    )

    faq_detected = analysis.get(
        "faq_detected",
        False
    )

    author_detected = analysis.get(
        "author_detected",
        False
    )

    semantic_html = analysis.get(
        "semantic_html",
        {}
    )

    semantic_score = semantic_html.get(
        "score",
        0
    )

    entity_signals = analysis.get(
        "entity_signals",
        {}
    )

    ai_readiness_score = analysis.get(
        "ai_readiness_score",
        0
    )

    # ==========================================================
    # SCORE BREAKDOWN
    # ==========================================================

    content_score = 0
    technical_score = 0
    structured_data_score = 0
    crawlability_score = 0
    semantic_score_points = 0
    entity_score = 0
    social_score = 0
    ai_score = 0

    # ==========================================================
    # 1. CONTENT QUALITY — 20 POINTS
    # ==========================================================

    if title:
        content_score += 3

    if description:
        content_score += 3

    if len(h1) == 1:
        content_score += 3
    elif len(h1) > 0:
        content_score += 2

    if len(h2) > 0:
        content_score += 3

    if len(h3) > 0:
        content_score += 1

    if word_count >= 300:
        content_score += 4
    elif word_count >= 150:
        content_score += 3
    elif word_count >= 75:
        content_score += 2
    elif word_count >= 40:
        content_score += 1

    if paragraph_count >= 5:
        content_score += 3
    elif paragraph_count >= 3:
        content_score += 2
    elif paragraph_count >= 1:
        content_score += 1

    content_score = min(
        content_score,
        20
    )

    # ==========================================================
    # 2. TECHNICAL SEO — 15 POINTS
    # ==========================================================

    if title:
        technical_score += 2

    if description:
        technical_score += 2

    if canonical:
        technical_score += 2

    if language:
        technical_score += 1

    if images_without_alt == 0:
        technical_score += 2
    elif image_count > 0:
        alt_ratio = (
            image_count - images_without_alt
        ) / image_count

        if alt_ratio >= 0.75:
            technical_score += 1

    if open_graph.get("title"):
        technical_score += 1

    if open_graph.get("description"):
        technical_score += 1

    if open_graph.get("image"):
        technical_score += 1

    if social.get("twitter_card"):
        technical_score += 1

    if social.get("twitter_title"):
        technical_score += 1

    technical_score = min(
        technical_score,
        15
    )

    # ==========================================================
    # 3. STRUCTURED DATA — 15 POINTS
    # ==========================================================

    if schema_present:
        structured_data_score += 6

    if "Organization" in schema_types:
        structured_data_score += 2

    if "WebSite" in schema_types:
        structured_data_score += 2

    if (
        "Article" in schema_types
        or "NewsArticle" in schema_types
        or "BlogPosting" in schema_types
    ):
        structured_data_score += 2

    if "FAQPage" in schema_types:
        structured_data_score += 1

    if "BreadcrumbList" in schema_types:
        structured_data_score += 1

    if len(schema_types) >= 3:
        structured_data_score += 1

    structured_data_score = min(
        structured_data_score,
        15
    )

    # ==========================================================
    # 4. CRAWLABILITY — 10 POINTS
    # ==========================================================

    if robots_txt:
        crawlability_score += 4

    if sitemap:
        crawlability_score += 4

    if internal_links >= 3:
        crawlability_score += 2
    elif internal_links > 0:
        crawlability_score += 1

    crawlability_score = min(
        crawlability_score,
        10
    )

    # ==========================================================
    # 5. SEMANTIC HTML — 10 POINTS
    # ==========================================================

    if semantic_score >= 5:
        semantic_score_points += 8
    elif semantic_score >= 3:
        semantic_score_points += 6
    elif semantic_score >= 2:
        semantic_score_points += 4
    elif semantic_score >= 1:
        semantic_score_points += 2

    if "main" in semantic_html.get(
        "elements",
        {}
    ) and semantic_html.get(
        "elements",
        {}
    ).get(
        "main"
    ):
        semantic_score_points += 2

    semantic_score_points = min(
        semantic_score_points,
        10
    )

    # ==========================================================
    # 6. ENTITY / AUTHORITY SIGNALS — 10 POINTS
    # ==========================================================

    if entity_signals.get(
        "author"
    ):
        entity_score += 2

    if entity_signals.get(
        "organization_schema"
    ):
        entity_score += 2

    if entity_signals.get(
        "website_schema"
    ):
        entity_score += 2

    if entity_signals.get(
        "article_schema"
    ):
        entity_score += 2

    if entity_signals.get(
        "breadcrumb_schema"
    ):
        entity_score += 1

    if entity_signals.get(
        "faq_schema"
    ):
        entity_score += 1

    entity_score = min(
        entity_score,
        10
    )

    # ==========================================================
    # 7. SOCIAL / REPRESENTATION — 5 POINTS
    # ==========================================================

    if open_graph.get("title"):
        social_score += 1

    if open_graph.get("description"):
        social_score += 1

    if open_graph.get("image"):
        social_score += 1

    if social.get("twitter_card"):
        social_score += 1

    if social.get("twitter_title"):
        social_score += 1

    social_score = min(
        social_score,
        5
    )

    # ==========================================================
    # 8. AI READINESS — 15 POINTS
    # ==========================================================

    if ai_readiness_score >= 90:
        ai_score = 15
    elif ai_readiness_score >= 75:
        ai_score = 13
    elif ai_readiness_score >= 60:
        ai_score = 10
    elif ai_readiness_score >= 45:
        ai_score = 8
    elif ai_readiness_score >= 30:
        ai_score = 5
    elif ai_readiness_score >= 15:
        ai_score = 3
    else:
        ai_score = 1

    # ==========================================================
    # FINAL SCORE
    # ==========================================================

    total_score = (
        content_score
        + technical_score
        + structured_data_score
        + crawlability_score
        + semantic_score_points
        + entity_score
        + social_score
        + ai_score
    )

    total_score = max(
        0,
        min(
            total_score,
            100
        )
    )

    # ==========================================================
    # SCORE LEVEL
    # ==========================================================

    if total_score >= 80:
        level = "Excellent"
    elif total_score >= 65:
        level = "Good"
    elif total_score >= 50:
        level = "Fair"
    elif total_score >= 30:
        level = "Poor"
    else:
        level = "Critical"

    # ==========================================================
    # CHECKS
    # ==========================================================

    checks = {
        "title": bool(title),

        "description": bool(
            description
        ),

        "h1": len(h1) > 0,

        "h2": len(h2) > 0,

        "content": word_count >= 300,

        "schema": schema_present,

        "canonical": bool(
            canonical
        ),

        "robots_txt": robots_txt,

        "sitemap": sitemap,

        "open_graph": (
            open_graph.get("title", False)
            and open_graph.get(
                "description",
                False
            )
        ),

        "semantic_html": (
            semantic_score >= 3
        ),

        "author": author_detected,

        "faq": faq_detected,

        "organization": entity_signals.get(
            "organization_schema",
            False
        ),

        "internal_links": internal_links > 0,
    }

    # ==========================================================
    # RETURN RESULT
    # ==========================================================

    return {
        "score": total_score,

        "level": level,

        "max_score": 100,

        "breakdown": {
            "content": {
                "score": content_score,
                "max": 20,
            },

            "technical": {
                "score": technical_score,
                "max": 15,
            },

            "structured_data": {
                "score": structured_data_score,
                "max": 15,
            },

            "crawlability": {
                "score": crawlability_score,
                "max": 10,
            },

            "semantic_html": {
                "score": semantic_score_points,
                "max": 10,
            },

            "entity_authority": {
                "score": entity_score,
                "max": 10,
            },

            "social": {
                "score": social_score,
                "max": 5,
            },

            "ai_readiness": {
                "score": ai_score,
                "max": 15,
            },
        },

        "checks": checks,
    }