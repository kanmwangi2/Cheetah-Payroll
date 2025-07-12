import React, { useEffect, useState } from 'react';
import { getPayments, updatePayment, deletePayment } from '../services/payments.service';
import { getStaff } from '../../staff/services/staff.service';
import { Payment, Staff } from '../../../shared/types';
import PaymentsForm from './PaymentsForm';
import PaymentsImportExport from './PaymentsImportExport';

const PaymentsList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [paymentsData, staffData] = await Promise.all([
          getPayments(companyId),
          getStaff(companyId)
        ]);
        setPayments(paymentsData);
        // Ensure staffData is cast to the shared Staff type
        const sharedStaff: Staff[] = Array.isArray(staffData)
          ? staffData.map(s => ({
              id: s.id,
              companyId: s.companyId,
              personalDetails: s.personalDetails,
              employmentDetails: s.employmentDetails,
              bankDetails: s.bankDetails,
              createdAt: s.createdAt,
              updatedAt: s.updatedAt
            }))
          : (staffData.data ?? []).map((s: any) => ({
              id: s.id,
              companyId: s.companyId,
              personalDetails: s.personalDetails,
              employmentDetails: s.employmentDetails,
              bankDetails: s.bankDetails,
              createdAt: s.createdAt,
              updatedAt: s.updatedAt
            }));
        setStaff(sharedStaff);
      } catch (e: any) {
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [companyId, refresh]);

  const getStaffName = (staffId: string) => {
    const s = staff.find(staff => staff.id === staffId);
    return s ? `${s.personalDetails?.firstName || ''} ${s.personalDetails?.lastName || ''}`.trim() : staffId;
  };

  const handleStatusToggle = async (payment: Payment) => {
    try {
      const newStatus = payment.status === 'active' ? 'inactive' : 'active';
      await updatePayment(companyId, payment.id, { 
        ...payment, 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setRefresh(r => r + 1);
    } catch (e: any) {
      setError(e.message || 'Failed to update payment status');
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) {return;}
    try {
      await deletePayment(companyId, paymentId);
      setRefresh(r => r + 1);
    } catch (e: any) {
      setError(e.message || 'Failed to delete payment');
    }
  };

  const filtered = payments.filter(p => {
    const staffName = getStaffName(p.staffId);
    const matchesSearch =
      !search ||
      p.type?.toLowerCase().includes(search.toLowerCase()) ||
      staffName.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || p.type === filterType;
    const matchesStatus = !filterStatus || p.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const uniqueTypes = Array.from(new Set(payments.map(p => p.type))).filter(Boolean);
  const uniqueStatuses = Array.from(new Set(payments.map(p => p.status))).filter(Boolean);

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
          Payments Management
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
              const csvContent = 'type,amount,staffId,description\n' + 
                payments.map(p => `${p.type},${p.amount},${p.staffId},${p.description || ''}`).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'payments_export.csv';
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
              const template = 'type,amount,staffId,description,isGross,isRecurring,effectiveDate\nsalary,500000,STAFF_ID,Monthly salary,true,true,2023-01-01';
              const blob = new Blob([template], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'payments_import_template.csv';
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
            + Add Payment
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
        <div className="payments-table-controls" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '2' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 500,
              color: '#333'
            }}>
              Search Payments
            </label>
            <input
              type="search"
              placeholder="Search by type, employee, or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 500,
              color: '#333'
            }}>
              Type
            </label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '14px'
              }}
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 500,
              color: '#333'
            }}>
              Status
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '14px'
              }}
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
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
          <span>Showing {filtered.length} of {payments.length} payments</span>
          {(search || filterType || filterStatus) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterType('');
                setFilterStatus('');
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
      {/* Payments Table */}
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {loading ? (
          <div style={{ 
            padding: '60px 40px', 
            textAlign: 'center',
            color: '#666'
          }}>
            Loading payments...
          </div>
        ) : error ? (
          <div style={{ 
            padding: '60px 40px', 
            textAlign: 'center',
            color: '#dc3545'
          }} role="alert">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ 
            padding: '60px 40px', 
            textAlign: 'center',
            color: '#666'
          }}>
            {payments.length === 0 ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💰</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No payments yet</h3>
                <p style={{ margin: '0' }}>Get started by adding your first payment.</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No payments found</h3>
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
                    Type
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Amount
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Employee
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Gross/Net
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Recurring
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Effective Date
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500, color: '#333', marginBottom: '4px' }}>
                        {p.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      {p.description && (
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
                      RWF {p.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px', color: '#333' }}>
                      {getStaffName(p.staffId)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: p.isGross ? '#e3f2fd' : '#fff3e0',
                        color: p.isGross ? '#1976d2' : '#f57c00'
                      }}>
                        {p.isGross ? 'Gross' : 'Net'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#333' }}>
                      {p.isRecurring ? '✓' : '✗'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleStatusToggle(p)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '16px',
                          border: 'none',
                          background: p.status === 'active' ? '#e8f5e8' : '#f8d7da',
                          color: p.status === 'active' ? '#2e7d32' : '#721c24',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        {p.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#333' }}>
                      <div>{new Date(p.effectiveDate).toLocaleDateString()}</div>
                      {p.endDate && (
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          to {new Date(p.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 4,
                          border: '1px solid #dc3545',
                          background: '#fff',
                          color: '#dc3545',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Adding Payment */}
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
            <PaymentsForm 
              companyId={companyId} 
              onAdded={() => {
                setShowForm(false);
                setRefresh(r => r + 1);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsList;
