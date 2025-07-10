import React, { useEffect, useState } from 'react';
import { getPayrolls, createPayroll, calculatePayroll } from '../payroll';

const defaultBrackets = [
  { min: 0, max: 60000, rate: 0 },
  { min: 60001, max: 100000, rate: 10 },
  { min: 100001, max: 200000, rate: 20 },
  { min: 200001, max: null, rate: 30 }
];
const defaultPension = { employee: 6, employer: 8 };
const defaultMaternity = { employee: 0.3, employer: 0.3 };
const defaultCBHI = { employee: 0.5, employer: 0 };
const defaultRAMA = { employee: 7.5, employer: 7.5 };

const PayrollList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState<any>({ gross: '', basic: '', transport: '', otherDeductions: '' });
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    getPayrolls(companyId)
      .then(setPayrolls)
      .catch(e => setError(e.message || 'Failed to load payrolls'))
      .finally(() => setLoading(false));
  }, [companyId, refresh]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    const gross = parseFloat(form.gross);
    const basic = parseFloat(form.basic);
    const transport = parseFloat(form.transport);
    const otherDeductions = parseFloat(form.otherDeductions) || 0;
    const result = calculatePayroll({
      gross,
      basic,
      transport,
      brackets: defaultBrackets,
      pensionRates: defaultPension,
      maternityRates: defaultMaternity,
      cbhiRates: defaultCBHI,
      ramaRates: defaultRAMA,
      otherDeductions
    });
    setResult(result);
  };

  const handleCreate = async () => {
    try {
      await createPayroll(companyId, { ...form, ...result });
      setRefresh(r => r + 1);
      setForm({ gross: '', basic: '', transport: '', otherDeductions: '' });
      setResult(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create payroll');
    }
  };

  if (loading) return <div>Loading payrolls...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Payrolls</h2>
      <div>
        <h3>Create Payroll</h3>
        <input placeholder="Gross Pay" value={form.gross} onChange={e => handleChange('gross', e.target.value)} required />
        <input placeholder="Basic Pay" value={form.basic} onChange={e => handleChange('basic', e.target.value)} required />
        <input placeholder="Transport Allowance" value={form.transport} onChange={e => handleChange('transport', e.target.value)} />
        <input placeholder="Other Deductions" value={form.otherDeductions} onChange={e => handleChange('otherDeductions', e.target.value)} />
        <button onClick={handleCalculate}>Calculate</button>
        {result && (
          <div>
            <h4>Calculation Result</h4>
            <pre>{JSON.stringify(result, null, 2)}</pre>
            <button onClick={handleCreate}>Save Payroll</button>
          </div>
        )}
      </div>
      <h3>Payroll List</h3>
      {payrolls.length === 0 ? (
        <div>No payrolls found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Gross</th>
              <th>Net</th>
              <th>PAYE</th>
              <th>Pension (Emp/Er)</th>
              <th>Maternity (Emp/Er)</th>
              <th>RAMA (Emp/Er)</th>
              <th>CBHI</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map(p => (
              <tr key={p.id}>
                <td>{p.gross}</td>
                <td>{p.finalNet}</td>
                <td>{p.paye}</td>
                <td>{p.pensionEmployee} / {p.pensionEmployer}</td>
                <td>{p.maternityEmployee} / {p.maternityEmployer}</td>
                <td>{p.ramaEmployee} / {p.ramaEmployer}</td>
                <td>{p.cbhiEmployee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PayrollList;
