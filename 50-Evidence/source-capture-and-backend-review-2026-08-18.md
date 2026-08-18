# Source capture and backend review — 2026-08-18

## Owner-provided source capture

- The direct Claude share routes remained behind a Cloudflare verification challenge.
- The owner supplied two pasted-text attachments; Codex read them without copying the raw conversation into the repository.
- English attachment: SHA-256 `9361901e173589bf8de726ecf9cf9ccfc58c5e025bb2851c119c53b9950764da`, 7,666 bytes.
- React attachment: SHA-256 `3b10d1df1491e0eabab13b9be6c3ec9fa3f442a57338d32b0425174600618245`, 10,826 bytes.
- Machine-readable manifest: `content/sources/source_manifest.json`.
- Derived summaries: `content/sources/claude-english-owner-capture-2026-08-18.md` and `content/sources/claude-react-owner-capture-2026-08-18.md`.
- Derived draft bundle: `content/drafts/claude-owner-source-drafts-v1.json` (10 cards, all `draft`, not loaded into the P0 runtime).

## Backend decision

ADR-0007 keeps Supabase Auth/Postgres/RLS for v1 and declines MongoDB for now. The reason is fit at the authorization boundary, not a claim that MongoDB cannot store the documents: Supabase supplies Auth + Postgres RLS, while a supported MongoDB design would require an additional API/auth/policy boundary. MongoDB's older Atlas App Services/Data API path is documented as end-of-life.

## Verification after capture

- `npm test -- --run` via the explicit Node/npm CLI path: 3 test files, 7 tests passed.
- `npm run build` via the explicit Node/npm CLI path: Vite production build passed.
- `python tools/run_gates.py --tier smoke`: 7/7 passed, receipts `20260818T121528Z-231ec1f7` and final `20260818T122047Z-e92f203a`.
- `python tools/audit_project_memory.py . --json`: no errors or warnings; 31 Markdown files scanned.
- `npm audit --audit-level=high` could not reach the npm advisory endpoint in this environment; do not treat that failed network check as a new vulnerability result. The prior P0 evidence recorded 0 vulnerabilities.

## Primary references

- Supabase RLS/Auth/security: <https://supabase.com/docs/guides/database/postgres/row-level-security>, <https://supabase.com/docs/guides/auth>, <https://supabase.com/docs/guides/database/secure-data>
- MongoDB Atlas authorization: <https://www.mongodb.com/docs/atlas/architecture/current/auth/>
- MongoDB App Services/Data API end-of-life: <https://www.mongodb.com/docs/atlas/app-services/data-api/generated-endpoints/>
- React state snapshot/purity/identity/Hook rules: <https://react.dev/learn/state-as-a-snapshot>, <https://react.dev/learn/keeping-components-pure>, <https://react.dev/learn/preserving-and-resetting-state>, <https://react.dev/reference/rules/rules-of-hooks>
