# ConsignO Cloud Playwright Demo

Playwright end-to-end automation project for validating a critical business workflow in ConsignO Cloud.

## Overview
This repository demonstrates practical browser automation against a real application flow, covering login, project creation, document upload, signer assignment, field configuration, signing order setup, launch, and logout.

## What it demonstrates
- Playwright-based end-to-end testing
- Validation of multi-step business workflows
- Authenticated browser automation
- Test setup for repeatable execution against a live application flow

## Workflow covered
- sign in
- create a new project
- upload a document
- add a signer
- add and assign a text field
- configure signing order
- launch and save the project
- log out

## Requirements
- Node.js 18+
- npm
- Valid application credentials

## Setup
```bash
npm install
npx playwright install
cp .env.example .env
```

Then fill in `.env` with valid credentials.

## Run
```bash
npm run auth
npm run test
```

## Tech Stack
- Playwright
- Node.js
- Environment-based test configuration

## Purpose
This project showcases practical test automation for a business-critical workflow, with emphasis on reliability, repeatability, and realistic end-to-end validation.
