import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Example expects data: { payrolls: Array<{ month: string, total: number }>, staff: Array<{ month: string, count: number }> }
interface ChartData {
  payrolls?: Array<{ month: string; total: number }>;
  staff?: Array<{ month: string; count: number }>;
  approvedCount?: number;
  pendingCount?: number;
  rejectedCount?: number;
}

export default function AdvancedCharts({ data }: { data: ChartData }) {
  const payrolls = data?.payrolls || [];
  const staff = data?.staff || [];
  const pieData = [
    { name: 'Approved', value: data?.approvedCount || 0 },
    { name: 'Pending', value: data?.pendingCount || 0 },
    { name: 'Rejected', value: data?.rejectedCount || 0 },
  ];
  const COLORS = ['#4caf50', '#ff9800', '#f44336'];
  return (
    <div className="advanced-charts">
      <h4>Advanced Analytics</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
        <div style={{ width: 350, height: 250 }}>
          <h5>Payrolls Over Time</h5>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={payrolls} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#1976d2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: 350, height: 250 }}>
          <h5>Staff Growth</h5>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={staff} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#43a047" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: 250, height: 250 }}>
          <h5>Payroll Status</h5>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
