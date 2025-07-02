# Primary Admin Setup Guide

This guide will help you create the first primary admin user for your Cheetah Payroll application.

## Prerequisites

✅ Supabase project created
✅ Environment variables configured in `.env.local`
✅ Database schema applied
✅ RLS policies applied

## Step 1: Apply Database Schema

1. **Go to your Supabase Dashboard**
   - Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your Cheetah Payroll project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Schema**
   - Copy the entire contents of `supabase/schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

4. **Apply RLS Policies**
   - Copy the entire contents of `supabase/rls-policies.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

## Step 2: Create Your First Admin User

### Option A: Using Supabase Dashboard (Recommended)

1. **Create User Account**
   - In Supabase Dashboard, go to "Authentication" → "Users"
   - Click "Add user" → "Create new user"
   - Fill in:
     - **Email**: `admin@yourcompany.com` (use your actual email)
     - **Password**: Create a strong password
     - **Email Confirm**: ✅ Check this box
   - Click "Create user"

2. **Copy the User UUID**
   - After creating the user, you'll see a UUID in the users list
   - Copy this UUID (it looks like: `12345678-1234-1234-1234-123456789abc`)

### Option B: Using Auth Signup (If you have signup enabled)

If your app has a signup form, you can use that instead. But typically for the first admin, dashboard creation is preferred.

## Step 3: Create Company and Assign Admin Role

1. **Go back to SQL Editor**

2. **Run this SQL** (replace the placeholders with your actual values):

```sql
-- Step 1: Create your company
INSERT INTO companies (name, email, address, phone_number, description) 
VALUES (
  'Your Company Name',           -- Replace with your company name
  'admin@yourcompany.com',       -- Replace with your company email
  'Your Company Address',        -- Replace with your address
  '+250 XXX XXX XXX',           -- Replace with your phone
  'Business Description'         -- Replace with your business type
);

-- Step 2: Get the company ID (run this to see the ID)
SELECT id, name FROM companies WHERE name = 'Your Company Name';

-- Step 3: Assign primary admin role to your user
-- Replace 'USER_UUID_HERE' with the UUID from Step 2
-- Replace 'COMPANY_UUID_HERE' with the company ID from the query above
INSERT INTO user_company_roles (user_id, company_id, role)
VALUES (
  'USER_UUID_HERE',      -- Replace with your user UUID
  'COMPANY_UUID_HERE',   -- Replace with your company UUID  
  'primary_admin'
);

-- Step 4: Verify the setup
SELECT 
  u.email,
  c.name as company_name,
  ucr.role
FROM user_company_roles ucr
JOIN auth.users u ON u.id = ucr.user_id
JOIN companies c ON c.id = ucr.company_id
WHERE ucr.role = 'primary_admin';
```

## Step 4: Test Your Setup

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Open the app**: [http://localhost:3000](http://localhost:3000)

3. **Login with your credentials**:
   - Email: The email you used when creating the user
   - Password: The password you set

4. **You should see**:
   - Login successful
   - Redirected to company selection page
   - Your company listed
   - Access to all admin features

## Troubleshooting

### Issue: "Invalid login credentials"
- ✅ Check your email/password are correct
- ✅ Ensure the user was created in Supabase Auth
- ✅ Check if email confirmation is required

### Issue: "No companies available"
- ✅ Verify the company was created in the database
- ✅ Check the user_company_roles table has the correct entries
- ✅ Ensure the role is exactly 'primary_admin'

### Issue: RLS Policy errors
- ✅ Make sure you ran both schema.sql AND rls-policies.sql
- ✅ Check that RLS is enabled on all tables
- ✅ Verify the policies are applied correctly

### Issue: Environment variables
- ✅ Check your `.env.local` file has:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  ```

## Next Steps After Setup

Once you're logged in as primary admin:

1. **Company Settings**: Update your company information
2. **User Management**: Invite other users and assign roles
3. **Payment Types**: Configure salary components (Basic Pay, Allowances, etc.)
4. **Deduction Types**: Set up deduction categories (Loans, Advances, etc.)
5. **Tax Settings**: Review and adjust tax rates if needed
6. **Staff Management**: Start adding employee records

## Security Notes

- ✅ Use a strong password for your admin account
- ✅ Keep your Supabase credentials secure
- ✅ Don't share admin credentials
- ✅ Regularly review user access and roles
- ✅ Enable 2FA on your Supabase account

---

**Need Help?**
If you encounter issues, check:
1. Supabase project logs
2. Browser console for errors
3. Network tab for failed requests
4. Supabase Auth logs in dashboard
