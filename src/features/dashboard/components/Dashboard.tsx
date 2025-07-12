import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  companyId: string;
}

interface DashboardMetrics {
  staffCount: number;
  payrollCount: number;
  pendingApprovals: number;
  totalPayments: number;
  totalDeductions: number;
  thisMonthPayroll: number;
}

interface RecentActivity {
  id: string;
  type: 'staff' | 'payroll' | 'payment' | 'deduction';
  description: string;
  timestamp: Date;
  status?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ companyId }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    staffCount: 0,
    payrollCount: 0,
    pendingApprovals: 0,
    totalPayments: 0,
    totalDeductions: 0,
    thisMonthPayroll: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const db = getFirestore();
      
      try {
        // Fetch staff count
        const staffSnap = await getDocs(collection(db, 'companies', companyId, 'staff'));
        const staffCount = staffSnap.size;

        // Fetch payroll count
        const payrollSnap = await getDocs(collection(db, 'companies', companyId, 'payrolls'));
        const payrollCount = payrollSnap.size;

        // Fetch pending approvals (simulated)
        const pendingApprovals = Math.floor(Math.random() * 5);

        // Fetch payments count
        const paymentsSnap = await getDocs(collection(db, 'companies', companyId, 'payments'));
        const totalPayments = paymentsSnap.size;

        // Fetch deductions count
        const deductionsSnap = await getDocs(collection(db, 'companies', companyId, 'deductions'));
        const totalDeductions = deductionsSnap.size;

        // Calculate this month's payroll (simulated)
        const thisMonthPayroll = Math.floor(Math.random() * 1000000) + 500000;

        setMetrics({
          staffCount,
          payrollCount,
          pendingApprovals,
          totalPayments,
          totalDeductions,
          thisMonthPayroll
        });

        // Sample recent activity
        setRecentActivity([
          {
            id: '1',
            type: 'staff',
            description: 'New employee added',
            timestamp: new Date(Date.now() - 3600000),
            status: 'completed'
          },
          {
            id: '2',
            type: 'payroll',
            description: 'Monthly payroll processed',
            timestamp: new Date(Date.now() - 7200000),
            status: 'completed'
          },
          {
            id: '3',
            type: 'payment',
            description: 'Salary payments processed',
            timestamp: new Date(Date.now() - 7200000),
            status: 'completed'
          }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [companyId]);

  const quickActions = [
    { 
      title: 'Add New Employee', 
      description: 'Register a new staff member',
      icon: '👤',
      action: () => navigate('/staff')
    },
    { 
      title: 'Process Payroll', 
      description: 'Create and calculate payroll',
      icon: '💰',
      action: () => navigate('/payroll')
    },
    { 
      title: 'Generate Reports', 
      description: 'View and export reports',
      icon: '📊',
      action: () => navigate('/reports')
    },
    { 
      title: 'Manage Payments', 
      description: 'Configure employee payments',
      icon: '💳',
      action: () => navigate('/payments')
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Dashboard
        </h1>
        <div className="dashboard-timestamp">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-metrics">
        <div className="dashboard-metric-card">
          <div className="dashboard-metric-header">
            <span className="dashboard-metric-icon">👥</span>
            <h3 className="dashboard-metric-title">Total Staff</h3>
          </div>
          <div className="dashboard-metric-value">
            {metrics.staffCount}
          </div>
          <div className="dashboard-metric-change">
            Active employees
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-header">
            <span className="dashboard-metric-icon">📊</span>
            <h3 className="dashboard-metric-title">Payrolls</h3>
          </div>
          <div className="dashboard-metric-value">
            {metrics.payrollCount}
          </div>
          <div className="dashboard-metric-change">
            Total processed
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-header">
            <span className="dashboard-metric-icon">⏳</span>
            <h3 className="dashboard-metric-title">Pending Approvals</h3>
          </div>
          <div className="dashboard-metric-value">
            {metrics.pendingApprovals}
          </div>
          <div className="dashboard-metric-change">
            Awaiting review
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-header">
            <span className="dashboard-metric-icon">💰</span>
            <h3 className="dashboard-metric-title">Active Payments</h3>
          </div>
          <div className="dashboard-metric-value">
            {metrics.totalPayments}
          </div>
          <div className="dashboard-metric-change">
            Payment records
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-3xl)'
      }}>
        {/* Quick Actions */}
        <div className="dashboard-quick-actions">
          <h3 className="dashboard-section-title">
            Quick Actions
          </h3>
          <div className="dashboard-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="dashboard-action-card"
              >
                <div className="dashboard-action-icon">
                  {action.icon}
                </div>
                <div className="dashboard-action-title">
                  {action.title}
                </div>
                <p className="dashboard-action-description">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-recent-activity">
          <h3 className="dashboard-section-title">
            Recent Activity
          </h3>
          <div>
            {recentActivity.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: 'var(--color-text-secondary)', 
                padding: 'var(--spacing-xl)',
                fontSize: 'var(--font-size-sm)'
              }}>
                No recent activity
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="dashboard-activity-item"
                >
                  <div className="dashboard-activity-icon">
                    {activity.type === 'staff' ? '👤' :
                     activity.type === 'payroll' ? '📊' :
                     activity.type === 'payment' ? '💰' : '📉'}
                  </div>
                  <div className="dashboard-activity-content">
                    <p className="dashboard-activity-description">
                      {activity.description}
                    </p>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <p className="dashboard-activity-time">
                        {activity.timestamp.toLocaleString()}
                      </p>
                      {activity.status && (
                        <span className={`dashboard-activity-status status-${activity.status}`}>
                          {activity.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;