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

-- Create payment_types table
CREATE TABLE payment_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('gross', 'net')),
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

-- Create deduction_types table
CREATE TABLE deduction_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies ON DELETE CASCADE,
    name TEXT NOT NULL,
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

-- Create payroll_runs table
CREATE TABLE payroll_runs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved', 'rejected')),
    created_by UUID REFERENCES auth.users ON DELETE SET NULL,
    approved_by UUID REFERENCES auth.users ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, month, year)
);

-- Create payroll_calculations table
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deduction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_tax_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_tax_exemptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Companies: Users can view companies they have access to
CREATE POLICY "Users can view assigned companies" ON companies FOR SELECT USING (
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

-- Global admins can manage all companies
CREATE POLICY "Global admins can manage companies" ON companies FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

-- User company roles: Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_company_roles FOR SELECT USING (user_id = auth.uid());

-- Global admins can manage all user roles
CREATE POLICY "Global admins can manage user roles" ON user_company_roles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

-- Company-scoped data policies (departments, staff, etc.)
CREATE POLICY "Company scoped data access" ON departments FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM user_company_roles 
        WHERE company_id = departments.company_id
    ) OR 
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

CREATE POLICY "Company scoped staff access" ON staff_members FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM user_company_roles 
        WHERE company_id = staff_members.company_id
    ) OR 
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

-- Apply similar policies to other company-scoped tables
CREATE POLICY "Company scoped custom fields access" ON custom_field_definitions FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM user_company_roles 
        WHERE company_id = custom_field_definitions.company_id
    ) OR 
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

CREATE POLICY "Staff custom fields access" ON staff_custom_fields FOR ALL USING (
    auth.uid() IN (
        SELECT ucr.user_id FROM user_company_roles ucr
        JOIN staff_members sm ON sm.company_id = ucr.company_id
        WHERE sm.id = staff_custom_fields.staff_member_id
    ) OR 
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

CREATE POLICY "Company scoped payment types access" ON payment_types FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM user_company_roles 
        WHERE company_id = payment_types.company_id
    ) OR 
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

CREATE POLICY "Staff payments access" ON staff_payments FOR ALL USING (
    auth.uid() IN (
        SELECT ucr.user_id FROM user_company_roles ucr
        JOIN staff_members sm ON sm.company_id = ucr.company_id
        WHERE sm.id = staff_payments.staff_member_id
    ) OR 
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

CREATE POLICY "Company scoped deduction types access" ON deduction_types FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM user_company_roles 
        WHERE company_id = deduction_types.company_id
    ) OR 
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

CREATE POLICY "Staff deductions access" ON staff_deductions FOR ALL USING (
    auth.uid() IN (
        SELECT ucr.user_id FROM user_company_roles ucr
        JOIN staff_members sm ON sm.company_id = ucr.company_id
        WHERE sm.id = staff_deductions.staff_member_id
    ) OR 
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

CREATE POLICY "Company scoped payroll runs access" ON payroll_runs FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM user_company_roles 
        WHERE company_id = payroll_runs.company_id
    ) OR 
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

CREATE POLICY "Payroll calculations access" ON payroll_calculations FOR ALL USING (
    auth.uid() IN (
        SELECT ucr.user_id FROM user_company_roles ucr
        JOIN payroll_runs pr ON pr.company_id = ucr.company_id
        WHERE pr.id = payroll_calculations.payroll_run_id
    ) OR 
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

-- Global tax settings: All authenticated users can read, only global admins can modify
CREATE POLICY "All users can view tax settings" ON global_tax_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Global admins can manage tax settings" ON global_tax_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

CREATE POLICY "Company tax exemptions access" ON company_tax_exemptions FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM user_company_roles 
        WHERE company_id = company_tax_exemptions.company_id
    ) OR 
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

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
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_company_roles_updated_at BEFORE UPDATE ON user_company_roles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_custom_field_definitions_updated_at BEFORE UPDATE ON custom_field_definitions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_staff_custom_fields_updated_at BEFORE UPDATE ON staff_custom_fields FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payment_types_updated_at BEFORE UPDATE ON payment_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_staff_payments_updated_at BEFORE UPDATE ON staff_payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_deduction_types_updated_at BEFORE UPDATE ON deduction_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_staff_deductions_updated_at BEFORE UPDATE ON staff_deductions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON payroll_runs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payroll_calculations_updated_at BEFORE UPDATE ON payroll_calculations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_global_tax_settings_updated_at BEFORE UPDATE ON global_tax_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_company_tax_exemptions_updated_at BEFORE UPDATE ON company_tax_exemptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
