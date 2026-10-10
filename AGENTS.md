# Instructions for every development window, agent, and contributor

**MANDATORY BEFORE ANY FILE CHANGE:** Read `PROJECT_MANIFEST.md` first, followed by `docs/email_outreach_spec_v3_1.md` and `docs/email_outreach_mvp_plan.md`. Never assume a previous window's plan is authoritative over these checked-in documents.

1. Verify intended file paths and responsibilities against the manifest registry.
2. Reuse existing paths/modules if appropriate; avoid creating competing senders, repositories, schedulers or state machines.
3. If adding, removing, moving, or expanding the responsibility of a file or directory, update `PROJECT_MANIFEST.md` **in the same change**, including its registry, stage/status, and change log.
4. Do not mark planned functions implemented unless code and applicable tests exist. Don't silently change status enums, data contracts, or policy defaults.
5. Preserve direct Gmail API transport, host-controlled pacing, reviewed follow-up batches, 14/28/40-day offsets from initial send, and bounce-for-review policy.
6. Do not expose credentials in client code, version control, or docs.
7. At handoff, report changed files, registry changes, tests run, and any open gaps.

If an instruction conflicts with product requirements, document the conflict and request a decision rather than silently rewriting source of truth.
