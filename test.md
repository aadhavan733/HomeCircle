# HomeCircle – Automated QA Test Suite

Application:
https://arivolix-homecircle.vercel.app

Create a complete automated QA test suite for the existing HomeCircle application.

Do not change application behavior just to make tests pass.

## First inspect

Inspect:

- package.json
- test configuration
- framework
- Supabase setup
- database schema
- RLS policies
- routes
- transaction logic
- bill recurrence logic
- savings goal calculations
- budget calculations
- PWA manifest
- service worker
- offline/Dexie logic

Report the existing test framework before implementing tests.

## Add automated tests for:

### Build and code quality

- Type check
- Lint
- Production build
- Broken imports
- Missing routes
- Invalid environment configuration

### Unit tests

Test:

- Income calculation
- Expense calculation
- Budget remaining
- Budget usage percentage
- Category spending
- Bill next-occurrence calculation
- One-time bill behavior
- Recurring bill behavior
- Duplicate Mark Paid prevention
- Savings goal progress
- Savings goal remaining amount
- Progress cap at 100%
- Invalid amount rejection

### Component tests

Test:

- Login form
- Signup form
- Add transaction form
- Shared/personal visibility selector
- Add bill form
- Add savings goal form
- Budget form
- Validation messages
- Loading states
- Empty states
- Error states

### End-to-end tests

Use Playwright or the existing browser test framework if available.

Test:

1. Login
2. Logout
3. Dashboard loading
4. Add income
5. Add shared expense
6. Add personal expense
7. Edit transaction
8. Delete transaction
9. Add one-time bill
10. Add recurring bill
11. Mark bill paid
12. Add savings goal
13. Add savings contribution
14. Family switching
15. Mobile navigation
16. PWA manifest loading
17. Service worker registration

## Security tests

Use separate test accounts and a separate test family.

Verify:

- User cannot access another family’s records.
- Personal transactions are visible only to their creator.
- Shared transactions are visible to authorized family members.
- Members cannot edit or delete another member’s personal transactions.
- Unauthorized direct database requests are rejected.
- RLS policies are active.

Never use production user data.

## PWA tests

Verify:

- Manifest exists.
- Manifest is valid JSON.
- Name is HomeCircle.
- Display is standalone.
- Start URL is valid.
- 192x192 icon exists.
- 512x512 icon exists.
- Maskable icon exists.
- Icon URLs return HTTP 200.
- Service worker registers.
- Service worker scope is correct.
- No old logo references remain.

## Responsive tests

Run browser tests at:

- 320x800
- 375x812
- 390x844
- 768x1024
- 1440x900

Check for:

- Horizontal overflow
- Clipped text
- Overlapping buttons
- Broken modals
- Navigation problems
- Floating button overlap

## Test data

Use only clearly marked test data:

- QA Test Family
- QA Test Income
- QA Personal Expense
- QA Shared Expense
- QA Monthly Bill
- QA Savings Goal

Do not use real personal financial information.

## Final output

Provide:

1. Test framework used.
2. Files created.
3. Files changed.
4. Commands to run tests.
5. Total tests.
6. Passed tests.
7. Failed tests.
8. Skipped tests.
9. Screenshots or videos where supported.
10. Bugs with severity.
11. Exact reproduction steps.
12. Remaining manual tests.
13. Whether the application is ready for Phase 1 approval.

Do not report a test as passed if it was not actually executed.
Give ScreenShot for each test case