We are fixing the QA issues found in the latest test report.

Important:
- Inspect the existing code before changing anything.
- Do not redesign the UI.
- Do not change business logic unnecessarily.
- Do not modify database structure unless required.
- Do not remove or weaken existing tests.
- After each fix, run the relevant tests.

BUG-001: Add Sign Out functionality

Requirements:
1. Add a clearly visible Sign Out/Logout action.
2. Use the existing Supabase authentication setup.
3. On logout:
   - Sign out from Supabase.
   - Clear relevant client/session state.
   - Redirect to /login.
4. Prevent access to protected pages after logout.
5. Ensure browser Back and page refresh do not expose protected content.
6. Show a loading state while logout is processing.
7. Handle logout errors safely.

Test cases:
- Login -> Logout
- Logout -> Refresh
- Logout -> Browser Back
- Logout -> Open /transactions directly
- Logout -> Open /bills directly
- Logout -> Open /goals directly
- Logout -> Open /family directly

BUG-002: Fix form label associations

Inspect:
- AddTransactionForm.tsx
- bills/add/page.tsx
- goals/add/page.tsx

Requirements:
1. Every visible form label must have htmlFor.
2. Every related input/select/textarea must have a matching unique id.
3. Do not create duplicate IDs.
4. Preserve the current appearance and behavior.

Test:
- Click each label and confirm the correct field receives focus.
- Test keyboard navigation.
- Run an accessibility audit.

BUG-003: Review useEffect state updates

Inspect:
- InstallPrompt.tsx
- SyncProvider.tsx

Requirements:
1. Determine whether the state updates are necessary.
2. Avoid render loops, hydration issues, flickering or unnecessary updates.
3. Do not blindly remove the state updates.
4. Preserve PWA install prompt and sync behavior.
5. Explain any change made.

After fixing:
1. Run TypeScript:
   npx tsc --noEmit

2. Run lint:
   npm run lint

3. Run unit/component tests:
   npm test -- --run

4. Run Playwright:
   npx playwright test

5. Report:
   - Files changed
   - Changes made
   - Tests executed
   - Pass/fail result
   - Remaining warnings
   - Any issue requiring manual testing

Do not claim manual testing was completed unless it was actually performed.