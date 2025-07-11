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
    <div className="payments-list">
      <h2>Payments</h2>
      <PaymentsForm companyId={companyId} onAdded={() => setRefresh(r => r + 1)} />
      <PaymentsImportExport
        companyId={companyId}
        onImported={() => setRefresh(r => r + 1)}
        payments={payments}
      />
      <div className="payments-table-controls" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search by type, employee, or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="payments-search"
          style={{ flex: '1', minWidth: '200px' }}
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="payments-type-filter"
        >
          <option value="">All Types</option>
          {uniqueTypes.map(type => (
            <option key={type} value={type}>
              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="payments-status-filter"
        >
          <option value="">All Statuses</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="payments-loading">Loading payments...</div>
      ) : error ? (
        <div className="payments-error" role="alert">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="payments-empty">No payments found.</div>
      ) : (
        <div className="payments-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="payments-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #dee2e6' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Employee</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Gross/Net</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Recurring</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Effective Date</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                    {p.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {p.description && (
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                        {p.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #dee2e6', fontWeight: '500' }}>
                    RWF {p.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                    {getStaffName(p.staffId)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      background: p.isGross ? '#e3f2fd' : '#fff3e0',
                      color: p.isGross ? '#1976d2' : '#f57c00',
                      fontSize: '0.8rem'
                    }}>
                      {p.isGross ? 'Gross' : 'Net'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                    {p.isRecurring ? '✓' : '✗'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                    <button
                      onClick={() => handleStatusToggle(p)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: p.status === 'active' ? '#4caf50' : '#f44336',
                        color: 'white',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {p.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                    {new Date(p.effectiveDate).toLocaleDateString()}
                    {p.endDate && (
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        to {new Date(p.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #dc3545',
                        background: 'white',
                        color: '#dc3545',
                        fontSize: '0.8rem',
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
  );
};

export default PaymentsList;
