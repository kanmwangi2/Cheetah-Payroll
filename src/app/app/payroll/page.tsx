'use client'

// Force dynamic rendering to prevent static pre-rendering issues with Supabase
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useCompany } from '@/hooks/use-company'
import { db } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, Play, FileText, Download, Calendar, DollarSign, Users } from 'lucide-react'
import { PayrollRun, PayrollCalculation, StaffMember } from '@/types'
import { toast } from 'sonner'
import { calculatePayroll } from '@/lib/payroll-engine'

export default function PayrollPage() {
  const { company } = useCompany()
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([])
  const [currentRun, setCurrentRun] = useState<PayrollRun | null>(null)
  const [calculations, setCalculations] = useState<(PayrollCalculation & { staff_member: StaffMember })[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewRunDialogOpen, setIsNewRunDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    periodStart: '',
    periodEnd: '',
    payDate: '',
    description: ''
  })

  useEffect(() => {
    if (company?.id) {
      fetchPayrollRuns()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id])

  const fetchPayrollRuns = async () => {
    try {
      const { data } = await db.raw
        .from('payroll_runs')
        .select(`
          *,
          created_by_profile:profiles!created_by(*)
        `)
        .eq('company_id', company?.id)
        .order('period_start', { ascending: false })

      const convertedRuns = data?.map(run => ({
        ...run,
        periodStart: run.period_start,
        periodEnd: run.period_end,
        payDate: run.pay_date,
        createdAt: run.created_at,
        updatedAt: run.updated_at
      })) as PayrollRun[]

      setPayrollRuns(convertedRuns || [])
    } catch (error) {
      console.error('Error fetching payroll runs:', error)
      toast.error('Failed to load payroll runs')
    } finally {
      setLoading(false)
    }
  }

  const fetchPayrollCalculations = async (payrollRunId: string) => {
    try {
      const { data } = await db.raw
        .from('payroll_calculations')
        .select(`
          *,
          staff_member:staff_members(*)
        `)
        .eq('payroll_run_id', payrollRunId)
        .order('staff_member(last_name)')

      // Convert to camelCase
      const convertedData = data?.map(calc => ({
        ...calc,
        staffMemberId: calc.staff_member_id,
        payrollRunId: calc.payroll_run_id,
        totalGrossSalary: calc.total_gross_salary,
        basicPayGross: calc.basic_pay_gross,
        transportAllowanceGross: calc.transport_allowance_gross,
        employerPension: calc.employer_pension,
        employeePension: calc.employee_pension,
        employerMaternity: calc.employer_maternity,
        employeeMaternity: calc.employee_maternity,
        employerRama: calc.employer_rama,
        employeeRama: calc.employee_rama,
        cbhiDeduction: calc.cbhi_deduction,
        totalAppliedDeductions: calc.total_applied_deductions,
        finalNetPay: calc.final_net_pay,
        paymentBreakdown: calc.payment_breakdown,
        deductionBreakdown: calc.deduction_breakdown,
        createdAt: calc.created_at,
        updatedAt: calc.updated_at,
        staff_member: calc.staff_member ? {
          ...calc.staff_member,
          staffNumber: calc.staff_member.staff_number,
          firstName: calc.staff_member.first_name,
          lastName: calc.staff_member.last_name,
          companyId: calc.staff_member.company_id,
          departmentId: calc.staff_member.department_id,
          employeeCategory: calc.staff_member.employee_category,
          birthDate: calc.staff_member.birth_date,
          employmentDate: calc.staff_member.employment_date,
          idPassportNo: calc.staff_member.id_passport_no,
          emergencyContactName: calc.staff_member.emergency_contact_name,
          emergencyContactRelationship: calc.staff_member.emergency_contact_relationship,
          emergencyContactPhone: calc.staff_member.emergency_contact_phone,
          isActive: calc.staff_member.is_active,
          createdAt: calc.staff_member.created_at,
          updatedAt: calc.staff_member.updated_at
        } : calc.staff_member
      }))

      setCalculations(convertedData || [])
    } catch (error) {
      console.error('Error fetching payroll calculations:', error)
      toast.error('Failed to load payroll calculations')
    }
  }

  const handleCreatePayrollRun = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setProcessing(true)
      
      const { data: user } = await db.raw.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      const payrollData = {
        company_id: company?.id,
        period_start: formData.periodStart,
        period_end: formData.periodEnd,
        pay_date: formData.payDate,
        description: formData.description,
        status: 'draft',
        created_by: user.user.id
      }

      const { data: newRun } = await db.raw
        .from('payroll_runs')
        .insert(payrollData)
        .select()
        .single()

      // Get all active staff members
      const { data: staffMembers } = await db.raw
        .from('staff_members')
        .select(`
          *,
          staff_payments(*, payment_type:payment_types(*)),
          staff_deductions(*, deduction_type:deduction_types(*))
        `)
        .eq('company_id', company?.id)
        .eq('is_active', true)

      // Calculate payroll for each staff member
      const calculations = []
      for (const staff of staffMembers || []) {
        try {
          const result = await calculatePayroll(staff, formData.periodStart, formData.periodEnd)
          calculations.push({
            payroll_run_id: newRun.id,
            staff_member_id: staff.id,
            gross_pay: result.grossPay,
            total_deductions: result.totalDeductions,
            net_pay: result.netPay,
            tax_amount: result.taxAmount,
            overtime_amount: result.overtimeAmount || 0,
            allowances_amount: result.allowancesAmount || 0,
            benefits_amount: result.benefitsAmount || 0,
            status: 'calculated'
          })
        } catch (calcError) {
          console.error(`Error calculating payroll for ${staff.first_name} ${staff.last_name}:`, calcError)
          // Add error record
          calculations.push({
            payroll_run_id: newRun.id,
            staff_member_id: staff.id,
            gross_pay: 0,
            total_deductions: 0,
            net_pay: 0,
            tax_amount: 0,
            overtime_amount: 0,
            allowances_amount: 0,
            benefits_amount: 0,
            status: 'error'
          })
        }
      }

      // Insert calculations
      if (calculations.length > 0) {
        const { error: calcError } = await db.raw
          .from('payroll_calculations')
          .insert(calculations)

        if (calcError) throw calcError
      }

      toast.success('Payroll run created successfully')
      setIsNewRunDialogOpen(false)
      resetForm()
      fetchPayrollRuns()
    } catch (error) {
      console.error('Error creating payroll run:', error)
      toast.error('Failed to create payroll run')
    } finally {
      setProcessing(false)
    }
  }

  const handleProcessPayroll = async (payrollRun: PayrollRun) => {
    if (!confirm('Are you sure you want to process this payroll? This action cannot be undone.')) return

    try {
      setProcessing(true)
      
      const { error } = await db.raw
        .from('payroll_runs')
        .update({ 
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .eq('id', payrollRun.id)

      if (error) throw error
      
      toast.success('Payroll processed successfully')
      fetchPayrollRuns()
    } catch (error) {
      console.error('Error processing payroll:', error)
      toast.error('Failed to process payroll')
    } finally {
      setProcessing(false)
    }
  }

  const handleViewDetails = (payrollRun: PayrollRun) => {
    setCurrentRun(payrollRun)
    fetchPayrollCalculations(payrollRun.id)
  }

  const resetForm = () => {
    setFormData({
      periodStart: '',
      periodEnd: '',
      payDate: '',
      description: ''
    })
  }

  const getTotalPayroll = (payrollRun: PayrollRun) => {
    // This would typically come from aggregated calculations
    return 0 // Placeholder
  }

  const filteredPayrollRuns = payrollRuns.filter(run =>
    run.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    run.periodStart?.includes(searchQuery) ||
    run.periodEnd?.includes(searchQuery)
  )

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage payroll runs and calculations for your company
          </p>
        </div>
        <Dialog open={isNewRunDialogOpen} onOpenChange={setIsNewRunDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm() }}>
              <Plus className="h-4 w-4 mr-2" />
              New Payroll Run
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Payroll Run</DialogTitle>
              <DialogDescription>
                Set up a new payroll run for the specified period.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePayrollRun} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period_start">Period Start *</Label>
                <Input
                  id="period_start"
                  type="date"
                  value={formData.periodStart}
                  onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="period_end">Period End *</Label>
                <Input
                  id="period_end"
                  type="date"
                  value={formData.periodEnd}
                  onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pay_date">Pay Date *</Label>
                <Input
                  id="pay_date"
                  type="date"
                  value={formData.payDate}
                  onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Monthly payroll for January 2024"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewRunDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create & Calculate'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="runs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
          {currentRun && (
            <TabsTrigger value="details">
              Run Details - {new Date(currentRun.periodStart).toLocaleDateString()} to {new Date(currentRun.periodEnd).toLocaleDateString()}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="runs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Runs</CardTitle>
              <CardDescription>
                View and manage all payroll runs for your company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payroll runs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Pay Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayrollRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">
                        {`${new Date(run.periodStart).toLocaleDateString()} - ${new Date(run.periodEnd).toLocaleDateString()}`}
                      </TableCell>
                      <TableCell>{run.description}</TableCell>
                      <TableCell>
                        {run.payDate ? new Date(run.payDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          run.status === 'processed' ? 'default' :
                          run.status === 'draft' ? 'secondary' : 'destructive'
                        }>
                          {run.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(run as any).created_by_profile?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {getTotalPayroll(run).toLocaleString()} RWF
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(run)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {run.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProcessPayroll(run)}
                              disabled={processing}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredPayrollRuns.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No payroll runs found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No payroll runs match your search.' : 'Get started by creating your first payroll run.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {currentRun && (
          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculations.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gross Pay</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculations.reduce((sum, calc) => sum + calc.grossPay, 0).toLocaleString()} RWF
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculations.reduce((sum, calc) => sum + calc.totalDeductions, 0).toLocaleString()} RWF
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculations.reduce((sum, calc) => sum + calc.netPay, 0).toLocaleString()} RWF
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Calculations</CardTitle>
                <CardDescription>
                  Individual payroll calculations for this run
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculations.map((calc) => (
                      <TableRow key={calc.id}>
                        <TableCell className="font-medium">
                          {calc.staff_member.firstName} {calc.staff_member.lastName}
                        </TableCell>
                        <TableCell>{calc.grossPay.toLocaleString()} RWF</TableCell>
                        <TableCell>{calc.taxAmount.toLocaleString()} RWF</TableCell>
                        <TableCell>{calc.totalDeductions.toLocaleString()} RWF</TableCell>
                        <TableCell className="font-medium">{calc.netPay.toLocaleString()} RWF</TableCell>
                        <TableCell>
                          <Badge variant={calc.status === 'calculated' ? 'default' : 'destructive'}>
                            {calc.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
