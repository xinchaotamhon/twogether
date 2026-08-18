# Browser gate evidence — 2026-08-18

## Scope

Production preview of the built P0 artifact, exercised with Playwright 1.62.1 using the installed Google Chrome executable. The gate covers the critical learner path and PWA shell without connecting Supabase or writing remote data.

## Command and result

```text
node tools/run_browser_gate.mjs
Running 4 tests using 4 workers
4 passed (23.3s)

python tools/run_gates.py --tier smoke
[PASS] ... browser.p0-contract
Gate run 20260818T153904Z-68053065: pass

After evidence/state/handoff updates, the final audit + cumulative smoke receipt was `20260818T154057Z-526977ec: pass`; the memory audit scanned 35 Markdown files.
```

## Covered behavior

- Answer is absent until the learner activates `Đã thử`; the reveal and `Nhớ`/`Quên` controls then appear.
- The attempt control is focusable and activatable with the keyboard.
- A review by Hiệp does not reduce Hoàng's fresh local due queue.
- The visual map has a visible keyboard/table alternative.
- The production manifest is standalone with icons; the service worker registers and does not cache `private_notes` or `review_events`.

## Initial failure and disposition

The first test run had two selector/configuration failures: the accessible name began with an icon before `Nhớ`, and Vitest collected the Playwright file. The selector now matches the accessible name, `vitest.config.ts` excludes `e2e/**`, and the browser runner owns preview startup/cleanup so the command exits deterministically. The gate remains enabled.

## Remaining boundary

This proves the local P0 browser contract only. Supabase RLS, remote idempotency, HTTPS deployment, and real installability on the target device still require their own gates.
