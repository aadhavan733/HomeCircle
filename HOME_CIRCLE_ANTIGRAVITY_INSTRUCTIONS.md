
# HomeCircle — Antigravity Project Instructions

## 1. Project Identity

Project Name: HomeCircle

Project Type: Family Shared Budget Management Application

Primary Currency: Indian Rupee (INR / ₹)

Target Users: Whole family

Development Approach: Plan first, implement one stage at a time.

Repository: Existing personal GitHub repository, to be confirmed by the project owner.

Status: Planning approved. No coding until Stage 1 requirements and UI/UX are finalized.

---

## 2. Product Vision

HomeCircle helps families understand their shared household finances.

Users can:
- Record daily expenses.
- Record income.
- View monthly spending.
- Manage total and category budgets.
- Track recurring bills.
- Set savings goals.
- Share permitted financial information with family.
- Record expenses while offline.

The app must remain simple, private, and easy to use.

Product positioning:

"Know your family's money. Plan your month. Save together."

---

## 3. Core Product Principles

1. Privacy first.
2. Simple UI/UX.
3. Mobile-first design.
4. Offline-first expense entry.
5. Secure family access.
6. Reliable money calculations.
7. Small, testable releases.
8. No unnecessary features.
9. Clear documentation.
10. Do not sacrifice security for convenience.

---

## 4. Approved MVP Scope

### Authentication
- Email and password login.
- Google login.
- Logout.
- Session persistence.
- Password reset.
- Protected application routes.

### Family Management
- Create a family.
- Join a family through a secure invite.
- View family members.
- Owner, admin, member, and viewer roles.
- Family membership validation.
- Basic family settings.

### Expenses
- Add expense.
- Edit expense.
- Delete expense according to permissions.
- Record income.
- Amount in INR.
- Category.
- Date.
- Payment method.
- Person who paid.
- Shared or personal visibility.
- Optional note.
- Transaction history.
- Basic month and category filters.

### Dashboard
- Monthly total income.
- Monthly shared expenses.
- Budget remaining.
- Category spending.
- Spending trend.
- Upcoming bills.
- Savings progress.

Keep dashboard charts limited to useful information.

### Budgets
- Total monthly family budget.
- Category monthly budgets.
- Budget remaining.
- Spending progress.
- Current month selector.

### Recurring Bills
- Create bill.
- Edit bill.
- Deactivate bill.
- Amount.
- Frequency.
- Next due date.
- Mark bill paid.
- Upcoming bills.
- Basic bill history.

### Savings Goals
- Create goal.
- Target amount.
- Target date.
- Add contribution.
- Progress percentage.
- Contribution history.
- Shared or personal goal visibility.

### Offline Support
- Add expense without internet.
- Store pending changes locally.
- Sync when online.
- Retry failed synchronization.
- Show sync status.
- Prevent duplicate transactions.
- Handle conflicts safely.

---

## 5. Out of Scope for MVP

Do not implement without explicit approval:

- Bank account linking.
- Automatic UPI transaction import.
- UPI payments.
- Investment tracking.
- Loans and complex EMI management.
- AI chatbot.
- AI financial advice.
- Public profiles.
- Social features.
- Multiple currencies.
- Business accounting.
- Complex forecasting.
- Advanced analytics.
- Unnecessary third-party trackers.

---

## 6. Privacy and Security Requirements

This application stores sensitive household financial information.

Treat all financial data as private by default.

### Required Rules

1. No financial records may be publicly accessible.
2. Shared transactions are visible only to authorized family members.
3. Personal transactions are visible only to their owner and explicitly authorized roles.
4. Backend authorization is mandatory.
5. Frontend hiding is not a security control.
6. Every family-owned table must have appropriate Row Level Security.
7. Never expose Supabase service-role keys in frontend code.
8. Never commit secrets to GitHub.
9. Use environment variables for credentials.
10. Validate all data on the server.
11. Do not send financial records to AI providers in MVP.
12. Avoid unnecessary analytics and tracking.
13. Do not store UPI PINs, bank passwords, or card CVVs.
14. Do not log sensitive amounts or private transaction notes.
15. Use HTTPS in production.
16. Protect invite links and membership operations.
17. Use least-privilege access.
18. Document security-sensitive decisions.
19. Test permissions using multiple family accounts.
20. Do not claim that privacy is absolutely guaranteed.

### Privacy Model

Transaction visibility values:

- shared
- personal

Personal transactions must not be returned to unauthorized family members.

Roles:

- owner
- admin
- member
- viewer

Do not assume that every family member can see every record.

---

## 7. UI/UX Requirements

The UI must remain simple.

### Navigation

Use a maximum of five main navigation items:

1. Home
2. Transactions
3. Bills
4. Goals
5. Family

### Design Rules

- Mobile-first.
- Responsive desktop layout.
- Clear typography.
- High contrast.
- Simple forms.
- Large touch targets.
- One primary Add Expense action.
- Avoid unnecessary modals.
- Avoid complex dashboards.
- Avoid excessive charts.
- Use clear English labels.
- Use INR formatting consistently.
- Keep important information visible.
- Provide useful empty states.
- Provide clear validation messages.
- Show loading, success, error, and offline states.

### Expense Entry

Expense entry should be quick:

1. Enter amount.
2. Select category.
3. Select date.
4. Select who paid.
5. Select shared or personal.
6. Save.

Do not require unnecessary fields.

---

## 8. Money and Calculation Rules

1. Store money as integer paise.
2. Example: ₹250.50 = 25050 paise.
3. Never use floating-point values for monetary calculations.
4. Validate amount > 0.
5. Use INR as the default currency.
6. Format currency consistently.
7. Use safe arithmetic for totals and percentages.
8. Define rounding rules before implementation.
9. Validate all financial inputs.
10. Test totals, budgets, savings, and bill calculations.

---

## 9. Database Requirements

Expected core tables:

- profiles
- families
- family_members
- categories
- transactions
- budgets
- recurring_bills
- bill_occurrences
- savings_goals
- goal_contributions
- sync_operations

### Database Rules

- Use UUIDs where appropriate.
- Use foreign keys.
- Add timestamps.
- Add useful indexes.
- Add constraints.
- Use RLS.
- Define ownership clearly.
- Prevent orphaned records.
- Prevent duplicate sync operations.
- Use migrations for schema changes.
- Never manually alter production schema without documentation.

---

## 10. Offline-First Requirements

Offline support is a core feature.

### Local Storage

Use IndexedDB through a suitable local database library.

### Offline Operations

- Create local transaction ID.
- Store pending transaction.
- Show pending sync state.
- Sync when connectivity returns.
- Retry failed operations.
- Prevent duplicate server records.
- Handle edits and deletes safely.
- Handle conflicts explicitly.
- Do not silently discard local data.

### Important

Do not claim offline support is complete until it has been tested with:

- Internet disabled.
- Multiple offline expenses.
- App reload while offline.
- Reconnection.
- Failed sync.
- Duplicate retry.
- Two devices editing the same record.
- Shared and personal privacy rules.

---

## 11. Development Stages

### Stage 1 — Requirements and Planning

Deliverables:
- Final product brief.
- Approved MVP scope.
- User roles.
- Privacy model.
- Screen list.
- Database plan.
- Technical decisions.
- Out-of-scope list.

No coding until planning is approved.

### Stage 2 — UI/UX Design

Deliverables:
- Dashboard wireframe.
- Add Expense flow.
- Transactions screen.
- Bills screen.
- Goals screen.
- Family screen.
- Login flow.
- Mobile layout.
- Empty, loading, error, and offline states.

No unnecessary UI complexity.

### Stage 3 — Project Setup

Deliverables:
- Next.js project.
- TypeScript.
- Tailwind CSS.
- GitHub integration.
- Environment configuration.
- Basic app shell.
- Local development setup.
- Linting and test setup.

### Stage 4 — Database and Authentication

Deliverables:
- Database migrations.
- Supabase Auth.
- Email login.
- Google login.
- Family creation.
- Family membership.
- Roles.
- RLS policies.
- Permission tests.

### Stage 5 — Expense Management

Deliverables:
- Add income and expenses.
- Edit and delete.
- Categories.
- Shared/personal visibility.
- Transactions list.
- Filters.
- Validation.
- Tests.

### Stage 6 — Dashboard and Budgets

Deliverables:
- Monthly summary.
- Total budget.
- Category budgets.
- Charts.
- Budget remaining.
- Month selector.
- Calculation tests.

### Stage 7 — Bills and Savings

Deliverables:
- Recurring bills.
- Bill occurrences.
- Paid/unpaid status.
- Upcoming bills.
- Savings goals.
- Contributions.
- Progress calculations.
- Tests.

### Stage 8 — Offline-First Sync

Deliverables:
- IndexedDB storage.
- Offline expense entry.
- Sync queue.
- Retry handling.
- Duplicate prevention.
- Conflict strategy.
- Sync status.
- Offline tests.

### Stage 9 — Testing and Security

Deliverables:
- Unit tests.
- Integration tests.
- Permission tests.
- RLS tests.
- Offline tests.
- Mobile testing.
- Accessibility checks.
- Security review.
- Backup/export review.

### Stage 10 — Deployment

Deliverables:
- Production deployment.
- Secure environment variables.
- HTTPS.
- Production database configuration.
- Domain if required.
- Family onboarding.
- Backup process.
- Documentation.

---

## 12. Agent Operating Rules

1. Do not code before the current stage is approved.
2. Work only on the requested stage.
3. Do not implement the entire app in one prompt.
4. Explain the plan before making major changes.
5. Ask for approval before major architectural changes.
6. Do not invent requirements.
7. Do not add unnecessary features.
8. Preserve working functionality.
9. Use small, understandable changes.
10. Keep code maintainable.
11. Do not expose secrets.
12. Do not bypass security checks.
13. Run relevant tests after changes.
14. Report failed tests honestly.
15. Document important decisions.
16. Keep Git commits meaningful.
17. Do not delete data without explicit approval.
18. Do not deploy to production without approval.
19. Do not claim completion without verification.
20. Treat financial data as sensitive.

---

## 13. Definition of Done

A feature is complete only when:

- Requirements are satisfied.
- UI is simple and responsive.
- Data is validated.
- Permissions are enforced.
- Relevant tests pass.
- Offline behavior is tested where applicable.
- No existing feature is broken.
- Errors are handled.
- Secrets are protected.
- Documentation is updated.
- The agent reports what was changed and how it was verified.

---

## 14. Stage Completion Report

At the end of every stage, report:

1. Stage name.
2. What was completed.
3. Files changed.
4. Database changes.
5. Tests run.
6. Test results.
7. Security considerations.
8. Known limitations.
9. Next stage recommendation.
10. Approval required before continuing.

---

## 15. Current Instruction

We are currently in Stage 1 — Requirements and Planning.

Do not write application code yet.

First finalize:
- Product brief.
- MVP scope.
- Privacy model.
- UI/UX rules.
- Database design.
- Technical architecture.
- Development roadmap.

Wait for explicit approval before starting Stage 2.