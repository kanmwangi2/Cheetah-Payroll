-- Cheetah Payroll: Primary Admin Setup Script
-- Instructions: Replace the placeholder values with your actual information

-- Step 1: Create your company
INSERT INTO companies (name, email, address, phone_number, tin_number, registration_number, description) 
VALUES (
  'Your Company Name',           -- 🔄 REPLACE: Your actual company name
  'admin@yourcompany.com',       -- 🔄 REPLACE: Your company email
  'Your Company Address',        -- 🔄 REPLACE: Your company address
  '+250 XXX XXX XXX',           -- 🔄 REPLACE: Your company phone number
  '123456789',                   -- 🔄 REPLACE: Your TIN number (optional)
  'REG123456',                   -- 🔄 REPLACE: Registration number (optional)
  'Technology/Healthcare/etc'    -- 🔄 REPLACE: Your business type
);

-- Step 2: View the created company (copy the ID from results)
SELECT id, name, email FROM companies WHERE name = 'Your Company Name';

-- Step 3: Assign primary admin role
-- 🔄 REPLACE: Get the user UUID from Supabase Auth Dashboard
-- 🔄 REPLACE: Get the company UUID from the query above
INSERT INTO user_company_roles (user_id, company_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000000',  -- 🔄 REPLACE: Your user UUID from Supabase Auth
  '00000000-0000-0000-0000-000000000000',  -- 🔄 REPLACE: Company UUID from Step 2
  'primary_admin'
);

-- Step 4: Verify the setup worked
SELECT 
  p.email,
  p.first_name,
  p.last_name,
  c.name as company_name,
  ucr.role,
  ucr.created_at
FROM user_company_roles ucr
JOIN profiles p ON p.id = ucr.user_id
JOIN companies c ON c.id = ucr.company_id
WHERE ucr.role = 'primary_admin'
ORDER BY ucr.created_at DESC;

-- Step 5: Check if global tax settings exist (should return 1 row)
SELECT COUNT(*) as tax_settings_count FROM global_tax_settings;

-- If the above returns 0, run this:
-- INSERT INTO global_tax_settings (id) VALUES (uuid_generate_v4());

-- Optional: Create default departments for your company
-- 🔄 REPLACE the company_id with your actual company UUID
INSERT INTO departments (company_id, name, description) 
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Administration', 'Administrative staff'),
  ('00000000-0000-0000-0000-000000000000', 'Finance', 'Finance and accounting'),
  ('00000000-0000-0000-0000-000000000000', 'HR', 'Human resources'),
  ('00000000-0000-0000-0000-000000000000', 'IT', 'Information technology'),
  ('00000000-0000-0000-0000-000000000000', 'Operations', 'Operations and logistics');

-- Final verification: Check everything is set up correctly
SELECT 
  'Companies' as table_name, 
  COUNT(*) as count 
FROM companies
UNION ALL
SELECT 
  'Admin Users' as table_name, 
  COUNT(*) as count 
FROM user_company_roles 
WHERE role = 'primary_admin'
UNION ALL
SELECT 
  'Departments' as table_name, 
  COUNT(*) as count 
FROM departments
UNION ALL
SELECT 
  'Tax Settings' as table_name, 
  COUNT(*) as count 
FROM global_tax_settings;
