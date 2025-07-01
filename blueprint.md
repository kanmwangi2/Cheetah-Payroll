# Cheetah Payroll - Application Blueprint

**Version:** 2.0 (Supabase Backend & Vercel Deployment)
**Date:** 2025-07-01

## 1. Introduction

### 1.1. Purpose

Cheetah Payroll is a modern, web-based application designed to simplify and manage company payroll and HR-related tasks, specifically tailored for Rwandan statutory requirements. It provides a user-friendly, multi-company platform for managing staff, payments, deductions, payroll processing, and regulatory reporting.

### 1.2. Tech Stack

-   **Framework:** Next.js (with App Router)
-   **Language:** TypeScript
-   **UI Library:** React with ShadCN UI components
-   **Styling:** Tailwind CSS
-   **Backend:** Supabase (PostgreSQL database with real-time capabilities)
-   **Authentication:** Supabase Auth
-   **File Storage:** Supabase Storage (for profile pictures, documents)
-   **Hosting:** Vercel
-   **AI/Generative Features:** Genkit (scaffolded, not yet implemented)

### 1.3. Style & Appearance

-   **Primary Color:** Soft indigo (`#667EEA`)
-   **Background (Dark Mode):** Dark, desaturated indigo (`#2D3748`)
-   **Accent Color:** Pale blue (`#A3BFFA`)
-   **Font:** 'Inter' (sans-serif)
-   **Layout:** A consistent three-part layout is used across the main application: a collapsible left navigation sidebar, a top header displaying the current company context and user menu, and a central content area.

---

## 2. Core Architecture & Concepts

### 2.1. Multi-Company Architecture

The application is designed to manage multiple distinct company profiles from a single instance. All operational data is strictly partitioned by a `companyId`.

-   **Company-Scoped Data:** Staff records, payment configurations, deduction records, payroll runs, custom field definitions, payment/deduction types, departments, and company-specific settings.
-   **Global Data:** User accounts, the master list of companies, global tax configurations, and the avatar image.

### 2.2. Database Architecture (Supabase PostgreSQL)

All application data is stored in a Supabase PostgreSQL database with Row Level Security (RLS) policies for data isolation and security. This provides:
-   **Persistent Data Storage:** All data is stored centrally and accessible from any device.
-   **Real-time Updates:** Live updates across multiple sessions using Supabase's real-time capabilities.
-   **Automatic Backups:** Built-in database backups and point-in-time recovery.
-   **Scalability:** Handles multiple concurrent users and companies efficiently.
-   **Data Security:** Row Level Security ensures users can only access data they're authorized to see.

#### 2.2.1. Database Schema Overview

**Core Tables:**
- `profiles` - User profile information (extends Supabase auth.users)
- `companies` - Company master records
- `user_company_roles` - Junction table for user-company-role relationships
- `staff_members` - Employee records (company-scoped)
- `custom_field_definitions` - Company-specific custom fields
- `staff_custom_fields` - Values for custom fields per staff member
- `payment_types` - Company payment component definitions
- `staff_payments` - Payment configurations per staff member
- `deduction_types` - Company deduction category definitions  
- `staff_deductions` - Individual deduction records
- `payroll_runs` - Payroll processing sessions
- `payroll_calculations` - Detailed calculation results per employee per run
- `departments` - Company departments
- `global_tax_settings` - System-wide tax configuration

#### 2.2.2. Row Level Security (RLS)

All tables implement RLS policies to ensure:
- Users can only access companies they're assigned to
- Global admins have access to all data
- Company-specific data is isolated by `company_id`
- Users can only modify data according to their role permissions

### 2.3. User Roles & Access Control

A role-based access control (RBAC) system governs user permissions, implemented through Supabase RLS policies and application-level checks:

-   **Primary Admin:** The superuser with the highest level of access. Manages all global settings (companies, users, taxes) and has full operational control over all companies. This role cannot be deleted or easily changed.
-   **App Admin:** A secondary superuser with the same permissions as the Primary Admin.
-   **Company Admin:** Manages specifically assigned companies. Can configure company details, settings, and manage 'Payroll Preparer' and 'Payroll Approver' users within their assigned companies.
-   **Payroll Preparer:** Can create and manage draft payroll runs, configure staff payments, and manage deductions for their assigned companies.
-   **Payroll Approver:** Can review, approve, or reject payroll runs submitted for their assigned companies.

#### 2.3.1. Authentication Flow

1. **Login:** Users authenticate via Supabase Auth (email/password)
2. **Session Management:** Authentication state managed by Supabase client
3. **Role Resolution:** User roles and company assignments fetched from `user_company_roles` table
4. **Company Selection:** Users select active company context (stored in local session)
5. **Authorization:** All data access filtered by user roles and company assignments

### 2.4. Deployment & Infrastructure

#### 2.4.1. Vercel Hosting
- **Frontend Deployment:** Next.js app deployed to Vercel with automatic deployments from Git
- **Serverless Functions:** API routes run as Vercel serverless functions
- **Environment Variables:** Supabase credentials and other secrets managed via Vercel environment variables
- **Custom Domain:** Production domain configured through Vercel DNS

#### 2.4.2. Supabase Configuration
- **Database:** PostgreSQL instance with connection pooling
- **Authentication:** Supabase Auth with email/password provider
- **Storage:** File uploads (profile pictures, documents) stored in Supabase Storage buckets
- **Edge Functions:** Optional server-side logic for complex calculations or integrations
- **Real-time:** WebSocket connections for live data updates

---

## 3. Payroll Calculation Engine

The payroll calculation is the core of the application, designed for accuracy and flexibility based on Rwandan regulations. It runs in a specific, multi-stage sequence for each employee.

### 3.1. Stage 1: Gross Salary Calculation

This stage calculates the total gross earnings for an employee by processing each defined `Payment Type` sequentially based on its `order` number.

1.  **Sorting:** The system fetches all `PaymentType` definitions for the company and sorts them by their `order` property. Core types "Basic Pay" (order 1) and "Transport Allowance" (order 2) are always processed first.
2.  **Iterative Processing:** The system loops through the sorted payment types one by one.
    -   **`Gross` Type:** If a payment type is marked as "Gross", its configured amount is directly added to the employee's running total gross salary.
    -   **`Net` Type:** If a payment type is marked as "Net", the system treats its configured amount as the **target take-home value for that specific component**. It then performs a "gross-up" calculation using an iterative approximation method (`findAdditionalGrossForNetIncrement`) to determine the precise gross amount needed to achieve that target net after all taxes and deductions on the *cumulative* gross salary are considered. This ensures accuracy even with progressive tax bands.
3.  **Final Gross Salary:** The sum of the calculated gross amounts for all payment types constitutes the employee's `totalGrossSalary` for the period.

### 3.2. Stage 2: Statutory Deductions

Once the `totalGrossSalary` is determined, statutory deductions are calculated based on it and its components.

-   **PAYE (Pay As You Earn):** Calculated based on the `totalGrossSalary` and the progressive income tax bands defined in the Global Tax Settings.
-   **Pension (RSSB):** Calculated as a percentage of the `totalGrossSalary`.
-   **Maternity (RSSB):** Calculated as a percentage of the (`totalGrossSalary` - `Transport Allowance`).
-   **RAMA (Medical Insurance):** Calculated as a percentage of the `Basic Pay` component only.
-   **CBHI (Community Health Insurance):** Calculated as a percentage of the `Net Pay Before CBHI` (which is `totalGrossSalary` - PAYE - Employee RSSB/RAMA).

### 3.3. Stage 3: Other Deductions Application

After statutory deductions, other voluntary or assigned deductions (like loans, advances) are applied.

1.  **Sorting:** The system sorts all active `DeductionType` definitions for the company by their `order` property.
2.  **Sequential Application:** It processes each deduction type in order. The amount applied is the **lesser** of:
    -   The configured `monthlyDeduction` for that item.
    -   The remaining `balance` of that deduction item.
    -   The available `Net Pay After CBHI`.
3.  **No Negative Pay:** This system ensures that the application of these deductions will not result in a final net pay below zero. If funds are insufficient, only a partial amount is deducted, or the deduction is skipped for that run.
4.  **Final Net Pay:** The final take-home pay is `Net Pay After CBHI` minus the `Total Applied Deductions`.

---

## 4. Application Pages

This section provides a high-level overview of each page. For detailed descriptions of forms, fields, and data structures, see **Section 6: Forms & Data Structures**.

### 4.1. Authentication & Company Selection

-   **Login (`/`)**: Supabase Auth integration with email and password authentication. Includes password reset functionality.
-   **Company Selection (`/select-company`)**: Post-login screen where users choose their company context from companies they have access to. Selected company stored in session. Provides access to `Application Settings` for global admins.

### 4.2. Global Settings (Admin Only)

Accessed from the Company Selection screen.

-   **Application Settings (`/settings/application`)**: A tabbed interface for global management.
    -   **Company Management Tab**: CRUD interface for all company records in the system.
    -   **User Management Tab**: CRUD interface for all user accounts. Admins can assign roles and company access.
    -   **Global Taxes Tab**: Configure PAYE bands, RSSB (Pension, Maternity), RAMA, and CBHI rates applicable to all companies.

### 4.3. Main Application (`/app`)

#### 4.3.1. Dashboard (`/app/dashboard`)

The landing page after selecting a company.
-   **Functionality:** Displays key metrics for the current company context in summary cards (Total Active Employees, Next Payroll Run, Total Payroll Cost, Total Deductions).

#### 4.3.2. Staff Management (`/app/staff`)

A tabbed interface for all staff-related operations.
-   **Staff Members Tab**: A paginated table listing all staff. Supports search, add, edit, and bulk delete.
-   **Custom Fields Tab**: Define and manage company-specific data fields.

#### 4.3.3. Payments (`/app/payments`)

A tabbed interface for managing employee payment structures.
-   **Payments Tab**: A paginated list of all staff. Users can configure payment amounts for each staff member against the company's defined `Payment Types`.
-   **Payment Types Tab**: Define company-wide pay components (e.g., House Allowance, Overtime).

#### 4.3.4. Deductions (`/app/deductions`)

A tabbed interface for managing all staff deductions.
-   **Deductions Tab**: Manage individual, ongoing staff deductions (e.g., a specific loan for an employee).
-   **Deduction Types Tab**: Define categories for deductions (e.g., Loan, Advance, Staff Welfare).

#### 4.3.5. Payroll Processing

-   **Payroll List (`/app/payroll`)**: A paginated list of all payroll runs. Users can create new runs here.
-   **Payroll Detail Page (`/app/payroll/[id]`)**: The main payroll processing workspace. Triggers calculations, displays detailed results, and handles workflow actions (Approve, Reject, etc.).

#### 4.3.6. Reports (`/app/reports`)

A tabbed interface for generating all official documents from "Approved" payroll runs.
-   **Statutory Reports Tab**: Select an approved payroll period to generate a suite of statutory reports.
-   **Payslips Tab**: Generate PDF payslips for individual employees or in bulk.
-   **Deduction History Tab**: Generate a PDF report showing a deduction's payment history.

#### 4.3.7. Settings (User Menu)

-   **User Profile (`/app/settings/profile`)**: Manage personal details (name, email, phone), password, and profile picture.
-   **Company Settings (`/app/settings/company`)**: Manage settings for the currently active company (Profile, Tax Exemptions, Departments, Company Users).

---

## 5. Report Details

### 5.1. Statutory Reports

-   **Ishema Report**: `Last Name`, `First Name`, `RSSB Number`, `ID or Passport Number`, `Category`, `Is RAMA Member`, `Basic Salary`, `Transport/House/Other Benefit in Kind`, `Transport/House/Other Cash Allowance`, etc.
-   **PAYE Report**: `TIN`, `RSSB Number`, `National ID/Passport`, `Last Name`, `First Name`, `Return Type`, `Dates`, `Basic Salary`, Allowances, `PAYE Taxable Base`, `PAYE`, `RSSB/RAMA Contributions`.
-   **Pension Report**: `RSSB Number`, Names, `Gross Salary`, `Transport Allowance`, `Pension (Employee/Employer)`, `Employer Occupational Hazards`, `Total Contributions`.
-   **Maternity Report**: `RSSB Number`, Names, `Amount of Remuneration` (Gross - Transport), `Number of Days`, `Status`, `Total contributions`.
-   **CBHI Report**: `RSSB Number`, `National ID/Passport`, Names, `Basic Salary`, Allowances, `PAYE Taxable Base`, `PAYE`, `CBHI`.
-   **Net Salaries Report**: `First Name`, `Last Name`, `Staff Number`, `Bank name`, `Bank code`, `Bank account no.`, `Bank branch`, `Net Pay`.

### 5.2. Payslip

A detailed PDF document for each employee, containing:
-   Company and employee details.
-   **Earnings Section:** Itemized list of all non-zero payment components (Basic Pay, Allowances) and Total Gross Salary.
-   **Deductions Section:** Itemized lists for Statutory Deductions (PAYE, RSSB, RAMA, CBHI) and Other Deductions (Loans, Advances), each with a subtotal.
-   **Final Summary:** Total Gross Salary, Total Deductions, and the final **Net Pay**.

### 5.3. Deduction History Report

A PDF report showing the lifecycle of a single deduction for one employee.
-   **Columns:** `Payroll Month`, `Amount Deducted`, `Running Balance`.
-   Includes a starting entry showing the original amount and date.

---

## 6. Forms & Data Structures

This section provides a detailed breakdown of each major data entry form and data display structure.

### 6.1. Staff Form (`/app/staff`)

-   **Purpose:** To add a new staff member or edit an existing one for the selected company. This form is a multi-section dialog.
-   **Data Persistence:** All changes saved to Supabase database with real-time updates.
-   **Import/Export:** Data can be imported/exported via CSV. The template `staff_import_template.csv` includes all standard and custom fields.
-   **Form Fields:**
    -   **Personal & Employment:** `First Name`, `Last Name`, `Staff Number`, `Email`, `Phone`, `RSSB Number`, `Employee Category` (Dropdown: Permanent, Casual, etc.), `Gender` (Dropdown), `Birth Date`, `Department`, `Designation`, `Employment Date`, `Nationality`, `ID/Passport No`.
    -   **Address:** `Province`, `District`, `Sector`, `Cell`, `Village`.
    -   **Bank Details:** `Bank Name`, `Bank Code`, `Account No.`, `Branch`.
    -   **Emergency Contact:** `Name`, `Relationship` (Dropdown), `Phone`.
    -   **Employment Status:** `Status` (Dropdown: Active, Inactive).
    -   **Custom Information:** This section dynamically includes an input field for each `CustomFieldDefinition` created for the company. The input type (Text, Number, Date) matches the field's definition.

### 6.2. Payment Configuration Form (`/app/payments`)

-   **Purpose:** To configure the monetary amounts for each payment type for a specific staff member.
-   **Data Persistence:** All changes saved to Supabase database with automatic validation.
-   **Import/Export:** Data can be imported/exported via CSV. The template `payments_import_template.csv` dynamically generates headers for `StaffID`, `StaffName`, and each defined `PaymentType`.
-   **Form Fields:**
    -   **Staff Member:** A dropdown to select the staff member (only on 'Add Staff Payment' dialog).
    -   **Dynamic Payment Fields:** The form dynamically displays a numeric input field for every `PaymentType` defined for the company (e.g., a field for 'Basic Pay', a field for 'House Allowance'). The label indicates the name and Gross/Net status of the type. The user enters the target amount for each.

### 6.3. Deduction Form (`/app/deductions`)

-   **Purpose:** To create or edit a specific, ongoing deduction for an employee (e.g., a specific loan).
-   **Data Persistence:** All deduction records stored in Supabase with automatic balance tracking.
-   **Import/Export:** Data can be imported/exported via CSV (`deductions_import_template.csv`).
-   **Form Fields:**
    -   `Staff Member`: Dropdown to select the employee.
    -   `Deduction Type`: Dropdown to select a pre-defined `DeductionType` (e.g., Loan, Advance).
    -   `Description`: Text field for a description (e.g., "Laptop Purchase Loan").
    -   `Original Amount`: The total amount of the deduction to be repaid.
    -   `Monthly Deduction`: The amount to be deducted each payroll run.
    -   `Deducted So Far`: The cumulative amount already deducted (editable, typically for importing existing records).
    -   `Start Date`: The date the deduction should become active.

### 6.4. Payroll Detail View Table (`/app/payroll/[id]`)

-   **Purpose:** This is not a data entry form but a detailed table displaying the calculated results of a payroll run. Columns with a total value of zero for the entire run are hidden automatically.
-   **Columns & Calculations:**
    -   **Employee Info:** `First Name`, `Last Name`, `Staff No.`, `RSSB No`. (Sourced from `StaffMember` record).
    -   **Dynamic Earnings Columns:** A column is shown for each `PaymentType` with a non-zero total.
        -   `[Payment Type Name]` (e.g., Basic Pay, House Allowance): The calculated gross value for that specific payment component for that employee.
    -   **Core Statutory & Summary Columns:**
        -   `Total Gross`: `SUM` of all dynamic earnings columns for the employee.
        -   `Employer Pension`: `totalGrossSalary * pensionEmployerRate`.
        -   `Employee Pension`: `totalGrossSalary * pensionEmployeeRate`.
        -   `Total Pension`: `Employer Pension + Employee Pension`.
        -   `Employer Maternity`: `(totalGrossSalary - transportAllowanceGross) * maternityEmployerRate`.
        -   `Employee Maternity`: `(totalGrossSalary - transportAllowanceGross) * maternityEmployeeRate`.
        -   `Total Maternity`: `Employer Maternity + Employee Maternity`.
        -   `Employer RAMA`: `basicPayGross * ramaEmployerRate`.
        -   `Employee RAMA`: `basicPayGross * ramaEmployeeRate`.
        -   `Total RAMA`: `Employer RAMA + Employee RAMA`.
        -   `Employer RSSB`: `Employer Pension + Employer Maternity + Employer RAMA`.
        -   `Employee RSSB`: `Employee Pension + Employee Maternity + Employee RAMA`.
        -   `PAYE`: Calculated based on `totalGrossSalary` and the progressive tax bands from Global Tax Settings.
        -   `Net Pay Before CBHI`: `totalGrossSalary - Employee RSSB - PAYE`.
        -   `CBHI Deduction`: `Net Pay Before CBHI * cbhiRate`.
        -   `Net Pay After CBHI`: `Net Pay Before CBHI - CBHI Deduction`.
    -   **Dynamic Deduction Columns:** A column is shown for each `DeductionType` with a non-zero total.
        -   `[Deduction Type Name]` (e.g., Loan, Advance): The sum of all deductions of this type applied to the employee in this run.
    -   **Final Summary Columns:**
        -   `Total Applied Deductions`: `SUM` of all dynamic deduction columns for the employee.
        -   `Final Net Pay`: `Net Pay After CBHI - Total Applied Deductions`.

### 6.5. Other Administrative Forms

-   **New Payroll Run Form (`/app/payroll`):** `Month` (Dropdown), `Year` (Dropdown). Creates a new draft payroll run.
-   **Payment Type Form (`/app/payments`):** `Name` (Text), `Type` (Radio: Gross/Net). Defines a new pay component.
-   **Deduction Type Form (`/app/deductions`):** `Name` (Text). Defines a new category for deductions.
-   **Custom Field Form (`/app/staff`):** `Field Name` (Text), `Type` (Dropdown: Text, Number, Date). Defines a new custom field.
-   **Company Profile Form (`/app/settings/company`):** `Company Name`, `Registration Number`, `Address`, `Primary Business`, `TIN`, `Email`, `Phone`.
-   **Tax Exemption Form (`/app/settings/company`):** Toggles for `PAYE`, `Pension`, `Maternity`, `RAMA`, `CBHI`.
-   **Department Form (`/app/settings/company`):** `Name` (Text), `Description` (Textarea).
-   **User Profile Form (`/app/settings/profile`):** `First Name`, `Last Name`, `Email`, `Phone`.
-   **Password Change Form (`/app/settings/profile`):** `Current Password`, `New Password`, `Confirm New Password`.
-   **Global Company Management Form (`/settings/application`):** `Company Name`, `TIN Number`, `Address`, `Email`, `Phone`, `Primary Business`.
-   **Global User Management Form (`/settings/application`):** `First Name`, `Last Name`, `Email`, `Phone`, `Password`, `Role` (Dropdown), `Assigned Companies` (Multi-select Checkbox).
-   **Global Taxes Form (`/settings/application`):** Numeric inputs for all PAYE band limits and rates, and all RSSB/RAMA/CBHI contribution percentages.

---

## 7. Technical Implementation

### 7.1. Supabase Integration

#### 7.1.1. Database Schema Migration
```sql
-- Example table structure for companies
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  tin_number VARCHAR,
  registration_number VARCHAR,
  address TEXT,
  email VARCHAR,
  phone VARCHAR,
  primary_business VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policy Example
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view companies they have access to" ON companies
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM user_company_roles 
      WHERE company_id = companies.id
    ) OR 
    EXISTS (
      SELECT 1 FROM user_company_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('primary_admin', 'app_admin')
    )
  );
```

#### 7.1.2. Authentication Setup
- **Provider Configuration:** Email/password authentication enabled
- **Custom Claims:** User roles and company assignments managed via database triggers
- **Session Management:** Automatic session refresh and token validation
- **Password Policy:** Configurable password requirements and reset flows

#### 7.1.3. Real-time Subscriptions
- **Payroll Updates:** Live updates during payroll calculation and approval processes
- **Staff Changes:** Real-time sync when staff members are added/modified
- **System Notifications:** Instant alerts for approval requests and system events

### 7.2. Vercel Deployment Configuration

#### 7.2.1. Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app

# Optional: Email Service (for notifications)
RESEND_API_KEY=your-resend-api-key
```

#### 7.2.2. Build Configuration (vercel.json)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

#### 7.2.3. Performance Optimization
- **Edge Functions:** Critical API routes deployed to Vercel Edge Runtime
- **Database Connection Pooling:** Supabase connection pooling for optimal performance
- **Caching Strategy:** Static generation for reports, ISR for dynamic content
- **Image Optimization:** Vercel's built-in image optimization for profile pictures

### 7.3. Data Migration Strategy

#### 7.3.1. From IndexedDB to Supabase
For existing installations using IndexedDB:
1. **Export Tool:** Utility to export all IndexedDB data to JSON format
2. **Import API:** Secure endpoint to bulk import data to Supabase
3. **Validation:** Data integrity checks during migration process
4. **Rollback:** Ability to maintain IndexedDB backup during transition

#### 7.3.2. Backup and Recovery
- **Automated Backups:** Daily database backups via Supabase
- **Point-in-time Recovery:** Ability to restore to any point in the last 7 days
- **Export Functionality:** Regular data exports in multiple formats (JSON, CSV)
- **Disaster Recovery:** Multi-region backup strategy for critical data

### 7.4. Security Considerations

#### 7.4.1. Data Protection
- **Encryption:** All data encrypted at rest and in transit
- **RLS Policies:** Comprehensive Row Level Security for data isolation
- **API Security:** Rate limiting and request validation on all endpoints
- **Audit Logging:** Comprehensive audit trail for all data modifications

#### 7.4.2. Compliance
- **GDPR Compliance:** Data deletion and export capabilities
- **Data Residency:** Configurable data storage regions
- **Access Controls:** Granular permissions and role-based access
- **Session Security:** Secure session management with automatic timeout

---
