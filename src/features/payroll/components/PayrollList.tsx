import React, { useEffect, useState } from 'react';
import PDFExport from '../../reports/components/PDFExport';
import AuditTrail from '../../../shared/components/AuditTrail';
import ApprovalWorkflow from '../../../shared/components/ApprovalWorkflow';
import { getPayrolls, createPayroll, calculatePayroll } from '../services/payroll.service';
import PayrollImportExport from './PayrollImportExport';

const defaultBrackets = [
  { min: 0, max: 60000, rate: 0 },
  { min: 60001, max: 100000, rate: 10 },
  { min: 100001, max: 200000, rate: 20 },
  { min: 200001, max: null, rate: 30 },
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
  const [form, setForm] = useState<any>({
    gross: '',
    basic: '',
    transport: '',
    otherDeductions: '',
  });
  const [result, setResult] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    getPayrolls(companyId)
      .then(setPayrolls)
      .catch(e => setError(e.message || 'Failed to load payrolls'))
      .finally(() => setLoading(false));
  }, [companyId, refresh]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
    setFieldErrors(prev => {
      const { [field]: omit, ...rest } = prev;
      return rest;
    });
  };

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.gross || isNaN(Number(form.gross)) || Number(form.gross) <= 0)
      {errs.gross = 'Gross must be positive number';}
    if (!form.basic || isNaN(Number(form.basic)) || Number(form.basic) < 0)
      {errs.basic = 'Basic must be non-negative number';}
    if (form.transport && (isNaN(Number(form.transport)) || Number(form.transport) < 0))
      {errs.transport = 'Transport must be non-negative number';}
    if (
      form.otherDeductions &&
      (isNaN(Number(form.otherDeductions)) || Number(form.otherDeductions) < 0)
    )
      {errs.otherDeductions = 'Other deductions must be non-negative number';}
    return errs;
  };

  const handleCalculate = () => {
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {return;}
    const gross = parseFloat(form.gross);
    const basic = parseFloat(form.basic);
    const transport = parseFloat(form.transport) || 0;
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
      otherDeductions,
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

  if (loading) {return <div className="payroll-loading" aria-live="polite">Loading payrolls...</div>;}
  if (error)
    {return (
      <div className="payroll-error" role="alert" aria-live="assertive">
        {error}
      </div>
    );}

  const filtered = payrolls.filter(p => {
    return !search || String(p.gross).includes(search) || String(p.finalNet).includes(search);
  });

  return (
    <div className="payroll-list">
      <h2>Payrolls</h2>
      <PDFExport data={payrolls} type="payroll" />
      <AuditTrail entityId={companyId} entityType="company" />
      <ApprovalWorkflow payrollId={payrolls[0]?.id || ''} companyId={companyId} />
      <div className="payroll-form-wrapper">
        <h3>Create Payroll</h3>
        <div className="payroll-form">
          <div className="form-row">
            <label htmlFor="payroll-gross">Gross Pay</label>
            <input
              id="payroll-gross"
              className={fieldErrors.gross ? 'error' : ''}
              placeholder="Gross Pay"
              value={form.gross}
              onChange={e => handleChange('gross', e.target.value)}
              required
              aria-invalid={!!fieldErrors.gross}
              aria-describedby="gross-error"
              inputMode="decimal"
            />
            {fieldErrors.gross && (
              <div className="field-error" id="gross-error">
                {fieldErrors.gross}
              </div>
            )}
          </div>
          <div className="form-row">
            <label htmlFor="payroll-basic">Basic Pay</label>
            <input
              id="payroll-basic"
              className={fieldErrors.basic ? 'error' : ''}
              placeholder="Basic Pay"
              value={form.basic}
              onChange={e => handleChange('basic', e.target.value)}
              required
              aria-invalid={!!fieldErrors.basic}
              aria-describedby="basic-error"
              inputMode="decimal"
            />
            {fieldErrors.basic && (
              <div className="field-error" id="basic-error">
                {fieldErrors.basic}
              </div>
            )}
          </div>
          <div className="form-row">
            <label htmlFor="payroll-transport">Transport Allowance</label>
            <input
              id="payroll-transport"
              className={fieldErrors.transport ? 'error' : ''}
              placeholder="Transport Allowance"
              value={form.transport}
              onChange={e => handleChange('transport', e.target.value)}
              aria-invalid={!!fieldErrors.transport}
              aria-describedby="transport-error"
              inputMode="decimal"
            />
            {fieldErrors.transport && (
              <div className="field-error" id="transport-error">
                {fieldErrors.transport}
              </div>
            )}
          </div>
          <div className="form-row">
            <label>
              Other Deductions
              <input
                className={fieldErrors.otherDeductions ? 'error' : ''}
                placeholder="Other Deductions"
                value={form.otherDeductions}
                onChange={e => handleChange('otherDeductions', e.target.value)}
                aria-invalid={!!fieldErrors.otherDeductions}
                aria-describedby="otherDeductions-error"
                inputMode="decimal"
              />
            </label>
            {fieldErrors.otherDeductions && (
              <div className="field-error" id="otherDeductions-error">
                {fieldErrors.otherDeductions}
              </div>
            )}
          </div>
          <div className="form-row">
            <button type="button" className="primary-btn" onClick={handleCalculate}>
              Calculate
            </button>
          </div>
          {error && (
            <div className="form-error" role="alert" aria-live="assertive">
              {error}
            </div>
          )}
        </div>
        {result && (
          <div className="payroll-calc-result">
            <h4>Calculation Result</h4>
            <pre>{JSON.stringify(result, null, 2)}</pre>
            <button className="primary-btn" onClick={handleCreate}>
              Save Payroll
            </button>
          </div>
        )}
      </div>
      <PayrollImportExport
        companyId={companyId}
        onImported={() => setRefresh(r => r + 1)}
        payrolls={payrolls}
      />
      <h3>Payroll List</h3>
      <div className="payroll-table-controls">
        <input
          type="search"
          placeholder="Search by gross or net..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="payroll-search"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="payroll-empty" aria-live="polite">
          No payrolls found.
        </div>
      ) : (
        <div className="payroll-table-wrapper">
          <table className="payroll-table">
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
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>{p.gross}</td>
                  <td>{p.finalNet}</td>
                  <td>{p.paye}</td>
                  <td>
                    {p.pensionEmployee} / {p.pensionEmployer}
                  </td>
                  <td>
                    {p.maternityEmployee} / {p.maternityEmployer}
                  </td>
                  <td>
                    {p.ramaEmployee} / {p.ramaEmployer}
                  </td>
                  <td>{p.cbhiEmployee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PayrollList;
