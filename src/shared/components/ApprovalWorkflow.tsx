import React, { useEffect, useState } from 'react';
import { fetchPayroll } from '../../features/payroll/services/fetchPayroll';
import {
  submitPayroll,
  approvePayroll,
  rejectPayroll,
  PayrollStatus,
} from '../../features/payroll/services/payroll.service';

// TODO: Replace with real user/role context
const mockUser = { id: 'demo-user', role: 'company_admin' };

export default function ApprovalWorkflow({
  payrollId,
  companyId,
}: {
  payrollId: string;
  companyId: string;
}) {
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!payrollId || !companyId) return;
    setLoading(true);
    fetchPayroll(companyId, payrollId)
      .then(setPayroll)
      .catch(e => setError(e.message || 'Failed to load payroll'))
      .finally(() => setLoading(false));
  }, [payrollId, companyId, refresh]);

  const canSubmit =
    payroll &&
    payroll.status === 'draft' &&
    ['payroll_preparer', 'company_admin', 'app_admin', 'primary_admin'].includes(mockUser.role);
  const canApprove =
    payroll &&
    payroll.status === 'submitted' &&
    ['company_admin', 'app_admin', 'primary_admin'].includes(mockUser.role);
  const canReject = canApprove;

  const handleSubmit = async () => {
    setActionError(null);
    try {
      await submitPayroll(companyId, payrollId, mockUser.id);
      setRefresh(r => r + 1);
    } catch (e: any) {
      setActionError(e.message || 'Failed to submit payroll');
    }
  };
  const handleApprove = async () => {
    setActionError(null);
    try {
      await approvePayroll(companyId, payrollId, mockUser.id);
      setRefresh(r => r + 1);
    } catch (e: any) {
      setActionError(e.message || 'Failed to approve payroll');
    }
  };
  const handleReject = async () => {
    setActionError(null);
    try {
      await rejectPayroll(companyId, payrollId, mockUser.id, rejectReason);
      setRefresh(r => r + 1);
      setRejectReason('');
    } catch (e: any) {
      setActionError(e.message || 'Failed to reject payroll');
    }
  };

  return (
    <div className="approval-workflow">
      <h4>Approval Workflow</h4>
      {loading && <div>Loading workflow...</div>}
      {error && (
        <div className="approval-error" role="alert">
          {error}
        </div>
      )}
      {payroll && (
        <div>
          <div>
            Status: <b>{payroll.status || 'draft'}</b>
          </div>
          {payroll.status === 'rejected' && (
            <div style={{ color: 'crimson' }}>
              Rejected: {payroll.rejectionReason || 'No reason provided'}
            </div>
          )}
          <div style={{ margin: '8px 0' }}>
            {canSubmit && <button onClick={handleSubmit}>Submit for Approval</button>}
            {canApprove && <button onClick={handleApprove}>Approve</button>}
            {canReject && (
              <span>
                <input
                  type="text"
                  placeholder="Rejection reason"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  style={{ marginRight: 4 }}
                />
                <button onClick={handleReject} disabled={!rejectReason}>
                  Reject
                </button>
              </span>
            )}
          </div>
          {actionError && (
            <div className="approval-action-error" role="alert">
              {actionError}
            </div>
          )}
          <div style={{ fontSize: 12, color: '#888' }}>
            <div>Submitted by: {payroll.submittedBy || '-'}</div>
            <div>Approved by: {payroll.approvedBy || '-'}</div>
            <div>Rejected by: {payroll.rejectedBy || '-'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
