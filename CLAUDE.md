# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Development Commands

- **Install dependencies**: `npm install`
- **Start development server**: `npm run dev` (Express backend)
- **Start frontend development**: `npm run frontend` (Webpack dev server)
- **Build backend**: `npm run build` (TypeScript compilation)
- **Build frontend**: `npm run build:frontend` (Webpack production build)
- **Run tests**: `npm test` (Jest test suite)

## Project Architecture

### Technology Stack

- **Frontend**: React 18 with TypeScript, React Router v7 for SPA routing
- **Backend**: Express.js with TypeScript (optional - can use Firebase directly)
- **Database**: Google Cloud Firestore (NoSQL document database)
- **Authentication**: Firebase Authentication
- **Build Tools**: Webpack for frontend bundling, TypeScript compiler for backend
- **Testing**: Jest with React Testing Library and jsdom environment

### Application Structure

The application is a unified full-stack payroll management system with all code in a single
repository:

- **Single Page App (SPA)**: React router handles `/login`, `/signup`, `/forgot-password` routes
- **Authentication Flow**: Login → Company Selection → Dashboard with all modules
- **Company-centric**: All data operations are scoped to selected company
- **Role-based Access**: 5 user roles (primary_admin, app_admin, company_admin, payroll_approver,
  payroll_preparer)

### Core Modules

1. **Dashboard** (`src/components/Dashboard.tsx`) - Company overview and metrics
2. **Staff Management** (`src/components/StaffList.tsx`, `src/staff.ts`) - Employee CRUD operations
3. **Payments** (`src/components/PaymentsList.tsx`, `src/payments.ts`) - Salary and allowance
   management
4. **Deductions** (`src/components/DeductionsList.tsx`, `src/deductions.ts`) - Loan and deduction
   tracking
5. **Payroll Processing** (`src/components/PayrollList.tsx`, `src/payroll.ts`) - Tax calculations
   and payroll runs
6. **Reports** (`src/components/Reports.tsx`) - Statutory and management reporting

### Data Layer Architecture

- **Firestore Integration**: Real-time listeners in `src/*.ts` utility files
- **Company Isolation**: All data scoped to `/companies/{companyId}` collections
- **Type Safety**: Shared types defined in `src/types.ts`
- **Authentication**: Handled in `src/auth.ts` with Firebase Auth

### Key Features

- **Import/Export**: CSV/Excel import/export for all data types with validation
- **Tax Calculations**: Rwanda-specific PAYE, Pension, Maternity, CBHI, RAMA calculations
- **Approval Workflow**: Payroll preparer creates, payroll approver reviews/approves
- **PDF Generation**: Payslips and reports using jsPDF
- **Theme System**: Light/Dark/System theme support with localStorage persistence

### Testing Strategy

- Jest configuration in `jest.config.js` with jsdom environment
- React Testing Library for component testing
- Test setup in `setupTests.ts`
- Example test in `src/__tests__/StaffList.test.tsx`

### Deployment

- **Frontend**: Firebase Hosting (see `Deployment.md`)
- **Database**: Google Cloud Firestore
- **Environment Variables**: `.env` file with Firebase config (not committed)
- **Build Output**: `dist/` directory for production builds

### Important Patterns

- **Lazy Loading**: Main components are lazy-loaded in `src/App.tsx`
- **Company Context**: All operations require a selected company
- **Real-time Updates**: Firestore listeners provide live data synchronization
- **Error Handling**: Comprehensive validation in import/export operations
- **Accessibility**: ARIA support and keyboard navigation throughout

See `Blueprint.md` for complete business requirements and tax calculation specifications.
