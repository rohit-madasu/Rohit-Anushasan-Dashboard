# Verification report · Private dashboard refresh

Prepared 17 October 2026 IST. This is an offline interface/data refresh from retained, source-bound records. It is not a new court review.

## Automated checks

All eight Node regression suites pass against the final runtime source. Run `node tests/run-tests.cjs` to repeat them.

- Original source preservation: the 190 current rows, 480 historical rows, 20 leads, limitation profiles, tracking directives and source-document bindings remain byte-equivalent to the verified baseline objects.
- Display identity: exact known locator/case/party grouping, file suffix separation, punctuation-sensitive identity boundaries, source preservation within groups and separate dates.
- Full months: earlier months/years, leap dates, month/day controls, party-first previews/cards and non-calendar-filtered case search.
- Calendar semantics: unassigned leads excluded from ordinary counts; stopped/superseded future rows not restored; explicit History retains all evidence.
- Complete search registry: all 298 running-source profiles, 299 locators and 157 separate closed-register rows; all 56,894 traceable source units.
- Supplemental evidence: all 5,260 historical table rows retain historical/nonfresh/nonappointment flags and source locators; 113 party and 5 identifier bindings refer to source-visible text.
- Login logic: PBKDF2 verification, wrong/correct login, exact six-hour duration, no sliding expiry, reload/session restoration, logout, focus, visibility, page restoration, timer, malformed/future storage, storage denial and interrupted login.
- Render/event model: whole-month controls, case-search clear/no-result flows, source passages not present in any profile, escaping, profile details and cleared search state on logout.
- Court palette: all 462 exact-label styles have corresponding CSS. Minimum foreground/background contrast is 5.39:1, above the 4.5:1 normal-text threshold. Written labels accompany every colour.

Known partial names are retained. For example, a known party followed by “opposing party not stated” is not replaced by an unavailable-name placeholder. Wholly absent/masked source names remain unavailable. No official identity is inferred from an office label.

## Actual browser checks

A dedicated local HTTP preview was tested in the cloud browser using a synthetic test verifier, with the shipping authentication code unchanged. The preview did not include private build workspaces or source document binaries.

Verified: wrong and correct password, same absolute expiry after reload, expired-session lock, lock retained after reload, logout/input clearing and locked reload; calendar click and keyboard movement, previous/next month, empty-date warning and full-index search.

Responsive browser checks covered desktop and narrow CSS widths including approximately 510 and 408 pixels without horizontal overflow. The final browser audit found no remaining blocker in data completeness, runtime or browser smoke checks. A final typography-only edit replaced an unsupported diagonal-arrow glyph with a standard arrow; layout and behavior were unchanged.

Direct `file://` browser execution was not available in this test environment. The package uses only relative scripts/styles, no fetch or external dependencies, and is designed to open directly as a local file. That exact browser transport was not exercised here. A physical Android/iPhone device was not tested; narrow desktop-browser layouts are not a device-performance claim.

## Search performance

Computation-only benchmark on this cloud executor (Node v24), before browser layout:

- 400 full-profile queries: median 6.64 ms, p95 8.94 ms
- Full-source inverted-index queries: median 0.50 ms, p95 2.53 ms
- Profile index construction: approximately 485 ms once per load
- Full-source index construction: approximately 266 ms computation, performed in small background batches in the interface

These are measured cloud-executor values, not guarantees for the user's hardware. Results render in batches of 30 profiles and 20 source passages; full fields are expanded on demand. Large source text is not stringified or scanned in full on each keystroke.

## Privacy and security boundary

The gate is a convenience UI lock, explicitly described that way in the interface and README. The standalone data is not encrypted, and the HTML/password screen is not strong access control. No analytics, automatic external resource loads, new court queries, GitHub publication or sharing changes are part of this refresh.

The shipped password configuration is a salted PBKDF2-SHA256 verifier. No plaintext user password or generated browser test fixture is included. Preserve private filesystem/Drive permissions.
