from typing import Any, Dict, List


def generate_recommendations(
    analysis: Dict[str, Any],
    visibility: Dict[str, Any],
) -> List[Dict[str, Any]]:

    recommendations: List[Dict[str, Any]] = []

    checks = visibility.get(
        "checks",
        {}
    )

    breakdown = visibility.get(
        "breakdown",
        {}
    )

    score = visibility.get(
        "score",
        0
    )

    # ==========================================================
    # CONTENT
    # ==========================================================

    content = breakdown.get(
        "content",
        {}
    )

    content_score = content.get(
        "score",
        0
    )

    if not checks.get("description"):
        recommendations.append({
            "priority": "high",
            "category": "content",
            "issue": "Missing meta description",
            "recommendation": (
                "Add a concise and descriptive meta "
                "description explaining what the page offers."
            ),
        })

    if not checks.get("h2"):
        recommendations.append({
            "priority": "medium",
            "category": "content",
            "issue": "No H2 headings",
            "recommendation": (
                "Add descriptive H2 headings to organize "
                "content into clear sections."
            ),
        })

    word_count = analysis.get(
        "word_count",
        0
    )

    if word_count < 300:
        recommendations.append({
            "priority": "medium",
            "category": "content",
            "issue": "Low content volume",
            "recommendation": (
                "Increase useful, original content so "
                "AI systems have enough context to understand "
                "the website and its expertise."
            ),
        })

    if content_score < 10:
        recommendations.append({
            "priority": "high",
            "category": "content",
            "issue": "Weak content structure",
            "recommendation": (
                "Improve page structure using clear headings, "
                "descriptive sections, and substantial supporting content."
            ),
        })

    # ==========================================================
    # TECHNICAL SEO
    # ==========================================================

    if not checks.get("canonical"):
        recommendations.append({
            "priority": "medium",
            "category": "technical",
            "issue": "Canonical URL is missing",
            "recommendation": (
                "Add a canonical URL to clearly identify "
                "the preferred version of the page."
            ),
        })

    if not analysis.get(
        "language"
    ):
        recommendations.append({
            "priority": "low",
            "category": "technical",
            "issue": "HTML language attribute is missing",
            "recommendation": (
                "Add a valid lang attribute to the HTML element "
                "to help search engines and AI systems understand "
                "the page language."
            ),
        })

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

    if (
        image_count > 0
        and images_without_alt > 0
    ):
        recommendations.append({
            "priority": "medium",
            "category": "technical",
            "issue": "Images are missing alt text",
            "recommendation": (
                f"{images_without_alt} of {image_count} images "
                "do not have descriptive alt text. Add meaningful "
                "alt attributes to improve accessibility and "
                "content understanding."
            ),
        })

    # ==========================================================
    # STRUCTURED DATA
    # ==========================================================

    if not checks.get("schema"):
        recommendations.append({
            "priority": "high",
            "category": "structured_data",
            "issue": "Structured data is missing",
            "recommendation": (
                "Add relevant Schema.org structured data such as "
                "Organization, WebSite, Article, Product, or FAQPage "
                "to help search engines and AI systems understand "
                "the website."
            ),
        })

    schema_types = analysis.get(
        "schema",
        {}
    ).get(
        "types",
        []
    )

    if (
        schema_types
        and "Organization" not in schema_types
    ):
        recommendations.append({
            "priority": "medium",
            "category": "entity",
            "issue": "Organization schema is missing",
            "recommendation": (
                "Add Organization schema containing the business "
                "name, URL, logo, and other relevant entity information."
            ),
        })

    if (
        schema_types
        and "WebSite" not in schema_types
    ):
        recommendations.append({
            "priority": "low",
            "category": "entity",
            "issue": "WebSite schema is missing",
            "recommendation": (
                "Add WebSite structured data to clearly identify "
                "the website entity and its primary URL."
            ),
        })

    # ==========================================================
    # CRAWLABILITY
    # ==========================================================

    if not checks.get("robots_txt"):
        recommendations.append({
            "priority": "medium",
            "category": "crawlability",
            "issue": "Robots.txt not detected",
            "recommendation": (
                "Create a robots.txt file with appropriate crawler "
                "instructions for search engines and AI crawlers."
            ),
        })

    if not checks.get("sitemap"):
        recommendations.append({
            "priority": "medium",
            "category": "crawlability",
            "issue": "XML sitemap not detected",
            "recommendation": (
                "Create an XML sitemap containing important website "
                "URLs and make it discoverable through robots.txt."
            ),
        })

    if not checks.get("internal_links"):
        recommendations.append({
            "priority": "medium",
            "category": "crawlability",
            "issue": "No internal links detected",
            "recommendation": (
                "Add relevant internal links between important pages "
                "to help crawlers discover and understand website content."
            ),
        })

    # ==========================================================
    # SEMANTIC HTML
    # ==========================================================

    if not checks.get("semantic_html"):
        recommendations.append({
            "priority": "medium",
            "category": "semantic",
            "issue": "Weak semantic HTML structure",
            "recommendation": (
                "Use semantic HTML elements such as main, article, "
                "section, nav, header, and footer to create a clearer "
                "content structure."
            ),
        })

    # ==========================================================
    # ENTITY / AUTHORITY
    # ==========================================================

    if not checks.get("author"):
        recommendations.append({
            "priority": "low",
            "category": "authority",
            "issue": "Author information is missing",
            "recommendation": (
                "Add visible author information and author metadata "
                "where appropriate to strengthen expertise and content "
                "trust signals."
            ),
        })

    if not checks.get("organization"):
        recommendations.append({
            "priority": "medium",
            "category": "authority",
            "issue": "Organization entity signal is missing",
            "recommendation": (
                "Clearly identify the organization behind the website "
                "using Organization schema and consistent business information."
            ),
        })

    # ==========================================================
    # FAQ / ANSWERABILITY
    # ==========================================================

    if not checks.get("faq"):
        recommendations.append({
            "priority": "low",
            "category": "ai_readiness",
            "issue": "FAQ content is missing",
            "recommendation": (
                "Consider adding a useful FAQ section that directly "
                "answers common questions related to your products, "
                "services, or topic."
            ),
        })

    # ==========================================================
    # SOCIAL / OPEN GRAPH
    # ==========================================================

    if not checks.get("open_graph"):
        recommendations.append({
            "priority": "low",
            "category": "social",
            "issue": "Open Graph metadata is incomplete",
            "recommendation": (
                "Add Open Graph title, description, and image metadata "
                "to improve content representation across platforms."
            ),
        })

    # ==========================================================
    # AI READINESS
    # ==========================================================

    ai_readiness_score = analysis.get(
        "ai_readiness_score",
        0
    )

    if ai_readiness_score < 50:
        recommendations.append({
            "priority": "high",
            "category": "ai_readiness",
            "issue": "Low AI readiness",
            "recommendation": (
                "Improve content structure, semantic HTML, structured "
                "data, entity information, crawlability, and answer-focused "
                "content so AI systems can understand the website more reliably."
            ),
        })

    # ==========================================================
    # OVERALL VISIBILITY
    # ==========================================================

    if score < 30:
        recommendations.append({
            "priority": "critical",
            "category": "visibility",
            "issue": "Critical AI visibility score",
            "recommendation": (
                "The website currently has very weak AI visibility. "
                "Prioritize content quality, structured data, crawlability, "
                "entity signals, and technical foundations."
            ),
        })

    elif score < 50:
        recommendations.append({
            "priority": "high",
            "category": "visibility",
            "issue": "Low AI visibility score",
            "recommendation": (
                "Address the highest-impact technical and content issues "
                "to significantly improve AI visibility."
            ),
        })

    # ==========================================================
    # PRIORITY ORDER
    # ==========================================================

    priority_order = {
        "critical": 0,
        "high": 1,
        "medium": 2,
        "low": 3,
    }

    recommendations.sort(
        key=lambda item: priority_order.get(
            item.get("priority", "low"),
            3
        )
    )

    return recommendations