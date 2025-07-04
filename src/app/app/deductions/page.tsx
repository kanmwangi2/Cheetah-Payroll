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
import { Search, Plus, Edit, Trash2, Minus } from 'lucide-react'
import { DeductionType } from '@/types'
import { toast } from 'sonner'

export default function DeductionsPage() {
  const { company } = useCompany()
  const [deductions, setDeductions] = useState<DeductionType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDeduction, setEditingDeduction] = useState<DeductionType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    calculationMethod: 'fixed' as 'fixed' | 'percentage' | 'formula',
    formula: '',
    isMandatory: false,
    affectsTax: true,
    isActive: true
  })

  useEffect(() => {
    if (company?.id) {
      fetchDeductions()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id])

  const fetchDeductions = async () => {
    try {
      const { data, error } = await db.select('deduction_types', {
        filters: { companyId: company?.id },
        order: { column: 'name', ascending: true }
      })

      if (error) throw error
      setDeductions(data || [])
    } catch (error) {
      console.error('Error fetching deductions:', error)
      toast.error('Failed to load deduction types')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const deductionData = {
        name: formData.name,
        description: formData.description,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        calculationMethod: formData.calculationMethod,
        formula: formData.formula || null,
        isMandatory: formData.isMandatory,
        affectsTax: formData.affectsTax,
        isActive: formData.isActive,
        companyId: company?.id
      }

      if (editingDeduction) {
        const { error } = await db.update('deduction_types', deductionData, {
          filters: { id: editingDeduction.id }
        })

        if (error) throw error
        toast.success('Deduction type updated successfully')
      } else {
        const { error } = await db.insert('deduction_types', deductionData)

        if (error) throw error
        toast.success('Deduction type created successfully')
      }

      setIsAddDialogOpen(false)
      setEditingDeduction(null)
      resetForm()
      fetchDeductions()
    } catch (error) {
      console.error('Error saving deduction:', error)
      toast.error('Failed to save deduction type')
    }
  }

  const handleDelete = async (deduction: DeductionType) => {
    if (!confirm('Are you sure you want to delete this deduction type?')) return

    try {
      const { error } = await db.delete('deduction_types', {
        filters: { id: deduction.id }
      })

      if (error) throw error
      toast.success('Deduction type deleted successfully')
      fetchDeductions()
    } catch (error) {
      console.error('Error deleting deduction:', error)
      toast.error('Failed to delete deduction type')
    }
  }

  const handleEdit = (deduction: DeductionType) => {
    setEditingDeduction(deduction)
    setFormData({
      name: deduction.name,
      description: deduction.description || '',
      amount: deduction.amount?.toString() || '',
      calculationMethod: deduction.calculationMethod,
      formula: deduction.formula || '',
      isMandatory: deduction.isMandatory,
      affectsTax: deduction.affectsTax,
      isActive: deduction.isActive
    })
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: '',
      calculationMethod: 'fixed',
      formula: '',
      isMandatory: false,
      affectsTax: true,
      isActive: true
    })
  }

  const filteredDeductions = deductions.filter(deduction =>
    deduction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deduction.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deduction Types</h1>
          <p className="text-muted-foreground">
            Manage deduction types for your company&apos;s payroll
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingDeduction(null) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Deduction Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingDeduction ? 'Edit Deduction Type' : 'Add Deduction Type'}
              </DialogTitle>
              <DialogDescription>
                Configure a new deduction type for your payroll system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="RSSB, Tax, Loan, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description of this deduction type"
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
                    placeholder="basic_salary * 0.03"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use variables like basic_salary, gross_pay, etc.
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  id="is_mandatory"
                  type="checkbox"
                  checked={formData.isMandatory}
                  onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                />
                <Label htmlFor="is_mandatory">Mandatory (applies to all employees)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="affects_tax"
                  type="checkbox"
                  checked={formData.affectsTax}
                  onChange={(e) => setFormData({ ...formData, affectsTax: e.target.checked })}
                />
                <Label htmlFor="affects_tax">Affects Tax Calculation</Label>
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
                  {editingDeduction ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deduction Types</CardTitle>
          <CardDescription>
            Configure different types of deductions for your payroll system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deduction types..."
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
                <TableHead>Mandatory</TableHead>
                <TableHead>Affects Tax</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeductions.map((deduction) => (
                <TableRow key={deduction.id}>
                  <TableCell className="font-medium">{deduction.name}</TableCell>
                  <TableCell>{deduction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {deduction.calculationMethod === 'fixed' ? 'Fixed' :
                       deduction.calculationMethod === 'percentage' ? 'Percentage' : 'Formula'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {deduction.calculationMethod === 'fixed' && deduction.amount
                      ? `${deduction.amount.toLocaleString()} RWF`
                      : deduction.calculationMethod === 'percentage' && deduction.amount
                      ? `${deduction.amount}%`
                      : deduction.formula || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={deduction.isMandatory ? "default" : "secondary"}>
                      {deduction.isMandatory ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={deduction.affectsTax ? "default" : "secondary"}>
                      {deduction.affectsTax ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={deduction.isActive ? "default" : "secondary"}>
                      {deduction.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(deduction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(deduction)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDeductions.length === 0 && (
            <div className="text-center py-8">
              <Minus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No deduction types found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'No deduction types match your search.' : 'Get started by creating your first deduction type.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
