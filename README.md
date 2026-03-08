# ConsignO Cloud Playwright Demo

This repository contains a Playwright end-to-end test for a critical user flow in ConsignO Cloud.

The scenario covers:

- signing into the application
- creating a new project
- uploading a document
- adding a signer
- adding and assigning a text field
- setting the signing order
- launching and saving the project
- logging out at the end of the flow

## Project Layout

```text
playwright-test/
├── auth.setup.spec.ts
├── create-project.spec.ts
├── playwright.config.ts
├── tests/
│   └── financial_inventory_report-8.pdf
└── .env.example
```

## Requirements

- Node.js 18+
- npm

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browsers:

```bash
npx playwright install
```

3. Create a local environment file:

```bash
cp .env.example .env
```

4. Fill in `.env` with valid credentials:

```env
EMAIL=your.email@example.com
PASSWORD=your-password
```

## Running the Test

If direct UI login is unreliable for your account, create an authenticated session once:

```bash
npm run auth
```

This opens a headed browser. Complete the login manually and wait for the dashboard to load. The session is then saved to `playwright/.auth/user.json`.

Run the full suite:

```bash
npm run test
```

Run only the critical workflow:

```bash
npm run test -- --grep "Create and configure signature project"
```

Open the Playwright report:

```bash
npm run report
```

## Notes

- `.env` is intentionally ignored and should never be committed.
- `playwright/.auth/` is local session state and is also ignored.
- The test keeps the selectors account-agnostic where possible, but it is still written against the current ConsignO Cloud UI.
