from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Integration
from .credentials import CredentialManager
from .firecrawl import FirecrawlClient
from .technical_crawl import analyze_crawl


router = APIRouter(
    prefix="/integrations",
    tags=["Integrations"]
)


# --------------------------------
# Database dependency
# --------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# --------------------------------
# Request schemas
# --------------------------------

class ConnectIntegrationRequest(BaseModel):
    tenant_id: str
    provider: str
    display_name: str
    auth_type: str
    credentials: Dict[str, Any]


class FirecrawlRequest(BaseModel):
    tenant_id: str
    url: str
    limit: int = 20
    max_discovery_depth: int = 2


# --------------------------------
# Connect / Save Integration
# --------------------------------

@router.post("/connect")
def connect_integration(
    data: ConnectIntegrationRequest,
    db: Session = Depends(get_db)
):
    credential_manager = CredentialManager()

    encrypted_credentials = credential_manager.encrypt(
        data.credentials
    )

    existing = (
        db.query(Integration)
        .filter(
            Integration.tenant_id == data.tenant_id,
            Integration.provider == data.provider
        )
        .first()
    )

    if existing:
        existing.display_name = data.display_name
        existing.auth_type = data.auth_type
        existing.encrypted_credentials = encrypted_credentials
        existing.is_connected = True

        db.commit()
        db.refresh(existing)

        return {
            "status": "success",
            "message": "Integration updated successfully",
            "integration": {
                "id": existing.id,
                "tenant_id": existing.tenant_id,
                "provider": existing.provider,
                "display_name": existing.display_name,
                "auth_type": existing.auth_type,
                "is_connected": existing.is_connected,
            }
        }

    integration = Integration(
        tenant_id=data.tenant_id,
        provider=data.provider,
        display_name=data.display_name,
        auth_type=data.auth_type,
        encrypted_credentials=encrypted_credentials,
        is_connected=True,
    )

    db.add(integration)
    db.commit()
    db.refresh(integration)

    return {
        "status": "success",
        "message": "Integration connected successfully",
        "integration": {
            "id": integration.id,
            "tenant_id": integration.tenant_id,
            "provider": integration.provider,
            "display_name": integration.display_name,
            "auth_type": integration.auth_type,
            "is_connected": integration.is_connected,
        }
    }


# --------------------------------
# Firecrawl Crawl
# --------------------------------

@router.post("/firecrawl/crawl")
def firecrawl_crawl(
    data: FirecrawlRequest,
    db: Session = Depends(get_db)
):
    integration = (
        db.query(Integration)
        .filter(
            Integration.tenant_id == data.tenant_id,
            Integration.provider == "firecrawl",
            Integration.is_connected == True
        )
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Firecrawl integration is not connected for this tenant."
        )

    if not integration.encrypted_credentials:
        raise HTTPException(
            status_code=400,
            detail="Firecrawl credentials are missing."
        )

    try:
        credential_manager = CredentialManager()

        credentials = credential_manager.decrypt(
            integration.encrypted_credentials
        )

        api_key = credentials.get("api_key")

        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="Firecrawl API key is missing."
            )

        client = FirecrawlClient(
            api_key=api_key
        )

        result = client.crawl(
            url=data.url,
            limit=data.limit,
            max_discovery_depth=data.max_discovery_depth,
        )

        integration.usage_count += 1

        db.commit()

        return {
            "status": "success",
            "provider": "firecrawl",
            "tenant_id": data.tenant_id,
            "crawl": result,
            "usage_count": integration.usage_count,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc)
        )


# --------------------------------
# Firecrawl Crawl Status
# --------------------------------

@router.get("/firecrawl/crawl/{crawl_id}")
def firecrawl_crawl_status(
    crawl_id: str,
    tenant_id: str,
    db: Session = Depends(get_db)
):
    integration = (
        db.query(Integration)
        .filter(
            Integration.tenant_id == tenant_id,
            Integration.provider == "firecrawl",
            Integration.is_connected == True
        )
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Firecrawl integration is not connected for this tenant."
        )

    if not integration.encrypted_credentials:
        raise HTTPException(
            status_code=400,
            detail="Firecrawl credentials are missing."
        )

    try:
        credential_manager = CredentialManager()

        credentials = credential_manager.decrypt(
            integration.encrypted_credentials
        )

        api_key = credentials.get("api_key")

        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="Firecrawl API key is missing."
            )

        client = FirecrawlClient(
            api_key=api_key
        )

        result = client.get_crawl_status(
            crawl_id=crawl_id
        )

        # --------------------------------
        # Technical Crawl Analysis
        # --------------------------------

        technical_analysis = analyze_crawl(
            result
        )

        return {
            "status": "success",
            "provider": "firecrawl",
            "tenant_id": tenant_id,
            "crawl": result,
            "technical_analysis": technical_analysis,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc)
        )


# --------------------------------
# Get all integrations for tenant
# --------------------------------

@router.get("/{tenant_id}")
def get_integrations(
    tenant_id: str,
    db: Session = Depends(get_db)
):
    integrations = (
        db.query(Integration)
        .filter(
            Integration.tenant_id == tenant_id
        )
        .order_by(
            Integration.created_at.desc()
        )
        .all()
    )

    return {
        "status": "success",
        "tenant_id": tenant_id,
        "count": len(integrations),
        "integrations": [
            {
                "id": integration.id,
                "provider": integration.provider,
                "display_name": integration.display_name,
                "auth_type": integration.auth_type,
                "is_connected": integration.is_connected,
                "usage_count": integration.usage_count,
                "created_at": integration.created_at,
                "updated_at": integration.updated_at,
            }
            for integration in integrations
        ],
    }


# --------------------------------
# Get single integration
# --------------------------------

@router.get("/{tenant_id}/{provider}")
def get_integration(
    tenant_id: str,
    provider: str,
    db: Session = Depends(get_db)
):
    integration = (
        db.query(Integration)
        .filter(
            Integration.tenant_id == tenant_id,
            Integration.provider == provider
        )
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Integration not found"
        )

    return {
        "status": "success",
        "integration": {
            "id": integration.id,
            "tenant_id": integration.tenant_id,
            "provider": integration.provider,
            "display_name": integration.display_name,
            "auth_type": integration.auth_type,
            "is_connected": integration.is_connected,
            "usage_count": integration.usage_count,
            "created_at": integration.created_at,
            "updated_at": integration.updated_at,
        }
    }


# --------------------------------
# Disconnect integration
# --------------------------------

@router.delete("/{tenant_id}/{provider}")
def disconnect_integration(
    tenant_id: str,
    provider: str,
    db: Session = Depends(get_db)
):
    integration = (
        db.query(Integration)
        .filter(
            Integration.tenant_id == tenant_id,
            Integration.provider == provider
        )
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Integration not found"
        )

    db.delete(integration)
    db.commit()

    return {
        "status": "success",
        "message": "Integration disconnected successfully"
    }