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
      <div className="deductions-table-controls">
        <input
          type="search"
          placeholder="Search by type, employee, or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="deductions-search"
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
        <div className="deductions-table-wrapper">
          <table className="deductions-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Employee</th>
                <th style={{ textAlign: 'right' }}>Original Amount</th>
                <th style={{ textAlign: 'right' }}>Remaining</th>
                <th style={{ textAlign: 'center' }}>Progress</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Loan Details</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {DEDUCTION_TYPE_LABELS[d.type] || d.type}
                    </div>
                    {d.description && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-xs)' }}>
                        {d.description}
                      </div>
                    )}
                  </td>
                  <td>
                    {getStaffName(d.staffId)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-medium)' }}>
                    RWF {d.originalAmount.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-medium)', color: d.remainingBalance > 0 ? 'var(--color-error-text)' : 'var(--color-success-text)' }}>
                    RWF {d.remainingBalance.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ width: '100px', margin: '0 auto' }}>
                      <div className="progress-bar">
                        <div className={`progress-fill ${d.status === 'completed' ? 'completed' : ''}`} style={{ width: `${getProgressPercentage(d)}%` }} />
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-xs)' }}>
                        {getProgressPercentage(d)}%
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-badge status-${d.status}`}>
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {d.type === 'loan' && (
                      <div style={{ fontSize: 'var(--font-size-xs)' }}>
                        {d.monthlyInstallment && (
                          <div>Monthly: RWF {d.monthlyInstallment.toLocaleString()}</div>
                        )}
                        {d.remainingInstallments && (
                          <div>Remaining: {d.remainingInstallments} payments</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {d.type === 'loan' && d.status === 'active' && d.remainingBalance > 0 && (
                        <button
                          onClick={() => setPaymentModalOpen(d.id)}
                          className="primary-btn"
                          style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                        >
                          Record Payment
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="secondary-btn"
                        style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--spacing-xs) var(--spacing-sm)', color: 'var(--color-error-text)', borderColor: 'var(--color-error-border)' }}
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', width: '90%' }}>
            <h3>Record Loan Payment</h3>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label>
                Payment Amount
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  style={{ marginTop: 'var(--spacing-xs)' }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setPaymentModalOpen(null);
                  setPaymentAmount('');
                }}
                className="secondary-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLoanPayment(paymentModalOpen)}
                className="primary-btn"
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
