from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json

from .schemas import WebsiteRequest
from .website_analyzer import analyze_website
from .visibility_score import calculate_visibility_score
from .recommendations import generate_recommendations

from .database import Base, engine, SessionLocal
from . import models

# Integrations
from .integrations.router import router as integrations_router
from .integrations.credentials import CredentialManager
from .integrations.firecrawl import FirecrawlClient
from .integrations.technical_crawl import analyze_crawl


# ==========================================================
# DATABASE
# ==========================================================

Base.metadata.create_all(bind=engine)


# ==========================================================
# FASTAPI
# ==========================================================

app = FastAPI(
    title="AI Visibility SaaS API"
)


# ==========================================================
# INTEGRATION ROUTES
# ==========================================================

app.include_router(
    integrations_router
)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# DATABASE SESSION
# ==========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==========================================================
# ROOT
# ==========================================================

@app.get("/")
def root():
    return {
        "message": "AI Visibility SaaS Backend is running"
    }


# ==========================================================
# HEALTH
# ==========================================================

@app.get("/health")
def health():
    return {
        "status": "ok"
    }


# ==========================================================
# ANALYZE WEBSITE
# ==========================================================

@app.post("/analyze")
def analyze_website_endpoint(
    data: WebsiteRequest,
    db: Session = Depends(get_db),
):

    website_url = str(data.url)

    # ------------------------------------------------------
    # WEBSITE ANALYSIS
    # ------------------------------------------------------

    try:
        analysis = analyze_website(
            website_url
        )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Website analysis failed: {str(exc)}"
        )

    # ------------------------------------------------------
    # VISIBILITY SCORE
    # ------------------------------------------------------

    visibility = calculate_visibility_score(
        analysis
    )

    # ------------------------------------------------------
    # RECOMMENDATIONS
    # ------------------------------------------------------

    recommendations = generate_recommendations(
        analysis,
        visibility
    )

    # ------------------------------------------------------
    # FIRECRAWL TECHNICAL ANALYSIS
    # ------------------------------------------------------

    technical_analysis = None
    crawl_result = None

    firecrawl_integration = (
        db.query(models.Integration)
        .filter(
            models.Integration.tenant_id == "demo-tenant",
            models.Integration.provider == "firecrawl",
            models.Integration.is_connected == True,
        )
        .first()
    )

    if firecrawl_integration:

        try:

            if firecrawl_integration.encrypted_credentials:

                credential_manager = CredentialManager()

                credentials = credential_manager.decrypt(
                    firecrawl_integration.encrypted_credentials
                )

                api_key = credentials.get(
                    "api_key"
                )

                if api_key:

                    firecrawl_client = FirecrawlClient(
                        api_key=api_key
                    )

                    # --------------------------------------------------
                    # START CRAWL
                    # --------------------------------------------------

                    crawl_result = firecrawl_client.crawl(
                        url=website_url,
                        limit=20,
                        max_discovery_depth=2,
                    )

                    crawl_id = crawl_result.get(
                        "id"
                    )

                    # --------------------------------------------------
                    # GET CRAWL STATUS
                    # --------------------------------------------------

                    if crawl_id:

                        crawl_status = (
                            firecrawl_client.get_crawl_status(
                                crawl_id=crawl_id
                            )
                        )

                        if crawl_status.get(
                            "status"
                        ) == "completed":

                            technical_analysis = analyze_crawl(
                                crawl_status
                            )

                            firecrawl_integration.usage_count += 1

                            db.commit()

        except Exception as exc:

            print(
                f"Firecrawl analysis failed: {exc}"
            )

            technical_analysis = None

    # ------------------------------------------------------
    # TECHNICAL SUMMARY
    # ------------------------------------------------------

    technical_summary = {}

    if technical_analysis:

        technical_summary = (
            technical_analysis.get(
                "summary",
                {}
            )
        )

    # ======================================================
    # CREATE AUDIT
    # ======================================================

    audit = models.Audit(

        url=website_url,

        score=visibility.get(
            "score",
            0
        ),

        title=analysis.get(
            "title",
            ""
        ),

        description=analysis.get(
            "description",
            ""
        ),

        word_count=analysis.get(
            "word_count",
            0
        ),

        # --------------------------------------------------
        # FULL ANALYSIS DATA
        # --------------------------------------------------

        analysis_data=json.dumps(
            {
                "website_analysis": analysis,

                "visibility": visibility,

                "technical_analysis": (
                    technical_analysis
                ),

                "crawl_result": (
                    crawl_result
                ),
            }
        ),

        # --------------------------------------------------
        # RECOMMENDATIONS
        # --------------------------------------------------

        recommendations=json.dumps(
            recommendations
        ),

        # --------------------------------------------------
        # TECHNICAL CRAWL DATA
        # --------------------------------------------------

        crawl_data=(
            json.dumps(
                technical_analysis
            )
            if technical_analysis
            else None
        ),

        crawl_pages=technical_summary.get(
            "pages_crawled"
        ),

        unique_pages=technical_summary.get(
            "unique_pages"
        ),

        successful_pages=technical_summary.get(
            "successful_pages"
        ),

        failed_pages=technical_summary.get(
            "failed_pages"
        ),

        pages_without_title=technical_summary.get(
            "pages_without_title"
        ),

        thin_content_pages=technical_summary.get(
            "thin_content_pages"
        ),

        total_crawl_words=technical_summary.get(
            "total_words"
        ),

        average_crawl_words=technical_summary.get(
            "average_word_count"
        ),

        crawl_credits_used=(
            technical_analysis
            .get(
                "crawl_metadata",
                {}
            )
            .get(
                "credits_used"
            )
            if technical_analysis
            else None
        ),

        crawl_duration=(
            int(
                technical_analysis
                .get(
                    "crawl_metadata",
                    {}
                )
                .get(
                    "duration",
                    0
                )
            )
            if technical_analysis
            else None
        ),
    )

    db.add(audit)
    db.commit()
    db.refresh(audit)

    # ======================================================
    # RESPONSE
    # ======================================================

    return {

        "status": "success",

        "audit_id": audit.id,

        "url": website_url,

        "analysis": analysis,

        "visibility": visibility,

        "recommendations": recommendations,

        "technical_analysis": technical_analysis,
    }


# ==========================================================
# AUDIT HISTORY
# ==========================================================

@app.get("/audits")
def get_audits(
    db: Session = Depends(get_db)
):

    audits = (
        db.query(models.Audit)
        .order_by(
            models.Audit.created_at.desc()
        )
        .all()
    )

    return {

        "status": "success",

        "count": len(audits),

        "audits": [

            {
                "id": audit.id,

                "url": audit.url,

                "score": audit.score,

                "title": audit.title,

                "description": audit.description,

                "word_count": audit.word_count,

                "crawl_pages": audit.crawl_pages,

                "unique_pages": audit.unique_pages,

                "successful_pages": (
                    audit.successful_pages
                ),

                "failed_pages": (
                    audit.failed_pages
                ),

                "pages_without_title": (
                    audit.pages_without_title
                ),

                "thin_content_pages": (
                    audit.thin_content_pages
                ),

                "created_at": audit.created_at,
            }

            for audit in audits
        ],
    }


# ==========================================================
# SINGLE AUDIT REPORT
# ==========================================================

@app.get("/audits/{audit_id}")
def get_single_audit(
    audit_id: int,
    db: Session = Depends(get_db),
):

    audit = (
        db.query(models.Audit)
        .filter(
            models.Audit.id == audit_id
        )
        .first()
    )

    if not audit:

        raise HTTPException(
            status_code=404,
            detail="Audit not found"
        )

    # ------------------------------------------------------
    # LOAD STORED ANALYSIS
    # ------------------------------------------------------

    try:

        stored_analysis = json.loads(
            audit.analysis_data
        )

    except (
        json.JSONDecodeError,
        TypeError,
    ):

        stored_analysis = {}

    # ------------------------------------------------------
    # WEBSITE ANALYSIS
    # ------------------------------------------------------

    if (
        isinstance(
            stored_analysis,
            dict
        )
        and "website_analysis"
        in stored_analysis
    ):

        analysis = stored_analysis.get(
            "website_analysis",
            {}
        )

    else:

        analysis = stored_analysis

    # ------------------------------------------------------
    # STORED VISIBILITY
    # ------------------------------------------------------

    stored_visibility = None

    if isinstance(
        stored_analysis,
        dict
    ):

        stored_visibility = (
            stored_analysis.get(
                "visibility"
            )
        )

    # Recalculate if not stored
    if not stored_visibility:

        visibility = calculate_visibility_score(
            analysis
        )

    else:

        visibility = stored_visibility

    # ------------------------------------------------------
    # TECHNICAL ANALYSIS
    # ------------------------------------------------------

    technical_analysis = None

    if isinstance(
        stored_analysis,
        dict
    ):

        technical_analysis = (
            stored_analysis.get(
                "technical_analysis"
            )
        )

    # ------------------------------------------------------
    # RECOMMENDATIONS
    # ------------------------------------------------------

    try:

        recommendations = json.loads(
            audit.recommendations
        )

    except (
        json.JSONDecodeError,
        TypeError,
    ):

        recommendations = []

    # ======================================================
    # REPORT
    # ======================================================

    return {

        "status": "success",

        "audit": {

            "id": audit.id,

            "url": audit.url,

            "score": audit.score,

            "title": audit.title,

            "description": audit.description,

            "word_count": audit.word_count,

            "created_at": audit.created_at,

            "analysis": analysis,

            "visibility": visibility,

            "recommendations": recommendations,

            "technical_analysis": (
                technical_analysis
            ),

            # ------------------------------------------------
            # CRAWL METRICS
            # ------------------------------------------------

            "crawl_metrics": {

                "crawl_pages": (
                    audit.crawl_pages
                ),

                "unique_pages": (
                    audit.unique_pages
                ),

                "successful_pages": (
                    audit.successful_pages
                ),

                "failed_pages": (
                    audit.failed_pages
                ),

                "pages_without_title": (
                    audit.pages_without_title
                ),

                "thin_content_pages": (
                    audit.thin_content_pages
                ),

                "total_crawl_words": (
                    audit.total_crawl_words
                ),

                "average_crawl_words": (
                    audit.average_crawl_words
                ),

                "crawl_credits_used": (
                    audit.crawl_credits_used
                ),

                "crawl_duration": (
                    audit.crawl_duration
                ),
            },
        }
    }


# ==========================================================
# SETTINGS
# ==========================================================

@app.get("/settings")
def get_settings(
    db: Session = Depends(get_db)
):

    settings = (
        db.query(models.Settings)
        .first()
    )

    if not settings:

        settings = models.Settings(

            workspace_name=(
                "AI Visibility Workspace"
            ),

            default_website="",

            notifications=True,

            enhanced_analysis=True,
        )

        db.add(settings)

        db.commit()

        db.refresh(settings)

    return {

        "status": "success",

        "settings": {

            "id": settings.id,

            "workspace_name": (
                settings.workspace_name
            ),

            "default_website": (
                settings.default_website
            ),

            "notifications": (
                settings.notifications
            ),

            "enhanced_analysis": (
                settings.enhanced_analysis
            ),

            "created_at": (
                settings.created_at
            ),
        },
    }


# ==========================================================
# UPDATE SETTINGS
# ==========================================================

@app.put("/settings")
def update_settings(
    data: dict,
    db: Session = Depends(get_db),
):

    settings = (
        db.query(models.Settings)
        .first()
    )

    if not settings:

        settings = models.Settings(

            workspace_name=(
                "AI Visibility Workspace"
            ),

            default_website="",

            notifications=True,

            enhanced_analysis=True,
        )

        db.add(settings)

    if "workspace_name" in data:

        settings.workspace_name = (
            data["workspace_name"]
        )

    if "default_website" in data:

        settings.default_website = (
            data["default_website"]
        )

    if "notifications" in data:

        settings.notifications = bool(
            data["notifications"]
        )

    if "enhanced_analysis" in data:

        settings.enhanced_analysis = bool(
            data["enhanced_analysis"]
        )

    db.commit()

    db.refresh(settings)

    return {

        "status": "success",

        "message": (
            "Settings updated successfully"
        ),

        "settings": {

            "id": settings.id,

            "workspace_name": (
                settings.workspace_name
            ),

            "default_website": (
                settings.default_website
            ),

            "notifications": (
                settings.notifications
            ),

            "enhanced_analysis": (
                settings.enhanced_analysis
            ),

            "created_at": (
                settings.created_at
            ),
        },
    }