# Email Outreach Manager — MVP Implementation Plan

Based on **Email Outreach Specification v3.1**, the MVP should be built in six development phases, with a working Gmail sender available early and the full outreach pipeline afterward.

**Target workflow:** Import attorneys → Review emails → Send initial outreach → Detect replies → Prepare follow-ups → Approve and send follow-ups → Track results.

## MVP architecture

```text
Local Next.js Application
(Send | Dashboard | Settings)
            |
    Node.js Backend + Worker
    (Queue, random pacing,
     pipeline, reply detection)
       /                \
Google Sheets         Gmail API
(records, status,      (send, threads,
 history)              replies)
```

Supabase should wait until after the MVP. All database access should go through a repository interface to simplify migration.

## Phase 1 — Project foundation and Google authentication

**Estimate:** 4–7 hours

Initialize the local application, connect the Gmail API, validate the sending identity, and establish TypeScript data interfaces.

- Create Next.js / TypeScript project and Node worker.
- Configure Google OAuth authentication and secure token storage.
- Confirm `chuck@radiantperspectives.com` can send.
- Connect to Google Sheets API.
- Define project, campaign, contact, and message identifiers and repository interfaces.

**Acceptance:** A locally running application can authenticate to Gmail and read/write a test spreadsheet.

## Phase 2 — Data model and CSV import

**Estimate:** 6–10 hours

Build the import pipeline and retain source data and outreach history.

- Create structured Google Sheets tabs and schemas.
- Implement CSV import with required-field mapping.
- Preserve optional data and source attributes.
- Validate email addresses and required fields.
- Identify duplicates and prior outreach history.
- Create draft initial messages.

**Acceptance:** Import a real outreach CSV, review mapped records, and inspect them in persistent storage.

## Phase 3 — Send screen and reliable sending

**Estimate:** 12–18 hours

Build the primary working application and reach the first operational milestone.

- Build editable email table with selection, Hold, and Delete.
- Add Start / Pause / Resume / Stop controls.
- Add test sends to the operator.
- Implement host-controlled `SEND_MIN` / `SEND_MAX` random pacing.
- Implement durable queue, locks, and timestamps.
- Save Gmail message and thread IDs.
- Add **Already Sent** ledger and uncertain-send reconciliation.

**Acceptance:** Send a reviewed batch of real emails at configured intervals without repeating messages on restart.

## Phase 4 — Reply and bounce detection

**Estimate:** 5–9 hours

Make the application aware of recipient responses.

- Poll Gmail for new replies.
- Match replies to original threads.
- Record response timestamps.
- Distinguish human replies from automatic responses.
- Flag bounced emails for review and pause further sends.
- Cancel queued follow-ups for responders.

**Acceptance:** Replying to a test email updates the correct record and prevents inappropriate follow-ups.

## Phase 5 — Follow-up pipeline

**Estimate:** 10–16 hours

Implement the agreed 14/28/40-day follow-up lifecycle and manually approved follow-ups.

- Calculate due dates **14, 28, and 40 calendar days after the initial successful send**.
- Support system defaults with future project and campaign overrides.
- Generate follow-up drafts from templates.
- Allow editing individual follow-up messages.
- Display eligible follow-ups in a review queue.
- Require manual batch approval before sending.
- Send approved follow-ups in the original Gmail thread.

**Acceptance:** A due follow-up can be reviewed, approved, sent in the original thread, and tracked as a separate message.

## Phase 6 — Dashboard and MVP acceptance testing

**Estimate:** 10–16 hours

Add practical reporting and validate the complete operational workflow.

- Report sent volume and replies over time.
- Show counts and response rates by `tech_field`.
- Show daily send counts and available quota information.
- Add basic domain/firm and time-of-day reports.
- Support project and campaign filtering.
- Test restarts, duplicates, bounces, replies, and failure recovery.

**Acceptance:** The entire import-to-follow-up workflow passes repeatable tests, and dashboard values reflect actual send/reply history.

## Effort summary

| Milestone | Included phases | Estimated hands-on development |
|---|---|---:|
| Operational initial sender | 1–3 | **22–35 hours** |
| Complete MVP | 1–6 | **47–76 hours** |

Estimates assume one experienced developer and include baseline integration testing. Google OAuth, Sheets concurrency, and Gmail threading are the main sources of variability.

## Features deferred until after the MVP

- Supabase migration.
- AI-generated personalized follow-ups.
- Multiple users.
- Cloud hosting.
- Gmail push notifications.
- Advanced analytics.
- Enforcement of permitted sending hours and days.

**Do not defer:** Durable records, duplicate protection, reply cancellation, or uncertain-send recovery.

## Recommended first development task — End-to-end vertical slice

Build one complete path before expanding the UI and data model:

1. Authenticate directly with Gmail and Google Sheets.
2. Import five test contacts from CSV.
3. Preview and approve one message.
4. Send that message through the direct Gmail API.
5. Persist its sending status, timestamp, and Gmail identifiers.
6. Restart the application and verify that the message cannot be accidentally resent.

Once this works, expand functionality phase by phase.

## MVP completion definition

**Phase 3** delivers the first usable sender. **Phase 5** delivers the core contact-management and follow-up functionality. **Phase 6** completes the MVP with reporting and end-to-end validation.

Build and verify the full lifecycle for one contact before scaling to hundreds of attorneys.
