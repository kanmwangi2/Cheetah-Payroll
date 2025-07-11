# Cheetah Payroll

A unified, full-stack payroll management application for Rwanda, with all backend, frontend, and
shared code in a single repository root.

- See [Blueprint.md](./Blueprint.md) for full product/business requirements.
- See [Deployment.md](./Deployment.md) for deployment instructions.

## Project Structure

- `/src`: All source code (API, UI, shared logic)
- `/public`: Static assets (for frontend)
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `.env`: Environment variables (not committed)
- `Blueprint.md`: Product blueprint
- `Deployment.md`: Deployment guide

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in your Firebase config (see Firebase console).
3. **Run in development:**
   ```sh
   npm run frontend
   # or
   npm run dev
   ```
4. **Build for production:**
   ```sh
   npm run build:frontend
   ```
5. **Run tests:**
   ```sh
   npm test
   ```

## Testing

- Uses **Jest** and **React Testing Library** for unit and integration tests.
- All major flows (auth, company selection, staff/payments/deductions/payroll CRUD, import/export,
  reporting) should be covered.
- To add tests, create files in `src/__tests__` with `.test.tsx` or `.test.ts` extension.

## Accessibility & Security

- Follows WCAG and ARIA best practices for forms, modals, and navigation.
- Firestore security rules enforce strict RBAC and company-level access.
- No sensitive secrets are exposed to the frontend; only public Firebase config is used.

## Deployment

### Quick Deploy Commands
```sh
# Full deployment workflow (recommended)
npm run predeploy && npm run deploy

# Individual deployment steps
npm run build:frontend:clean  # Clean and build frontend
npm run test:ci               # Run tests in CI mode
npm run deploy                # Deploy to Firebase hosting
npm run deploy:full           # Deploy everything (hosting + functions)
```

### Available Deploy Scripts
- `npm run deploy` - Deploy frontend to Firebase hosting
- `npm run deploy:full` - Deploy everything (hosting + functions + rules)
- `npm run deploy:functions` - Deploy only Firebase functions
- `npm run deploy:preview` - Deploy to preview channel
- `npm run deploy:staging` - Deploy to staging channel
- `npm run predeploy` - Run build and tests before deployment

### Deployment Setup
- See [Deployment.md](./Deployment.md) for complete Firebase setup instructions.
- Production build uses Webpack with code splitting, compression, and environment variable support.
- Firebase configuration is already set up in `firebase.json`.

---

For full technical and business requirements, see [Blueprint.md](./Blueprint.md).
