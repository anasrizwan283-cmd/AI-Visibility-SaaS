from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime

from .database import Base


class Audit(Base):
    __tablename__ = "audits"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    url = Column(
        String(500),
        nullable=False
    )

    score = Column(
        Integer,
        nullable=False
    )

    title = Column(
        String(500),
        nullable=True
    )

    description = Column(
        Text,
        nullable=True
    )

    word_count = Column(
        Integer,
        nullable=True
    )

    analysis_data = Column(
        Text,
        nullable=True
    )

    recommendations = Column(
        Text,
        nullable=True
    )

    # --------------------------------
    # Technical Crawl Data
    # --------------------------------

    crawl_data = Column(
        Text,
        nullable=True
    )

    crawl_pages = Column(
        Integer,
        nullable=True
    )

    unique_pages = Column(
        Integer,
        nullable=True
    )

    successful_pages = Column(
        Integer,
        nullable=True
    )

    failed_pages = Column(
        Integer,
        nullable=True
    )

    pages_without_title = Column(
        Integer,
        nullable=True
    )

    thin_content_pages = Column(
        Integer,
        nullable=True
    )

    total_crawl_words = Column(
        Integer,
        nullable=True
    )

    average_crawl_words = Column(
        Integer,
        nullable=True
    )

    crawl_credits_used = Column(
        Integer,
        nullable=True
    )

    crawl_duration = Column(
        Integer,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Settings(Base):
    __tablename__ = "settings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    workspace_name = Column(
        String(200),
        nullable=False,
        default="AI Visibility Workspace"
    )

    default_website = Column(
        String(500),
        nullable=True
    )

    notifications = Column(
        Boolean,
        nullable=False,
        default=True
    )

    enhanced_analysis = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Integration(Base):
    __tablename__ = "integrations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    tenant_id = Column(
        String(100),
        nullable=False,
        index=True
    )

    provider = Column(
        String(100),
        nullable=False,
        index=True
    )

    display_name = Column(
        String(200),
        nullable=False
    )

    auth_type = Column(
        String(50),
        nullable=False
    )

    encrypted_credentials = Column(
        Text,
        nullable=True
    )

    is_connected = Column(
        Boolean,
        nullable=False,
        default=False
    )

    usage_count = Column(
        Integer,
        nullable=False,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )