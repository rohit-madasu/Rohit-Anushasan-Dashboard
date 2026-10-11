# Rohit–Anushasan Hearing Dashboard

A private, static hearing calendar for Anushasan Associates. This complete repository copy includes the updated calendar, styles, source filters and self-contained data. No external scripts, credentials or account setup are needed by the dashboard itself.

## What is included

- index.html: the calendar and source-detail layout
- styles.css: the existing green-and-cream design, with responsive and keyboard-focus improvements
- app.js: date navigation, search, source filters and evidence details
- calendar-core.js: India Standard Time date handling and exact source-row selection
- data.js: the updated private presentation dataset
- .gitignore and .nojekyll: preserved repository files

## Open the dashboard

Extract the complete ZIP into one folder, then open index.html in a modern browser. Keep all files together. There is no build step and no package installation is required. If your browser restricts local files, run Python’s standard local server from the extracted folder with `python3 -m http.server 8000 --bind 127.0.0.1`, then open http://127.0.0.1:8000 in that browser.

The case-stage report link opens the verified private Drive document. Sign in with your authorized Google account if asked. The dashboard does not change document access.

## Reading the information

The initial view shows matched official identities. A matched identity does not remove a date conflict or establish that the firm is responsible for attending. Important conflicts and assignment cautions are shown directly on the cards.

“All potential sources” also shows candidate, office, secondary and order-derived entries. Counters measure evidence entries, not unique cases or hearings. Multiple entries can concern one matter. Unassigned or unnamed leads are shown separately and excluded from those counters.

Use the arrows to browse dates, or search by an available party name, file, case number or CNR. Protected party names are withheld and cannot be searched. Source details open by click, tap or keyboard. Evidence history is separate from current listings.

## Source coverage

This is a bounded update, not a new comprehensive court check of every case. It retains 383 evidence records and 298 source profiles. The current dataset has 246 potential evidence entries and 53 matched-identity entries. The 226-profile limitation list spans categories and is separate from the 188 profiles classified as unclear.

The source was prepared on 12 October 2026. Fresh official checks were performed on 11 October for 42 court records across 39 source files. Each card preserves its own check or source time. Older findings have not been relabelled as newly checked. Later WhatsApp reviews cover an incremental overlap, not a new full-history rereview.

Dates use India Standard Time. Past dates leave current views but remain in evidence history. An empty date does not establish that there are no hearings; confirm changes with the office before attending.

The source document is Current_Case_Hearings_and_Stages_2026-10-12_0004IST_bounded_recovery.docx. The data retains its document fingerprint and the canonical data fingerprint. The private evidence download contains the same minimal data displayed here, with evidence IDs and fingerprints for tracing back to the private source.

## Privacy and maintenance

Protected identities and free-text fields are masked. Other legal information remains private. This static copy does not provide authentication by itself.

Keep the five runtime files together when making an updated copy. Updates must preserve source identities, evidence history, qualifications and original check times. Verify date navigation, search, filters and source details on desktop and mobile after replacing data. This archive does not perform any remote update automatically.
