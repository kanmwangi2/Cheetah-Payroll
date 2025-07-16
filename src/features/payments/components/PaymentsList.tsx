import React, { useEffect, useState } from 'react';
import { getPayments, updatePayment, deletePayment } from '../services/payments.service';
import { getStaff } from '../../staff/services/staff.service';
import { Payment, Staff } from '../../../shared/types';
import PaymentsForm from './PaymentsForm';
import PaymentsImportExport from './PaymentsImportExport';
import PaymentProfile from './PaymentProfile';

const PaymentsList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

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
      } catch (e: unknown) {
        setError((e as Error).message || 'Failed to load data');
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
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to update payment status');
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) {return;}
    try {
      await deletePayment(companyId, paymentId);
      setRefresh(r => r + 1);
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to delete payment');
    }
  };

  const filtered = payments.filter(p => p !== null).filter(p => {
    const staffName = getStaffName(p?.staffId);
    const matchesSearch =
      !search ||
      p?.type?.toLowerCase().includes(search.toLowerCase()) ||
      staffName.toLowerCase().includes(search.toLowerCase()) ||
      p?.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || p?.type === filterType;
    const matchesStatus = !filterStatus || p?.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const uniqueTypes = Array.from(new Set(payments.filter(p => p?.type).map(p => p.type))).filter(Boolean);
  const uniqueStatuses = Array.from(new Set(payments.filter(p => p?.status).map(p => p.status))).filter(Boolean);

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
          Payments Management
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowImportExport(true)}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--color-primary-600)',
              color: 'var(--color-text-inverse)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'all var(--transition-normal)'
            }}
          >
            📤 Import/Export
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--color-primary-600)',
              color: 'var(--color-text-inverse)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'all var(--transition-normal)'
            }}
          >
            + Add Payment
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
        boxShadow: 'var(--shadow-md)'
      }}>
        <div className="payments-table-controls" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '2' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 500,
              color: 'var(--color-text-primary)'
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
                border: '1px solid var(--color-input-border)',
                borderRadius: 4,
                fontSize: '14px',
                background: 'var(--color-input-bg)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
          
          <div style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 500,
              color: 'var(--color-text-primary)'
            }}>
              Type
            </label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-input-border)',
                borderRadius: 4,
                fontSize: '14px',
                background: 'var(--color-input-bg)',
                color: 'var(--color-text-primary)'
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
              color: 'var(--color-text-primary)'
            }}>
              Status
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-input-border)',
                borderRadius: 4,
                fontSize: '14px',
                background: 'var(--color-input-bg)',
                color: 'var(--color-text-primary)'
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
          color: 'var(--color-text-secondary)',
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
              className="btn btn-ghost btn-xs"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
      {/* Payments Table */}
      <div style={{
        background: 'var(--color-card-bg)',
        borderRadius: '8px',
        border: '1px solid var(--color-card-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }}>
        {loading ? (
          <div style={{ 
            padding: '60px 40px', 
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            Loading payments...
          </div>
        ) : error ? (
          <div style={{ 
            padding: '60px 40px', 
            textAlign: 'center',
            color: 'var(--color-error-600)'
          }} role="alert">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ 
            padding: '60px 40px', 
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            {payments.length === 0 ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💰</div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>No payments yet</h3>
                <p style={{ margin: '0' }}>Get started by adding your first payment.</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>No payments found</h3>
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
                    Type
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Amount
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Employee
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Gross/Net
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Recurring
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Effective Date
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p?.id || `payment-${Math.random()}`} style={{ borderBottom: '1px solid var(--color-table-border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                        {p?.type ? p.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Type'}
                      </div>
                      {p?.description && (
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                      RWF {(p?.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-primary)' }}>
                      {getStaffName(p?.staffId || '')}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: p?.isGross ? 'var(--color-info-100)' : 'var(--color-warning-100)',
                        color: p?.isGross ? 'var(--color-info-700)' : 'var(--color-warning-700)'
                      }}>
                        {p?.isGross ? 'Gross' : 'Net'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-primary)' }}>
                      {p?.isRecurring ? '✓' : '✗'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleStatusToggle(p)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '16px',
                          border: 'none',
                          background: p.status === 'active' ? 'var(--color-success-100)' : 'var(--color-error-100)',
                          color: p.status === 'active' ? 'var(--color-success-700)' : 'var(--color-error-700)',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        {p.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-primary)' }}>
                      <div>{new Date(p.effectiveDate).toLocaleDateString()}</div>
                      {p.endDate && (
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          to {new Date(p.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div className="table-actions">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="btn btn-info btn-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setEditingPayment(p)}
                          className="btn btn-warning btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="btn btn-danger btn-sm"
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

      {/* Modal for Adding Payment */}
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

      {/* Edit Payment Modal */}
      {editingPayment && (
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
              onClick={() => setEditingPayment(null)}
              className="modal-close-btn"
            >
              ×
            </button>
            <PaymentsForm 
              companyId={companyId}
              paymentData={editingPayment}
              isEditMode={true}
              onAdded={() => {
                setEditingPayment(null);
                setRefresh(r => r + 1);
              }} 
            />
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {showImportExport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowImportExport(false)}
              className="modal-close-btn"
            >
              ×
            </button>
            <PaymentsImportExport 
              companyId={companyId} 
              payments={payments}
              onImported={() => {
                setShowImportExport(false);
                setRefresh(r => r + 1);
              }} 
            />
          </div>
        </div>
      )}

      {/* Payment Profile Modal */}
      {selectedPayment && (
        <PaymentProfile
          companyId={companyId}
          paymentId={selectedPayment.id}
          onClose={() => setSelectedPayment(null)}
          onUpdated={() => {
            setRefresh(r => r + 1);
          }}
        />
      )}
    </div>
  );
};

export default PaymentsList;
