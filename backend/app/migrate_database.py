from sqlalchemy import inspect, text

from .database import engine


def add_column_if_missing(
    table_name: str,
    column_name: str,
    column_definition: str
):
    inspector = inspect(engine)

    existing_columns = {
        column["name"]
        for column in inspector.get_columns(table_name)
    }

    if column_name in existing_columns:
        print(
            f"{table_name}.{column_name} already exists"
        )
        return

    with engine.begin() as connection:
        connection.execute(
            text(
                f"ALTER TABLE {table_name} "
                f"ADD COLUMN {column_name} "
                f"{column_definition}"
            )
        )

    print(
        f"Added {table_name}.{column_name}"
    )


def migrate():
    print("Starting database migration...")

    audit_columns = [
        ("crawl_data", "TEXT"),
        ("crawl_pages", "INTEGER"),
        ("unique_pages", "INTEGER"),
        ("successful_pages", "INTEGER"),
        ("failed_pages", "INTEGER"),
        ("pages_without_title", "INTEGER"),
        ("thin_content_pages", "INTEGER"),
        ("total_crawl_words", "INTEGER"),
        ("average_crawl_words", "INTEGER"),
        ("crawl_credits_used", "INTEGER"),
        ("crawl_duration", "INTEGER"),
    ]

    for column_name, column_definition in audit_columns:
        add_column_if_missing(
            "audits",
            column_name,
            column_definition
        )

    print("Database migration completed successfully.")


if __name__ == "__main__":
    migrate()