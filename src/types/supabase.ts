export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          email: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          tin_number: string | null
          registration_number: string | null
          address: string | null
          email: string | null
          phone: string | null
          primary_business: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tin_number?: string | null
          registration_number?: string | null
          address?: string | null
          email?: string | null
          phone?: string | null
          primary_business?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tin_number?: string | null
          registration_number?: string | null
          address?: string | null
          email?: string | null
          phone?: string | null
          primary_business?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_company_roles: {
        Row: {
          id: string
          user_id: string
          company_id: string
          role: 'primary_admin' | 'app_admin' | 'company_admin' | 'payroll_preparer' | 'payroll_approver'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          role: 'primary_admin' | 'app_admin' | 'company_admin' | 'payroll_preparer' | 'payroll_approver'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          role?: 'primary_admin' | 'app_admin' | 'company_admin' | 'payroll_preparer' | 'payroll_approver'
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      staff_members: {
        Row: {
          id: string
          company_id: string
          staff_number: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          rssb_number: string | null
          employee_category: string | null
          gender: string | null
          birth_date: string | null
          department_id: string | null
          designation: string | null
          employment_date: string | null
          nationality: string | null
          id_passport_no: string | null
          province: string | null
          district: string | null
          sector: string | null
          cell: string | null
          village: string | null
          bank_name: string | null
          bank_code: string | null
          account_no: string | null
          branch: string | null
          emergency_contact_name: string | null
          emergency_contact_relationship: string | null
          emergency_contact_phone: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          staff_number: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          rssb_number?: string | null
          employee_category?: string | null
          gender?: string | null
          birth_date?: string | null
          department_id?: string | null
          designation?: string | null
          employment_date?: string | null
          nationality?: string | null
          id_passport_no?: string | null
          province?: string | null
          district?: string | null
          sector?: string | null
          cell?: string | null
          village?: string | null
          bank_name?: string | null
          bank_code?: string | null
          account_no?: string | null
          branch?: string | null
          emergency_contact_name?: string | null
          emergency_contact_relationship?: string | null
          emergency_contact_phone?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          staff_number?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          rssb_number?: string | null
          employee_category?: string | null
          gender?: string | null
          birth_date?: string | null
          department_id?: string | null
          designation?: string | null
          employment_date?: string | null
          nationality?: string | null
          id_passport_no?: string | null
          province?: string | null
          district?: string | null
          sector?: string | null
          cell?: string | null
          village?: string | null
          bank_name?: string | null
          bank_code?: string | null
          account_no?: string | null
          branch?: string | null
          emergency_contact_name?: string | null
          emergency_contact_relationship?: string | null
          emergency_contact_phone?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      custom_field_definitions: {
        Row: {
          id: string
          company_id: string
          field_name: string
          field_type: 'text' | 'number' | 'date'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          field_name: string
          field_type: 'text' | 'number' | 'date'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          field_name?: string
          field_type?: 'text' | 'number' | 'date'
          created_at?: string
          updated_at?: string
        }
      }
      staff_custom_fields: {
        Row: {
          id: string
          staff_member_id: string
          custom_field_definition_id: string
          value: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_member_id: string
          custom_field_definition_id: string
          value?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_member_id?: string
          custom_field_definition_id?: string
          value?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_types: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          type: 'gross' | 'net'
          calculation_method: 'fixed' | 'percentage' | 'formula'
          amount: number | null
          formula: string | null
          taxable: boolean
          is_active: boolean
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          type: 'gross' | 'net'
          calculation_method?: 'fixed' | 'percentage' | 'formula'
          amount?: number | null
          formula?: string | null
          taxable?: boolean
          is_active?: boolean
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          type?: 'gross' | 'net'
          calculation_method?: 'fixed' | 'percentage' | 'formula'
          amount?: number | null
          formula?: string | null
          taxable?: boolean
          is_active?: boolean
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      staff_payments: {
        Row: {
          id: string
          staff_member_id: string
          payment_type_id: string
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_member_id: string
          payment_type_id: string
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_member_id?: string
          payment_type_id?: string
          amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      deduction_types: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          calculation_method: 'fixed' | 'percentage' | 'formula'
          amount: number | null
          formula: string | null
          is_mandatory: boolean
          is_active: boolean
          affects_tax: boolean
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          calculation_method?: 'fixed' | 'percentage' | 'formula'
          amount?: number | null
          formula?: string | null
          is_mandatory?: boolean
          is_active?: boolean
          affects_tax?: boolean
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          calculation_method?: 'fixed' | 'percentage' | 'formula'
          amount?: number | null
          formula?: string | null
          is_mandatory?: boolean
          is_active?: boolean
          affects_tax?: boolean
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      staff_deductions: {
        Row: {
          id: string
          staff_member_id: string
          deduction_type_id: string
          description: string | null
          original_amount: number
          monthly_deduction: number
          deducted_so_far: number
          start_date: string
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_member_id: string
          deduction_type_id: string
          description?: string | null
          original_amount: number
          monthly_deduction: number
          deducted_so_far?: number
          start_date: string
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_member_id?: string
          deduction_type_id?: string
          description?: string | null
          original_amount?: number
          monthly_deduction?: number
          deducted_so_far?: number
          start_date?: string
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      payroll_runs: {
        Row: {
          id: string
          company_id: string
          period_start: string
          period_end: string
          pay_date: string | null
          description: string | null
          status: 'draft' | 'calculated' | 'approved' | 'rejected' | 'processed'
          created_by: string | null
          approved_by: string | null
          approved_at: string | null
          processed_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          period_start: string
          period_end: string
          pay_date?: string | null
          description?: string | null
          status?: 'draft' | 'calculated' | 'approved' | 'rejected' | 'processed'
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          processed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          period_start?: string
          period_end?: string
          pay_date?: string | null
          description?: string | null
          status?: 'draft' | 'calculated' | 'approved' | 'rejected' | 'processed'
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          processed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payroll_calculations: {
        Row: {
          id: string
          payroll_run_id: string
          staff_member_id: string
          total_gross_salary: number
          basic_pay_gross: number
          transport_allowance_gross: number
          other_payments: Json
          employer_pension: number
          employee_pension: number
          employer_maternity: number
          employee_maternity: number
          employer_rama: number
          employee_rama: number
          paye: number
          cbhi_deduction: number
          other_deductions: Json
          total_applied_deductions: number
          final_net_pay: number
          gross_pay: number
          total_deductions: number
          net_pay: number
          tax_amount: number
          overtime_amount: number
          allowances_amount: number
          benefits_amount: number
          status: 'calculated' | 'approved' | 'error' | 'pending'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          payroll_run_id: string
          staff_member_id: string
          total_gross_salary?: number
          basic_pay_gross?: number
          transport_allowance_gross?: number
          other_payments?: Json
          employer_pension?: number
          employee_pension?: number
          employer_maternity?: number
          employee_maternity?: number
          employer_rama?: number
          employee_rama?: number
          paye?: number
          cbhi_deduction?: number
          other_deductions?: Json
          total_applied_deductions?: number
          final_net_pay?: number
          gross_pay?: number
          total_deductions?: number
          net_pay?: number
          tax_amount?: number
          overtime_amount?: number
          allowances_amount?: number
          benefits_amount?: number
          status?: 'calculated' | 'approved' | 'error' | 'pending'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          payroll_run_id?: string
          staff_member_id?: string
          total_gross_salary?: number
          basic_pay_gross?: number
          transport_allowance_gross?: number
          other_payments?: Json
          employer_pension?: number
          employee_pension?: number
          employer_maternity?: number
          employee_maternity?: number
          employer_rama?: number
          employee_rama?: number
          paye?: number
          cbhi_deduction?: number
          other_deductions?: Json
          total_applied_deductions?: number
          final_net_pay?: number
          gross_pay?: number
          total_deductions?: number
          net_pay?: number
          tax_amount?: number
          overtime_amount?: number
          allowances_amount?: number
          benefits_amount?: number
          status?: 'calculated' | 'approved' | 'error' | 'pending'
          created_at?: string
          updated_at?: string
        }
      }
      global_tax_settings: {
        Row: {
          id: string
          paye_bands: Json
          pension_employee_rate: number
          pension_employer_rate: number
          maternity_employee_rate: number
          maternity_employer_rate: number
          rama_employee_rate: number
          rama_employer_rate: number
          cbhi_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          paye_bands: Json
          pension_employee_rate: number
          pension_employer_rate: number
          maternity_employee_rate: number
          maternity_employer_rate: number
          rama_employee_rate: number
          rama_employer_rate: number
          cbhi_rate: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          paye_bands?: Json
          pension_employee_rate?: number
          pension_employer_rate?: number
          maternity_employee_rate?: number
          maternity_employer_rate?: number
          rama_employee_rate?: number
          rama_employer_rate?: number
          cbhi_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      company_tax_exemptions: {
        Row: {
          id: string
          company_id: string
          paye_exempt: boolean
          pension_exempt: boolean
          maternity_exempt: boolean
          rama_exempt: boolean
          cbhi_exempt: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          paye_exempt?: boolean
          pension_exempt?: boolean
          maternity_exempt?: boolean
          rama_exempt?: boolean
          cbhi_exempt?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          paye_exempt?: boolean
          pension_exempt?: boolean
          maternity_exempt?: boolean
          rama_exempt?: boolean
          cbhi_exempt?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
