# Email Outreach Manager — MVP scaffold

This is a **bootstrap**, not a functioning email-sending product. See `PROJECT_MANIFEST.md` before editing or adding files. Requirements: `docs/email_outreach_spec_v3_1.md`; phase plan: `docs/email_outreach_mvp_plan.md`.

## Open in VS Code

Open `email-outreach-manager.code-workspace`, or open this folder.

## Setup

1. Install Node.js 22+ and npm.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` (do not add OAuth secrets until setting up the Gmail integration).
4. Run `npm run dev` and open <http://localhost:3000>.
5. Run `npm run typecheck`, `npm test`, and optionally `npm run worker` (worker only prints a scaffold notice).

## Status

- Basic placeholder page, domain types, data/transport interfaces, and follow-up due-date calculation exist.
- **Not implemented:** OAuth connection, CSV imports, Google Sheets, Gmail sending, persistent queue, reply detection, full UI, dashboard.
- The `docs/` files are reference snapshots. Track changes in `PROJECT_MANIFEST.md` and update the spec when scope or product behavior changes.

## Safe development workflow

1. Read `AGENTS.md`, `PROJECT_MANIFEST.md`, specification and current stage plan.
2. Check the registry before selecting a path or changing a responsibility.
3. Implement one stage with tests; update the registry and status within the **same change**.
4. Run typecheck/tests and note limitations in the change log.
