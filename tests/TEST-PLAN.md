# Private dashboard acceptance checks

This plan tests the local private artifact only. No deployment, repository write, external upload, or account access is involved.

## Source fidelity and conservative grouping
- Compare original current/history/leads/limitations/tracking arrays and document bindings with baseline hashes.
- Use same valid CNR and exact file sets as primary identity; retain distinct case numbers/types, applications, conflicting profile mappings and different CNRs. Without CNR use canonical typed case or exact literal case with complete party binding. Preserve letter suffixes and all original evidence.
- Spelling differences alone never establish identity. A valid CNR with safe exact file mapping may consolidate party-label variants; missing or conflicting locators remain separate. Unknown CNR/case rows must not bridge ambiguous established identities.
- A calendar appearance on one date must not remove a separate appearance on another date.
- Collapsing duplicate display rows must preserve source IDs/hashes/timestamps, every conflicting date/court/stage/qualification, and each original row in evidence detail/export.
- Never expose or fabricate names masked in source. Missing names should be visibly unavailable, with the recorded case identifier secondary.

## Party-first and court presentation
- Check rendered cards, search results, calendar previews, and accessible preview labels: party text first, case identifier next.
- Court colors must be consistent between cards, previews, and a readable legend. Exact/unknown court labels remain in evidence. Current summaries use the preferred matched court; evidenced aliases share a color. Colors must not be the only cue.
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
- Use the supported cloud browser on the final local standalone HTML, with an isolated synthetic-password verifier fixture for auth paths; do not rewrite the deliverable verifier.
- Record exact artifact hash, checks passed/failed/not run, browser errors, request log, and screenshots at desktop and mobile sizes.
- Re-run affected tests after implementation changes, and verify the final packaged artifact itself before reporting completion.

## Historical 17 October acceptance baseline

The prior edition verified the exact prefixes of all 56,894 retained source units, every original profile/source/history prefix, all 480 original calendar history rows and each former current object in current display or its exact archival snapshot. The only retained-row changes allowed are the two run-local fresh-check flags, with an exact original snapshot. The old tracking summary reconstructs the original overlay; only its current-date counts age from 22 to 16. The complete new DOCX occurrence map must contain every paragraph exactly once, without re-appending the 42,508 retained stage units.

The prior CNR acceptance baseline covered the 18 observations, distinguishing 15 fresh Oct 17 records from three Oct 16 candidates; all exact fractional clocks versus normalized compatibility display/ranking clocks; newest official summary ranking; five changed next dates and historic prior dates; POCSO candidate separation; File 255's distinct proceedings; File 130's conflicting office year; Files 123 and 257's retained identity limitations; and File 191's blank FIR/Year 0 qualification. Existing grouping, filters, names, colours, profile identities/categories and six-hour auth invariants remain in force.

Browser verification must use final bound assets, a loopback HTTP server, and an isolated synthetic verifier if needed. No production auth bytes may change. Record the exact observed scope in QA.md. Older browser reports are baseline history, not evidence that the daily edition was tested. No direct file-protocol or actual user-credential test is claimed unless explicitly performed and documented.


## Historical 18 October morning acceptance baseline

The following gates describe the superseded morning edition, retained for provenance rather than current release criteria. Its gates ran explicitly for reference date 18 October. Preserve all 57,656 prior corpus units, 498 prior history rows, 196 prior current projections or exact snapshots, 455 profile identities and full source/search prefixes, 5,260 supplemental rows, 129 party bindings, five case bindings, 97 directive objects, seven locked UI/authentication files and every retained court colour.

Reconstruct all 43,782 current stage paragraph occurrences from 43,243 immutable prior occurrences plus 539 new units. Reconstruct all 299 running physical pages from 281 unchanged prior pages plus 18 appended pages. Verify every current source ID, URL and SHA against the independently downloaded private readback. Retain the unchanged 16 October diary and closed-register catalog entries. Current corpus total must be 58,213 units.

The nine new events must separate five fresh 18 October matched-existing records (Files 252, 216, 152, 225 and 291) from four candidate observations dated 17 October (Files 108, 239, 178 and 266). Only the five fresh records may have current-run freshness flags. Preserve exact original observation clocks and their stated precision. Keep File 108's prior 14 October date in history and show its new 22 October CALL WITH MPs listing as a candidate. Preserve File 266's year, type and surname conflicts.

Check historical business separately from general stages and next-listing dates: File 252 HEARING versus for-orders business; File 216 reported settlement terms without inferred settlement/disposal; File 152 presiding-officer transfer without case-transfer-out inference; File 225 exact displayed act/section fields; File 291 COPIES versus 274 BNSS examination. Preserve all prior CNR-safe groupings and source-qualified party-first labels.

Verify the logged-out WhatsApp response receipt of 18 October 01:31:47.017 UTC, the 9–18 October unavailable review window, zero fresh media/text counts and unchanged 16 October checkpoints. No silence, absence of messages or overlap is inferred. The final package must contain exactly 35 files, with all file hashes checked against its manifest. Browser QA, archive integrity and remote ZIP readback remain separately recorded gates.


## 18 October manual refresh acceptance

The current private release contains exactly 37 intended repository files. Preserve the morning 58,213 source units, 455 profiles, 507 history rows, 5,260 supplementary history rows and 97 scoped directives exactly. The manual corpus has 69,448 units and full occurrence maps for all seven document sources. No profile/category merge or automatic tracking resumption is allowed.

Check 244 direct diary rows, 116 logical groups, 24 unresolved groups, and the three clearly dated unassigned office listings. Distinguish ten frozen afternoon records from earlier checks, retain masked candidates and future-dated portal entries as qualified evidence, and suppress stopped files 110/233. For 168/169 retain portal 21 October evidence in history under the single 22 October criminal-trial notification appointment.

The successful bounded WhatsApp review supersedes the historical morning blocked state: 55 original captured texts plus two targeted recoveries equal 57, with the full review cutoff unchanged at 11:49:24 UTC. Raw UI timezone remains unverified. The source corpus keeps the original reviewer observations and exact later captures.

Current document links require verified private readbacks. The approved app-only runtime changes resolve fully mapped predecessor stage/running URLs to their verified successors and display uncounted search/CAPTCHA totals truthfully. Raw URLs and structured null counts remain unchanged. Test unrelated, ambiguous and unmatched URLs against accidental redirects.

Run all ten Node suites, review the final hash-bound browser receipt and independent audit, then extract the completed ZIP and rerun all suites. Browser evidence remains limited to its documented desktop/narrow preview, synthetic auth fixture and observed interactions. Direct file execution and public hosting are not asserted.
