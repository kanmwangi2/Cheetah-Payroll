import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../core/config/firebase.config';
import StaffForm from './StaffForm';
import StaffProfile from './StaffProfile';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  rssbNumber: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  department: string;
  position: string;
  startDate: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  status: 'active' | 'inactive' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
}

interface StaffListProps {
  companyId: string;
}

const StaffList: React.FC<StaffListProps> = ({ companyId }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    loadStaff();
  }, [companyId]);

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, departmentFilter, statusFilter]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const staffQuery = query(
        collection(db, 'companies', companyId, 'staff'),
        orderBy('createdAt', 'desc')
      );
      const staffSnapshot = await getDocs(staffQuery);
      const staffData = staffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StaffMember[];
      
      setStaff(staffData);
      
      // Extract unique departments
      const uniqueDepartments = [...new Set(staffData.map(s => s.department).filter(Boolean))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = staff;

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.idNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(s => s.department === departmentFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    setFilteredStaff(filtered);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'companies', companyId, 'staff', staffId));
      loadStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Error deleting staff member. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '1.1rem',
        color: '#666'
      }}>
        Loading staff members...
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ 
          margin: 0, 
          color: '#333',
          fontSize: '2rem',
          fontWeight: 600
        }}>
          Staff Management
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  // Handle CSV import logic here
                  console.log('Import CSV:', file);
                }
              };
              input.click();
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 6,
              border: '1px solid #28a745',
              background: '#fff',
              color: '#28a745',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            📤 Import CSV
          </button>
          <button
            onClick={() => {
              // Export CSV logic
              const csvContent = 'firstName,lastName,idNumber,email\n' + 
                staff.map(s => `${s.firstName},${s.lastName},${s.idNumber},${s.email}`).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'staff_export.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 6,
              border: '1px solid #17a2b8',
              background: '#fff',
              color: '#17a2b8',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => {
              // Download template logic
              const template = 'firstName,lastName,idNumber,rssbNumber,dateOfBirth,gender,maritalStatus,phone,email,address,emergencyContact,startDate,position,employmentType,department,bankName,accountNumber\nJohn,Doe,123456789,RSSB123,1990-01-01,male,single,0780000000,john@example.com,123 Main St,Jane Doe,2022-01-01,Manager,Full-time,HR,Bank of Kigali,1234567890';
              const blob = new Blob([template], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'staff_import_template.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 6,
              border: '1px solid #6c757d',
              background: '#fff',
              color: '#6c757d',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            📋 Template
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              background: '#1976d2',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            + Add Staff
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr 1fr', 
          gap: '16px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 500,
              color: '#333'
            }}>
              Search Staff
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, email, phone..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 500,
              color: '#333'
            }}>
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '14px'
              }}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 500,
              color: '#333'
            }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '14px'
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '16px', 
          fontSize: '14px', 
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Showing {filteredStaff.length} of {staff.length} staff members</span>
          {(searchTerm || departmentFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('');
                setStatusFilter('');
              }}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid #ddd',
                background: '#fff',
                color: '#666',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {filteredStaff.length === 0 ? (
          <div style={{ 
            padding: '60px 40px', 
            textAlign: 'center',
            color: '#666'
          }}>
            {staff.length === 0 ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No staff members yet</h3>
                <p style={{ margin: '0 0 20px 0' }}>Get started by adding your first team member.</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No staff members found</h3>
                <p style={{ margin: '0' }}>Try adjusting your search criteria or filters.</p>
              </>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Employee Details
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    ID/RSSB Number
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Department
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Position
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => (
                  <tr 
                    key={member.id}
                    style={{ borderBottom: '1px solid #e9ecef' }}
                  >
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ 
                          fontWeight: 500, 
                          color: '#333',
                          marginBottom: '4px'
                        }}>
                          {member.firstName} {member.lastName}
                        </div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: '#666'
                        }}>
                          {member.email}
                        </div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: '#666'
                        }}>
                          {member.phone}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '14px', color: '#333' }}>
                        ID: {member.idNumber}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        RSSB: {member.rssbNumber}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#333' }}>
                      {member.department}
                    </td>
                    <td style={{ padding: '16px', color: '#333' }}>
                      {member.position}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: 
                          member.status === 'active' ? '#e8f5e8' :
                          member.status === 'inactive' ? '#fff3cd' : '#f8d7da',
                        color: 
                          member.status === 'active' ? '#2e7d32' :
                          member.status === 'inactive' ? '#856404' : '#721c24'
                      }}>
                        {member.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedStaff(member)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 4,
                            border: '1px solid #1976d2',
                            background: '#fff',
                            color: '#1976d2',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 4,
                            border: '1px solid #dc3545',
                            background: '#fff',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowForm(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 1001,
                color: '#666'
              }}
            >
              ×
            </button>
            <StaffForm
              companyId={companyId}
              onAdded={() => {
                setShowForm(false);
                loadStaff();
              }}
            />
          </div>
        </div>
      )}

      {selectedStaff && (
        <StaffProfile
          companyId={companyId}
          staffId={selectedStaff.id}
          onClose={() => setSelectedStaff(null)}
        />
      )}
    </div>
  );
};

export default StaffList;