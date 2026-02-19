"""Database layer for Genesis Chamber — Vercel Postgres (Neon) via asyncpg.

Provides persistent storage that survives Render.com redeploys.
When DATABASE_URL is not set, all methods gracefully return None/empty,
allowing the file-based fallback in simulation_store.py and storage.py.
"""

import os
import json
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone

# asyncpg is optional — file-based fallback when not available
try:
    import asyncpg
    HAS_ASYNCPG = True
except ImportError:
    HAS_ASYNCPG = False

DATABASE_URL = os.getenv("DATABASE_URL", "")


def _parse_dt(value) -> datetime:
    """Convert ISO string or datetime to timezone-aware datetime for asyncpg TIMESTAMPTZ."""
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, str) and value:
        try:
            dt = datetime.fromisoformat(value)
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    return datetime.now(timezone.utc)


class DatabasePool:
    """Manages the asyncpg connection pool (singleton)."""
    _pool: Optional[Any] = None

    @classmethod
    async def get_pool(cls):
        if cls._pool is None and DATABASE_URL and HAS_ASYNCPG:
            try:
                cls._pool = await asyncpg.create_pool(
                    DATABASE_URL,
                    min_size=1,
                    max_size=5,
                    ssl="require",
                )
            except Exception as e:
                print(f"[database] Failed to connect: {e}")
                cls._pool = None
        return cls._pool

    @classmethod
    async def close(cls):
        if cls._pool:
            await cls._pool.close()
            cls._pool = None


def is_db_available() -> bool:
    """Check if database is configured and asyncpg is installed."""
    return bool(DATABASE_URL) and HAS_ASYNCPG


# === SCHEMA ===

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS simulations (
    id TEXT PRIMARY KEY,
    config JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'initialized',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    current_round INTEGER DEFAULT 0,
    current_stage INTEGER DEFAULT 0,
    current_stage_name TEXT DEFAULT '',
    rounds JSONB DEFAULT '[]'::jsonb,
    concepts JSONB DEFAULT '{"active":[],"eliminated":[],"merged":[]}'::jsonb,
    quality_gates JSONB DEFAULT '[]'::jsonb,
    transcript_entries JSONB DEFAULT '[]'::jsonb,
    event_log JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_simulations_status ON simulations(status);
CREATE INDEX IF NOT EXISTS idx_simulations_created ON simulations(created_at DESC);

CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    messages JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);

CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    extracted_text TEXT DEFAULT '',
    file_list JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upload_files (
    id SERIAL PRIMARY KEY,
    upload_id TEXT NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    content BYTEA NOT NULL,
    content_type TEXT DEFAULT 'application/octet-stream',
    size_bytes INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_upload_files_upload ON upload_files(upload_id);
"""


async def ensure_schema():
    """Create tables if they don't exist."""
    pool = await DatabasePool.get_pool()
    if not pool:
        return False
    try:
        await pool.execute(SCHEMA_SQL)
        return True
    except Exception as e:
        print(f"[database] Schema creation failed: {e}")
        return False


# === SIMULATION DB ===

class SimulationDB:
    """Database-backed simulation storage."""

    async def save_state(self, state) -> bool:
        pool = await DatabasePool.get_pool()
        if not pool:
            return False
        try:
            data = state.model_dump(mode="json")
            await pool.execute("""
                INSERT INTO simulations (id, config, status, created_at, current_round,
                    current_stage, current_stage_name, rounds, concepts,
                    quality_gates, transcript_entries, event_log, updated_at)
                VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb,
                        $10::jsonb, $11::jsonb, $12::jsonb, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    config = $2::jsonb, status = $3, current_round = $5,
                    current_stage = $6, current_stage_name = $7,
                    rounds = $8::jsonb, concepts = $9::jsonb,
                    quality_gates = $10::jsonb, transcript_entries = $11::jsonb,
                    event_log = $12::jsonb, updated_at = NOW()
            """,
                data["id"],
                json.dumps(data["config"]),
                data["status"],
                _parse_dt(data.get("created_at")),
                data["current_round"],
                data["current_stage"],
                data["current_stage_name"],
                json.dumps(data["rounds"]),
                json.dumps(data["concepts"]),
                json.dumps(data["quality_gates"]),
                json.dumps(data["transcript_entries"]),
                json.dumps(data["event_log"]),
            )
            return True
        except Exception as e:
            print(f"[database] save_state failed: {e}")
            return False

    async def load_state(self, sim_id: str):
        pool = await DatabasePool.get_pool()
        if not pool:
            return None
        try:
            row = await pool.fetchrow("SELECT * FROM simulations WHERE id = $1", sim_id)
            if not row:
                return None
            from .models import SimulationState
            return SimulationState(
                id=row["id"],
                config=json.loads(row["config"]),
                status=row["status"],
                created_at=row["created_at"].isoformat() if row["created_at"] else "",
                current_round=row["current_round"],
                current_stage=row["current_stage"],
                current_stage_name=row["current_stage_name"] or "",
                rounds=json.loads(row["rounds"]),
                concepts=json.loads(row["concepts"]),
                quality_gates=json.loads(row["quality_gates"]),
                transcript_entries=json.loads(row["transcript_entries"]),
                event_log=json.loads(row["event_log"]),
            )
        except Exception as e:
            print(f"[database] load_state failed: {e}")
            return None

    async def list_simulations(self) -> List[Dict[str, Any]]:
        pool = await DatabasePool.get_pool()
        if not pool:
            return []
        try:
            rows = await pool.fetch("""
                SELECT id, config->>'name' as name, config->>'type' as type,
                       status, created_at, current_round, config->>'rounds' as total_rounds
                FROM simulations ORDER BY created_at DESC
            """)
            results = []
            for row in rows:
                results.append({
                    "id": row["id"],
                    "name": row["name"] or "Unnamed",
                    "type": row["type"] or "unknown",
                    "status": row["status"],
                    "created_at": row["created_at"].isoformat() if row["created_at"] else "",
                    "current_round": row["current_round"],
                    "total_rounds": int(row["total_rounds"]) if row["total_rounds"] else 0,
                })
            return results
        except Exception as e:
            print(f"[database] list_simulations failed: {e}")
            return []

    async def delete_simulation(self, sim_id: str) -> bool:
        pool = await DatabasePool.get_pool()
        if not pool:
            return False
        try:
            result = await pool.execute("DELETE FROM simulations WHERE id = $1", sim_id)
            return result == "DELETE 1"
        except Exception as e:
            print(f"[database] delete_simulation failed: {e}")
            return False


# === CONVERSATION DB ===

class ConversationDB:
    """Database-backed conversation storage."""

    async def create(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        pool = await DatabasePool.get_pool()
        if not pool:
            return None
        try:
            now = datetime.now(timezone.utc)
            await pool.execute("""
                INSERT INTO conversations (id, title, created_at, messages)
                VALUES ($1, $2, $3, '[]'::jsonb)
            """, conversation_id, "New Conversation", now)
            return {
                "id": conversation_id,
                "created_at": now.isoformat(),
                "title": "New Conversation",
                "messages": [],
            }
        except Exception as e:
            print(f"[database] create conversation failed: {e}")
            return None

    async def get(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        pool = await DatabasePool.get_pool()
        if not pool:
            return None
        try:
            row = await pool.fetchrow("SELECT * FROM conversations WHERE id = $1", conversation_id)
            if not row:
                return None
            return {
                "id": row["id"],
                "created_at": row["created_at"].isoformat() if row["created_at"] else "",
                "title": row["title"],
                "messages": json.loads(row["messages"]),
            }
        except Exception as e:
            print(f"[database] get conversation failed: {e}")
            return None

    async def save(self, conversation: Dict[str, Any]) -> bool:
        pool = await DatabasePool.get_pool()
        if not pool:
            return False
        try:
            await pool.execute("""
                INSERT INTO conversations (id, title, created_at, messages)
                VALUES ($1, $2, $3, $4::jsonb)
                ON CONFLICT (id) DO UPDATE SET
                    title = $2, messages = $4::jsonb
            """,
                conversation["id"],
                conversation.get("title", "New Conversation"),
                _parse_dt(conversation.get("created_at")),
                json.dumps(conversation.get("messages", [])),
            )
            return True
        except Exception as e:
            print(f"[database] save conversation failed: {e}")
            return False

    async def list_all(self) -> List[Dict[str, Any]]:
        pool = await DatabasePool.get_pool()
        if not pool:
            return []
        try:
            rows = await pool.fetch("""
                SELECT id, title, created_at, jsonb_array_length(messages) as message_count
                FROM conversations ORDER BY created_at DESC
            """)
            results = []
            for row in rows:
                results.append({
                    "id": row["id"],
                    "created_at": row["created_at"].isoformat() if row["created_at"] else "",
                    "title": row["title"],
                    "message_count": row["message_count"] or 0,
                })
            return results
        except Exception as e:
            print(f"[database] list conversations failed: {e}")
            return []

    async def update_title(self, conversation_id: str, title: str) -> bool:
        pool = await DatabasePool.get_pool()
        if not pool:
            return False
        try:
            await pool.execute(
                "UPDATE conversations SET title = $2 WHERE id = $1",
                conversation_id, title,
            )
            return True
        except Exception as e:
            print(f"[database] update_title failed: {e}")
            return False

    async def delete(self, conversation_id: str) -> bool:
        pool = await DatabasePool.get_pool()
        if not pool:
            return False
        try:
            result = await pool.execute("DELETE FROM conversations WHERE id = $1", conversation_id)
            return result == "DELETE 1"
        except Exception as e:
            print(f"[database] delete conversation failed: {e}")
            return False

    async def add_message(self, conversation_id: str, message: Dict[str, Any]) -> bool:
        pool = await DatabasePool.get_pool()
        if not pool:
            return False
        try:
            await pool.execute("""
                UPDATE conversations
                SET messages = messages || $2::jsonb
                WHERE id = $1
            """, conversation_id, json.dumps([message]))
            return True
        except Exception as e:
            print(f"[database] add_message failed: {e}")
            return False


# === UPLOAD DB ===

class UploadDB:
    """Database-backed upload storage."""

    async def save_upload(self, upload_id: str, filename: str, file_type: str,
                          extracted_text: str, file_list: List[str]) -> bool:
        pool = await DatabasePool.get_pool()
        if not pool:
            return False
        try:
            await pool.execute("""
                INSERT INTO uploads (id, filename, file_type, extracted_text, file_list)
                VALUES ($1, $2, $3, $4, $5::jsonb)
            """, upload_id, filename, file_type, extracted_text, json.dumps(file_list))
            return True
        except Exception as e:
            print(f"[database] save_upload failed: {e}")
            return False

    async def save_file(self, upload_id: str, path: str,
                        content: bytes, content_type: str) -> bool:
        pool = await DatabasePool.get_pool()
        if not pool:
            return False
        try:
            await pool.execute("""
                INSERT INTO upload_files (upload_id, path, content, content_type, size_bytes)
                VALUES ($1, $2, $3, $4, $5)
            """, upload_id, path, content, content_type, len(content))
            return True
        except Exception as e:
            print(f"[database] save_file failed: {e}")
            return False

    async def get_file(self, upload_id: str, path: str) -> Optional[Dict[str, Any]]:
        pool = await DatabasePool.get_pool()
        if not pool:
            return None
        try:
            row = await pool.fetchrow("""
                SELECT content, content_type FROM upload_files
                WHERE upload_id = $1 AND path = $2
            """, upload_id, path)
            if not row:
                return None
            return {"content": row["content"], "content_type": row["content_type"]}
        except Exception as e:
            print(f"[database] get_file failed: {e}")
            return None

    async def get_upload(self, upload_id: str) -> Optional[Dict[str, Any]]:
        pool = await DatabasePool.get_pool()
        if not pool:
            return None
        try:
            row = await pool.fetchrow("SELECT * FROM uploads WHERE id = $1", upload_id)
            if not row:
                return None
            return {
                "id": row["id"],
                "filename": row["filename"],
                "file_type": row["file_type"],
                "extracted_text": row["extracted_text"],
                "file_list": json.loads(row["file_list"]),
            }
        except Exception as e:
            print(f"[database] get_upload failed: {e}")
            return None
