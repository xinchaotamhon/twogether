# ADR-0003 — Installable PWA now; push reminders later and opt-in

- Status: accepted for P0
- Date: 2026-08-18
- Decision owner: Hiệp (project owner)

## Context

A phone-friendly installable web app is valuable, but push requires HTTPS, permission, service worker handling, subscription storage, server delivery, unsubscribe, and platform-specific behavior. Notification pressure can also make a missed day feel like failure.

## Decision

Ship the PWA manifest, responsive shell, offline shell/cache, and visible due queue in P0. Defer push to Phase 2, disabled by default, with a single daily summary, quiet hours, and a deliberate opt-in gesture.

## Alternatives rejected

- Build push first: expands backend/privacy surface before the study loop has evidence.
- No PWA: loses installability and phone ergonomics for little benefit.
- Aggressive reminders: optimizes re-entry rather than durable learning and risks shame.

## Gate and rollback

PWA gate covers manifest, service worker registration, cache fallback, and no private payload leakage. Phase 2 requires permission, subscription, delivery, revoke, quiet-hours, and rate-limit tests. Disable the feature flag without deleting study history.
