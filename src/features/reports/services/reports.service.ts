// Reports service for statutory and management reports
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getPayrolls, getStaffPayrollData } from '../../payroll/services/payroll.service';
import { getStaff } from '../../staff/services/staff.service';
import { StatutoryReport, Payroll, StaffPayroll, Staff } from '../../../shared/types';

const db = getFirestore();

// Statutory Report Types
export type StatutoryReportType = 'paye' | 'pension' | 'maternity' | 'cbhi' | 'rama';

export interface PayeReturnData {
  staffName: string;
  staffId: string;
  grossPay: number;
  payeTax: number;
  netPay: number;
}

export interface PensionReportData {
  staffName: string;
  staffId: string;
  grossPay: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
}

export interface MaternityReportData {
  staffName: string;
  staffId: string;
  grossPayExcludingTransport: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
}

export interface CBHIReportData {
  staffName: string;
  staffId: string;
  netBeforeCBHI: number;
  employeeContribution: number;
}

export interface RAMAReportData {
  staffName: string;
  staffId: string;
  basicPay: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
}

// Generate PAYE Return Report
export async function generatePayeReturn(
  companyId: string,
  period: string
): Promise<{ data: PayeReturnData[]; totalPaye: number; totalGross: number }> {
  const payrolls = await getPayrolls(companyId);
  const periodPayrolls = payrolls.filter(p => p.period === period && p.status === 'processed');
  
  if (periodPayrolls.length === 0) {
    throw new Error('No processed payrolls found for the specified period');
  }
  
  const allStaffPayrolls: StaffPayroll[] = [];
  for (const payroll of periodPayrolls) {
    const staffPayrolls = await getStaffPayrollData(companyId, payroll.id);
    allStaffPayrolls.push(...staffPayrolls);
  }
  
  const payeData: PayeReturnData[] = allStaffPayrolls.map(sp => ({
    staffName: sp.staffName,
    staffId: sp.staffId,
    grossPay: sp.calculations.grossPay,
    payeTax: sp.calculations.payeBeforeReliefs,
    netPay: sp.calculations.finalNetPay,
  }));
  
  const totalPaye = payeData.reduce((sum, item) => sum + item.payeTax, 0);
  const totalGross = payeData.reduce((sum, item) => sum + item.grossPay, 0);
  
  return { data: payeData, totalPaye, totalGross };
}

// Generate Pension Contribution Report
export async function generatePensionReport(
  companyId: string,
  period: string
): Promise<{ data: PensionReportData[]; totalEmployee: number; totalEmployer: number; grandTotal: number }> {
  const payrolls = await getPayrolls(companyId);
  const periodPayrolls = payrolls.filter(p => p.period === period && p.status === 'processed');
  
  if (periodPayrolls.length === 0) {
    throw new Error('No processed payrolls found for the specified period');
  }
  
  const allStaffPayrolls: StaffPayroll[] = [];
  for (const payroll of periodPayrolls) {
    const staffPayrolls = await getStaffPayrollData(companyId, payroll.id);
    allStaffPayrolls.push(...staffPayrolls);
  }
  
  const pensionData: PensionReportData[] = allStaffPayrolls.map(sp => ({
    staffName: sp.staffName,
    staffId: sp.staffId,
    grossPay: sp.calculations.grossPay,
    employeeContribution: sp.calculations.pensionEmployee,
    employerContribution: sp.calculations.pensionEmployer,
    totalContribution: sp.calculations.pensionEmployee + sp.calculations.pensionEmployer,
  }));
  
  const totalEmployee = pensionData.reduce((sum, item) => sum + item.employeeContribution, 0);
  const totalEmployer = pensionData.reduce((sum, item) => sum + item.employerContribution, 0);
  const grandTotal = totalEmployee + totalEmployer;
  
  return { data: pensionData, totalEmployee, totalEmployer, grandTotal };
}

// Generate Maternity Fund Report
export async function generateMaternityReport(
  companyId: string,
  period: string
): Promise<{ data: MaternityReportData[]; totalEmployee: number; totalEmployer: number; grandTotal: number }> {
  const payrolls = await getPayrolls(companyId);
  const periodPayrolls = payrolls.filter(p => p.period === period && p.status === 'processed');
  
  if (periodPayrolls.length === 0) {
    throw new Error('No processed payrolls found for the specified period');
  }
  
  const allStaffPayrolls: StaffPayroll[] = [];
  for (const payroll of periodPayrolls) {
    const staffPayrolls = await getStaffPayrollData(companyId, payroll.id);
    allStaffPayrolls.push(...staffPayrolls);
  }
  
  const maternityData: MaternityReportData[] = allStaffPayrolls.map(sp => ({
    staffName: sp.staffName,
    staffId: sp.staffId,
    grossPayExcludingTransport: sp.calculations.grossPay - sp.calculations.transportAllowance,
    employeeContribution: sp.calculations.maternityEmployee,
    employerContribution: sp.calculations.maternityEmployer,
    totalContribution: sp.calculations.maternityEmployee + sp.calculations.maternityEmployer,
  }));
  
  const totalEmployee = maternityData.reduce((sum, item) => sum + item.employeeContribution, 0);
  const totalEmployer = maternityData.reduce((sum, item) => sum + item.employerContribution, 0);
  const grandTotal = totalEmployee + totalEmployer;
  
  return { data: maternityData, totalEmployee, totalEmployer, grandTotal };
}

// Generate CBHI Report
export async function generateCBHIReport(
  companyId: string,
  period: string
): Promise<{ data: CBHIReportData[]; totalContribution: number }> {
  const payrolls = await getPayrolls(companyId);
  const periodPayrolls = payrolls.filter(p => p.period === period && p.status === 'processed');
  
  if (periodPayrolls.length === 0) {
    throw new Error('No processed payrolls found for the specified period');
  }
  
  const allStaffPayrolls: StaffPayroll[] = [];
  for (const payroll of periodPayrolls) {
    const staffPayrolls = await getStaffPayrollData(companyId, payroll.id);
    allStaffPayrolls.push(...staffPayrolls);
  }
  
  const cbhiData: CBHIReportData[] = allStaffPayrolls.map(sp => ({
    staffName: sp.staffName,
    staffId: sp.staffId,
    netBeforeCBHI: sp.calculations.netBeforeCBHI,
    employeeContribution: sp.calculations.cbhiEmployee,
  }));
  
  const totalContribution = cbhiData.reduce((sum, item) => sum + item.employeeContribution, 0);
  
  return { data: cbhiData, totalContribution };
}

// Generate RAMA Report
export async function generateRAMAReport(
  companyId: string,
  period: string
): Promise<{ data: RAMAReportData[]; totalEmployee: number; totalEmployer: number; grandTotal: number }> {
  const payrolls = await getPayrolls(companyId);
  const periodPayrolls = payrolls.filter(p => p.period === period && p.status === 'processed');
  
  if (periodPayrolls.length === 0) {
    throw new Error('No processed payrolls found for the specified period');
  }
  
  const allStaffPayrolls: StaffPayroll[] = [];
  for (const payroll of periodPayrolls) {
    const staffPayrolls = await getStaffPayrollData(companyId, payroll.id);
    allStaffPayrolls.push(...staffPayrolls);
  }
  
  const ramaData: RAMAReportData[] = allStaffPayrolls.map(sp => ({
    staffName: sp.staffName,
    staffId: sp.staffId,
    basicPay: sp.calculations.basicPay,
    employeeContribution: sp.calculations.ramaEmployee,
    employerContribution: sp.calculations.ramaEmployer,
    totalContribution: sp.calculations.ramaEmployee + sp.calculations.ramaEmployer,
  }));
  
  const totalEmployee = ramaData.reduce((sum, item) => sum + item.employeeContribution, 0);
  const totalEmployer = ramaData.reduce((sum, item) => sum + item.employerContribution, 0);
  const grandTotal = totalEmployee + totalEmployer;
  
  return { data: ramaData, totalEmployee, totalEmployer, grandTotal };
}

// Generate Bank Payment File
export async function generateBankPaymentFile(
  companyId: string,
  payrollId: string,
  format: 'csv' | 'txt' | 'excel' = 'csv'
): Promise<string> {
  const staffPayrolls = await getStaffPayrollData(companyId, payrollId);
  const staff = await getStaff(companyId);
  
  const paymentData = staffPayrolls.map(sp => {
    const staffArr: import('../../../shared/types').Staff[] = Array.isArray(staff)
      ? (staff as import('../../../shared/types').Staff[])
      : (staff.data ?? []).map((s: any) => ({
          id: s.id,
          companyId: s.companyId,
          personalDetails: s.personalDetails,
          employmentDetails: s.employmentDetails,
          bankDetails: s.bankDetails,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt
        }));
    const staffMember = staffArr.find((s) => s.id === sp.staffId);
    return {
      employeeId: sp.staffId,
      employeeName: sp.staffName,
      accountNumber: staffMember?.bankDetails?.accountNumber || '',
      bankCode: staffMember?.bankDetails?.bankCode || '',
      amount: sp.calculations.finalNetPay,
      reference: `Salary-${sp.payrollId.substring(0, 8)}-${sp.staffId}`,
    };
  });
  
  if (format === 'csv') {
    const headers = 'Employee ID,Employee Name,Account Number,Bank Code,Amount,Reference';
    const rows = paymentData.map(row => 
      `"${row.employeeId}","${row.employeeName}","${row.accountNumber}","${row.bankCode}",${row.amount},"${row.reference}"`
    );
    return [headers, ...rows].join('\n');
  }
  
  if (format === 'txt') {
    return paymentData.map(row => 
      `${row.accountNumber.padEnd(20)}${row.amount.toFixed(2).padStart(15)}${row.reference.padEnd(30)}`
    ).join('\n');
  }
  
  // Excel format would require additional library
  throw new Error('Excel format not yet implemented');
}

// Management Reports
export async function generatePayrollCostAnalysis(
  companyId: string,
  startPeriod: string,
  endPeriod: string
) {
  const payrolls = await getPayrolls(companyId);
  const filteredPayrolls = payrolls.filter(p => 
    p.period >= startPeriod && p.period <= endPeriod && p.status === 'processed'
  );
  
  const analysis = await Promise.all(
    filteredPayrolls.map(async (payroll) => {
      const staffPayrolls = await getStaffPayrollData(companyId, payroll.id);
      
      const grossTotal = staffPayrolls.reduce((sum, sp) => sum + sp.calculations.grossPay, 0);
      const netTotal = staffPayrolls.reduce((sum, sp) => sum + sp.calculations.finalNetPay, 0);
      const taxTotal = staffPayrolls.reduce((sum, sp) => sum + sp.calculations.payeBeforeReliefs, 0);
      const pensionTotal = staffPayrolls.reduce((sum, sp) => 
        sum + sp.calculations.pensionEmployee + sp.calculations.pensionEmployer, 0);
      
      return {
        period: payroll.period,
        staffCount: staffPayrolls.length,
        grossTotal,
        netTotal,
        taxTotal,
        pensionTotal,
        averageGross: grossTotal / staffPayrolls.length,
        averageNet: netTotal / staffPayrolls.length,
      };
    })
  );
  
  return analysis;
}

// Utility functions
export function formatCurrency(amount: number): string {
  return `RWF ${amount.toLocaleString()}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}

export function getAvailableReportPeriods(payrolls: Payroll[]): string[] {
  const periods = Array.from(new Set(
    payrolls
      .filter(p => p.status === 'processed')
      .map(p => p.period)
  )).sort().reverse();
  
  return periods;
}