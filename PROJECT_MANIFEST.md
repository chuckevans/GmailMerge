# PROJECT_MANIFEST — Authoritative Architecture and File Registry

**Manifest version:** 1.0
**Project:** Email Outreach Manager MVP
**Baseline:** Product spec v3.1
**Status:** Bootstrap scaffold; no Gmail sending or data integration implemented

## Mandatory change protocol

This is the FIRST file every development window/agent must read before editing the repository. `AGENTS.md` reinforces this contract.

1. Read this manifest, then `docs/email_outreach_spec_v3_1.md` and `docs/email_outreach_mvp_plan.md`.
2. Find the target path in the registry; honor its assigned responsibility. Do not create duplicate implementations.
3. Before creating, moving, deleting, renaming, or expanding a file responsibility, update the registry **in the same commit/change**.
4. Update **Implementation status** and the **Change log** with date, stage, paths and why responsibilities changed.
5. New files must be explicitly documented with their purpose, not silently added. For generated files (e.g., package lock), update registry once generated.
6. Preserve the specification’s core invariants: direct Gmail API; local Node worker controls randomized pacing; no valid-hours enforcement in MVP; follow-up eligibility +14/+28/+40 days after initial send with manual batch approval; bounced emails are flagged/paused for review; same-stage duplicate sends blocked.
7. Run `npm run typecheck` and `npm test` where dependencies are installed; disclose any failed or unrun checks. Never claim an unimplemented feature works.

## Source-of-truth precedence

1. Explicit latest user decisions (record them in spec and manifest).
2. `docs/email_outreach_spec_v3_1.md`: product behaviors and contract.
3. This manifest: folder ownership, file inventory, implementation status, modification protocol.
4. `docs/email_outreach_mvp_plan.md`: phase order and estimates.
5. Code/tests: actual implemented behavior; report divergences, do not silently redefine requirements.

## Directory ownership

| Directory | Purpose |
|---|---|
| `/` | Configuration, workspace instructions, source-of-truth documents |
| `.vscode/` | VS Code recommendations and repeatable tasks |
| `docs/` | Versioned copies of approved product spec and MVP plan |
| `src/app/` | Next.js UI routes and layout; never own send scheduling |
| `src/domain/` | Pure pipeline vocabulary and business rules |
| `src/repositories/` | Persistence contracts and future Sheets/Supabase adapters |
| `src/integrations/gmail/` | Direct Gmail API access, OAuth/send/threads/replies |
| `src/worker/` | Host-owned durable scheduling and reply polling; no UI state dependency |
| `src/config/` | Validated config/defaults and planned settings inheritance |

## Complete tracked file registry

| File | Purpose / ownership | Stage | Status |
|---|---|---|---|
| `.env.example` | Non-secret configuration variable names and example values. | 0 | reference/config |
| `.gitignore` | Excludes generated outputs, secrets, tokens and local runtime data. | 0 | reference/config |
| `.vscode/extensions.json` | Recommended VS Code extensions. | 0 | reference/config |
| `.vscode/settings.json` | Shared workspace editor settings. | 0 | reference/config |
| `.vscode/tasks.json` | Editor tasks to run UI, worker and validation. | 0 | reference/config |
| `AGENTS.md` | Mandatory instructions to every implementation window/agent. | 0 | reference/config |
| `README.md` | Quick-start commands and truthful implementation status. | 0 | reference/config |
| `docs/email_outreach_mvp_plan.md` | Six-phase delivery plan, estimates and acceptance criteria. | 0 | reference |
| `docs/email_outreach_spec_v3_1.md` | Authoritative product/functional specification snapshot v3.1. | 0 | reference |
| `email-outreach-manager.code-workspace` | VS Code workspace entry point. | 0 | reference/config |
| `next-env.d.ts` | Next.js ambient type references; do not place business logic. | 0 | reference/config |
| `next.config.ts` | Next.js build/runtime configuration. | 0 | reference/config |
| `package.json` | Node scripts, app/runtime/dev dependencies; update when dependencies or scripts change. | 0 | reference/config |
| `src/app/globals.css` | Starter application styles. | 0 | scaffold |
| `src/app/layout.tsx` | Next.js root HTML shell and shared CSS import. | 0 | scaffold |
| `src/app/page.tsx` | Honest bootstrap home page; eventual navigation to screens. | 0 | scaffold |
| `src/config/settings.ts` | Zod validation for pacing configuration; expand with overrides later. | 0 | scaffold |
| `src/domain/followup.test.ts` | Automated test for +14/+28/+40-day timing. | 0 (preparatory) | scaffold |
| `src/domain/followup.ts` | Pure due-date calculation anchored to initial successful send. | 0 (preparatory) | scaffold |
| `src/domain/types.ts` | Core type vocabulary and domain records; expand only with spec-aligned changes. | 0 | scaffold |
| `src/integrations/gmail/contracts.ts` | Direct Gmail API transport interface; not an implementation. | 0 | scaffold |
| `src/repositories/contracts.ts` | Persistence boundary; later Sheets and Supabase implementations. | 0 | scaffold |
| `src/worker/index.ts` | Independent host worker entry point; currently harmless placeholder. | 0 | scaffold |
| `tsconfig.json` | TypeScript strict compiler settings and import aliases. | 0 | reference/config |

## Planned files / modules (NOT YET CREATED)

| Planned path (illustrative) | Responsibility | Target phase |
|---|---|---|
| `src/integrations/gmail/oauth.ts` | Server-side OAuth consent, secure token storage and sender validation | 1 |
| `src/integrations/gmail/client.ts` | Direct Gmail API transport, IDs and RFC threading | 1, 4–5 |
| `src/repositories/google-sheets.ts` | Sheets-backed implementation of repository interfaces | 1–2 |
| `src/import/csv.ts` | CSV decoding, mapping, source provenance, validation | 2 |
| `src/domain/pipeline.ts` | State transitions, duplicate/response rules | 2–5 |
| `src/worker/queue.ts` | Durable job claims, lock, pacing, reconciliation | 3 |
| `src/worker/replies.ts` | Gmail reply polling, classification, bounce review flags | 4 |
| `src/app/send/…` | Send list, edit/hold/delete, preview, approvals, queue | 3 |
| `src/app/settings/…` | Sender/pacing/sequence configuration UI | 3–5 |
| `src/app/dashboard/…` | Operational statistics, filterable charts | 6 |
| `src/domain/templates.ts` | Follow-up templates, personalized overrides, stage eligibility | 5 |

**Rule:** Names in this planned table are illustrative, not preapproved. Once created, place their actual paths into the tracked registry, update the directory table as needed, and remove or correct corresponding planned entries.

## Implementation status

| Phase | State | Evidence / remaining work |
|---|---|---|
| 0 — Bootstrap | **Scaffolded** | Folder structure, contracts, VS Code workspace, instructions and one pure-date test exist. Integration not built. |
| 1 — Auth/Google foundation | **Not started** | OAuth, API connection and Sheets read/write outstanding. |
| 2 — CSV/data model | **Not started** | Durable schemas, data imports, duplicates outstanding. |
| 3 — Sender/Send UI | **Not started** | Queue, transport, edit/hold/delete and recovery outstanding. |
| 4 — Replies/bounces | **Not started** | Polling, classification, bounce review outstanding. |
| 5 — Follow-up pipeline | **Not started** | Stage template, manual approval and RFC threading outstanding. |
| 6 — Dashboard/acceptance | **Not started** | Metrics, full E2E acceptance testing outstanding. |

## Design invariants / interface boundaries

- **One authoritative sender:** local host directly calls Gmail API; no Apps Script sending bridge.
- **One authoritative worker:** `src/worker/` owns timing; Next.js request handlers may enqueue but must not autonomously send campaigns.
- **Persistent history:** a contact, campaign membership, message and send job are distinct records with immutable IDs.
- **Suppression is not history:** a prior email does not preclude an authorized next-step follow-up; same campaign/step must not send twice.
- **Uncertain outcome means no blind retry.** Gmail + Sheets are not transactional; reconciliation is required.
- **Automatic eligibility, human approval:** due follow-ups never auto-send without approved batch.
- **Schedule:** defaults +14/+28/+40 calendar days from initial successful send, overridable via system/project/campaign settings later.
- **Bounce:** pause future outbound sends to bounced address pending review; no automatic global suppression.

## Change log

| Date | Stage | Changed paths | Why |
|---|---|---|---|
| 2026-10-10 | Bootstrap | Initial tracked registry | Established starter structure, versioned specification and change-management contract. |

## Handoff template for each stage

Record in next development-window response: **files added/changed**, **manifest inventory changes**, **behaviors implemented**, **tests executed/results**, **missing/blocked items**, **next phase**.
