"""Database migration script — creates tables and optionally imports existing file-based data.

Usage:
    python -m backend.migrate           # Create tables only
    python -m backend.migrate --import  # Create tables + import existing data
"""

import asyncio
import json
import os
import sys
from pathlib import Path

try:
    import asyncpg
except ImportError:
    print("asyncpg is not installed. Run: pip install asyncpg>=0.29.0")
    sys.exit(1)

from .database import SCHEMA_SQL


async def create_tables(conn):
    """Create all tables."""
    await conn.execute(SCHEMA_SQL)
    print("[migrate] Tables created successfully")


async def import_simulations(conn, output_dir: str = "output/"):
    """Import existing simulation state files into the database."""
    output_path = Path(output_dir)
    if not output_path.exists():
        print("[migrate] No output/ directory found, skipping simulation import")
        return 0

    count = 0
    for entry in output_path.iterdir():
        if not entry.is_dir() or entry.name == "uploads":
            continue
        state_path = entry / "state.json"
        if not state_path.exists():
            continue

        try:
            with open(state_path) as f:
                data = json.load(f)

            await conn.execute("""
                INSERT INTO simulations (id, config, status, created_at, current_round,
                    current_stage, current_stage_name, rounds, concepts,
                    quality_gates, transcript_entries, event_log, updated_at)
                VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb,
                        $10::jsonb, $11::jsonb, $12::jsonb, NOW())
                ON CONFLICT (id) DO NOTHING
            """,
                data.get("id", entry.name),
                json.dumps(data.get("config", {})),
                data.get("status", "unknown"),
                data.get("created_at", ""),
                data.get("current_round", 0),
                data.get("current_stage", 0),
                data.get("current_stage_name", ""),
                json.dumps(data.get("rounds", [])),
                json.dumps(data.get("concepts", {"active": [], "eliminated": [], "merged": []})),
                json.dumps(data.get("quality_gates", [])),
                json.dumps(data.get("transcript_entries", [])),
                json.dumps(data.get("event_log", [])),
            )
            count += 1
            print(f"  Imported simulation: {data.get('id', entry.name)}")
        except Exception as e:
            print(f"  Failed to import {entry.name}: {e}")

    return count


async def import_conversations(conn, data_dir: str = "data/conversations/"):
    """Import existing conversation files into the database."""
    conv_path = Path(data_dir)
    if not conv_path.exists():
        print("[migrate] No data/conversations/ directory found, skipping conversation import")
        return 0

    count = 0
    for f in conv_path.glob("*.json"):
        try:
            with open(f) as fh:
                data = json.load(fh)

            await conn.execute("""
                INSERT INTO conversations (id, title, created_at, messages)
                VALUES ($1, $2, $3, $4::jsonb)
                ON CONFLICT (id) DO NOTHING
            """,
                data["id"],
                data.get("title", "New Conversation"),
                data.get("created_at", ""),
                json.dumps(data.get("messages", [])),
            )
            count += 1
            print(f"  Imported conversation: {data['id'][:12]}...")
        except Exception as e:
            print(f"  Failed to import {f.name}: {e}")

    return count


async def migrate():
    url = os.getenv("DATABASE_URL")
    if not url:
        print("[migrate] DATABASE_URL not set. Set it in your .env file.")
        print("  Example: DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require")
        sys.exit(1)

    print(f"[migrate] Connecting to database...")
    conn = await asyncpg.connect(url, ssl="require")

    try:
        await create_tables(conn)

        if "--import" in sys.argv:
            print("\n[migrate] Importing existing data...")
            sim_count = await import_simulations(conn)
            conv_count = await import_conversations(conn)
            print(f"\n[migrate] Import complete: {sim_count} simulations, {conv_count} conversations")
        else:
            print("[migrate] Tables ready. Run with --import to import existing file data.")
    finally:
        await conn.close()

    print("[migrate] Done!")


if __name__ == "__main__":
    asyncio.run(migrate())
