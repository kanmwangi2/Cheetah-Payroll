import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../core/config/firebase.config';
import StaffForm from './StaffForm';
import StaffProfile from './StaffProfile';
import StaffImportExport from './StaffImportExport';
import Button from '../../../shared/components/ui/Button';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  rssbNumber: string;
  staffNumber: string;
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
  endDate?: string;
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
  const [showImportExport, setShowImportExport] = useState(false);
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
      const staffData = staffSnapshot.docs.map(doc => {
        const data = doc.data();
        const staff = {
          id: doc.id,
          ...data
        } as StaffMember;
        
        // Track records without staffNumber for user notification
        if (!staff.staffNumber) {
          // This will be shown in the UI with a visual indicator
        }
        
        return staff;
      });
      
      setStaff(staffData);
      
      // Extract unique departments
      const uniqueDepartments = [...new Set(staffData.map(s => s.department).filter(Boolean))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      // Show user-friendly error message instead of logging to console
      alert('Unable to load staff members. Please refresh the page and try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = staff.filter(s => s !== null);

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
      // Show user-friendly error message
      alert('Unable to delete staff member. Please check your connection and try again.');
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
        color: 'var(--color-text-secondary)'
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
          color: 'var(--color-text-primary)',
          fontSize: '2rem',
          fontWeight: 600
        }}>
          Staff Management
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowImportExport(true)}
            className="btn-primary"
          >
            📤 Import/Export
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            + Add Staff
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        background: 'var(--color-card-bg)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid var(--color-card-border)',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)'
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
              color: 'var(--color-text-primary)'
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
                border: '1px solid var(--color-input-border)',
                borderRadius: 4,
                fontSize: '14px',
                backgroundColor: 'var(--color-input-bg)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 500,
              color: 'var(--color-text-primary)'
            }}>
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-input-border)',
                borderRadius: 4,
                fontSize: '14px',
                backgroundColor: 'var(--color-input-bg)',
                color: 'var(--color-text-primary)'
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
              color: 'var(--color-text-primary)'
            }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-input-border)',
                borderRadius: 4,
                fontSize: '14px',
                backgroundColor: 'var(--color-input-bg)',
                color: 'var(--color-text-primary)'
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
          color: 'var(--color-text-secondary)',
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
                border: '1px solid var(--color-border-secondary)',
                background: 'var(--color-card-bg)',
                color: 'var(--color-text-secondary)',
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
        background: 'var(--color-card-bg)',
        borderRadius: '8px',
        border: '1px solid var(--color-card-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {filteredStaff.length === 0 ? (
          <div style={{ 
            padding: '60px 40px', 
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            {staff.length === 0 ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>No staff members yet</h3>
                <p style={{ margin: '0 0 20px 0' }}>Get started by adding your first team member.</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>No staff members found</h3>
                <p style={{ margin: '0' }}>Try adjusting your search criteria or filters.</p>
              </>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-table-header)', borderBottom: '2px solid var(--color-table-border)' }}>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Employee Details
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Staff Number
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    ID/RSSB Number
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Department
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Position
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
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
                    style={{ borderBottom: '1px solid var(--color-table-border)' }}
                  >
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ 
                          fontWeight: 500, 
                          color: 'var(--color-text-primary)',
                          marginBottom: '4px'
                        }}>
                          {member.firstName} {member.lastName}
                        </div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: 'var(--color-text-secondary)'
                        }}>
                          {member.email}
                        </div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: 'var(--color-text-secondary)'
                        }}>
                          {member.phone}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      {member.staffNumber ? (
                        member.staffNumber
                      ) : (
                        <span style={{ 
                          color: 'var(--color-error-text)', 
                          fontWeight: 'bold',
                          backgroundColor: 'var(--color-error-bg)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          MISSING STAFF#
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
                        ID: {member.idNumber}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        RSSB: {member.rssbNumber}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-primary)' }}>
                      {member.department}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-primary)' }}>
                      {member.position}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: 
                          member.status === 'active' ? 'var(--color-success-bg)' :
                          member.status === 'inactive' ? 'var(--color-warning-bg)' : 'var(--color-error-bg)',
                        color: 
                          member.status === 'active' ? 'var(--color-success-text)' :
                          member.status === 'inactive' ? 'var(--color-warning-text)' : 'var(--color-error-text)'
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
                            border: '1px solid var(--color-button-primary)',
                            background: 'var(--color-card-bg)',
                            color: 'var(--color-button-primary)',
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
                            border: '1px solid var(--color-error-border)',
                            background: 'var(--color-card-bg)',
                            color: 'var(--color-error-text)',
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
          background: 'var(--color-bg-overlay)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-card-bg)',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowForm(false)}
              className="modal-close-btn"
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

      {/* Import/Export Modal */}
      {showImportExport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--color-bg-overlay)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-card-bg)',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowImportExport(false)}
              className="modal-close-btn"
            >
              ×
            </button>
            <StaffImportExport 
              companyId={companyId} 
              staff={staff}
              onImported={() => {
                setShowImportExport(false);
                loadStaff();
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;