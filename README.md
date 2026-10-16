# Anushasan Associates · Private court diary

Private offline dashboard refresh prepared 17 October 2026 IST from the verified 16 October source edition. No new court queries, public publication or source-permission changes were performed for this refresh.

## Open the diary

Unzip the complete folder, keep its files together, and open `index.html` in a current browser. No build, installation, analytics, external font, CDN or network request is required. Source-document links only open when you choose them and require your authorized Google account.

Enter the configured password. Login lasts exactly six hours from successful entry, including reloads in the same tab. The remaining time and Log out control appear in the header. Expiry is checked on a timer, window focus, visibility changes and page restoration. Closing the tab normally clears its session. If browser session storage is unavailable, reloading asks for the password again.

**The password screen is only a convenience lock. It is not encryption or strong access control. Anyone with these files can inspect the data or bypass the screen.** Keep this edition private. It contains private party names and the full retained source text. Do not publish it to public GitHub Pages. Public GitHub or Pages changes require the user's separate approval.

## Calendar

- Party names appear first, followed by case identifiers and file locators. Available authorized source names can replace earlier UI-only masking. Original masked fields remain unchanged in evidence. No name missing or masked in the actual source is reconstructed.
- The initial view is **All potential sources** for a full-month overview. Matched official, candidate, office, mirror, order and explicit History filters remain available. Historical records are clearly marked; an empty date does not establish no hearings.
- All recorded months remain navigable. Month arrows, previous/next day, Today, day click/tap, hover/focus previews, arrow keys, Home/End and Page Up/Down are supported.
- Identical known file-locator sets, case identifiers and normalized party text may share one display card for the same date. Identity normalization is conservative; meaningful punctuation, file suffixes, separate proceedings and uncertain aliases are not merged. Every underlying row, conflicting date, court label, stage, timestamp and source reference remains expandable.
- Counts are **display case entries and source rows**, not unique proceedings, attendance or verified outcomes. The same matter on different dates stays visible on each date. Unassigned leads remain separate from ordinary calendar counts.
- Court colours are deterministic for each exact recorded label, with written labels and a month-specific legend. Typography colours meet at least 4.5:1 contrast against their backgrounds. Similar colours or labels do not establish court equivalence.
- Current/future tracking-stop exclusions remain in effect. Historical alternatives and stopped records remain available in the explicit History view and source trail; they are not restored as current appointments.

## Case Search

One live input searches independently of calendar date or filter. The full profile registry contains **298 running-source profiles (299 file locators) and all 157 physical closed-register rows**, for 455 separately traceable profile/row records. These are not 455 distinct legal proceedings. Categories remain 84 active, 26 disposed and 188 unclear for the running-source profiles. Closed-register placement is an office-register fact, not automatic proof of judicial disposal.

Search party, case, file, CNR or other retained fields. A normalized profile index is built once. Results render 30 cards at a time; full fields are expanded on demand. Exact source matches remain identifiable through profile IDs, source locators, original fields, status caveats and document links.

The full **56,894 source units** are also available as separately qualified source-passage results through the same input. A background, chunked inverted token index keeps large source text out of per-keystroke full-document scans. Source passages are search hits, not extra cases or inferred profile associations. Source passages render 20 at a time with a Show more control; the complete corpus also remains in the evidence download and data file.

## Source preservation and historical coverage

The original `data.js` is unchanged: 190 current rows, 480 historical rows, 20 unassigned leads, 223 retained limitation profiles, source hashes, date conflicts, category qualifications and proceeding-scoped tracking exclusions all survive intact.

The supplemental index adds 5,260 source-located historical business/listing table rows. These remain history-only and never acquire fresh-check, matched-default or current-appointment status. The supplement includes available October 1 evidence; absence of an October 2 row is not a no-hearing finding. Earlier years remain navigable.

113 safe party-display bindings and 5 source-visible identifier-display bindings preserve the original evidence fields and include their source locator and identity caveats. Source-specific office descriptions do not prove an otherwise unconfirmed court/file association.

Original source edition: `Current_Case_Hearings_and_Stages_2026-10-16_daily_update.docx`

- Source: https://drive.google.com/file/d/1YHMgsx-KbUIHrM31d8yLPmZ6xcucNr9G/view
- SHA-256: `2a5b630d065671d7991926b8be515d9774da042a60fc53045de2d9b0250cece1`
- Prepared: 2026-10-16T07:25:17+05:30
- Verified PDF: https://drive.google.com/file/d/1PoHmeX4DCau0QNobcwISKsb7PRdG6P2U/view
- PDF SHA-256: `fab64d19392125454169d1a714a3ef0e478951a1156195377c288afb4f00a0ff`
- Original ZIP SHA-256: `18f97970283a79715841ce1ccb9d698f976e2ff38362270772a35d1d31ad0273`

The source registry inside `case-search-data.js` also binds the retained diary, running register and closed register to exact source file IDs and hashes. All relevant coverage limitations and timed source observations remain in the dashboard's Source notes and evidence map. This refresh does not imply any fresh court review, completeness beyond the four bound files, attendance, outcome or status reclassification.

## Files, verification and maintenance

Runtime files: `index.html`, `styles.css`, `court-colors.css`, `app.js`, `calendar-core.js`, `auth.js`, `auth-config.js`, `data.js`, `case-search-data.js`, and `courts.js`. `auth-config.js` stores a salted PBKDF2-SHA256 verifier, never the plaintext password.

`build_assets.py` regenerates the JS data wrappers and exact-label colour registry from the supplied JS sources (or optional local JSON inputs). It never accepts or stores a plaintext password. No package installation is needed. Node regression tests are in `tests/`; run `node tests/run-tests.cjs`. Browser QA is separate from the source, logic and DOM-model suites. Check `QA.md` for the exact tested scope and remaining limits.

The package excludes private build workspaces, source DOCX/PDF binaries, credentials, raw sessions and assistant notes. The authorized extracted case source text is intentionally included for offline full-field search. No publishing or deployment step is configured.
