# Pocket UI for teenybase

The admin panel of [teenybase](https://github.com/teenybase/teenybase), published on npm as [`@teenybase/pocket-ui`](https://www.npmjs.com/package/@teenybase/pocket-ui).

It is a fork of the [PocketBase](https://github.com/pocketbase/pocketbase) admin dashboard (`ui/`), modified to work with teenybase's API, and `src/client` is a modified subset of the [PocketBase JS SDK](https://github.com/pocketbase/js-sdk). PocketBase and its SDK are MIT-licensed, © Gani Georgiev; their copyright and licence notice is kept in [NOTICE](NOTICE) and ships in the npm package.

> teenybase is early (v0.1): APIs may change before 1.0.

## Usage

You don't install this package yourself. teenybase's `PocketUIExtension` serves the admin panel on `/api/v1/pocket/`, and the worker fetches the built files of an exact, pinned version of this package from jsDelivr:

```ts
import { PocketUIExtension } from 'teenybase/worker'

// Loads https://cdn.jsdelivr.net/npm/@teenybase/pocket-ui@<pinned version>/dist/
db.extensions.push(new PocketUIExtension(db))
```

Open `/api/v1/pocket/` in the browser and log in as `viewer` or `editor` with `POCKET_UI_VIEWER_PASSWORD` / `POCKET_UI_EDITOR_PASSWORD`, or as any role (`viewer`, `editor`, `superadmin`) with `ADMIN_SERVICE_TOKEN`. The options (`baseUrl`, `uiVersion`) are in the [config reference](https://github.com/teenybase/teenybase/blob/main/docs/config-reference.md).

## Development

```bash
npm install          # also builds dist/ (the prepare script)
npm run dev          # Vite dev server on http://localhost:3000
npm run build        # production build into dist/
```

The dev server talks to the backend in `.env.development` (`PB_BACKEND_URL`, default `http://localhost:8787/api/v1`), for example a teenybase app running with `npx teenybase dev`. To try a local build inside an app, run `npm run build && npx vite preview --port 4173` and pass `baseUrl: 'http://localhost:4173/'` to `PocketUIExtension`.

`.env` is committed on purpose: it holds only the public `PB_*` build settings that Vite reads. Put anything private in `.env.local`, which is ignored.

## Releases

Bump `version` in `package.json`, add a section for it to [CHANGELOG.md](CHANGELOG.md) and push to `master`. The [publish workflow](.github/workflows/publish.yml) builds and packs the package and, after approval, publishes it to npm with provenance through [release-tools](https://github.com/repalash/release-tools). teenybase then pins the new version in `POCKET_UI_VERSION` (`src/worker/util/pocketui.ts`) after checking it.

## License

MIT, like PocketBase: see [LICENSE](LICENSE). PocketBase's copyright notice is kept in [LICENSE](LICENSE) and [NOTICE](NOTICE).
