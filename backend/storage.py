"""JSON-based storage for conversations — hybrid DB + file.

Uses database when DATABASE_URL is configured, always writes files as backup.
Falls back to file-only when no database is available.
"""

import json
import os
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
from .config import DATA_DIR
from .database import ConversationDB, is_db_available

_db = ConversationDB() if is_db_available() else None


def ensure_data_dir():
    Path(DATA_DIR).mkdir(parents=True, exist_ok=True)


def get_conversation_path(conversation_id: str) -> str:
    return os.path.join(DATA_DIR, f"{conversation_id}.json")


# --- File-based methods (always available, used as fallback) ---

def _create_file(conversation_id: str) -> Dict[str, Any]:
    ensure_data_dir()
    conversation = {
        "id": conversation_id,
        "created_at": datetime.utcnow().isoformat(),
        "title": "New Conversation",
        "messages": []
    }
    path = get_conversation_path(conversation_id)
    with open(path, 'w') as f:
        json.dump(conversation, f, indent=2)
    return conversation


def _get_file(conversation_id: str) -> Optional[Dict[str, Any]]:
    path = get_conversation_path(conversation_id)
    if not os.path.exists(path):
        return None
    with open(path, 'r') as f:
        return json.load(f)


def _save_file(conversation: Dict[str, Any]):
    ensure_data_dir()
    path = get_conversation_path(conversation['id'])
    with open(path, 'w') as f:
        json.dump(conversation, f, indent=2)


def _list_files() -> List[Dict[str, Any]]:
    ensure_data_dir()
    conversations = []
    for filename in os.listdir(DATA_DIR):
        if filename.endswith('.json'):
            path = os.path.join(DATA_DIR, filename)
            try:
                with open(path, 'r') as f:
                    data = json.load(f)
                conversations.append({
                    "id": data["id"],
                    "created_at": data["created_at"],
                    "title": data.get("title", "New Conversation"),
                    "message_count": len(data["messages"])
                })
            except (json.JSONDecodeError, KeyError):
                continue
    conversations.sort(key=lambda x: x["created_at"], reverse=True)
    return conversations


def _schedule_db(coro):
    """Schedule a DB coroutine if event loop is running."""
    if not _db:
        return
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(coro)
    except RuntimeError:
        pass


# --- Public API (sync, with background DB writes) ---

def create_conversation(conversation_id: str) -> Dict[str, Any]:
    conversation = _create_file(conversation_id)
    if _db:
        _schedule_db(_db.create(conversation_id))
    return conversation


def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    return _get_file(conversation_id)


def save_conversation(conversation: Dict[str, Any]):
    _save_file(conversation)
    if _db:
        _schedule_db(_db.save(conversation))


def list_conversations() -> List[Dict[str, Any]]:
    return _list_files()


def add_user_message(conversation_id: str, content: str):
    conversation = get_conversation(conversation_id)
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} not found")

    message = {"role": "user", "content": content}
    conversation["messages"].append(message)
    save_conversation(conversation)


def add_assistant_message(
    conversation_id: str,
    stage1: List[Dict[str, Any]],
    stage2: List[Dict[str, Any]],
    stage3: Dict[str, Any]
):
    conversation = get_conversation(conversation_id)
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} not found")

    conversation["messages"].append({
        "role": "assistant",
        "stage1": stage1,
        "stage2": stage2,
        "stage3": stage3
    })
    save_conversation(conversation)


def update_conversation_title(conversation_id: str, title: str):
    conversation = get_conversation(conversation_id)
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} not found")

    conversation["title"] = title
    save_conversation(conversation)


# --- Async API (used where event loop is available) ---

async def list_conversations_async() -> List[Dict[str, Any]]:
    if _db:
        try:
            results = await _db.list_all()
            if results:
                return results
        except Exception as e:
            print(f"[storage] DB list failed, file fallback: {e}")
    return _list_files()


async def get_conversation_async(conversation_id: str) -> Optional[Dict[str, Any]]:
    if _db:
        try:
            result = await _db.get(conversation_id)
            if result:
                return result
        except Exception as e:
            print(f"[storage] DB get failed, file fallback: {e}")
    return _get_file(conversation_id)
