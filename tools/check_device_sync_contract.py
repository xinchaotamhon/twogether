#!/usr/bin/env python3
"""Static safety contract for paired Supabase FSRS/streak sync."""

from pathlib import Path
import re


def main() -> int:
    migration = Path("supabase/migrations/202609010001_device_pairing_sync.sql").read_text(encoding="utf-8")
    adapter = Path("src/supabaseAdapter.ts").read_text(encoding="utf-8")
    app = Path("src/App.tsx").read_text(encoding="utf-8")
    seed = Path("supabase/seed.sql").read_text(encoding="utf-8")
    required_sql = [
        "learner_devices", "device_pairing_invites", "daily_qualifications",
        "record_review_v2", "start_collection_run", "finalize_collection_run",
        "import_local_learning_state", "get_my_streak", "revoke insert, update, delete on table public.streaks",
        "auth.uid()", "digest(normalized_code, 'sha256')",
    ]
    errors = [f"migration lacks {value}" for value in required_sql if value not in migration]
    for value in ["signInAnonymously", "claim_device_pairing", "Dùng dữ liệu trên máy tạm thời"]:
        if value not in app:
            errors.append(f"App lacks {value}")
    for value in ["record_review_v2", "p_run_id", "import_local_learning_state", "cloud-import-backup"]:
        if value not in adapter:
            errors.append(f"adapter lacks {value}")
    if len(re.findall(r"\('core-en-(?:\d{2}|bridge-\d{2})', 'core-en-module", seed)) != 89 or "fixture-recall-01" in seed:
        errors.append("Supabase seed is not the exact 89-card approved core")
    if "service_role" in app.lower() or "service_role" in adapter.lower():
        errors.append("browser source mentions a forbidden service-role credential")
    if errors:
        print(f"[FAIL] device sync contract: {len(errors)} error(s)")
        for error in errors:
            print(f" - {error}")
        return 1
    print("[PASS] paired RLS identity + idempotent FSRS + server-derived streak + local backup")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
