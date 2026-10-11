# Rohit–Anushasan Hearing Dashboard

A static, searchable hearing-calendar dashboard for Anushasan Associates.

## Published site

The site is published from the `main` branch with GitHub Pages.

## Source

`index.html`, `styles.css`, and `app.js` provide the responsive calendar. `calendar-core.js` groups evidence records into proceeding cards without changing the source data. `data.js` contains the preserved source snapshot. No build step or external library is required.

On mobile, tapping a date moves directly to cards showing the file serial, parties, case number, court and stage. Search covers all dates, and source filters distinguish verified and provisional records. Full qualifications and the audit export remain available.

The arrows beside the selected date move backward or forward one calendar day, including days with no cases. The green counters follow the selection: the selected date, the following date, and the displayed calendar month. Counts reflect the current source filter and search; repeated evidence for a proceeding is grouped using the same rules as the case cards.

## Updating the dashboard

1. Reconcile the master diary, official court checks, office/document reports, and unresolved file mappings.
2. Replace the `window.HEARING_DATA` JSON object in `data.js` with the reconciled snapshot, retaining the existing schema and evidence history.
3. Remove local filesystem paths and confirm that no credentials are present.
4. Test calendar navigation, date selection, search and filtering at desktop and mobile widths, then commit and push to `main`.

## Important

This repository and its GitHub Pages site are public. Do not add `.env`, tokens, passwords, private source documents, or internal filesystem paths. The dashboard is a dated planning snapshot—not a live court feed—and its qualifications and source labels must be preserved.
