-- Cheetah Payroll Database Schema
-- Complete schema for the payroll management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create companies table
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    tin_number TEXT,
    registration_number TEXT,
    address TEXT,
    email TEXT,
    phone TEXT,
    primary_business TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_company_roles table (junction table)
CREATE TABLE user_company_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    company_id UUID REFERENCES companies ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('primary_admin', 'app_admin', 'company_admin', 'payroll_preparer', 'payroll_approver')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- Create departments table
CREATE TABLE departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Create staff_members table
CREATE TABLE staff_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies ON DELETE CASCADE,
    staff_number TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    rssb_number TEXT,
    employee_category TEXT,
    gender TEXT,
    birth_date DATE,
    department_id UUID REFERENCES departments ON DELETE SET NULL,
    designation TEXT,
    employment_date DATE,
    nationality TEXT,
    id_passport_no TEXT,
    province TEXT,
    district TEXT,
    sector TEXT,
    cell TEXT,
    village TEXT,
    bank_name TEXT,
    bank_code TEXT,
    account_no TEXT,
    branch TEXT,
    emergency_contact_name TEXT,
    emergency_contact_relationship TEXT,
    emergency_contact_phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, staff_number)
);

-- Create custom_field_definitions table
CREATE TABLE custom_field_definitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, field_name)
);

-- Create staff_custom_fields table
CREATE TABLE staff_custom_fields (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staff_member_id UUID REFERENCES staff_members ON DELETE CASCADE,
    custom_field_definition_id UUID REFERENCES custom_field_definitions ON DELETE CASCADE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(staff_member_id, custom_field_definition_id)
);

-- Create payment_types table with enhanced fields
CREATE TABLE payment_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('gross', 'net')),
    calculation_method TEXT NOT NULL DEFAULT 'fixed' CHECK (calculation_method IN ('fixed', 'percentage', 'formula')),
    amount DECIMAL(12,2),
    formula TEXT,
    taxable BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Create staff_payments table
CREATE TABLE staff_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staff_member_id UUID REFERENCES staff_members ON DELETE CASCADE,
    payment_type_id UUID REFERENCES payment_types ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(staff_member_id, payment_type_id)
);

-- Create deduction_types table with enhanced fields
CREATE TABLE deduction_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    calculation_method TEXT NOT NULL DEFAULT 'fixed' CHECK (calculation_method IN ('fixed', 'percentage', 'formula')),
    amount DECIMAL(12,2),
    formula TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    affects_tax BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Create staff_deductions table
CREATE TABLE staff_deductions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staff_member_id UUID REFERENCES staff_members ON DELETE CASCADE,
    deduction_type_id UUID REFERENCES deduction_types ON DELETE CASCADE,
    description TEXT,
    original_amount DECIMAL(12,2) NOT NULL,
    monthly_deduction DECIMAL(12,2) NOT NULL,
    deducted_so_far DECIMAL(12,2) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payroll_runs table with enhanced fields
CREATE TABLE payroll_runs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    pay_date DATE,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved', 'rejected', 'processed')),
    created_by UUID REFERENCES auth.users ON DELETE SET NULL,
    approved_by UUID REFERENCES auth.users ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payroll_calculations table with enhanced fields
CREATE TABLE payroll_calculations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payroll_run_id UUID REFERENCES payroll_runs ON DELETE CASCADE,
    staff_member_id UUID REFERENCES staff_members ON DELETE CASCADE,
    total_gross_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
    basic_pay_gross DECIMAL(12,2) NOT NULL DEFAULT 0,
    transport_allowance_gross DECIMAL(12,2) NOT NULL DEFAULT 0,
    other_payments JSONB DEFAULT '{}',
    employer_pension DECIMAL(12,2) NOT NULL DEFAULT 0,
    employee_pension DECIMAL(12,2) NOT NULL DEFAULT 0,
    employer_maternity DECIMAL(12,2) NOT NULL DEFAULT 0,
    employee_maternity DECIMAL(12,2) NOT NULL DEFAULT 0,
    employer_rama DECIMAL(12,2) NOT NULL DEFAULT 0,
    employee_rama DECIMAL(12,2) NOT NULL DEFAULT 0,
    paye DECIMAL(12,2) NOT NULL DEFAULT 0,
    cbhi_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
    other_deductions JSONB DEFAULT '{}',
    total_applied_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
    final_net_pay DECIMAL(12,2) NOT NULL DEFAULT 0,
    gross_pay DECIMAL(12,2) DEFAULT 0,
    total_deductions DECIMAL(12,2) DEFAULT 0,
    net_pay DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    overtime_amount DECIMAL(12,2) DEFAULT 0,
    allowances_amount DECIMAL(12,2) DEFAULT 0,
    benefits_amount DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'error', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(payroll_run_id, staff_member_id)
);

-- Create global_tax_settings table
CREATE TABLE global_tax_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    paye_bands JSONB NOT NULL DEFAULT '[
        {"min": 0, "max": 60000, "rate": 0},
        {"min": 60000, "max": 100000, "rate": 20},
        {"min": 100000, "max": null, "rate": 30}
    ]',
    pension_employee_rate DECIMAL(5,2) NOT NULL DEFAULT 3.00,
    pension_employer_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    maternity_employee_rate DECIMAL(5,2) NOT NULL DEFAULT 0.25,
    maternity_employer_rate DECIMAL(5,2) NOT NULL DEFAULT 0.25,
    rama_employee_rate DECIMAL(5,2) NOT NULL DEFAULT 7.50,
    rama_employer_rate DECIMAL(5,2) NOT NULL DEFAULT 7.50,
    cbhi_rate DECIMAL(5,2) NOT NULL DEFAULT 2.50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company_tax_exemptions table
CREATE TABLE company_tax_exemptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies ON DELETE CASCADE,
    paye_exempt BOOLEAN DEFAULT FALSE,
    pension_exempt BOOLEAN DEFAULT FALSE,
    maternity_exempt BOOLEAN DEFAULT FALSE,
    rama_exempt BOOLEAN DEFAULT FALSE,
    cbhi_exempt BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id)
);

-- Insert default global tax settings
INSERT INTO global_tax_settings (id) VALUES (uuid_generate_v4());

-- Functions to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_company_roles_updated_at BEFORE UPDATE ON user_company_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_field_definitions_updated_at BEFORE UPDATE ON custom_field_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_custom_fields_updated_at BEFORE UPDATE ON staff_custom_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_types_updated_at BEFORE UPDATE ON payment_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_payments_updated_at BEFORE UPDATE ON staff_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deduction_types_updated_at BEFORE UPDATE ON deduction_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_deductions_updated_at BEFORE UPDATE ON staff_deductions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON payroll_runs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_calculations_updated_at BEFORE UPDATE ON payroll_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_global_tax_settings_updated_at BEFORE UPDATE ON global_tax_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_tax_exemptions_updated_at BEFORE UPDATE ON company_tax_exemptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default payment types for companies
INSERT INTO payment_types (company_id, name, description, type, calculation_method, taxable, is_active, "order")
SELECT 
    c.id,
    'Basic Salary',
    'Monthly basic salary for employees',
    'gross',
    'fixed',
    true,
    true,
    1
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM payment_types pt 
    WHERE pt.company_id = c.id AND pt.name = 'Basic Salary'
);

-- Insert default deduction types for companies
INSERT INTO deduction_types (company_id, name, description, calculation_method, is_mandatory, affects_tax, is_active, "order")
SELECT 
    c.id,
    'RSSB Employee Contribution',
    'Employee contribution to Rwanda Social Security Board (3%)',
    'percentage',
    true,
    false,
    true,
    1
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM deduction_types dt 
    WHERE dt.company_id = c.id AND dt.name = 'RSSB Employee Contribution'
);

INSERT INTO deduction_types (company_id, name, description, calculation_method, amount, is_mandatory, affects_tax, is_active, "order")
SELECT 
    c.id,
    'CBHI (Mutuelle)',
    'Community Based Health Insurance contribution',
    'percentage',
    3.00,
    true,
    false,
    true,
    2
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM deduction_types dt 
    WHERE dt.company_id = c.id AND dt.name = 'CBHI (Mutuelle)'
);
