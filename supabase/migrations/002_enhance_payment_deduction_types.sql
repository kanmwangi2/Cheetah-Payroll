-- Add additional fields to payment_types table for better configuration
ALTER TABLE payment_types 
ADD COLUMN description TEXT,
ADD COLUMN calculation_method TEXT NOT NULL DEFAULT 'fixed' CHECK (calculation_method IN ('fixed', 'percentage', 'formula')),
ADD COLUMN amount DECIMAL(12,2),
ADD COLUMN formula TEXT,
ADD COLUMN taxable BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add additional fields to deduction_types table for better configuration
ALTER TABLE deduction_types 
ADD COLUMN description TEXT,
ADD COLUMN calculation_method TEXT NOT NULL DEFAULT 'fixed' CHECK (calculation_method IN ('fixed', 'percentage', 'formula')),
ADD COLUMN amount DECIMAL(12,2),
ADD COLUMN formula TEXT,
ADD COLUMN is_mandatory BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN affects_tax BOOLEAN NOT NULL DEFAULT true;

-- Update triggers for the new fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure triggers exist for payment_types and deduction_types
DROP TRIGGER IF EXISTS update_payment_types_updated_at ON payment_types;
CREATE TRIGGER update_payment_types_updated_at 
    BEFORE UPDATE ON payment_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deduction_types_updated_at ON deduction_types;
CREATE TRIGGER update_deduction_types_updated_at 
    BEFORE UPDATE ON deduction_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default payment types for companies
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

-- Insert some default deduction types for companies
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
