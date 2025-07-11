import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { Company } from '../../../shared/types';

interface DashboardProps {
  companyId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ companyId }) => {
  const [staffCount, setStaffCount] = useState<number>(0);
  const [payrollCount, setPayrollCount] = useState<number>(0);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    async function fetchData() {
      setLoading(true);
      // Staff count
      const staffSnap = await getDocs(collection(db, 'companies', companyId, 'staff'));
      setStaffCount(staffSnap.size);
      // Payroll count
      const payrollSnap = await getDocs(collection(db, 'companies', companyId, 'payrolls'));
      setPayrollCount(payrollSnap.size);
      // Pending approvals
      const pendingQuery = query(
        collection(db, 'companies', companyId, 'payrolls'),
        where('status', '==', 'pending_approval')
      );
      const pendingSnap = await getDocs(pendingQuery);
      setPendingApprovals(pendingSnap.size);
      setLoading(false);
    }
    fetchData();
  }, [companyId]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <h2 style={{ color: '#1976d2', marginBottom: 24 }}>Dashboard</h2>
      <div className="dashboard-metrics">
        <div className="dashboard-card">
          <div className="dashboard-metric-label">Staff</div>
          <div className="dashboard-metric-value">{staffCount}</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-metric-label">Active Payrolls</div>
          <div className="dashboard-metric-value">{payrollCount}</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-metric-label">Pending Approvals</div>
          <div className="dashboard-metric-value">{pendingApprovals}</div>
        </div>
      </div>
      {/* Add more widgets, KPIs, and recent activity here */}
    </div>
  );
};

export default Dashboard;
