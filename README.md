# Cheetah Payroll

A modern, web-based payroll management application designed for Rwandan statutory requirements. Built with Next.js, TypeScript, Supabase, and Tailwind CSS.

## Features

- **Multi-company Management** - Manage multiple companies from a single instance
- **Role-based Access Control** - Granular permissions for different user types
- **Staff Management** - Complete employee records with custom fields
- **Payment Configuration** - Flexible payment types (gross/net) with automatic calculations
- **Deduction Management** - Track loans, advances, and other deductions
- **Advanced Payroll Engine** - Rwanda-compliant PAYE, RSSB, RAMA, CBHI calculations
- **Comprehensive Reporting** - Statutory reports, payslips, and deduction histories
- **Real-time Updates** - Live data synchronization across sessions
- **CSV Import/Export** - Bulk data operations

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: ShadCN UI + Radix UI
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone <repository-url>
cd cheetah-payroll
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Run the database migration:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Run migrations
   supabase db push
   ```

### 3. Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   NEXTAUTH_SECRET=your-random-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 5. Create First Admin User

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Create a new user with email and password
4. In the SQL Editor, run:
   ```sql
   -- Create a company
   INSERT INTO companies (name, email) 
   VALUES ('Your Company Name', 'admin@company.com');
   
   -- Give the user primary admin role
   INSERT INTO user_company_roles (user_id, company_id, role)
   SELECT 
     'user-uuid-from-auth-users-table',
     id,
     'primary_admin'
   FROM companies WHERE name = 'Your Company Name';
   ```

## User Roles

- **Primary Admin** - Superuser with access to all features and companies
- **App Admin** - Secondary superuser with same permissions as Primary Admin
- **Company Admin** - Manages assigned companies and their users
- **Payroll Preparer** - Creates and manages payroll runs
- **Payroll Approver** - Reviews and approves payroll runs

## Payroll Calculation

The system implements Rwanda's statutory requirements:

### Tax Rates (Default)
- **PAYE**: 0% (up to 60K), 20% (60K-100K), 30% (100K+)
- **Pension**: 3% employee, 5% employer
- **Maternity**: 0.25% employee, 0.25% employer  
- **RAMA**: 7.5% employee, 7.5% employer
- **CBHI**: 2.5% of net pay before CBHI

### Calculation Flow
1. **Gross Salary**: Processes payment types in order (Basic Pay, Transport, others)
2. **Statutory Deductions**: PAYE, RSSB (Pension + Maternity), RAMA
3. **CBHI**: Applied to net pay after statutory deductions
4. **Other Deductions**: Loans, advances, etc. (cannot exceed available net pay)

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

## Development

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── app/               # Main application
│   └── settings/          # Global admin settings
├── components/            # React components
│   ├── ui/               # Base UI components
│   └── forms/            # Form components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   ├── payroll-engine.ts # Payroll calculations
│   └── utils.ts          # Helper functions
└── types/                # TypeScript definitions
```

### Key Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Type checking
```

### Database Schema Generation

To regenerate TypeScript types from your Supabase schema:

```bash
npm run db:generate-types
```

## Features in Detail

### Staff Management
- Complete employee profiles with address and emergency contacts
- Custom fields for company-specific data
- Department assignments
- Employment status tracking
- CSV import/export

### Payment Configuration
- Flexible payment types (Basic Pay, Allowances, etc.)
- Gross vs Net payment modes
- Per-employee payment configuration
- Bulk import via CSV

### Deduction Management  
- Deduction categories (Loans, Advances, etc.)
- Individual deduction tracking
- Automatic balance calculations
- Payment history

### Payroll Processing
- Draft → Calculate → Approve workflow
- Detailed calculation breakdowns
- Error handling and validation
- Approval/rejection with comments

### Reporting
- Statutory reports (PAYE, RSSB, RAMA, CBHI)
- Individual and bulk payslips
- Deduction history reports
- CSV and PDF export options

## Security

- Row Level Security (RLS) policies
- Role-based data access
- Company data isolation
- Secure authentication via Supabase
- Audit trails for data changes

## Support

For issues and feature requests, please create an issue in the project repository.

## License

This project is licensed under the MIT License.
