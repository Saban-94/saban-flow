08:04:51.699 Running build in Washington, D.C., USA (East) – iad1
08:04:51.701 Build machine configuration: 2 cores, 8 GB
08:04:51.894 Cloning github.com/Saban-94/saban-flow (Branch: main, Commit: 2ce794b)
08:04:52.588 Cloning completed: 692.000ms
08:04:52.653 Restored build cache from previous deployment (HRRP54wezPPCnxRD6Z17BF83iREu)
08:04:53.279 Running "vercel build"
08:04:53.291 Vercel CLI 62.7.0
08:04:54.162 Installing dependencies...
08:04:54.790 npm warn Unknown env config "cache-dir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
08:04:58.893 
08:04:58.893 up to date in 5s
08:04:58.893 
08:04:58.893 116 packages are looking for funding
08:04:58.893   run `npm fund` for details
08:04:58.948 Running "npm run build"
08:04:59.129 npm warn Unknown env config "cache-dir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
08:04:59.169 
08:04:59.170 > build
08:04:59.170 > vite build
08:04:59.170 
08:05:01.188 [info] [nitro:vercel] Using `nodejs24.x` runtime.
08:05:01.189 [info] [nitro:vercel] Using `web` entry format.
08:05:01.198 The plugin "vite-tsconfig-paths" is detected. Vite now supports tsconfig paths resolution natively via the resolve.tsconfigPaths option. You can remove the plugin and set resolve.tsconfigPaths: true in your Vite config instead.
08:05:01.596 vite v8.1.5 building client environment for production...
08:05:04.308 
transforming...✓ 1922 modules transformed.
08:05:04.417 rendering chunks...
08:05:04.520 ✗ Build failed in 2.92s
08:05:04.521 error during build:
08:05:04.521 Build failed with 1 error:
08:05:04.521 
08:05:04.521 [MISSING_EXPORT] "fetchGps" is not exported by "src/lib/data.ts".
08:05:04.521    ╭─[ src/routes/ituran.tsx?tsr-split=component:4:38 ]
08:05:04.521    │
08:05:04.521  4 │ import { NOTES, DRIVERS, fetchNotes, fetchGps } from "@/lib/data";
08:05:04.521    │                                      ────┬───  
08:05:04.521    │                                          ╰───── Missing export
08:05:04.521 ───╯
08:05:04.521 
08:05:04.522     at aggregateBindingErrorsIntoJsError (file:///vercel/path0/node_modules/rolldown/dist/shared/error-BgfXq0Tb.mjs:48:18)
08:05:04.522     at unwrapBindingResult (file:///vercel/path0/node_modules/rolldown/dist/shared/error-BgfXq0Tb.mjs:18:128)
08:05:04.522     at #build (file:///vercel/path0/node_modules/rolldown/dist/shared/rolldown-DP_p9pd3.mjs:132:34)
08:05:04.522     at async buildEnvironment (file:///vercel/path0/node_modules/vite/dist/node/chunks/node.js:33061:66)
08:05:04.522     at async Object.build (file:///vercel/path0/node_modules/vite/dist/node/chunks/node.js:33483:19)
08:05:04.522     at async buildStartViteEnvironments (file:///vercel/path0/node_modules/@tanstack/start-plugin-core/dist/esm/vite/planning.js:95:23)
08:05:04.522     at async Object.buildApp (file:///vercel/path0/node_modules/@tanstack/start-plugin-core/dist/esm/vite/plugin.js:113:8)
08:05:04.522     at async Object.buildApp (file:///vercel/path0/node_modules/vite/dist/node/chunks/node.js:33475:6)
08:05:04.522     at async CAC.<anonymous> (file:///vercel/path0/node_modules/vite/dist/node/cli.js:776:3) {
08:05:04.522   errors: [Getter/Setter]
08:05:04.522 }
08:05:04.638 Error: Command "npm run build" exited with 1
