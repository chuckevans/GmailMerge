# Email Outreach Manager — Implementation Specification
**Version:** 3.1 (decisions finalized)  
**Status:** Approved implementation baseline  
**Date:** 2026-10-10  
**Supersedes:** `app_instructions_v2.md` and v3.0 for implementation planning

## 1. Objective and operating principles

Build a local, single-operator outreach application for personalized attorney email campaigns sent from `chuck@radiantperspectives.com`. Initial contact data is imported via CSV (and may be stored/synchronized through Google Sheets); subsequent follow-ups and responses are managed within the application. Preserve all relevant source attributes and outreach history to enable later analytics and a migration to Supabase.

**Non-negotiable principles**
1. The **host application controls sending intervals**. It must remain running for scheduled sends. Initial release does **not** enforce permitted sending hours/days.
2. A **contact is not a message**. A contact may have multiple campaign memberships and multiple authorized messages.
3. A prior send **does not globally forbid a follow-up**. Global suppression and duplicate stage sends are distinct.
4. Follow-up **eligibility is automatic**, but **sending requires explicit operator approval of a batch or individual draft** (hybrid model).
5. Every send has a durable identity, event history, and a reconciliation path for uncertain outcomes.
6. A response halts automated follow-up eligibility/queueing pending review; explicit opt-outs suppress all campaigns.
7. Local UI, transport, pipeline logic, and persistence must be separate modules.

### 1.1 Confirmed decisions versus defaults

**Confirmed from original spec / discussion**
- CSV includes `email`, `subject`, `email_body`; show an import mapping confirmation, preserve other useful columns.
- Google Sheets / Apps Script are supported for the initial stage; evaluate Supabase long-term.
- Sender: `chuck@radiantperspectives.com`.
- Configurable `SEND_MIN`, `SEND_MAX`; timing is owned by the host program, not by script sleep or an Apps Script outbound trigger.
- Initial sending-window enforcement is deferred.
- Send, Dashboard, Settings screens; row edit/hold/delete, multi-select, duplicate highlighting; future multi-project support.
- Response tracking and timestamps, analytics with `tech_field`, and an Already Sent history.
- Initial outreach followed by potential first, second, third (and configurable further) follow-ups; distinct responder handling.
- Follow-ups can have updated email text; retain original initial-email text and history.
- Hybrid follow-up workflow: auto-compute eligibility, manually approve batch before sending.
- Prefer follow-ups in the original Gmail thread.

**Explicit design defaults (changeable in Settings; not separately ratified)**
- Three follow-up steps, due **14, 28, and 40 calendar days after the initial outreach send** (not cumulative delays from each preceding step). These are defaults, with future per-project and per-campaign overrides using the settings inheritance model; no send without approval.
- Reply scan every 5–10 minutes while host is running, plus on application startup and immediately before a follow-up send.
- Global suppression upon explicit opt-out or manual suppression. **Bounces are flagged for operator review and pause further sends to that address; do not automatically globally suppress on bounce.**
- `SEND_MIN=120` seconds; `SEND_MAX=300` seconds, illustrative defaults rather than final user preference.
- Single operator and one sending account for v1; multi-user roles deferred.
- First-release source of truth: Google Sheets with a host-side repository adapter; Supabase comes later.
- A new outreach campaign to previously contacted contacts requires a visible prior-history warning and explicit approval.

## 2. Definitions and boundaries

- **Project:** logical grouping, e.g. IP-litigation outreach.
- **Campaign:** an initial outreach initiative (topic/cohort) with one or more enrolled contacts and a follow-up sequence.
- **Contact:** canonical person/contact record; represents an attorney independently of campaigns.
- **Campaign membership:** one contact's enrollment in one campaign, with pipeline stage, disposition and next action.
- **Sequence step:** initial outreach (`0`), follow-up 1 (`1`), follow-up 2 (`2`), etc.
- **Message:** one immutable-on-send email instance, with rendered subject/body and Gmail identifiers.
- **Send job:** one approved outbound operation for one message.
- **Suppression:** prohibition on further outbound sending, potentially global or campaign-scoped.
- **Send history / Already Sent:** historical facts about sends; distinct from suppression.
- **Response:** an inbound message/event linked to an outbound thread; human replies, automatic replies, bounces and opt-outs must be distinguishable.

**Out of scope for first implementation:** automatic AI drafting, multi-user access, production cloud deployment, Google Pub/Sub notification service, automatic follow-up dispatch without approval, and time-of-day sending restrictions.

## 3. Architecture

### 3.1 Initial deployment

Local **Next.js + TypeScript** UI and server API, with a **dedicated Node.js worker** in the same supervised host process. The worker owns random pacing, outbound queue, and (initially polled) reply reconciliation. The host talks to a **persistence adapter** backed by Google Sheets and to a **direct Gmail API transport adapter** using host-side OAuth. Apps Script is not part of the sending path; **no long-duration `sleep()` loops** and no Apps Script time trigger as the primary outbound scheduler.

```
Local Next.js UI (Send | Dashboard | Settings)
           │
    Local API / services
           │
   ┌───────┴─────────────────────┐
   │                             │
Pipeline + repository       Node worker
   │                         │    │
Sheets adapter              queue  reply poller
   │                         │    │
Google Sheets                Gmail adapter
                              │
                             Gmail
```

**Implementation constraint:** Running `next dev` is not itself a durable task-runner. Start and stop the worker explicitly with the host service; on restart reload persisted send jobs and recover uncertain sends. The UI can be closed while the host process still runs, but closing/stopping the host ends outbound scheduling.

### 3.2 Future deployment

Swap the Sheets repository adapter for **Supabase PostgreSQL**; use transaction-backed job claiming, unique constraints, relational analytics and row-level security. A deployed worker can eventually replace the local one. Keep identity and state contracts stable.

### 3.3 Technology

- Host and UI: TypeScript, Next.js/React, Tailwind, TanStack Table, Recharts.
- Input validation: Zod; CSV parsing: robust RFC-4180 parser (e.g., Papa Parse).
- First persistence: Google Sheets (structured tabs) through a repository/service layer.
- Sending and threading: **direct Gmail API** from the host, using Gmail OAuth and RFC-compliant threaded messages. Validate the active account/send-as identity. Do not implement an Apps Script transport bridge.
- Later persistence: Supabase/Postgres with migrations.
- Testing: Vitest, mock Gmail/Sheets adapters, integration fixtures; Playwright for UI smoke tests.
- Secrets: server-side environment/secret store only; never distribute OAuth tokens to the browser or put secrets into Sheets.

## 4. Data contracts

### 4.1 Stable identifiers and normalization

Assign immutable `contact_id`, `project_id`, `campaign_id`, `campaign_membership_id`, `import_id`, `source_row_number`, `message_id` (application-generated), `send_job_id` and `send_attempt_id`. Use UUID/ULID values. Spreadsheet row numbers are never keys.

Store the original email and `normalized_email` (trim surrounding whitespace and lowercase for matching). Do **not** assume Gmail dot/plus aliases or two different addresses are the same person. Preserve imported evidence/metadata without asserting it is verified.

### 4.2 Tables / initial Sheets tabs

| Entity/tab | Required fields |
|---|---|
| `Projects` | `project_id`, `name`, `settings_json`, `created_at` |
| `Campaigns` | `campaign_id`, `project_id`, `name`, `campaign_status`, `sequence_id`, `created_at` |
| `Imports` | `import_id`, `project_id`, `campaign_id`, `filename`, `mapping_json`, `imported_at` |
| `Contacts` | `contact_id`, `email`, `normalized_email`, `first_name`, `last_name`, `firm`, `title`, `tech_field`, `source_attributes_json` |
| `CampaignContacts` | `campaign_membership_id`, `campaign_id`, `contact_id`, `pipeline_stage`, `pipeline_status`, `response_status`, `next_action_at`, `last_contacted_at`, `approved_step` |
| `Messages` | `message_id`, `campaign_membership_id`, `sequence_step`, `subject`, `email_body`, `message_status`, `gmail_message_id`, `gmail_thread_id`, `rfc_message_id`, `sent_at`, `first_reply_at`, `last_reply_at`, `reply_count`, `variant`, `created_at` |
| `SendJobs` | `send_job_id`, `message_id`, `send_attempt_id`, `job_status`, `approved_at`, `claimed_at`, `next_send_at`, `attempt_count`, `last_error`, `updated_at` |
| `Events` | `event_id`, `entity_type`, `entity_id`, `event_type`, `at`, `details_json` |
| `Already Sent` | `message_id`, `contact_id`, `normalized_email`, `project_id`, `campaign_id`, `sequence_step`, `sent_at` |
| `Suppressions` | `suppression_id`, `normalized_email`, `scope`, `scope_id`, `reason`, `created_at`, `released_at` |
| `Sequences` | `sequence_id`, `step`, `offset_days_from_initial`, `template_subject`, `template_body`, `enabled`; default offsets `14`, `28`, `40`; project/campaign overrides |
| `Settings` | `key`, `scope`, `scope_id`, `value_json` |

`Contacts` may have several addresses in later versions; initial version uses one primary email. Save imported original content as a step-0 message draft. On send, preserve the exact rendered subject/body snapshot. Changes after sending create a new message or draft revision, not a retroactive edit.

**Migration note:** In PostgreSQL add unique constraints on `(campaign_membership_id, sequence_step)` for normal messages and on distinct send idempotency keys; support explicit override via a separate send instance/revision rather than silently overwriting.

### 4.3 CSV mapping

Required columns: `email`, `subject`, `email_body`. Ask user to confirm mapping, even for auto-detected names. Optional: `tech_field`, `firm`, `first_name`, `last_name`, `title`, `external_candidate_id`, `variant`, other attributes. Keep all additional imported fields in `source_attributes_json` and source provenance. Support multiline bodies, UTF-8, quoting, blank rows, trim/validate addresses, empty subject/body warnings, duplicated rows, a sample preview and per-row validation errors. Import is atomic at the batch level as feasible; show a success/failure reconciliation report.

## 5. Sending and state machine

### 5.1 Status axes (do not conflate)

- `pipeline_stage`: `INITIAL` → `FOLLOWUP_1` → `FOLLOWUP_2` → `FOLLOWUP_3` (more configurable).
- `pipeline_status`: `ACTIVE`, `WAITING`, `RESPONDED`, `ENGAGED`, `COMPLETED`, `PAUSED`, `CLOSED`, `SUPPRESSED`.
- `message_status`: `DRAFT`, `READY`, `HOLD`, `DUPLICATE`, `QUEUED`, `SENDING`, `SENT`, `FAILED`, `REVIEW_REQUIRED`, `DELETED`, `SUPPRESSED`.
- `response_status`: `NONE`, `REPLIED`, `AUTO_REPLY`, `BOUNCED`, `OPTED_OUT`.
- `job_status`: `PENDING`, `CLAIMED`, `SUCCEEDED`, `FAILED`, `UNCERTAIN`, `CANCELED`.

For v1, `REVIEW` or `ELIGIBLE` describes a **pending action**, not a mutually exclusive `pipeline_status`. A membership can be `WAITING` with the next step eligible for review.

### 5.2 Core transitions

1. CSV import creates initial message `DRAFT`; validation and operator inclusion → `READY`.
2. Operator selects records and approves queue → message `QUEUED` and job `PENDING`.
3. Worker claims exactly one job (`CLAIMED`; message `SENDING`); lock serializes sends per sender.
4. Gmail confirms successful API result → save send identifiers and `sent_at`, append `Already Sent`, job `SUCCEEDED`, message `SENT`, membership `WAITING`.
5. Transport definite failure → `FAILED` with diagnostic, recoverable retry only according to retry policy.
6. Outcome ambiguous after transport request → `UNCERTAIN` / `REVIEW_REQUIRED` and **do not automatically resend**; reconcile against Gmail Sent/threads.
7. `HOLD` prevents sending; `DELETED` is soft delete (retain in data, hide from active list); `DUPLICATE` highlights row and prevents normal queueing.
8. Eligible follow-up produces a draft/review candidate, not an approved send job.
9. Human reply → `response_status=REPLIED`, membership `RESPONDED`, cancel future unsent follow-up jobs; operator may classify `ENGAGED` or `CLOSED`.
10. Explicit opt-out → suppress globally by address; cancel pending jobs across campaigns. A bounce → `response_status=BOUNCED`, create a review flag and pause all queued/future sends to that address until operator disposition; **no automatic global suppression**.
11. Completing final configured follow-up without a qualifying reply and after its waiting window → `COMPLETED`.

**Priority of checks immediately before transport:** global/campaign suppression → already sent same stage → valid account/alias → no human response → message ready and approved → quota → claim and send. Re-run checks even for jobs approved earlier.

### 5.3 Host-controlled pacing

`SEND_MIN` and `SEND_MAX` are host settings expressed in **seconds**; require `0 ≤ SEND_MIN ≤ SEND_MAX`. After a successful (or attempted) outbound message, compute a random delay in the inclusive range and persist the next sender-specific `next_send_at`; process at most one send job at a time. Start/Pause/Resume/Stop affect scheduling, not already-submitted Gmail requests. Preserve send order deterministically among equally eligible jobs (approved timestamp, then ID).

**No valid-day/hours gating in v1.** Fields such as timezone, permitted hours and days may be stored but must appear clearly as future/not-active settings; don't show controls that imply enforced behavior.

**Quota:** display Gmail/Apps Script quota information when available, enforce an operator-configured daily cap, and stop on quota errors; exact remaining provider quota must be labeled **unavailable** when it cannot be verified. Gmail sending limits vary by account/API; never promise deliverability or that random pacing avoids detection.

### 5.4 Authentication/sender and fidelity

Before sending, verify the authorized account can send as `chuck@radiantperspectives.com` (primary identity or configured Gmail send-as alias). Do not silently fall back to a different sender. Preserve UTF-8, line breaks, and message formatting. For a threaded follow-up, set Gmail `threadId` and appropriate RFC `In-Reply-To`/`References` headers with a compatible subject. If threading cannot be established, return for operator review rather than silently create a new conversation. Save outbound Gmail IDs and available RFC Message-ID.

### 5.5 Recovery, audit, and idempotency

Persist the claim/attempt **before** invoking Gmail; after success save returned identifiers, mark sent, then append the ledger as part of recoverable reconciliation. The Google Sheets version does not provide an atomic Gmail+Sheets transaction: never call it exactly-once delivery. Use sender lock, a stage-specific idempotency key, a durable event log, and an **uncertain** state. Recovery checks sent mail (message metadata, recipient/subject/time and available IDs) and requires operator intervention when still ambiguous. Do not retry a possibly successful send automatically. Record all manual overrides with actor, reason and timestamp.

## 6. Pipeline and follow-ups

### 6.1 Contact-centric lifecycle

- At import, enroll contact in campaign and create custom initial message from CSV.
- Initial send transitions membership to waiting.
- When a configured **calendar-day offset from `initial_sent_at`** has elapsed **without qualifying response, unresolved bounce, or suppression**, set the next step `ELIGIBLE_FOR_REVIEW`. Default offsets: +14, +28, +40 days. If a prior step has not yet been sent/decided, do not queue later steps out of order; overdue stages remain reviewable, never auto-send.
- Generate draft for that step from a sequence template, with per-contact editable override; **do not replace the initial message body**.
- Operator filters eligible contacts, reviews and approves selected draft(s) as a batch.
- Worker sends authorized queued follow-ups using random pacing, normally in original Gmail thread.
- On reply, pending future follow-ups are canceled. Human classification may convert contact to `ENGAGED`, `CLOSED` or leave `RESPONDED`.
- Follow-up count and delays are configurable; initial default is three follow-ups.

### 6.2 Template variables and personalization

Support stage templates with safe placeholders (e.g., `{{first_name}}`, `{{firm}}`, `{{tech_field}}`), preview resolved output, show unresolved fields, and forbid sending unresolved placeholders. Include per-contact edit that overrides the stage template. Save both template/version reference and final rendered snapshot. No automatic AI-generated content in MVP; future AI drafts require human review.

### 6.3 Follow-up threading

Default follow-ups in the **same Gmail conversation** as original outreach. Only create a new thread for an explicitly new campaign/authorized new conversation. Keep one campaign's outbound `gmail_thread_id`/RFC headers and track inbound messages in the thread. Check replies again just before dispatch because a reply may arrive after batch approval.

### 6.4 Duplicate / suppression logic

- Duplicate in same import: mark for review.
- Same contact already enrolled in same campaign: do not create duplicate membership.
- Step already `SENT` for membership: block repeat normal send.
- Contact sent initial outreach in prior campaign: show prior contact and warn; new initial send requires explicit operator approval.
- Authorized next step in same campaign: allowed, regardless of `Already Sent`.
- `RESPONDED` / `ENGAGED`: block scheduled follow-ups unless manually approved as a *new conversation*.
- `OPTED_OUT` / global suppression: disallow all outbound mail.
- `BOUNCED`: flag for review and pause further outbound messages to the address. Operator may correct address, suppress, or clear a false positive with an audit reason. Never automatically treat it as an opt-out or global suppression.
- Automatic/OOO response: classify separately, not substantive engagement.

Keep a separate immutable-ish **Already Sent** history and **Suppression** register. A status of `DUPLICATE` reflects an attempted disallowed operation, not proof the person should never be contacted again.

## 7. User interface

### 7.1 Send screen

Three primary top-level screens: **Send**, **Dashboard**, **Settings**. Send contains project/campaign selector, CSV import, campaign status, start/pause/resume/stop, Test Send (to own mailbox), queue selection controls, ready/queued/sent/held/duplicates/failed/responded counts, last/next send timestamps and sender quota indicator.

A large sortable/filterable row table prominently displays `email`, `subject`, `email_body` plus stage/status/tech field; far-right selection checkbox and **Edit / Hold / Delete** row actions. Edit opens separate editable email/subject/body fields with Save/Cancel, saving to underlying data only for unsent draft revisions. Hold marks `HOLD`, skips dispatch and shades pale yellow. Delete has OK/Cancel confirmation, sets `DELETED`, hides row in active list but preserves history. Duplicates are red and automatically blocked as appropriate; provide a reason and relevant historical send details. Support bulk approve/hold/delete with confirmation as appropriate. Display failures and uncertain sends in a review filter.

Include an **Eligible follow-ups** view inside Send (not an extra top-level screen) with sequence step, due date, prior send/reply context, editable generated draft, and manual batch approval. Display a per-contact activity/history drawer.

### 7.2 Dashboard

Filter all charts/tables by project, campaign, `tech_field`, variant and available dates.

Required:
- Sent emails by day/week/month/year.
- Sent today and remaining *known* allowed volume (or `unknown`).
- Human replies by send-date cohort and reply rate; show counts beside sent counts.
- Send-hour reply *rate* (denominator included), with optional weekday × hour heatmap.
- Domain / firm distribution for day, previous week, month, year; top-10 horizontal bars + Other rather than an unreadable pie.
- Reply-time distribution and 1/3/7/14-day cohort response rates.
- Step-specific reply and positive-response rates, bounce/opt-out rates, completion, failures, duplicate/suppression counts.
- Optional firm size, title, matter/technology tags for future correlations.

Keep automated/OOO replies distinct from substantive replies. Define a "reply" for dashboard rates as a qualifying non-automated inbound response from the recipient; allow review of ambiguous classifications. Clarify denominator and observation window for each metric.

### 7.3 Settings

Project and campaign settings, sender validation, pacing intervals, configurable daily cap, sequence steps/offsets/templates (system defaults → project overrides → campaign overrides), duplicate policy, retry/reconciliation controls, polling interval, timezone, and **stored but not enforced** sending windows for later. Display runtime health/host connected indicator; import/export and data migration controls can be added later. Settings precedence: system defaults < project defaults < campaign override, with clear effective values.

## 8. Testable acceptance criteria

- Import a CSV with reordered required columns, extra columns, quoted commas and multiline bodies; mapping preview confirms fields, bad rows are reported, and all original attributes/provenance are retained.
- Send one approved initial email from the validated sender, save accurate `sent_at` and Gmail IDs; rerun worker and confirm no duplicate stage send.
- Stop/restart host and confirm queued jobs survive; no sends occur while host worker is stopped.
- Random intervals fall within configured bounds, and one message at a time is processed; no configured-day/hour enforcement occurs in first release.
- Hold blocks queue/sending and displays yellow; Delete soft-deletes and hides; duplicate blocked and displayed red; historical data remains.
- Import an already-contacted attorney: historical notice appears; same-stage resend blocked; eligible authorized follow-up remains possible.
- Follow-up eligibility creates draft but no send; batch approval is mandatory and editable per recipient; approved follow-up threads with the initial message.
- Simulate a reply after approval but before dispatch: scheduled follow-up cancels; reply timestamp/state recorded.
- Classify OOO separately from real reply; bounce raises a review flag and pauses sends (without automatic suppression), while opt-out suppresses globally.
- Simulate Gmail success followed by Sheets write failure: no automatic resend; job flags uncertain and reconciles.
- Force overlapping scheduler invocation: only one worker claims a send job.
- Dashboard distinguishes reply counts/rates, send-date cohorts, category filters, and unknown provider quota.
- Multiple projects/campaigns preserve separate membership sequences while honoring global suppression.
- No browser-exposed OAuth/secret material; transport rejects wrong sending account.

## 9. Delivery phases and effort

Estimates are hands-on developer hours for one experienced developer, including baseline testing; not elapsed-time guarantees.

| Stage | Deliverable | Primary technology | Hours |
|---|---|---|---:|
| 0 | Final schema, state transitions and adapter interfaces | Markdown, TypeScript types | 3–5 |
| 1 | Local worker, Sheets repository, Gmail sender, pacing, sender validation, ledger | Node.js, direct Gmail API, Sheets | 7–12 |
| 2 | Gmail IDs, response scan/classifier, cancellation and recovery | Gmail API, Node.js | 5–8 |
| 3 | Local Send UI, robust CSV mapping, editing, campaigns, controls | Next.js, TypeScript, TanStack Table | 12–18 |
| 4 | Follow-up templates, due tracking, review/approval and thread replies | Node.js, Gmail API, React | 10–16 |
| 5 | Dashboard and per-stage metrics | Recharts, TypeScript | 6–10 |
| 6 | Multiple projects; Supabase adapter/schema/migration/RLS | PostgreSQL, Supabase | 12–20 |
| 7 | Test/recovery hardening and deployment instructions | Vitest, Playwright | 8–12 |
| **Total** | | | **63–101** |

**Milestone 1:** working host-paced initial outreach sender (stages 0–1).  
**Milestone 2:** reliable sender/reply detection, local UI, reviewed follow-ups (stages 2–4).  
**Milestone 3:** dashboard and scalable database architecture (stages 5–7).

## 10. Open decisions (not implementation blockers)

1. Default stage offsets are fixed at +14/+28/+40 days after initial outreach. Project and campaign overrides are specified but can be exposed in a later UI iteration.
2. Whether "engaged" is manually classified only (recommended for v1).
3. Exact treatment of contacts with multiple email addresses or shared generic law-firm inboxes (out of scope initially).

These defaults may be changed without restructuring the architecture.

## 11. Implementation guardrails

The application must never silently skip an approved operation without recording why; must never silently upgrade a duplicate into a send; must never treat an Apps Script execution timestamp as a Gmail receipt; must never overwrite history; and must never treat manual approval of a follow-up batch as permission to ignore new replies or suppression events. Every queue decision must be traceable to a contact, campaign, message, action, and timestamp.

## 12. v3.1 Decision Record (2026-10-10)

- **DEC-001 — Transport:** Direct Gmail API from the local host. No Apps Script send bridge.
- **DEC-002 — Follow-up timing:** Three default eligible dates at 14, 28, and 40 calendar days following the **initial successful outbound email**. Configurable at the project/campaign scope via inheritance; stage eligibility does not authorize sending. Dates do not restart after late follow-ups.
- **DEC-003 — Bounce policy:** Flag bounced addresses for review, pause queued and future sends to the address, and require operator disposition. Do not automatically place bounced addresses on the global suppression list.
