import React, { useEffect, useState, memo, useCallback } from 'react';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { APP_CONSTANTS } from '../../../shared/constants/app.constants';

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

const Dashboard: React.FC<DashboardProps> = memo(({ companyId }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    staffCount: 0,
    payrollCount: 0,
    pendingApprovals: 0,
    totalPayments: 0,
    totalDeductions: 0,
    thisMonthPayroll: 0
  });
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const navigate = useNavigate();

  // Cache data for 5 minutes to reduce API calls
  const CACHE_DURATION = 5 * 60 * 1000;

  useEffect(() => {
    const now = Date.now();
    // Skip API call if data is still fresh
    if (lastUpdated && (now - lastUpdated) < CACHE_DURATION) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      const db = getFirestore();
      
      try {
        // Prepare all queries to run in parallel
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        
        const queries = [
          // Staff count
          getDocs(collection(db, 'companies', companyId, 'staff')),
          
          // Payroll count
          getDocs(collection(db, 'companies', companyId, 'payrolls')),
          
          // Pending approvals count
          getDocs(query(
            collection(db, 'companies', companyId, 'payrolls'),
            where('status', '==', 'pending_approval')
          )),
          
          // Active payments (for amount calculation)
          getDocs(query(
            collection(db, 'companies', companyId, 'payments'),
            where('status', '==', 'active')
          )),
          
          // Active deductions count
          getDocs(query(
            collection(db, 'companies', companyId, 'deductions'),
            where('status', '==', 'active')
          )),
          
          // This month's payroll
          getDocs(query(
            collection(db, 'companies', companyId, 'payrolls'),
            where('period', '>=', currentMonth + '-01'),
            where('period', '<=', currentMonth + '-31'),
            orderBy('period', 'desc'),
            limit(1)
          ))
        ];

        // Execute all queries in parallel
        const [
          staffSnap,
          payrollSnap, 
          pendingApprovalsSnap,
          activePaymentsSnap,
          activeDeductionsSnap,
          thisMonthPayrollSnap
        ] = await Promise.all(queries);

        // Process results
        const staffCount = staffSnap.size;
        const payrollCount = payrollSnap.size;
        const pendingApprovals = pendingApprovalsSnap.size;
        const totalDeductions = activeDeductionsSnap.size;

        // Calculate total payments amount
        let totalPaymentsAmount = 0;
        activePaymentsSnap.forEach(doc => {
          const payment = doc.data();
          totalPaymentsAmount += payment.amount || 0;
        });

        // Calculate this month's payroll
        let thisMonthPayroll = 0;
        if (!thisMonthPayrollSnap.empty) {
          const latestPayroll = thisMonthPayrollSnap.docs[0].data();
          thisMonthPayroll = latestPayroll.totalNetPay || 0;
        }

        setMetrics({
          staffCount,
          payrollCount,
          pendingApprovals,
          totalPayments: totalPaymentsAmount,
          totalDeductions,
          thisMonthPayroll
        });
        setLastUpdated(Date.now());

      } catch (error) {
        // Show user-friendly error message instead of console log
        setError('Unable to load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [companyId, lastUpdated, CACHE_DURATION]);

  const quickActions = [
    { 
      title: 'Add New Employee', 
      description: 'Register a new staff member',
      icon: '👤',
      action: useCallback(() => navigate('/staff'), [navigate])
    },
    { 
      title: 'Process Payroll', 
      description: 'Create and calculate payroll',
      icon: '💰',
      action: useCallback(() => navigate('/payroll'), [navigate])
    },
    { 
      title: 'Generate Reports', 
      description: 'View and export reports',
      icon: '📊',
      action: useCallback(() => navigate('/reports'), [navigate])
    },
    { 
      title: 'Manage Payments', 
      description: 'Configure employee payments',
      icon: '💳',
      action: useCallback(() => navigate('/payments'), [navigate])
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
          Last updated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {new Date().toLocaleTimeString()}
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
            {new Intl.NumberFormat('en-RW', { style: 'currency', currency: APP_CONSTANTS.CURRENCY.CODE }).format(metrics.totalPayments)}
          </div>
          <div className="dashboard-metric-change">
            Total monthly amount
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-header">
            <span className="dashboard-metric-icon">📅</span>
            <h3 className="dashboard-metric-title">This Month's Payroll</h3>
          </div>
          <div className="dashboard-metric-value">
            {new Intl.NumberFormat('en-RW', { style: 'currency', currency: APP_CONSTANTS.CURRENCY.CODE }).format(metrics.thisMonthPayroll)}
          </div>
          <div className="dashboard-metric-change">
            Net pay distributed
          </div>
        </div>
      </div>

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
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;