# Cheetah Payroll - Product Blueprint

## Overview

A comprehensive multi-company payroll management application designed for Rwanda-specific payroll processing, tax calculations, and statutory reporting with role-based access control. The application features unified import/export functionality, comprehensive deduction management with balance tracking, and streamlined user experience with theme-aware design.

## Core Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, React Router v7 for SPA routing
- **Backend**: Express.js with TypeScript (optional - can use Firebase directly)
- **Database**: Google Cloud Firestore (NoSQL document database)
- **Authentication**: Firebase Authentication
- **Build Tools**: Webpack for frontend bundling, TypeScript compiler for backend
- **Testing**: Jest with React Testing Library and jsdom environment

### Application Structure
- **Single Page Application**: React router handles authentication and main application routing
- **Authentication Flow**: Login → Company Selection → Dashboard with all modules
- **Company-centric**: All data operations scoped to selected company
- **Role-based Access**: 5 user roles with granular permissions

## User Roles & Permissions

### 1. Primary Admin
- **System-wide access**: All companies and features
- **User management**: Create/modify any user, assign roles
- **Company management**: Create companies, manage settings
- **Global configuration**: Tax settings, application branding

### 2. App Admin  
- **Cross-company access**: All companies within their scope
- **User administration**: Manage users across companies
- **System monitoring**: Audit trails, system health
- **Configuration management**: Company settings, integrations

### 3. Company Admin
- **Company-specific access**: Single company scope
- **Staff management**: Full CRUD operations for staff
- **Payroll oversight**: View all payrolls, approve if needed
- **Company settings**: Configure company-specific parameters

### 4. Payroll Approver
- **Approval workflow**: Review and approve payroll submissions
- **Payroll visibility**: View all payrolls within company
- **Staff viewing**: Read-only access to staff information
- **Reporting access**: Generate approved payroll reports

### 5. Payroll Preparer
- **Payroll creation**: Create and submit payrolls for approval
- **Staff management**: Full CRUD operations for staff
- **Data entry**: Payments, deductions, staff information
- **Import/export**: Use CSV functionality for bulk operations

## Core Modules

### 1. Dashboard
- **Company Overview**: Staff count, active payrolls, recent activity
- **Key Metrics**: Total staff, payroll summaries, pending items
- **Quick Actions**: Fast access to common operations
- **Performance Optimized**: Parallel Firebase queries for fast loading

### 2. Staff Management
- **Comprehensive Profiles**: Personal info, employment details, bank information
- **Staff Numbers**: Unique identifier system for all staff records
- **Department Management**: Dynamic department dropdown from existing data
- **Employment Tracking**: Start dates, optional end dates
- **Import/Export**: Unified CSV functionality with validation

### 3. Payments Management
- **Payment Types**: Basic salary, allowances, overtime, commissions
- **Recurring Payments**: Monthly recurring with effective date ranges
- **Gross/Net Toggle**: Support for both gross and net payment entry
- **Staff Assignment**: Direct staff member assignment
- **Import/Export**: Unified CSV functionality with progress tracking

### 4. Deductions Management
- **Deduction Types**: Loans, advances, other charges
- **Balance Tracking**: Real-time calculation of remaining balances
- **Monthly Installments**: Support for installment-based deductions
- **Payment Recording**: Built-in payment tracking with balance updates
- **Import/Export**: Unified CSV functionality with validation

### 5. Payroll Processing
- **Rwanda Tax Engine**: PAYE, RSSB, CBHI, RAMA calculations
- **Approval Workflow**: Preparer creates, approver reviews/approves
- **Balance Integration**: Automatic deduction balance updates
- **Period Management**: Month/year selection with YYYY-MM format
- **Import/Export**: Unified CSV functionality for payroll data

### 6. Reports Generation
- **Payslip Generation**: Individual and bulk PDF payslips
- **Statutory Reports**: PAYE, RSSB compliance reports
- **Management Reports**: Payroll summaries, department breakdowns
- **Export Functionality**: PDF and CSV export options

### 7. Administration
- **Global Settings**: Application branding, system parameters
- **Dynamic Tax Configuration**: Real-time configurable tax rates, brackets, and contribution percentages
- **Tax Settings Management**: PAYE brackets, RSSB, CBHI, RAMA, and Maternity contribution rates
- **User Management**: Role assignment, permissions
- **Company Management**: Multi-company setup and configuration

### 8. Utilities & Support
- **Horizontal Tab Layout**: FAQ, Documentation, Advanced Tools, Audit Trail
- **Advanced Utilities**: System maintenance, bulk operations
- **Audit Trail**: Comprehensive activity logging
- **Help System**: FAQ and documentation integration

## Import/Export System

### Unified Architecture
All data modules use consistent import/export functionality:
- **Single Modal Interface**: Combined import, export, template download, and history
- **Progress Tracking**: Real-time import progress with error reporting
- **Validation Engine**: Row-by-row validation with detailed error messages
- **History Tracking**: Complete audit trail of all import operations
- **Template System**: Pre-formatted CSV templates with examples

### Data Validation
- **Field Validation**: Required fields, data types, format checking
- **Business Rules**: Duplicate prevention, date validation, numeric ranges
- **Error Reporting**: Line-by-line error messages with specific guidance
- **Format Support**: DD/MM/YYYY and YYYY-MM-DD date compatibility

## Rwanda Tax Engine

### PAYE (Pay As You Earn)
- **Dynamic Progressive Brackets**: Fully configurable tax brackets via Admin panel
- **Default Brackets**: 0% (0-60,000), 10% (60,001-100,000), 20% (100,001-200,000), 30% (200,001+)
- **Real-time Configuration**: Admin can modify brackets and rates without code changes
- **Monthly Calculation**: Accurate monthly tax computation using current configuration
- **Exemptions**: Standard exemptions and allowances
- **Annual Reconciliation**: Support for annual tax calculations

### Dynamic Tax Configuration
- **Admin-Configurable**: All tax rates and brackets configurable via Admin panel
- **Database-Driven**: Tax settings stored in Firestore `app_settings/tax_brackets`
- **Real-time Updates**: Changes in tax settings immediately affect all payroll calculations
- **Fallback Protection**: Default configuration ensures system reliability

### RSSB (Rwanda Social Security Board)
- **Configurable Rates**: Employee and employer contribution percentages set via tax configuration
- **Default Rates**: Employee 6%, Employer 8% (configurable)
- **Calculation Base**: Applied to total gross salary
- **Reporting Integration**: Direct integration with statutory reports

### CBHI (Community Based Health Insurance)
- **Configurable Rates**: Employee contribution percentage set via tax configuration
- **Default Rate**: Employee 0.5%, Employer 0% (configurable)
- **Calculation Base**: Applied to net salary before CBHI
- **Calculation Rules**: Rwanda-specific calculation methods

### RAMA (Rwanda Association of Medical Assistance)
- **Configurable Rates**: Employee and employer contribution percentages set via tax configuration
- **Default Rates**: Employee 7.5%, Employer 7.5% (configurable)
- **Calculation Base**: Applied to basic pay only (excludes allowances)
- **Integration**: Full integration with payroll processing

## Data Architecture

### Company Scoping
All data operations follow strict company isolation:
```
/companies/{companyId}/
├── staff/         (Staff records)
├── payments/      (Payment definitions)
├── deductions/    (Deduction records)
├── payrolls/      (Payroll records)
├── reports/       (Generated reports)
└── settings/      (Company configuration)
```

### Real-time Synchronization
- **Live Updates**: Real-time listeners for data changes
- **Conflict Resolution**: Automatic conflict handling
- **Offline Support**: Firebase offline persistence
- **Performance**: Optimized queries with pagination

## Theme System

### Multi-theme Support
- **Light Theme**: Default professional appearance
- **Dark Theme**: Dark mode with proper contrast
- **System Theme**: Automatic OS preference detection
- **Theme Persistence**: LocalStorage-based preference saving

### Consistent Design
- **CSS Variables**: Theme-aware color system
- **Component Library**: Reusable UI components
- **Accessibility**: ARIA support throughout
- **Responsive Design**: Mobile-first approach

## Security & Compliance

### Authentication
- **Firebase Auth**: Secure authentication with multiple providers
- **Session Management**: Automatic session handling
- **Role Verification**: Server-side role validation
- **Password Policy**: Configurable password requirements

### Data Protection
- **Company Isolation**: Strict data segregation
- **Access Control**: Role-based data access
- **Audit Logging**: Comprehensive activity tracking
- **Backup Strategy**: Automated data backup

### Compliance
- **Rwanda Compliance**: Full compliance with Rwanda payroll regulations
- **Data Privacy**: GDPR-compliant data handling
- **Financial Accuracy**: Precise tax calculations
- **Statutory Reporting**: Automated compliance reports

## Performance & Scalability

### Frontend Optimization
- **Code Splitting**: Lazy-loaded feature modules
- **Bundle Optimization**: Webpack-optimized builds
- **Caching Strategy**: Browser and CDN caching
- **Performance Monitoring**: Real-time performance tracking

### Backend Scalability
- **Firebase Scaling**: Auto-scaling NoSQL database
- **Query Optimization**: Efficient Firestore queries
- **Batch Operations**: Bulk data processing support
- **Connection Pooling**: Optimized connection management

## Quality Assurance

### Testing Strategy
- **Unit Testing**: Comprehensive component testing
- **Integration Testing**: Service layer testing
- **E2E Testing**: Complete workflow validation
- **Performance Testing**: Load and stress testing

### Code Quality
- **TypeScript**: Strong typing throughout
- **ESLint**: Consistent code standards
- **Code Reviews**: Mandatory review process
- **Documentation**: Comprehensive inline documentation

## Deployment & Operations

### Deployment Pipeline
- **Firebase Hosting**: Static asset deployment
- **Continuous Integration**: Automated build and test
- **Environment Management**: Development, staging, production
- **Rollback Strategy**: Quick rollback capabilities

### Monitoring & Maintenance
- **Error Tracking**: Real-time error monitoring
- **Performance Metrics**: Application performance tracking

## Recent Platform Enhancements (2025)

### Email Communication System
- **Payslip Distribution**: Automated email delivery of payslips to staff
- **Bulk Email Operations**: Send payslips to multiple recipients simultaneously
- **Report Sharing**: Email deduction and payment reports to administrators
- **Template Management**: Customizable email templates for different notification types
- **Delivery Tracking**: Monitor email delivery status and manage bounces
- **Error Handling**: Comprehensive error reporting for failed email deliveries

### Enhanced User Experience
- **Standardized UI Components**: Unified button styling across all modules
- **Profile Picture Management**: 
  - Interactive image cropping with real-time preview
  - Lazy loading for improved performance
  - Support for multiple image formats with validation
  - Optimized file handling with size limits
- **Improved Navigation**: Consistent theme-aware interface elements
- **Accessibility**: Enhanced keyboard navigation and screen reader support

### Data Integrity & Validation
- **Enhanced Input Validation**: 
  - Unique constraint validation for staff numbers and emails
  - Real-time duplicate detection
  - Comprehensive field validation with user-friendly error messages
- **Improved Error Handling**:
  - Retry logic for failed Firebase operations
  - Better error message translation for user clarity
  - Centralized error logging and monitoring
- **Data Consistency**: Unified type definitions across frontend and backend
- **Company Context Validation**: Strict data scoping to prevent cross-company data leaks

### Firebase Integration Improvements
- **Service Layer Enhancement**: 
  - Consistent error handling patterns across all services
  - Audit trail logging for all data modifications
  - Input validation at service level
  - Proper transaction handling for complex operations
- **Real-time Data Synchronization**: 
  - Enhanced error handling for real-time listeners
  - Improved connection management
  - Better offline support
- **Performance Optimization**:
  - Efficient query patterns
  - Batch operation improvements
  - Connection pooling and resource management

### Security & Access Control
- **Role-based Data Access**: Enhanced permission validation at service layer
- **Company Isolation**: Improved data segregation mechanisms
- **Authentication Context**: Better user session management
- **Audit Enhancement**: Comprehensive activity logging with detailed event tracking
- **User Analytics**: Usage pattern analysis
- **Maintenance Windows**: Scheduled maintenance procedures