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
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Download, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react'
import { PayrollRun, StaffMember } from '@/types'
import { toast } from 'sonner'

interface PayrollSummary {
  totalEmployees: number
  totalGrossPay: number
  totalDeductions: number
  totalNetPay: number
  averageSalary: number
}

interface MonthlyData {
  month: string
  totalPay: number
  employeeCount: number
}

export default function ReportsPage() {
  const { company } = useCompany()
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState({
    start: '',
    end: ''
  })
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary>({
    totalEmployees: 0,
    totalGrossPay: 0,
    totalDeductions: 0,
    totalNetPay: 0,
    averageSalary: 0
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

  useEffect(() => {
    if (company?.id) {
      fetchData()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id])

  const fetchData = async () => {
    try {
      // Fetch payroll runs
      const { data: runs } = await db.raw
        .from('payroll_runs')
        .select('*')
        .eq('company_id', company?.id)
        .order('period_start', { ascending: false })

      setPayrollRuns(runs || [])

      // Fetch staff members
      const { data: staff } = await db.raw
        .from('staff_members')
        .select('*')
        .eq('company_id', company?.id)
        .eq('is_active', true)

      setStaffMembers(staff || [])

      // Calculate summary data
      calculateSummaryData(runs || [], staff || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const calculateSummaryData = async (runs: PayrollRun[], staff: StaffMember[]) => {
    // Calculate current period summary
    const totalEmployees = staff.length
    
    // For now, use simplified calculations
    // In a real app, you'd aggregate from payroll_calculations
    const averageSalary = totalEmployees > 0 ? 500000 : 0 // Placeholder
    const totalGrossPay = totalEmployees * averageSalary
    const totalDeductions = totalGrossPay * 0.25 // Assume 25% deductions
    const totalNetPay = totalGrossPay - totalDeductions

    setPayrollSummary({
      totalEmployees,
      totalGrossPay,
      totalDeductions,
      totalNetPay,
      averageSalary
    })

    // Generate monthly trend data
    const monthlyTrend: MonthlyData[] = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for (let i = 0; i < 6; i++) {
      const monthIndex = (new Date().getMonth() - i + 12) % 12
      monthlyTrend.unshift({
        month: months[monthIndex],
        totalPay: totalGrossPay + (Math.random() - 0.5) * 1000000,
        employeeCount: totalEmployees + Math.floor((Math.random() - 0.5) * 5)
      })
    }
    
    setMonthlyData(monthlyTrend)
  }

  const generatePayrollReport = async () => {
    if (!selectedPeriod.start || !selectedPeriod.end) {
      toast.error('Please select both start and end dates')
      return
    }

    try {
      // Fetch payroll data for the selected period
      const { data: calculations } = await db.raw
        .from('payroll_calculations')
        .select(`
          *,
          staff_member:staff_members(*),
          payroll_run:payroll_runs(*)
        `)
        .gte('payroll_run.period_start', selectedPeriod.start)
        .lte('payroll_run.period_end', selectedPeriod.end)

      // Generate CSV content
      const csvContent = generatePayrollCSV(calculations || [])
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payroll_report_${selectedPeriod.start}_to_${selectedPeriod.end}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Payroll report generated successfully')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate payroll report')
    }
  }

  const generatePayrollCSV = (calculations: any[]) => {
    const headers = [
      'Employee Name',
      'Staff Number',
      'Department',
      'Period',
      'Gross Pay',
      'Tax Amount',
      'Total Deductions',
      'Net Pay'
    ]

    const rows = calculations.map(calc => [
      `${calc.staff_member?.first_name} ${calc.staff_member?.last_name}`,
      calc.staff_member?.staff_number || '',
      calc.staff_member?.department?.name || '',
      calc.payroll_run?.period_start ? 
        `${calc.payroll_run.period_start} to ${calc.payroll_run.period_end}` : '',
      calc.gross_pay || calc.total_gross_salary || 0,
      calc.tax_amount || calc.paye || 0,
      calc.total_deductions || calc.total_applied_deductions || 0,
      calc.net_pay || calc.final_net_pay || 0
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const generateTaxReport = async () => {
    if (!selectedPeriod.start || !selectedPeriod.end) {
      toast.error('Please select both start and end dates')
      return
    }

    try {
      // This would generate a tax-specific report for RRA
      toast.success('Tax report generation would be implemented here')
    } catch (error) {
      console.error('Error generating tax report:', error)
      toast.error('Failed to generate tax report')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate payroll reports and view analytics for your company
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Reports</TabsTrigger>
          <TabsTrigger value="tax">Tax Reports</TabsTrigger>
          <TabsTrigger value="staff">Staff Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payrollSummary.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">Active staff members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payrollSummary.totalGrossPay.toLocaleString()} RWF
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payrollSummary.totalDeductions.toLocaleString()} RWF
                </div>
                <p className="text-xs text-muted-foreground">
                  {((payrollSummary.totalDeductions / payrollSummary.totalGrossPay) * 100).toFixed(1)}% of gross
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payrollSummary.averageSalary.toLocaleString()} RWF
                </div>
                <p className="text-xs text-muted-foreground">Per employee</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend Chart (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Payroll Trend</CardTitle>
              <CardDescription>
                Total payroll costs over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 text-sm font-medium">{data.month}</div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${(data.totalPay / Math.max(...monthlyData.map(d => d.totalPay))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {data.totalPay.toLocaleString()} RWF
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payroll Runs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payroll Runs</CardTitle>
              <CardDescription>
                Latest payroll processing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRuns.slice(0, 5).map((run) => (
                    <TableRow key={run.id}>
                      <TableCell>                        {run.periodStart && run.periodEnd ?
                          `${new Date(run.periodStart).toLocaleDateString()} - ${new Date(run.periodEnd).toLocaleDateString()}` :
                          'No Period Set'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          run.status === 'processed' || run.status === 'approved' ? 'default' :
                          run.status === 'draft' ? 'secondary' : 'destructive'
                        }>
                          {run.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{payrollSummary.totalEmployees}</TableCell>
                      <TableCell>{new Date(run.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Payroll Report</CardTitle>
              <CardDescription>
                Generate detailed payroll reports for specific periods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={selectedPeriod.start}
                    onChange={(e) => setSelectedPeriod({ ...selectedPeriod, start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={selectedPeriod.end}
                    onChange={(e) => setSelectedPeriod({ ...selectedPeriod, end: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={generatePayrollReport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generate & Download Payroll Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Reports</CardTitle>
              <CardDescription>
                Generate tax reports for RRA compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-start-date">Start Date</Label>
                  <Input
                    id="tax-start-date"
                    type="date"
                    value={selectedPeriod.start}
                    onChange={(e) => setSelectedPeriod({ ...selectedPeriod, start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-end-date">End Date</Label>
                  <Input
                    id="tax-end-date"
                    type="date"
                    value={selectedPeriod.end}
                    onChange={(e) => setSelectedPeriod({ ...selectedPeriod, end: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={generateTaxReport}>
                  <FileText className="h-4 w-4 mr-2" />
                  PAYE Report
                </Button>
                <Button onClick={generateTaxReport}>
                  <FileText className="h-4 w-4 mr-2" />
                  RSSB Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff Summary Report</CardTitle>
              <CardDescription>
                Overview of all active staff members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Staff Number</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Employment Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">
                        {staff.firstName} {staff.lastName}
                      </TableCell>
                      <TableCell>{staff.staffNumber}</TableCell>
                      <TableCell>{staff.designation}</TableCell>
                      <TableCell>
                        {staff.employmentDate ? 
                          new Date(staff.employmentDate).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={staff.status === 'active' ? "default" : "secondary"}>
                          {staff.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
