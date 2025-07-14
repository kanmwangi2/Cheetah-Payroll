import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
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
  const [error, setError] = useState<string | null>(null);
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

        // Fetch pending approvals
        const pendingQuery = query(
          collection(db, 'companies', companyId, 'payrolls'),
          where('status', '==', 'pending_approval')
        );
        const pendingSnap = await getDocs(pendingQuery);
        const pendingApprovals = pendingSnap.size;

        // Fetch payments count
        const paymentsSnap = await getDocs(collection(db, 'companies', companyId, 'payments'));
        const totalPayments = paymentsSnap.size;

        // Fetch deductions count
        const deductionsSnap = await getDocs(collection(db, 'companies', companyId, 'deductions'));
        const totalDeductions = deductionsSnap.size;

        // Calculate this month's payroll value (placeholder)
        const thisMonthPayroll = 0; // Will be calculated from actual payroll data

        setMetrics({
          staffCount,
          payrollCount,
          pendingApprovals,
          totalPayments,
          totalDeductions,
          thisMonthPayroll
        });

        // Fetch recent activity (placeholder data for now)
        setRecentActivity([
          {
            id: '1',
            type: 'staff',
            description: 'New employee John Doe added',
            timestamp: new Date(),
            status: 'completed'
          },
          {
            id: '2',
            type: 'payroll',
            description: 'March 2025 payroll created',
            timestamp: new Date(Date.now() - 3600000),
            status: 'pending_approval'
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
        // Show user-friendly error message instead of console log
        setError('Unable to load dashboard data. Please try refreshing the page.');
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
      action: () => navigate('/staff'),
      color: '#1976d2'
    },
    { 
      title: 'Process Payroll', 
      description: 'Create and calculate payroll',
      icon: '💰',
      action: () => navigate('/payroll'),
      color: '#388e3c'
    },
    { 
      title: 'Generate Reports', 
      description: 'View and export reports',
      icon: '📊',
      action: () => navigate('/reports'),
      color: '#f57c00'
    },
    { 
      title: 'Manage Payments', 
      description: 'Configure employee payments',
      icon: '💳',
      action: () => navigate('/payments'),
      color: '#7b1fa2'
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
          <div style={{ fontSize: '2rem', fontWeight: 600, color: '#1976d2' }}>
            {metrics.staffCount}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
            Active employees
          </div>
        </div>

        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            <h3 style={{ margin: 0, color: '#333', fontSize: '1rem' }}>Payrolls</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, color: '#388e3c' }}>
            {metrics.payrollCount}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
            Total processed
          </div>
        </div>

        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>⏳</span>
            <h3 style={{ margin: 0, color: '#333', fontSize: '1rem' }}>Pending Approvals</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, color: '#f57c00' }}>
            {metrics.pendingApprovals}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
            Awaiting review
          </div>
        </div>

        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
            <h3 style={{ margin: 0, color: '#333', fontSize: '1rem' }}>Active Payments</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, color: '#7b1fa2' }}>
            {metrics.totalPayments}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
            Payment records
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Quick Actions */}
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '1.1rem' }}>
            Quick Actions
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                style={{
                  background: '#f8f9fa',
                  border: `2px solid ${action.color}20`,
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = `${action.color}10`;
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = '#f8f9fa';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '8px' 
                }}>
                  {action.icon}
                </div>
                <div style={{ 
                  fontWeight: 600, 
                  color: action.color,
                  marginBottom: '4px',
                  fontSize: '0.95rem'
                }}>
                  {action.title}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#666' 
                }}>
                  {action.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '1.1rem' }}>
            Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                padding: '20px',
                fontSize: '0.9rem'
              }}>
                No recent activity
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${
                      activity.type === 'staff' ? '#1976d2' :
                      activity.type === 'payroll' ? '#388e3c' :
                      activity.type === 'payment' ? '#7b1fa2' : '#f57c00'
                    }`
                  }}
                >
                  <div style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 500,
                    marginBottom: '4px'
                  }}>
                    {activity.description}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#666',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{activity.timestamp.toLocaleString()}</span>
                    {activity.status && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        background: activity.status === 'completed' ? '#e8f5e8' : '#fff3cd',
                        color: activity.status === 'completed' ? '#2e7d32' : '#856404'
                      }}>
                        {activity.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '1.1rem' }}>
          System Overview
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>System Status</div>
            <div style={{ fontSize: '0.9rem', color: '#28a745' }}>All Systems Operational</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔄</div>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>Last Backup</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Today, 2:00 AM</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📈</div>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>Performance</div>
            <div style={{ fontSize: '0.9rem', color: '#28a745' }}>Excellent</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
