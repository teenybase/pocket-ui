// Public build settings compiled into the UI as import.meta.env.PB_* (they used to live in .env files).
// Nothing here is secret. To change one for a local build, set an environment variable with the same
// name, e.g. `PB_BACKEND_URL=http://localhost:8790/api/v1 npm run dev`.
export function uiConfig(mode: string, version: string): Record<string, string> {
    const env = process.env
    return {
        // where the UI calls the teenybase API; the dev server talks to `npx teenybase dev`
        PB_BACKEND_URL: env.PB_BACKEND_URL ?? (mode === 'development' ? 'http://localhost:8787/api/v1' : '/api/v1'),
        PB_DOCS_URL: env.PB_DOCS_URL ?? 'https://github.com/teenybase/teenybase',
        PB_RELEASES: env.PB_RELEASES ?? 'https://www.npmjs.com/package/@teenybase/pocket-ui',
        PB_VERSION: env.PB_VERSION ?? `v${version}`,
    }
}
