-- Cheetah Payroll Row Level Security Policies
-- RLS policies for secure multi-tenant data access

-- Enable Row Level Security on all tables
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

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- COMPANIES POLICIES
-- =============================================

-- Users can view companies they have access to
CREATE POLICY "Users can view assigned companies" ON companies 
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

-- Global admins can manage all companies
CREATE POLICY "Global admins can manage companies" ON companies 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

-- Company admins can update their assigned companies
CREATE POLICY "Company admins can update assigned companies" ON companies 
FOR UPDATE USING (
    auth.uid() IN (
        SELECT user_id FROM user_company_roles 
        WHERE company_id = companies.id
        AND role IN ('company_admin', 'primary_admin', 'app_admin')
    )
);

-- =============================================
-- USER COMPANY ROLES POLICIES
-- =============================================

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_company_roles 
FOR SELECT USING (user_id = auth.uid());

-- Global admins can manage all user roles
CREATE POLICY "Global admins can manage user roles" ON user_company_roles 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

-- Company admins can manage roles for their companies
CREATE POLICY "Company admins can manage company roles" ON user_company_roles 
FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM user_company_roles ucr2
        WHERE ucr2.company_id = user_company_roles.company_id
        AND ucr2.role IN ('company_admin', 'primary_admin', 'app_admin')
    )
);

-- =============================================
-- COMPANY-SCOPED DATA POLICIES
-- =============================================

-- Departments access
CREATE POLICY "Company scoped departments access" ON departments 
FOR ALL USING (
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

-- Staff members access
CREATE POLICY "Company scoped staff access" ON staff_members 
FOR ALL USING (
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

-- Custom field definitions access
CREATE POLICY "Company scoped custom fields access" ON custom_field_definitions 
FOR ALL USING (
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

-- Staff custom fields access
CREATE POLICY "Staff custom fields access" ON staff_custom_fields 
FOR ALL USING (
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

-- Payment types access
CREATE POLICY "Company scoped payment types access" ON payment_types 
FOR ALL USING (
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

-- Staff payments access
CREATE POLICY "Staff payments access" ON staff_payments 
FOR ALL USING (
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

-- Deduction types access
CREATE POLICY "Company scoped deduction types access" ON deduction_types 
FOR ALL USING (
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

-- Staff deductions access
CREATE POLICY "Staff deductions access" ON staff_deductions 
FOR ALL USING (
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

-- Payroll runs access
CREATE POLICY "Company scoped payroll runs access" ON payroll_runs 
FOR ALL USING (
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

-- Payroll calculations access
CREATE POLICY "Payroll calculations access" ON payroll_calculations 
FOR ALL USING (
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

-- Company tax exemptions access
CREATE POLICY "Company tax exemptions access" ON company_tax_exemptions 
FOR ALL USING (
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

-- =============================================
-- GLOBAL TAX SETTINGS POLICIES
-- =============================================

-- All authenticated users can read global tax settings
CREATE POLICY "All users can view tax settings" ON global_tax_settings 
FOR SELECT TO authenticated USING (true);

-- Only global admins can modify global tax settings
CREATE POLICY "Global admins can manage tax settings" ON global_tax_settings 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_company_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('primary_admin', 'app_admin')
    )
);

-- =============================================
-- ROLE-BASED PERMISSIONS POLICIES
-- =============================================

-- Payroll preparers can create and modify payroll runs in draft/calculated status
CREATE POLICY "Payroll preparers can manage draft payrolls" ON payroll_runs 
FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM user_company_roles 
        WHERE company_id = payroll_runs.company_id
        AND role IN ('payroll_preparer', 'company_admin', 'primary_admin', 'app_admin')
    )
);

CREATE POLICY "Payroll preparers can update draft payrolls" ON payroll_runs 
FOR UPDATE USING (
    status IN ('draft', 'calculated') AND
    auth.uid() IN (
        SELECT user_id FROM user_company_roles 
        WHERE company_id = payroll_runs.company_id
        AND role IN ('payroll_preparer', 'company_admin', 'primary_admin', 'app_admin')
    )
);

-- Payroll approvers can approve/reject payroll runs
CREATE POLICY "Payroll approvers can approve payrolls" ON payroll_runs 
FOR UPDATE USING (
    status IN ('calculated', 'approved', 'rejected') AND
    auth.uid() IN (
        SELECT user_id FROM user_company_roles 
        WHERE company_id = payroll_runs.company_id
        AND role IN ('payroll_approver', 'company_admin', 'primary_admin', 'app_admin')
    )
);
