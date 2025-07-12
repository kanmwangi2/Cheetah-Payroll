import React, { useEffect, useState } from 'react';
import { getDeductions, processLoanPayment, deleteDeduction, DEDUCTION_TYPE_LABELS, validateDeductionPayment } from '../services/deductions.service';
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
  const [showForm, setShowForm] = useState(false);

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

    const amount = parseFloat(paymentAmount);
    const deduction = deductions.find(d => d.id === deductionId);
    
    if (deduction) {
      // Validate payment amount against remaining balance
      const validationError = validateDeductionPayment(deduction, amount);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    try {
      await processLoanPayment(companyId, deductionId, amount);
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
          Deductions Management
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
              border: '1px solid var(--color-success-500)',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-success-500)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            📤 Import CSV
          </button>
          <button
            onClick={() => {
              const csvContent = 'type,staffId,originalAmount,monthlyAmount,description\n' + 
                deductions.map(d => `${d.type},${d.staffId},${d.originalAmount},${d.monthlyInstallment || ''},${d.description || ''}`).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'deductions_export.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 6,
              border: '1px solid var(--color-info-500)',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-info-500)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => {
              const template = 'type,staffId,originalAmount,description,monthlyInstallment\nloan,STAFF_ID,100000,Employee loan,10000';
              const blob = new Blob([template], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'deductions_import_template.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 6,
              border: '1px solid var(--color-gray-500)',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-gray-500)',
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
              background: 'var(--color-button-primary)',
              color: 'var(--color-text-inverse)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            + Add Deduction
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
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '2' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 500,
              color: 'var(--color-text-primary)'
            }}>
              Search Deductions
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
                  {DEDUCTION_TYPE_LABELS[type] || type}
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
          <span>Showing {filtered.length} of {deductions.length} deductions</span>
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
                border: '1px solid var(--color-border-primary)',
                background: 'var(--color-bg-primary)',
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
      {/* Deductions Table */}
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
            Loading deductions...
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
            {deductions.length === 0 ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📉</div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>No deductions yet</h3>
                <p style={{ margin: '0' }}>Get started by adding your first deduction.</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>No deductions found</h3>
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
                    textAlign: 'left', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Employee
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Original Amount
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Monthly Amount
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Remaining
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    fontSize: '14px'
                  }}>
                    Progress
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
                    Loan Details
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
                {filtered.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--color-table-border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                        {DEDUCTION_TYPE_LABELS[d.type] || d.type}
                      </div>
                      {d.description && (
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          {d.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-primary)' }}>
                      {getStaffName(d.staffId)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      RWF {d.originalAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 500, color: 'var(--color-primary-600)' }}>
                      {d.monthlyInstallment ? `RWF ${d.monthlyInstallment.toLocaleString()}` : 'N/A'}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'right', 
                      fontWeight: 500, 
                      color: d.remainingBalance > 0 ? 'var(--color-error-600)' : 'var(--color-success-600)' 
                    }}>
                      RWF {d.remainingBalance.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ width: '100px', margin: '0 auto' }}>
                        <div style={{ 
                          width: '100%', 
                          height: '8px', 
                          background: 'var(--color-gray-200)', 
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${getProgressPercentage(d)}%`,
                            height: '100%',
                            background: d.status === 'completed' ? 'var(--color-success-500)' : 'var(--color-primary-500)',
                            transition: 'width 0.3s'
                          }} />
                        </div>
                        <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--color-text-secondary)' }}>
                          {getProgressPercentage(d)}%
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: 
                          d.status === 'active' ? 'var(--color-success-100)' :
                          d.status === 'completed' ? 'var(--color-info-100)' : 'var(--color-error-100)',
                        color: 
                          d.status === 'active' ? 'var(--color-success-700)' :
                          d.status === 'completed' ? 'var(--color-info-700)' : 'var(--color-error-700)'
                      }}>
                        {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {d.type === 'loan' && (
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          {d.monthlyInstallment && (
                            <div>Monthly: RWF {d.monthlyInstallment.toLocaleString()}</div>
                          )}
                          {d.remainingInstallments && (
                            <div>Remaining: {d.remainingInstallments} payments</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {d.type === 'loan' && d.status === 'active' && d.remainingBalance > 0 && (
                          <button
                            onClick={() => setPaymentModalOpen(d.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 4,
                              border: '1px solid var(--color-primary-500)',
                              background: 'var(--color-bg-primary)',
                              color: 'var(--color-primary-500)',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Record Payment
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(d.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 4,
                            border: '1px solid var(--color-error-500)',
                            background: 'var(--color-bg-primary)',
                            color: 'var(--color-error-500)',
                            fontSize: '12px',
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
      </div>
      {/* Modal for Adding Deduction */}
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
            <DeductionsForm 
              companyId={companyId} 
              onAdded={() => {
                setShowForm(false);
                setRefresh(r => r + 1);
              }} 
            />
          </div>
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
          background: 'var(--color-bg-overlay)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-card-bg)',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            padding: '24px',
            position: 'relative'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--color-text-primary)' }}>Record Loan Payment</h3>
            {(() => {
              const deduction = deductions.find(d => d.id === paymentModalOpen);
              return deduction && (
                <div style={{ 
                  marginBottom: '16px', 
                  padding: '12px',
                  background: 'var(--color-info-100)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)'
                }}>
                  <div><strong>Remaining Balance:</strong> RWF {deduction.remainingBalance.toLocaleString()}</div>
                  {deduction.monthlyInstallment && (
                    <div><strong>Monthly Installment:</strong> RWF {deduction.monthlyInstallment.toLocaleString()}</div>
                  )}
                </div>
              );
            })()}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: 500,
                color: 'var(--color-text-primary)'
              }}>
                Payment Amount
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                placeholder="Enter payment amount"
                max={(() => {
                  const deduction = deductions.find(d => d.id === paymentModalOpen);
                  return deduction ? deduction.remainingBalance : undefined;
                })()}
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
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setPaymentModalOpen(null);
                  setPaymentAmount('');
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: 4,
                  border: '1px solid var(--color-border-primary)',
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleLoanPayment(paymentModalOpen)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 4,
                  border: 'none',
                  background: 'var(--color-button-primary)',
                  color: 'var(--color-text-inverse)',
                  cursor: 'pointer',
                  fontSize: '14px'
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
