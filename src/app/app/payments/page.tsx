'use client'

// Force dynamic rendering to prevent static pre-rendering issues with Supabase
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useCompany } from '@/hooks/use-company'
import { db } from '@/lib/supabase-enhanced'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, Calculator } from 'lucide-react'
import { PaymentType } from '@/types'
import { toast } from 'sonner'

export default function PaymentsPage() {
  const { company } = useCompany()
  const [payments, setPayments] = useState<PaymentType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<PaymentType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    taxable: true,
    calculationMethod: 'fixed' as 'fixed' | 'percentage' | 'formula',
    formula: '',
    isActive: true
  })

  useEffect(() => {
    if (company?.id) {
      fetchPayments()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id])

  const fetchPayments = async () => {
    try {
      const { data, error } = await db.select('payment_types', {
        filters: { companyId: company?.id },
        order: { column: 'name', ascending: true }
      })

      if (error) throw error
      setPayments(data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load payment types')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const paymentData = {
        name: formData.name,
        description: formData.description,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        taxable: formData.taxable,
        calculationMethod: formData.calculationMethod,
        formula: formData.formula || null,
        isActive: formData.isActive,
        companyId: company?.id
      }

      if (editingPayment) {
        const { error } = await db.update('payment_types', paymentData, {
          filters: { id: editingPayment.id }
        })

        if (error) throw error
        toast.success('Payment type updated successfully')
      } else {
        const { error } = await db.insert('payment_types', paymentData)

        if (error) throw error
        toast.success('Payment type created successfully')
      }

      setIsAddDialogOpen(false)
      setEditingPayment(null)
      resetForm()
      fetchPayments()
    } catch (error) {
      console.error('Error saving payment:', error)
      toast.error('Failed to save payment type')
    }
  }

  const handleDelete = async (payment: PaymentType) => {
    if (!confirm('Are you sure you want to delete this payment type?')) return

    try {
      const { error } = await db.delete('payment_types', {
        filters: { id: payment.id }
      })

      if (error) throw error
      toast.success('Payment type deleted successfully')
      fetchPayments()
    } catch (error) {
      console.error('Error deleting payment:', error)
      toast.error('Failed to delete payment type')
    }
  }

  const handleEdit = (payment: PaymentType) => {
    setEditingPayment(payment)
    setFormData({
      name: payment.name,
      description: payment.description || '',
      amount: payment.amount?.toString() || '',
      taxable: payment.taxable,
      calculationMethod: payment.calculationMethod,
      formula: payment.formula || '',
      isActive: payment.isActive
    })
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: '',
      taxable: true,
      calculationMethod: 'fixed',
      formula: '',
      isActive: true
    })
  }

  const filteredPayments = payments.filter(payment =>
    payment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Types</h1>
          <p className="text-muted-foreground">
            Manage payment types for your company&apos;s payroll
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingPayment(null) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingPayment ? 'Edit Payment Type' : 'Add Payment Type'}
              </DialogTitle>
              <DialogDescription>
                Configure a new payment type for your payroll system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Basic Salary, Overtime, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description of this payment type"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calculation_method">Calculation Method</Label>
                <select
                  id="calculation_method"
                  value={formData.calculationMethod}
                  onChange={(e) => setFormData({ ...formData, calculationMethod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                  <option value="formula">Custom Formula</option>
                </select>
              </div>

              {formData.calculationMethod === 'fixed' && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (RWF)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              )}

              {formData.calculationMethod === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Percentage (%)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>
              )}

              {formData.calculationMethod === 'formula' && (
                <div className="space-y-2">
                  <Label htmlFor="formula">Formula</Label>
                  <Input
                    id="formula"
                    value={formData.formula}
                    onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                    placeholder="basic_salary * 0.1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use variables like basic_salary, hours_worked, etc.
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  id="taxable"
                  type="checkbox"
                  checked={formData.taxable}
                  onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
                />
                <Label htmlFor="taxable">Taxable</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPayment ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Types</CardTitle>
          <CardDescription>
            Configure different types of payments for your payroll system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payment types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount/Rate</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.name}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {payment.calculationMethod === 'fixed' ? 'Fixed' :
                       payment.calculationMethod === 'percentage' ? 'Percentage' : 'Formula'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.calculationMethod === 'fixed' && payment.amount
                      ? `${payment.amount.toLocaleString()} RWF`
                      : payment.calculationMethod === 'percentage' && payment.amount
                      ? `${payment.amount}%`
                      : payment.formula || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.taxable ? "default" : "secondary"}>
                      {payment.taxable ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.isActive ? "default" : "secondary"}>
                      {payment.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(payment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(payment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No payment types found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'No payment types match your search.' : 'Get started by creating your first payment type.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
