'use client'

// Force dynamic rendering to prevent static pre-rendering issues with Supabase
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useCompany } from '@/hooks/use-company'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { StaffMember, CustomFieldDefinition } from '@/types'
import { db } from '@/lib/supabase-enhanced'
import { objectToCamelCase } from '@/lib/case-converter'
import { formatDate } from '@/lib/utils'

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  const { company } = useCompany()

  useEffect(() => {
    if (company) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company])

  const loadData = async () => {
    if (!company) return

    try {
      // Load staff members with departments
      const { data: staffDataRaw } = await db.raw
        .from('staff_members')
        .select(`
          *,
          departments (
            id,
            name
          )
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      const staffData = staffDataRaw?.map(staff => objectToCamelCase(staff)) as StaffMember[]

      // Load custom field definitions
      const { data: customFieldsDataRaw } = await db.raw
        .from('custom_field_definitions')
        .select('*')
        .eq('company_id', company.id)
        .order('field_name')

      const customFieldsData = customFieldsDataRaw?.map(field => objectToCamelCase(field)) as CustomFieldDefinition[]

      setStaff(staffData || [])
      setCustomFields(customFieldsData || [])
    } catch (error) {
      console.error('Error loading staff data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStaff = staff.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.staffNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddStaff = () => {
    setSelectedStaff(null)
    setShowAddDialog(true)
  }

  const handleEditStaff = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember)
    setShowAddDialog(true)
  }

  const handleDeleteStaff = async (staffMember: StaffMember) => {
    if (!confirm(`Are you sure you want to delete ${staffMember.firstName} ${staffMember.lastName}?`)) {
      return
    }

    try {
      await db.delete('staffMembers', { id: staffMember.id })
      await loadData()
    } catch (error) {
      console.error('Error deleting staff member:', error)
    }
  }

  const handleAddCustomField = async () => {
    const fieldName = prompt('Enter custom field name:')
    const fieldType = prompt('Enter field type (text, number, date):')
    
    if (!fieldName || !fieldType || !['text', 'number', 'date'].includes(fieldType)) {
      return
    }

    try {
      await db.insert('customFieldDefinitions', {
        companyId: company!.id,
        fieldName: fieldName,
        fieldType: fieldType as 'text' | 'number' | 'date',
        isRequired: false
      })

      await loadData()
    } catch (error) {
      console.error('Error adding custom field:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading staff data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <p className="text-muted-foreground">
          Manage employee records and custom fields for {company?.name}
        </p>
      </div>

      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Members</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Staff Members</CardTitle>
                  <CardDescription>
                    View and manage all staff members
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddStaff}>
                    Add Staff Member
                  </Button>
                  <Button variant="outline">
                    Import CSV
                  </Button>
                  <Button variant="outline">
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Input
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Employment Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.staffNumber}
                        </TableCell>
                        <TableCell>
                          {member.firstName} {member.lastName}
                        </TableCell>
                        <TableCell>{member.email || '-'}</TableCell>
                        <TableCell>
                          {(member as any).departments?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {member.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {member.employmentDate ? formatDate(member.employmentDate) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStaff(member)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteStaff(member)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredStaff.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No staff members found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-fields" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Custom Fields</CardTitle>
                  <CardDescription>
                    Define company-specific data fields for staff members
                  </CardDescription>
                </div>
                <Button onClick={handleAddCustomField}>
                  Add Custom Field
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field Name</TableHead>
                      <TableHead>Field Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customFields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">
                          {field.fieldName}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{field.fieldType}</span>
                        </TableCell>
                        <TableCell>
                          {formatDate(field.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (confirm(`Delete custom field "${field.fieldName}"?`)) {
                                await db.delete('customFieldDefinitions', { id: field.id })
                                await loadData()
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {customFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No custom fields defined
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </DialogTitle>
            <DialogDescription>
              Enter the staff member details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name *</label>
              <Input placeholder="Enter first name" />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name *</label>
              <Input placeholder="Enter last name" />
            </div>
            <div>
              <label className="text-sm font-medium">Staff Number *</label>
              <Input placeholder="Enter staff number" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="Enter email" />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button>
              {selectedStaff ? 'Update' : 'Create'} Staff Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
