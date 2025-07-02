# Cheetah Payroll Database Setup

This directory contains the complete database schema and security policies for the Cheetah Payroll application.

## Files

- **`schema.sql`** - Complete database schema with all tables, functions, triggers, and default data
- **`rls-policies.sql`** - Row Level Security policies for multi-tenant data access control

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. **Create Schema:**
   - Go to your Supabase project dashboard
   - Navigate to "SQL Editor"
   - Copy and paste the contents of `schema.sql`
   - Click "Run" to execute

2. **Apply RLS Policies:**
   - In the same SQL Editor
   - Copy and paste the contents of `rls-policies.sql`
   - Click "Run" to execute

### Option 2: Using Supabase CLI

1. **Initialize Supabase (if not already done):**
   ```bash
   supabase init
   ```

2. **Link to your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Apply schema:**
   ```bash
   supabase db reset --db-url "your-database-url"
   ```

4. **Or run the files directly:**
   ```bash
   psql "your-database-url" < schema.sql
   psql "your-database-url" < rls-policies.sql
   ```

## Schema Overview

### Core Tables

- **`profiles`** - User profiles extending Supabase auth
- **`companies`** - Company/organization records
- **`user_company_roles`** - Role-based access control
- **`departments`** - Organizational departments
- **`staff_members`** - Employee records with comprehensive fields

### Payroll Configuration

- **`payment_types`** - Configurable payment categories (Basic Pay, Allowances, etc.)
- **`deduction_types`** - Configurable deduction categories (Loans, RSSB, etc.)
- **`staff_payments`** - Individual staff payment assignments
- **`staff_deductions`** - Individual staff deduction records

### Payroll Processing

- **`payroll_runs`** - Payroll processing batches
- **`payroll_calculations`** - Detailed payroll calculations per employee
- **`global_tax_settings`** - System-wide tax configuration
- **`company_tax_exemptions`** - Company-specific tax exemptions

### Custom Fields

- **`custom_field_definitions`** - User-defined field types
- **`staff_custom_fields`** - Values for custom fields per employee

## Security Features

### Row Level Security (RLS)

- **Multi-tenant Architecture**: Data is automatically filtered by company access
- **Role-based Permissions**: Different access levels for different user roles
- **Secure by Default**: All tables have RLS enabled with appropriate policies

### User Roles

1. **Primary Admin** - Superuser with access to all features
2. **App Admin** - Secondary superuser with same permissions
3. **Company Admin** - Manages assigned companies and users
4. **Payroll Preparer** - Creates and manages payroll runs
5. **Payroll Approver** - Reviews and approves payroll runs

## Default Data

The schema automatically includes:

- **Global Tax Settings** - Rwanda's current tax rates and bands
- **Default Payment Types** - Basic Salary for each company
- **Default Deduction Types** - RSSB and CBHI for each company

## Maintenance

### Backup

Always backup your database before applying schema changes:

```bash
pg_dump "your-database-url" > backup.sql
```

### Updates

When updating the schema:

1. Test changes in a development environment first
2. Create a backup of production data
3. Apply changes during low-usage periods
4. Verify all features work correctly after update

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your database user has CREATE privileges
2. **Function Exists**: Drop existing functions before recreating if needed
3. **RLS Issues**: Verify user roles are correctly assigned in `user_company_roles`

### Verification

After applying the schema, verify everything is working:

```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies exist
SELECT schemaname, tablename, policyname FROM pg_policies;

-- Verify default data
SELECT * FROM global_tax_settings;
SELECT * FROM payment_types LIMIT 5;
SELECT * FROM deduction_types LIMIT 5;
```

## Support

For issues with database setup:

1. Check Supabase project logs
2. Verify environment variables are set correctly
3. Ensure database URL and credentials are valid
4. Contact support with specific error messages
