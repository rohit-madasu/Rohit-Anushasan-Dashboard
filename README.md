# Rohit–Anushasan Hearing Dashboard

A static, searchable hearing-calendar dashboard for Anushasan Associates.

## Published site

The site is published from the `main` branch with GitHub Pages.

## Source

`index.html` is a self-contained snapshot generated from the firm's reconciled court-diary data. It includes the interface, styles, client-side filtering, and embedded evidence data, so it does not require a build step or server.

## Updating the dashboard

1. Reconcile the master diary, official court checks, office/document reports, and unresolved file mappings.
2. Generate a replacement self-contained HTML snapshot.
3. Remove local filesystem paths and confirm that no credentials are present.
4. Replace `index.html`, test calendar navigation/search/filtering at desktop and mobile widths, then commit and push to `main`.

## Important

This repository and its GitHub Pages site are public. Do not add `.env`, tokens, passwords, private source documents, or internal filesystem paths. The dashboard is a dated planning snapshot—not a live court feed—and its qualifications and source labels must be preserved.
