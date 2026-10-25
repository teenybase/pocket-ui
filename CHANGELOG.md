# Changelog

## 0.0.6 - 2026-10-26

- Licensed under MIT, the same licence as PocketBase (it was Apache-2.0). LICENSE carries both PocketBase's and teenybase's copyright notices.
- The package now ships a `NOTICE` file with PocketBase's MIT copyright and licence notice (this UI is a fork of the PocketBase admin dashboard, and `src/client` is a subset of the PocketBase JS SDK).
- The repository moved to [teenybase/pocket-ui](https://github.com/teenybase/pocket-ui). `repository`, `bugs` and `homepage` point there, and the docs link in the UI header points to [teenybase/teenybase](https://github.com/teenybase/teenybase).
- Releases are published from GitHub Actions with npm trusted publishing and provenance.
- No UI changes since 0.0.5.

## 0.0.5 - 2026-04-02

- Sorting sends `order` (the teenybase list parameter) instead of `sort`.

## 0.0.4 - 2025-02-05

- The API and UI base paths can be overridden with `window.API_BASE_URL` and `window.API_UI_BASE_URL`.

## 0.0.3 - 2025-01-29

- Minor fixes.

## 0.0.2 - 2024-12-28

- Added integer and blob fields, and basic support for records with several primary key fields and no `id` field.

## 0.0.1 - 2024-12-11

- First release: the PocketBase admin UI adapted for teenybase.
