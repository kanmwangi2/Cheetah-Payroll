# Payroll Management App - Product Blueprint

## Overview

A comprehensive multi-company payroll management application designed to handle complex payroll
processing, tax calculations, and statutory reporting with role-based access control. The application
features enhanced import/export functionality, comprehensive deduction management with balance tracking,
and streamlined user experience with improved navigation and permissions.

## Recent Enhancements (2025)

### User Experience Improvements
- **Enhanced Navigation**: Utilities now accessible from all pages via top header button
- **Improved Dialog UX**: Added proper padding and styling to close buttons across all dialogs
- **Theme Integration**: Dynamic logo support from global settings, consistent theme switching
- **Performance Optimization**: Dashboard loading optimized with parallel query execution (6x faster)

### Payroll Module Enhancements
- **Smart Period Selection**: Month/year picker with YYYY-MM format and current month default
- **Role-Based Permissions**: Edit/delete controls based on approval status and user roles
- **Balance Integration**: Automatic deduction balance updates when payroll is processed/deleted
- **Streamlined Interface**: Removed unnecessary import/export, renamed to "Create New Payroll"

### Deduction Management System
- **Real-Time Balance Tracking**: Calculated balance field with payroll integration
- **Payment Validation**: Balance validation controls prevent over-payment scenarios
- **Monthly Amount Display**: Prominent monthly installment column for better visibility
- **Payment Recording**: Enhanced payment modal with balance information and limits

### Staff Management Features
- **Staff Number Field**: Unique identifier system for all staff records
- **Department Management**: Dynamic dropdown populated from existing company departments
- **Employment Tracking**: Optional end date field for comprehensive employment history
- **Enhanced Import/Export**: CSV templates include all form fields with validation

### Data Import/Export Improvements
- **Universal Date Support**: DD/MM/YYYY and YYYY-MM-DD format compatibility across all modules
- **Enhanced Validation**: Comprehensive field validation with detailed error reporting
- **Complete Field Coverage**: Import/export templates include all form details
- **Progress Tracking**: Real-time import progress with Firebase integration

### Company & Authentication
- **Smart Company Selection**: Single combobox with search, role-based filtering
- **Enhanced Access Control**: Users see only assigned companies based on role
- **Dynamic Branding**: Global logo integration in Application Administration
- **Improved Layout**: Fixed button overlaps and spacing issues

### Reports & Utilities Reorganization
- **Focused Reporting**: Removed management reports, streamlined to core functionality
- **Reorganized Utilities**: FAQ, Documentation, Advanced Tools, Audit Trail structure
- **Integrated Notifications**: Moved from utilities to global settings for better organization
- **Enhanced Accessibility**: Utilities visible from all pages with improved navigation

## User Types & Permissions

### 1. Primary Admin

- **Role**: Ultimate system administrator
- **Permissions**: Full application rights across all companies
- **Restrictions**:
  - Only one Primary Admin allowed
  - Cannot be deleted
  - Has access to all application-level settings
- **Key Responsibilities**:
  - Create and manage App Admins
  - Oversee entire application ecosystem
  - Manage global tax settings and brackets

### 2. App Admin

- **Role**: System administrator with broad access
- **Permissions**: Full application rights across all companies
- **Restrictions**:
  - Created by Primary Admin only
  - Can be deleted by Primary Admin
- **Key Responsibilities**:
  - Create and manage companies
  - Create and manage users across companies
  - Configure application-level settings
  - Access to all company data

### 3. Company Admin

- **Role**: Company-specific administrator
- **Permissions**: Full rights only to assigned company(s)
- **Restrictions**: Limited to specific companies
- **Key Responsibilities**:
  - Manage company-specific settings
  - Create and manage company users
  - Oversee company departments and structure
  - Access company-specific reports

### 4. Payroll Approver

- **Role**: Payroll validation specialist
- **Permissions**:
  - View payroll data
  - Approve payrolls created by others
  - Cannot create or modify payroll calculations
- **Key Responsibilities**:
  - Review payroll accuracy
  - Approve payroll for processing
  - Validate statutory compliance

### 5. Payroll Preparer

- **Role**: Payroll calculation specialist
- **Permissions**:
  - Create and calculate payrolls
  - Cannot approve payrolls
  - View staff and payment data
- **Key Responsibilities**:
  - Process payroll calculations
  - Generate payroll drafts
  - Prepare statutory reports

## Application Architecture

### Authentication & Company Selection Flow

1. User logs in with credentials
2. System validates user and determines accessible companies
3. User redirected to **Company Selection** page
4. After company selection, user redirected to Dashboard

### Company Selection Page

- **Primary Display**: List of accessible companies with selection interface
- **Special Access Panel**: "Application Settings" (visible only to Primary Admin and App Admins)
  - **Tab 1**: Company Management
  - **Tab 2**: User Management
  - **Tab 3**: Tax Configuration (PAYE, Pension, Maternity, CBHI, RAMA)
  - **Tab 4**: Global Application Settings

## Core Application Structure

### 🏠 Dashboard

- **Purpose**: Default home page and company overview
- **Features**:
  - Summary metrics for selected company
  - Quick access widgets
  - Recent activity feed
  - Key performance indicators (KPIs)
  - Staff count, active payrolls, pending approvals

### 👥 Staff Page

- **Purpose**: Employee management and records
- **Features**:
  - **Add Staff Form**:
    - First Name (required)
    - Last Name (required)
    - ID/Passport Number (required, unique)
    - RSSB Number (required)
    - Department (dropdown)
    - Personal Details:
      - Date of Birth
      - Gender
      - Marital Status
      - Contact Information (Phone, Email, Address)
      - Emergency Contact
      - Bank Details
      - Employment Details (Start Date, Position, Employment Type)
  - **Staff List**: Searchable and filterable table
  - **Staff Profile**: Detailed view with edit capabilities
  - **Import/Export Features**:
    - **CSV Import**: Bulk staff import with validation and error reporting
    - **Excel Import**: Support for .xlsx files with template download
    - **Data Export**: Export staff list to CSV, Excel, PDF formats
    - **Template Download**: Pre-formatted import templates
    - **Import History**: Track and audit all import operations

### 💰 Payments Page

- **Purpose**: Manage employee compensation components
- **Features**:
  - **Payment Types**:
    - Basic Salary
    - Transport Allowance
    - Overtime Allowance
    - Bonuses
    - Commission
    - Other Allowances
  - **Payment Configuration**:
    - Gross/Net designation toggle
    - Recurring/One-time setting
    - Employee assignment
    - Amount specification
    - Effective date range
  - **Payment List**: View all configured payments by employee
  - **Import/Export Features**:
    - **Bulk Payment Import**: CSV/Excel import for multiple payments
    - **Payment Templates**: Pre-formatted templates for common payment types
    - **Export Options**: Export payment data to CSV, Excel, PDF
    - **Bulk Operations**: Mass update and delete capabilities
    - **Validation Rules**: Real-time validation during import
    - **Error Reporting**: Detailed import error logs and corrections

### 📉 Deductions Page

- **Purpose**: Track and manage employee deductions
- **Features**:
  - **Deduction Types**:
    - Advances
    - Loans
    - Other Charges
    - Disciplinary Deductions
  - **Deduction Tracking**:
    - Outstanding balances
    - Payment history
    - Automatic payroll integration
  - **Deduction Reversal**: Automatic reversal when payroll is deleted
  - **Loan Management**: Installment tracking and scheduling
  - **Import/Export Features**:
    - **Bulk Deduction Import**: CSV/Excel import for multiple deductions
    - **Loan Import**: Structured loan data with repayment schedules
    - **Export Capabilities**: Export deduction data to CSV, Excel, PDF
    - **Deduction Templates**: Pre-formatted import templates
    - **Balance Reconciliation**: Import/export for balance verification

### 📊 Payroll Page

- **Purpose**: Process actual payroll calculations
- **Features**:
  - **Payroll Creation**:
    - Select payroll period
    - Choose employees
    - Review payments and deductions
  - **Calculation Engine**:
    - Tax calculations (PAYE, Pension, Maternity, CBHI, RAMA)
    - Gross-up calculations for net payments
    - **Iterative Gross-up Algorithm**:
      - Binary search (bisection method)
      - Goal-seeking algorithm
      - Stable convergence targeting net amount
      - Precision tolerance configuration
  - **Payroll Review**:
    - Line-by-line validation
    - Summary totals
    - Tax breakdown
  - **Approval Workflow**:
    - Preparer creates payroll
    - Approver reviews and approves
    - Status tracking
  - **Payroll Processing**:
    - Bank file generation
    - Statutory report preparation
    - Payslip generation
  - **Import/Export Features**:
    - **Payroll Export**: Export complete payroll to CSV, Excel, PDF
    - **Bank File Export**: Multiple bank formats (CSV, TXT, Excel)
    - **Backup/Restore**: Complete payroll data backup and restoration
    - **Audit Trail Export**: Export all payroll changes and approvals
    - **Comparative Reports**: Export period-to-period comparisons

### 📋 Reports Page

- **Purpose**: Generate statutory and management reports
- **Features**:
  - **Statutory Reports**:
    - PAYE Return (CSV, Excel, PDF export)
    - Pension Contribution Report (CSV, Excel, PDF export)
    - Maternity Fund Report (CSV, Excel, PDF export)
    - CBHI Contribution Report (CSV, Excel, PDF export)
    - RAMA Contribution Report (CSV, Excel, PDF export)
  - **Bank Reports**:
    - Payment instruction files (Multiple bank formats)
    - Bank reconciliation reports (CSV, Excel, PDF)
  - **Payslip Generation**:
    - **Individual Payslips**: High-quality PDF generation
    - **Bulk Payslip Generation**: PDF compilation for all employees
    - **Email Distribution**: Automated payslip email delivery
    - **Payslip Templates**: Customizable PDF templates
    - **Digital Signatures**: Optional digital signing for payslips
    - **Password Protection**: Optional PDF password protection
  - **Deduction Reports**:
    - **Outstanding Loan Balances**: PDF export with detailed breakdown
    - **Deduction Summary**: PDF reports with charts and analytics
    - **Payment History**: Comprehensive PDF reports with timelines
    - **Loan Amortization**: PDF schedules for individual loans
    - **Deduction Reconciliation**: PDF reports for audit purposes
  - **Management Reports**:
    - Payroll cost analysis (PDF, Excel, CSV)
    - Department-wise breakdown (PDF with charts)
    - Variance analysis (PDF with visual comparisons)
    - Historical trends (PDF with graphs and analytics)
  - **Export Features**:
    - **Batch Export**: Export multiple reports simultaneously
    - **Scheduled Exports**: Automated report generation and delivery
    - **Custom Formats**: Configurable export formats and layouts
    - **Report Archive**: Historical report storage and retrieval

### 🔧 Utilities

- **Purpose**: Information and support resources
- **Features**:
  - **FAQ**: Frequently asked questions
  - **Documentation**: User guides and tutorials
  - **Support**: Help desk and contact information
  - **System Information**: Version details and updates

## User Interface Design

### Top Navigation Bar

- **Left Side**: Company logo and name
- **Right Side** (from left to right):
  - 🌓 **Theme Toggle**: Light/Dark/System (default: System)
  - 👤 **User Avatar**: Profile picture with dropdown
    - User name
    - Role badge
    - Email address
    - "User Profile" link
    - "Company Settings" link (for admins)
    - 🔄 "Switch Company" link
    - 🚪 "Log Out" link

### Icon Usage

- Consistent icon library throughout application
- Icons for:
  - Navigation items
  - Action buttons
  - Status indicators
  - User roles
  - Document types
  - Settings categories

## Tax Configuration System

### Rwanda Tax Structure

#### 1. **PAYE (Pay As You Earn)**

- **Tax Type**: Progressive taxation system
- **Calculation Basis**: Total gross pay
- **Tax Brackets**:
  - RWF 0 - 60,000: 0%
  - RWF 60,001 - 100,000: 10%
  - RWF 100,001 - 200,000: 20%
  - RWF 200,001 and above: 30%
- **Calculation Method**: Progressive (cumulative brackets)

#### 2. **Pension Contribution**

- **Employer Rate**: 8% of total gross pay
- **Employee Rate**: 6% of total gross pay
- **Calculation Basis**: Total gross pay
- **Total Contribution**: 14% (8% employer + 6% employee)

#### 3. **Maternity Contribution**

- **Employer Rate**: 0.3% of qualifying gross pay
- **Employee Rate**: 0.3% of qualifying gross pay
- **Calculation Basis**: Total gross pay excluding transport allowance
- **Total Contribution**: 0.6% (0.3% employer + 0.3% employee)

#### 4. **CBHI (Community Based Health Insurance)**

- **Employee Rate**: 0.5% of net salary
- **Employer Rate**: 0% (employee only)
- **Calculation Basis**: Net salary before CBHI deduction
- **Calculation Order**: Applied after all other deductions except CBHI

#### 5. **RAMA (Rwanda Medical Aid)**

- **Employer Rate**: 7.5% of basic pay
- **Employee Rate**: 7.5% of basic pay
- **Calculation Basis**: Basic pay only (excludes allowances)
- **Total Contribution**: 15% (7.5% employer + 7.5% employee)

### Tax Calculation Sequence

The payroll calculation engine follows this specific order:

1. **Start with Total Gross Pay** (Basic Pay + All Allowances)
2. **Calculate PAYE** (Progressive brackets on Total Gross Pay)
3. **Calculate Pension** (14% total: 8% employer + 6% employee on Total Gross Pay)
4. **Calculate Maternity** (0.6% total: 0.3% employer + 0.3% employee on Total Gross Pay excluding
   transport)
5. **Calculate RAMA** (15% total: 7.5% employer + 7.5% employee on Basic Pay only)
6. **Calculate Net Salary** (Gross Pay - Employee PAYE - Employee Pension - Employee Maternity -
   Employee RAMA)
7. **Calculate CBHI** (0.5% employee on Net Salary before CBHI)
8. **Final Net Pay** (Net Salary - CBHI - Other Deductions)

### Tax Bracket Management

- **PAYE Progressive Calculation**: Configurable income brackets with cumulative calculation
- **Rate Management**: Editable tax rates and thresholds
- **Basis Configuration**: Different calculation bases for each tax type
- **Effective Dating**: Time-based tax rule changes
- **Compliance Tracking**: Audit trail for tax changes

## Technical Specifications

### Backend Architecture

- **Database**: Google Cloud Firestore (NoSQL)
- **Real-time Updates**: Firestore real-time listeners
- **Data Structure**: Document-based with collections and subcollections
- **Scalability**: Automatic scaling with Firestore's serverless architecture
- **Security**: Firestore Security Rules for data protection

### Firestore Data Model

```
/companies/{companyId}
  - name, settings, tax_config, created_at, updated_at

/companies/{companyId}/users/{userId}
  - role, permissions, profile_data, created_at, updated_at

/companies/{companyId}/staff/{staffId}
  - personal_details, employment_details, bank_details, created_at, updated_at

/companies/{companyId}/payments/{paymentId}
  - staff_id, amount, type, is_gross, effective_date, created_at, updated_at

/companies/{companyId}/deductions/{deductionId}
  - staff_id, amount, type, balance, created_at, updated_at

/companies/{companyId}/payrolls/{payrollId}
  - period, status, calculations, approvals, created_at, updated_at

/companies/{companyId}/payrolls/{payrollId}/staff_payroll/{staffId}
  - gross_pay, net_pay, paye_tax, pension_employee, pension_employer,
    maternity_employee, maternity_employer, rama_employee, rama_employer,
    cbhi_employee, other_deductions, final_net_pay, created_at, updated_at

/app_settings/tax_brackets
  - paye_brackets: [
      {min: 0, max: 60000, rate: 0},
      {min: 60001, max: 100000, rate: 10},
      {min: 100001, max: 200000, rate: 20},
      {min: 200001, max: null, rate: 30}
    ]
  - pension_rates: {employee: 6, employer: 8}
  - maternity_rates: {employee: 0.3, employer: 0.3}
  - cbhi_rates: {employee: 0.5, employer: 0}
  - rama_rates: {employee: 7.5, employer: 7.5}

/app_settings/users/{userId}
  - global_permissions, accessible_companies, profile_data
```

### Firestore Integration Features

- **Offline Capability**: Firestore offline persistence
- **Real-time Sync**: Live updates across multiple users
- **Atomic Transactions**: Ensure data consistency during payroll processing
- **Batch Operations**: Efficient bulk operations for large payrolls
- **Query Optimization**: Indexed queries for performance
- **Data Validation**: Client and server-side validation rules

### Gross-up Calculation Algorithm

```
Input: Net Amount, Tax Rates, Other Deductions
Output: Gross Amount

Algorithm: Binary Search Method for Complex Tax Structure
1. Set lower bound = Net Amount
2. Set upper bound = Net Amount * 2.5 (accounting for Rwanda's 30% top PAYE rate)
3. While (upper bound - lower bound > precision tolerance):
   a. Calculate middle point (potential gross)
   b. Apply Rwanda tax sequence:
      - Calculate PAYE using progressive brackets
      - Calculate Pension (6% employee on gross)
      - Calculate Maternity (0.3% employee on gross excluding transport)
      - Calculate RAMA (7.5% employee on basic pay portion)
      - Calculate intermediate net
      - Calculate CBHI (0.5% on intermediate net)
      - Calculate final net after all deductions
   c. If resulting net > target net: upper bound = middle point
   d. If resulting net < target net: lower bound = middle point
4. Return converged gross amount

Special Considerations:
- Handle progressive PAYE brackets correctly
- Account for different calculation bases (gross vs basic pay vs net)
- Apply calculation sequence as per Rwanda tax law
```

### Security Features

- **Firestore Security Rules**: Document-level access control
- **Authentication**: Firebase Authentication integration
- **Role-based access control (RBAC)**: Implemented through Firestore security rules
- **Data encryption**: Automatic encryption at rest and in transit
- **Audit logging**: Firestore audit logs for all financial transactions
- **Session management**: Firebase session and timeout controls
- **Multi-factor authentication**: Firebase Auth MFA options

### Data Management

- **Real-time Synchronization**: Firestore real-time listeners for live updates
- **Import/Export System**:
  - **Supported Import Formats**: CSV, Excel (.xlsx, .xls), JSON
  - **Supported Export Formats**: CSV, Excel, PDF, JSON, XML
  - **Template Management**: Downloadable import templates for all data types
  - **Data Validation**: Real-time validation during import with error reporting
  - **Batch Processing**: Large dataset handling with progress indicators
  - **Import History**: Complete audit trail of all import operations
  - **Error Recovery**: Rollback capabilities for failed imports
- **PDF Generation Engine**:
  - **High-Quality Rendering**: Professional PDF output with company branding
  - **Custom Templates**: Configurable PDF layouts and styling
  - **Batch PDF Generation**: Efficient bulk PDF creation
  - **Digital Signatures**: Integration with digital signature providers
  - **Password Protection**: Secure PDF generation with encryption
  - **Watermarking**: Optional watermarks for draft/final documents
- **Backup Strategy**: Automated Firestore backups and exports
- **Data Retention**: Configurable retention policies with Firestore TTL
- **Data Export**: Comprehensive export capabilities across all modules
- **Data Validation**: Firestore validation rules and client-side validation
- **Offline Support**: Firestore offline persistence for mobile users
- **Scalability**: Automatic scaling with Firestore's serverless architecture

## Compliance & Reporting

### Statutory Compliance

- Rwanda Revenue Authority (RRA) reporting formats
- Social Security Board (RSSB) submissions
- Bank payment file standards
- Audit trail maintenance

### Report Formats

- **PDF**: Professional formatted reports with company branding
  - **Payslips**: Individual and bulk PDF generation with custom templates
  - **Deduction Reports**: Detailed PDF reports with charts and breakdowns
  - **Statutory Reports**: Compliance-ready PDF formats for government submission
  - **Management Reports**: Executive-level PDF reports with analytics and visualizations
- **Excel**: Detailed spreadsheet exports with formulas and formatting
- **CSV**: Data interchange format for third-party integrations
- **Bank Files**: Structured payment instructions in multiple bank formats
- **JSON/XML**: API-ready formats for system integrations

### Import/Export Technical Specifications

- **File Size Limits**: Up to 50MB for imports, unlimited for exports
- **Concurrent Processing**: Multiple import/export operations
- **Progress Tracking**: Real-time progress indicators for large operations
- **Error Handling**: Comprehensive error reporting with line-by-line feedback
- **Data Mapping**: Flexible field mapping for different import formats
- **Validation Rules**: Configurable validation rules for data quality
- **Transformation Engine**: Data transformation capabilities during import/export

## User Experience Design

### Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop enhancement
- Cross-browser compatibility

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### Performance

- Lazy loading for large datasets
- Optimized database queries
- Caching strategies
- Progressive web app features

## Future Enhancements

### Planned Features

- Integration with HR systems
- Advanced analytics and forecasting
- Mobile application development
- API for third-party integrations
- Multi-language support
- Advanced workflow automation

### Scalability Considerations

- **Cloud-native architecture**: Built on Google Cloud Platform with Firestore
- **Serverless backend**: Firestore's automatic scaling and management
- **Global distribution**: Firestore multi-region replication
- **Load balancing**: Google Cloud Load Balancer integration
- **CDN implementation**: Firebase Hosting with global CDN
- **Performance monitoring**: Firebase Performance Monitoring

---

**Document Version**: 1.0  
**Last Updated**: July 2025  
**Document Owner**: Product Team  
**Review Cycle**: Quarterly
