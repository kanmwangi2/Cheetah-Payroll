'use client'

// Force dynamic rendering to prevent static pre-rendering issues with Supabase
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useCompany } from '@/hooks/use-company'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Building, MapPin, Phone, Mail, FileText, CreditCard } from 'lucide-react'
import { Company } from '@/types'
import { toast } from 'sonner'

export default function CompanySettingsPage() {
  const { company } = useCompany()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    tin_number: '',
    registration_number: '',
    primary_business: ''
  })

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        tin_number: company.tin_number || '',
        registration_number: company.registration_number || '',
        primary_business: company.primary_business || ''
      })
      setLoading(false)
    }
  }, [company])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          tin_number: formData.tin_number,
          registration_number: formData.registration_number,
          primary_business: formData.primary_business
        })
        .eq('id', company?.id)

      if (error) throw error

      toast.success('Company information updated successfully')
    } catch (error) {
      console.error('Error updating company:', error)
      toast.error('Failed to update company information')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Company Information</span>
          </CardTitle>
          <CardDescription>
            Update your company&apos;s basic information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary_business">Primary Business</Label>
                <Input
                  id="primary_business"
                  value={formData.primary_business}
                  onChange={(e) => setFormData({ ...formData, primary_business: e.target.value })}
                  placeholder="e.g., Technology, Healthcare, etc."
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-10"
                    placeholder="Company physical address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    placeholder="company@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                    placeholder="+250 XXX XXX XXX"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Legal & Tax Information</span>
          </CardTitle>
          <CardDescription>
            Manage your company&apos;s legal and tax registration details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registration_number">Company Registration Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    className="pl-10"
                    placeholder="Company registration number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tin_number">Tax Identification Number (TIN)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tin_number"
                    value={formData.tin_number}
                    onChange={(e) => setFormData({ ...formData, tin_number: e.target.value })}
                    className="pl-10"
                    placeholder="Tax identification number"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {company && (
        <Card>
          <CardHeader>
            <CardTitle>Company Statistics</CardTitle>
            <CardDescription>
              Overview of your company&apos;s system usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-muted-foreground">Active Employees</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-muted-foreground">Payroll Runs</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {new Date(company.created_at).getFullYear()}
                </div>
                <div className="text-muted-foreground">Member Since</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {company && (
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Read-only system details for your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-muted-foreground">Company ID</label>
                <p className="font-mono text-xs">{company.id}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Created</label>
                <p>{new Date(company.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Last Updated</label>
                <p>{new Date(company.updated_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Status</label>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
