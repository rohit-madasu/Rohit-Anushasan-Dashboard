# Private dashboard acceptance checks

This plan tests the local private artifact only. No deployment, repository write, external upload, or account access is involved.

## Source fidelity and conservative grouping
- Compare original current/history/leads/limitations/tracking arrays and document bindings with baseline hashes.
- Group only exact normalized full file locators, case identifiers, and parties. Preserve letter suffixes, individual parties, separate cases, and different file locator sets.
- Never infer identity equivalence from spelling variants, masked/unknown parties or identifiers, or a missing file locator.
- A calendar appearance on one date must not remove a separate appearance on another date.
- Collapsing duplicate display rows must preserve source IDs/hashes/timestamps, every conflicting date/court/stage/qualification, and each original row in evidence detail/export.
- Never expose or fabricate names masked in source. Missing names should be visibly unavailable, with the recorded case identifier secondary.

## Party-first and court presentation
- Check rendered cards, search results, calendar previews, and accessible preview labels: party text first, case identifier next.
- Court colors must be consistent between cards, previews, and a readable legend. Exact/unknown court labels remain visible; colors must not be the only cue.
- Measure foreground/background text contrast of chips and legend entries (minimum 4.5:1 for normal text), inspect keyboard focus, desktop/mobile layouts, overflow, and zoom.

## Historical calendar and search
- Navigate backwards to the earliest retained history (2023-11-22), and forwards through the latest retained date (2027-04-22), including year boundaries and leap February.
- Clicking a historical day and changing months must show that month's eligible history rather than retain an upcoming-only date restriction.
- One live Case Search input searches all running/closed profiles plus retained evidence, independently of selected date and calendar evidence filter.
- Search party, full/suffixed file, case number, court and CNR; check a closed profile with no current row and a profile with no hearing row.
- Verify full-corpus counts against the supplied full registry; currentRows/historyRows alone are not a full profile index.
- Clear/no-result/repeated typing flows must not lose month selection or leak an obsolete result.

## Cosmetic six-hour gate
- Locked initial page, empty/incorrect input, successful unlock, explicit logout, and keyboard flow.
- Six hours is absolute from successful login: refresh, focus, user activity, or another tab must not silently extend expiry.
- Before the expiry threshold the session restores; at/after the threshold timer, reload, focus and visibility checks all lock it.
- Expired/malformed/future/incomplete stored state must fail closed. Storage unavailable should fail safely with a clear explanation.
- Do not put plaintext password in source, tests, test reports, screenshots, or storage. Verifier may be present because this is an expressly cosmetic static gate.
- Source data remains readable in the downloaded artifact and developer tools; page must clearly describe that limitation without claiming encryption/server security.
- The standalone HTML must load without external scripts, styles, fonts, images or automatic network calls, including when opened using file:// and with networking disabled.
- Inspect resulting standalone bytes for syntactic validity and repeated embedded close-script hazards.

## Regression and delivery evidence
- Run node source-integrity.test.cjs and focused pure-function unit tests.
- Run Chromium/Playwright on the final local standalone HTML, with an isolated synthetic-password verifier fixture for auth paths; do not rewrite the deliverable verifier.
- Record exact artifact hash, checks passed/failed/not run, browser errors, request log, and screenshots at desktop and mobile sizes.
- Re-run affected tests after implementation changes, and verify the final packaged artifact itself before reporting completion.
