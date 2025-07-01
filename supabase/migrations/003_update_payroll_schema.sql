-- Update payroll_runs table to use date ranges instead of month/year
ALTER TABLE payroll_runs 
ADD COLUMN period_start DATE,
ADD COLUMN period_end DATE,
ADD COLUMN pay_date DATE,
ADD COLUMN description TEXT;

-- Update status enum to include 'processed'
ALTER TABLE payroll_runs 
DROP CONSTRAINT payroll_runs_status_check;

ALTER TABLE payroll_runs 
ADD CONSTRAINT payroll_runs_status_check 
CHECK (status IN ('draft', 'calculated', 'approved', 'rejected', 'processed'));

-- Drop the unique constraint on month/year since we're moving to date ranges
ALTER TABLE payroll_runs 
DROP CONSTRAINT payroll_runs_company_id_month_year_key;

-- Add new unique constraint on company_id and period (to prevent overlapping periods)
-- This will be enforced at application level for now

-- Update payroll_calculations table to match expected fields
ALTER TABLE payroll_calculations 
ADD COLUMN gross_pay DECIMAL(12,2) DEFAULT 0,
ADD COLUMN total_deductions DECIMAL(12,2) DEFAULT 0,
ADD COLUMN net_pay DECIMAL(12,2) DEFAULT 0,
ADD COLUMN tax_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN overtime_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN allowances_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN benefits_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN status TEXT DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'error', 'pending'));

-- Add processed_at field to payroll_runs
ALTER TABLE payroll_runs 
ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;
