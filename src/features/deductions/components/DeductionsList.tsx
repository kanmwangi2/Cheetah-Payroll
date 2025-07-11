import React, { useEffect, useState } from 'react';
import { getDeductions, processLoanPayment, deleteDeduction, DEDUCTION_TYPE_LABELS } from '../services/deductions.service';
import { getStaff } from '../../staff/services/staff.service';
import { Deduction, Staff } from '../../../shared/types';
import DeductionsForm from './DeductionsForm';
import DeductionsImportExport from './DeductionsImportExport';

const DeductionsList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [deductionsData, staffData] = await Promise.all([
          getDeductions(companyId),
          getStaff(companyId)
        ]);
        setDeductions(deductionsData);
        // Ensure staffData is cast to the shared Staff type
        // Cast staffData to shared Staff type for type safety
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

  const handleLoanPayment = async (deductionId: string) => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) {
      setError('Please enter a valid payment amount');
      return;
    }

    try {
      await processLoanPayment(companyId, deductionId, parseFloat(paymentAmount));
      setPaymentModalOpen(null);
      setPaymentAmount('');
      setRefresh(r => r + 1);
    } catch (e: any) {
      setError(e.message || 'Failed to process payment');
    }
  };

  const handleDelete = async (deductionId: string) => {
    if (!confirm('Are you sure you want to cancel this deduction?')) {return;}
    try {
      await deleteDeduction(companyId, deductionId);
      setRefresh(r => r + 1);
    } catch (e: any) {
      setError(e.message || 'Failed to delete deduction');
    }
  };

  const filtered = deductions.filter(d => {
    const staffName = getStaffName(d.staffId);
    const matchesSearch =
      !search ||
      d.type?.toLowerCase().includes(search.toLowerCase()) ||
      staffName.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || d.type === filterType;
    const matchesStatus = !filterStatus || d.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const uniqueTypes = Array.from(new Set(deductions.map(d => d.type))).filter(Boolean);
  const uniqueStatuses = Array.from(new Set(deductions.map(d => d.status))).filter(Boolean);

  const getProgressPercentage = (deduction: Deduction) => {
    if (deduction.originalAmount === 0) {return 100;}
    return Math.round(((deduction.originalAmount - deduction.remainingBalance) / deduction.originalAmount) * 100);
  };

  return (
    <div className="deductions-list">
      <h2>Deductions</h2>
      <DeductionsForm companyId={companyId} onAdded={() => setRefresh(r => r + 1)} />
      <DeductionsImportExport
        companyId={companyId}
        onImported={() => setRefresh(r => r + 1)}
        deductions={deductions}
      />
      <div className="deductions-table-controls" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search by type, employee, or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="deductions-search"
          style={{ flex: '1', minWidth: '200px' }}
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="deductions-type-filter"
        >
          <option value="">All Types</option>
          {uniqueTypes.map(type => (
            <option key={type} value={type}>
              {DEDUCTION_TYPE_LABELS[type] || type}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="deductions-status-filter"
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
        <div className="deductions-loading">Loading deductions...</div>
      ) : error ? (
        <div className="deductions-error" role="alert">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="deductions-empty">No deductions found.</div>
      ) : (
        <div className="deductions-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="deductions-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Employee</th>
                <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #dee2e6' }}>Original Amount</th>
                <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #dee2e6' }}>Remaining</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Progress</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Loan Details</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                    <div style={{ fontWeight: '500' }}>
                      {DEDUCTION_TYPE_LABELS[d.type] || d.type}
                    </div>
                    {d.description && (
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                        {d.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                    {getStaffName(d.staffId)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #dee2e6', fontWeight: '500' }}>
                    RWF {d.originalAmount.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #dee2e6', fontWeight: '500', color: d.remainingBalance > 0 ? '#d32f2f' : '#4caf50' }}>
                    RWF {d.remainingBalance.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                    <div style={{ width: '100px', margin: '0 auto' }}>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#e0e0e0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${getProgressPercentage(d)}%`,
                          height: '100%',
                          background: d.status === 'completed' ? '#4caf50' : '#2196f3',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                        {getProgressPercentage(d)}%
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      background: d.status === 'active' ? '#e8f5e8' : d.status === 'completed' ? '#f3e5f5' : '#ffebee',
                      color: d.status === 'active' ? '#2e7d32' : d.status === 'completed' ? '#7b1fa2' : '#c62828'
                    }}>
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                    {d.type === 'loan' && (
                      <div style={{ fontSize: '0.8rem' }}>
                        {d.monthlyInstallment && (
                          <div>Monthly: RWF {d.monthlyInstallment.toLocaleString()}</div>
                        )}
                        {d.remainingInstallments && (
                          <div>Remaining: {d.remainingInstallments} payments</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {d.type === 'loan' && d.status === 'active' && d.remainingBalance > 0 && (
                        <button
                          onClick={() => setPaymentModalOpen(d.id)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #1976d2',
                            background: '#1976d2',
                            color: 'white',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          Record Payment
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(d.id)}
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
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Payment Modal */}
      {paymentModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3>Record Loan Payment</h3>
            <div style={{ marginBottom: '16px' }}>
              <label>
                Payment Amount
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginTop: '4px'
                  }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setPaymentModalOpen(null);
                  setPaymentAmount('');
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  background: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleLoanPayment(paymentModalOpen)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: '#1976d2',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeductionsList;
