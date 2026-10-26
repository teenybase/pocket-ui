// Public build settings compiled into the UI as import.meta.env.PB_* (they used to live in .env files).
// Nothing here is secret. For the dev server and `--mode development` builds, an environment variable
// with the same name overrides a value, e.g. `PB_BACKEND_URL=http://localhost:8790/api/v1 npm run dev`.
// Production builds (`npm run build`, what gets published) ignore the environment, so a stray PB_*
// variable on a CI runner can't change a released bundle.
export function uiConfig(mode: string, version: string): Record<string, string> {
    const fromEnv = (name: string) => (mode === 'production' ? undefined : process.env[name])
    return {
        // where the UI calls the teenybase API; the dev server talks to `npx teenybase dev`
        PB_BACKEND_URL: fromEnv('PB_BACKEND_URL') ?? (mode === 'production' ? '/api/v1' : 'http://localhost:8787/api/v1'),
        PB_DOCS_URL: fromEnv('PB_DOCS_URL') ?? 'https://github.com/teenybase/teenybase',
        PB_RELEASES: fromEnv('PB_RELEASES') ?? 'https://www.npmjs.com/package/@teenybase/pocket-ui',
        PB_VERSION: fromEnv('PB_VERSION') ?? `v${version}`,
    }
}
