# URGENT BUG FIX – HomeCircle PWA Installation and Wrong Icon

Application URL:
https://arivolix-homecircle.vercel.app

## Current problem

When I install HomeCircle from the browser:

1. The browser creates only a shortcut instead of a proper installed PWA.
2. The shortcut/app uses the wrong icon.
3. Previous prompts did not produce any visible changes.

Do not just explain the solution. You must inspect the actual codebase, make the required changes, run tests, and show the exact files changed.

---

# STEP 1 – Inspect the actual project

Before changing anything, inspect the project and identify:

- Framework used
- Actual app entry file
- Actual public/static folder
- Actual manifest file
- Actual favicon files
- Actual service worker file
- Existing PWA package/configuration
- Existing HomeCircle logo files
- Vercel deployment configuration

Search the entire project for:

- manifest
- favicon
- apple-touch-icon
- serviceWorker
- service-worker
- beforeinstallprompt
- display-mode
- HomeCircle
- old logo names
- old application names

Do not assume that `public/manifest.json` exists.
Do not create duplicate files without checking the existing structure.

At the beginning of your response, report:

- Framework:
- App entry file:
- Manifest path:
- Service worker path:
- Current icon paths:
- PWA package/config:
- Root cause found:

---

# STEP 2 – Verify the deployed files

Check these URLs against the deployed application:

- https://arivolix-homecircle.vercel.app/manifest.json
- https://arivolix-homecircle.vercel.app/favicon.ico
- https://arivolix-homecircle.vercel.app/favicon-32.png
- https://arivolix-homecircle.vercel.app/icons/homecircle-192.png
- https://arivolix-homecircle.vercel.app/icons/homecircle-512.png
- https://arivolix-homecircle.vercel.app/icons/homecircle-512-maskable.png

If the real manifest or icon paths are different, use the real paths.

For every asset, verify:

- HTTP status is 200
- Correct content type
- Correct image dimensions
- Correct HomeCircle logo
- No redirect to the main HTML page
- No 404 error

If you cannot access the deployed URLs from the development environment, clearly state that and verify the local build instead.

---

# STEP 3 – Fix the real manifest

Modify the actual manifest used by the application.

The manifest must contain:

- name: HomeCircle
- short_name: HomeCircle
- id: /
- start_url: /
- scope: /
- display: standalone
- theme_color: HomeCircle teal color
- background_color: white
- valid 192x192 PNG icon
- valid 512x512 PNG icon
- valid maskable icon

Use the existing HomeCircle logo, not a browser logo, Vercel logo, or placeholder logo.

Important:

- There must be only one active manifest.
- The HTML must reference the correct manifest.
- Remove conflicting or obsolete manifest references.
- Use root-relative paths that match the actual files.
- Do not use fake icon paths.
- Do not use an SVG-only icon as the only Android icon.

---

# STEP 4 – Generate or repair the icon assets

Create or repair the following assets in the correct public/static folder:

- homecircle-192.png
- homecircle-512.png
- homecircle-512-maskable.png
- homecircle-apple-touch-icon.png
- favicon.ico
- favicon-32.png
- favicon-16.png

Use the official HomeCircle logo already in the project.

Requirements:

- 192x192 PNG
- 512x512 PNG
- 512x512 maskable PNG
- Clear logo at small size
- Correct padding for maskable icon
- No old logo
- No unrelated logo
- No broken transparency
- No stretched logo

If the existing logo is an SVG, convert it to PNG assets correctly instead of only referencing the SVG.

Show the generated files and their dimensions in the final report.

---

# STEP 5 – Fix HTML metadata

Update the actual HTML document used by the framework.

Add the correct references:

- Web manifest
- favicon.ico
- 32x32 favicon
- 16x16 favicon
- apple-touch-icon
- theme-color
- mobile-web-app-capable
- apple-mobile-web-app-capable
- apple-mobile-web-app-title

Remove references to old application names and old icon paths.

Do not edit an unused HTML file.

---

# STEP 6 – Fix service worker and cache version

Inspect the existing service worker.

If a service worker exists:

- Ensure it is registered correctly.
- Ensure its scope is correct.
- Update the cache version.
- Remove stale manifest and icon cache entries.
- Do not cache private Supabase data publicly.
- Do not break authentication or offline sync.

Use a new cache version such as:

homecircle-static-v3

If there is no service worker, implement a minimal safe service worker for the app shell only.

Do not claim PWA installation is fixed unless the service worker and manifest are valid.

---

# STEP 7 – Add a real installation button

Implement a proper installation flow.

Requirements:

- Listen for `beforeinstallprompt`.
- Store the event.
- Display an `Install HomeCircle` button only when installation is available.
- Trigger the prompt only after a real button click.
- Hide the button after installation.
- Detect standalone mode.
- Do not create a fake browser shortcut.
- Do not show “Installed” before confirmation.
- Show a fallback instruction when the browser does not support installation.

Use accessible button text:

Install HomeCircle

The button must be visible in the existing application UI, preferably in the profile/settings area or dashboard.

---

# STEP 8 – Build and test

Run the correct project commands:

- Install dependencies if required
- Run lint
- Run type check if available
- Run production build
- Start the production build locally if possible

Fix all errors caused by this change.

Do not finish with only a code explanation.

---

# STEP 9 – Provide exact evidence

At the end, provide:

1. Root cause.
2. Exact files changed.
3. Exact files created.
4. Old icon path and new icon path.
5. Manifest path.
6. Service worker path.
7. Build result.
8. Test result.
9. Screenshot of the manifest or browser install section if possible.
10. Clear instructions for redeploying to Vercel.

If no file was changed, do not say the task is complete.
If the issue cannot be fixed because of a deployment problem, identify the exact deployment problem.

---

# STEP 10 – Deployment requirement

After changes:

- Commit the changes if Git is configured.
- Push them to the connected repository if permission is available.
- Trigger a Vercel deployment if available.
- Confirm the deployed URL uses the new files.

If you cannot deploy automatically, tell me exactly:

- Which command I must run
- Which files must be committed
- Which branch must be pushed
- How to confirm the deployment

Do not stop at local changes if the live URL is still using the old version.