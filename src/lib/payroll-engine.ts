import { 
  PayrollCalculationInput, 
  PayrollCalculationResult, 
  PayeTaxBand,
  GlobalTaxSettings,
  StaffPayment,
  PaymentType,
  StaffDeduction,
  DeductionType
} from '@/types'

export class PayrollCalculationEngine {
  private taxSettings: GlobalTaxSettings
  private taxExemptions: any

  constructor(taxSettings: GlobalTaxSettings, taxExemptions?: any) {
    this.taxSettings = taxSettings
    this.taxExemptions = taxExemptions
  }

  calculatePayroll(input: PayrollCalculationInput): PayrollCalculationResult {
    // Stage 1: Calculate gross salary
    const grossCalculation = this.calculateGrossSalary(
      input.paymentTypes,
      input.staffPayments
    )

    // Stage 2: Calculate statutory deductions
    const statutoryDeductions = this.calculateStatutoryDeductions(
      grossCalculation.totalGross,
      grossCalculation.basicPay,
      grossCalculation.transportAllowance
    )

    // Stage 3: Calculate other deductions
    const otherDeductionsResult = this.calculateOtherDeductions(
      input.staffDeductions,
      statutoryDeductions.netPayAfterCBHI
    )

    // Final calculation
    const finalNetPay = statutoryDeductions.netPayAfterCBHI - otherDeductionsResult.totalApplied

    return {
      staffMemberId: input.staffMemberId,
      totalGrossSalary: grossCalculation.totalGross,
      basicPayGross: grossCalculation.basicPay,
      transportAllowanceGross: grossCalculation.transportAllowance,
      otherPayments: grossCalculation.otherPayments,
      employerPension: statutoryDeductions.employerPension,
      employeePension: statutoryDeductions.employeePension,
      employerMaternity: statutoryDeductions.employerMaternity,
      employeeMaternity: statutoryDeductions.employeeMaternity,
      employerRAMA: statutoryDeductions.employerRAMA,
      employeeRAMA: statutoryDeductions.employeeRAMA,
      paye: statutoryDeductions.paye,
      cbhiDeduction: statutoryDeductions.cbhi,
      otherDeductions: otherDeductionsResult.breakdown,
      totalAppliedDeductions: otherDeductionsResult.totalApplied,
      finalNetPay: Math.max(0, finalNetPay)
    }
  }

  private calculateGrossSalary(
    paymentTypes: PaymentType[], 
    staffPayments: StaffPayment[]
  ) {
    // Sort payment types by order
    const sortedPaymentTypes = [...paymentTypes].sort((a, b) => a.order - b.order)
    
    let totalGross = 0
    let basicPay = 0
    let transportAllowance = 0
    const otherPayments: Record<string, number> = {}

    for (const paymentType of sortedPaymentTypes) {
      const staffPayment = staffPayments.find(sp => sp.paymentTypeId === paymentType.id)
      if (!staffPayment || staffPayment.amount === 0) continue

      let grossAmount = 0

      if (paymentType.type === 'gross') {
        grossAmount = staffPayment.amount
      } else {
        // Net type - perform gross-up calculation
        grossAmount = this.findAdditionalGrossForNetIncrement(
          totalGross,
          staffPayment.amount
        )
      }

      totalGross += grossAmount

      // Store specific components
      if (paymentType.name === 'Basic Pay') {
        basicPay = grossAmount
      } else if (paymentType.name === 'Transport Allowance') {
        transportAllowance = grossAmount
      } else {
        otherPayments[paymentType.name] = grossAmount
      }
    }

    return {
      totalGross,
      basicPay,
      transportAllowance,
      otherPayments
    }
  }

  private calculateStatutoryDeductions(
    totalGrossSalary: number,
    basicPay: number,
    transportAllowance: number
  ) {
    // Calculate RSSB components
    const employerPension = totalGrossSalary * (this.taxSettings.pensionEmployerRate / 100)
    const employeePension = totalGrossSalary * (this.taxSettings.pensionEmployeeRate / 100)

    const maternityBase = totalGrossSalary - transportAllowance
    const employerMaternity = maternityBase * (this.taxSettings.maternityEmployerRate / 100)
    const employeeMaternity = maternityBase * (this.taxSettings.maternityEmployeeRate / 100)

    const employerRAMA = basicPay * (this.taxSettings.ramaEmployerRate / 100)
    const employeeRAMA = basicPay * (this.taxSettings.ramaEmployeeRate / 100)

    // Calculate PAYE
    const paye = this.calculatePAYE(totalGrossSalary)

    // Calculate net pay before CBHI
    const totalEmployeeRSSB = employeePension + employeeMaternity + employeeRAMA
    const netPayBeforeCBHI = totalGrossSalary - totalEmployeeRSSB - paye

    // Calculate CBHI
    const cbhi = netPayBeforeCBHI * (this.taxSettings.cbhiRate / 100)
    const netPayAfterCBHI = netPayBeforeCBHI - cbhi

    return {
      employerPension,
      employeePension,
      employerMaternity,
      employeeMaternity,
      employerRAMA,
      employeeRAMA,
      paye,
      cbhi,
      netPayBeforeCBHI,
      netPayAfterCBHI
    }
  }

  private calculatePAYE(grossSalary: number): number {
    if (this.taxExemptions?.paye_exempt) return 0

    const payeBands = this.taxSettings.payeTaxBands as unknown as PayeTaxBand[]
    let paye = 0
    let remainingIncome = grossSalary

    for (const band of payeBands) {
      if (remainingIncome <= 0) break

      const bandMin = band.min
      const bandMax = band.max || Infinity
      const bandWidth = bandMax - bandMin
      const taxableInThisBand = Math.min(remainingIncome, bandWidth)

      if (grossSalary > bandMin) {
        const taxableAmount = Math.min(taxableInThisBand, grossSalary - bandMin)
        paye += taxableAmount * (band.rate / 100)
      }

      remainingIncome -= taxableInThisBand
    }

    return Math.max(0, paye)
  }

  private calculateOtherDeductions(
    staffDeductions: StaffDeduction[],
    availableAmount: number
  ) {
    const breakdown: Record<string, number> = {}
    let totalApplied = 0
    let remaining = availableAmount

    // Sort deductions by order (if deduction types have order)
    const sortedDeductions = [...staffDeductions]

    for (const deduction of sortedDeductions) {
      if (remaining <= 0) break

      const remainingBalance = deduction.originalAmount - deduction.deductedSoFar
      const maxDeductible = Math.min(
        deduction.monthlyDeduction,
        remainingBalance,
        remaining
      )

      if (maxDeductible > 0) {
        breakdown[deduction.id] = maxDeductible
        totalApplied += maxDeductible
        remaining -= maxDeductible
      }
    }

    return {
      breakdown,
      totalApplied
    }
  }

  private findAdditionalGrossForNetIncrement(
    currentGross: number,
    targetNetIncrement: number,
    precision: number = 0.01,
    maxIterations: number = 100
  ): number {
    let low = 0
    let high = targetNetIncrement * 3 // Upper bound estimate
    let iterations = 0

    while (high - low > precision && iterations < maxIterations) {
      const mid = (low + high) / 2
      const testGross = currentGross + mid

      // Calculate taxes on the test gross
      const testStatutory = this.calculateStatutoryDeductions(testGross, 0, 0)
      const testNetIncrement = mid - (testStatutory.paye - this.calculatePAYE(currentGross))
        - (testStatutory.employeePension + testStatutory.employeeMaternity + testStatutory.employeeRAMA)
        + (currentGross * (this.taxSettings.pensionEmployeeRate + this.taxSettings.maternityEmployeeRate + this.taxSettings.ramaEmployeeRate) / 100)

      if (testNetIncrement < targetNetIncrement) {
        low = mid
      } else {
        high = mid
      }

      iterations++
    }

    return (low + high) / 2
  }
}

// Utility functions for payroll calculations
export function createDefaultPaymentTypes(companyId: string): Omit<PaymentType, 'id' | 'createdAt' | 'updatedAt'>[] {
  return [
    {
      companyId: companyId,
      name: 'Basic Pay',
      description: 'Basic salary',
      type: 'gross',
      calculationMethod: 'fixed',
      amount: null,
      formula: null,
      taxable: true,
      isActive: true,
      order: 1
    },
    {
      companyId: companyId,
      name: 'Transport Allowance',
      description: 'Transportation allowance',
      type: 'gross',
      calculationMethod: 'fixed',
      amount: null,
      formula: null,
      taxable: true,
      isActive: true,
      order: 2
    }
  ]
}

export function createDefaultDeductionTypes(companyId: string): Omit<DeductionType, 'id' | 'createdAt' | 'updatedAt'>[] {
  return [
    {
      companyId: companyId,
      name: 'Loan',
      description: 'Staff loan deduction',
      calculationMethod: 'fixed',
      amount: null,
      formula: null,
      isMandatory: false,
      isActive: true,
      affectsTax: false,
      order: 1
    },
    {
      companyId: companyId,
      name: 'Advance',
      description: 'Salary advance deduction',
      calculationMethod: 'fixed',
      amount: null,
      formula: null,
      isMandatory: false,
      isActive: true,
      affectsTax: false,
      order: 2
    },
    {
      companyId: companyId,
      name: 'Staff Welfare',
      description: 'Staff welfare contribution',
      calculationMethod: 'fixed',
      amount: null,
      formula: null,
      isMandatory: false,
      isActive: true,
      affectsTax: false,
      order: 3
    }
  ]
}

export function getDefaultTaxSettings(): Omit<GlobalTaxSettings, 'id' | 'updatedAt'> {
  return {
    payeTaxBands: [
      { min: 0, max: 60000, rate: 0 },
      { min: 60001, max: 130000, rate: 0.2 },
      { min: 130001, max: 200000, rate: 0.25 },
      { min: 200001, max: 300000, rate: 0.3 },
      { min: 300001, max: Infinity, rate: 0.3 }
    ],
    pensionEmployerRate: 5,
    pensionEmployeeRate: 3,
    maternityEmployerRate: 0.3,
    maternityEmployeeRate: 0.3,
    ramaEmployerRate: 1,
    ramaEmployeeRate: 1,
    cbhiRate: 7.5,
    pensionRate: 8,
    maternityRate: 0.6,
    ramaRate: 2
  }
}

// Standalone function for simple payroll calculations
export async function calculatePayroll(
  staffMember: any,
  periodStart: string,
  periodEnd: string
): Promise<{
  grossPay: number
  totalDeductions: number
  netPay: number
  taxAmount: number
  overtimeAmount?: number
  allowancesAmount?: number
  benefitsAmount?: number
}> {
  // This is a simplified calculation - in a real application,
  // you would fetch the actual payment and deduction configurations
  // and apply complex business logic
  
  // For now, we'll use some basic calculations based on the staff member data
  let grossPay = 0
  let totalDeductions = 0
  let taxAmount = 0
  let overtimeAmount = 0
  let allowancesAmount = 0
  let benefitsAmount = 0

  // Calculate basic gross pay from staff payments
  if (staffMember.staff_payments && Array.isArray(staffMember.staff_payments)) {
    for (const payment of staffMember.staff_payments) {
      if (payment.payment_type?.calculation_method === 'fixed') {
        grossPay += payment.amount || 0
      } else if (payment.payment_type?.calculation_method === 'percentage') {
        // Apply percentage to basic salary (simplified)
        grossPay += (grossPay * (payment.payment_type.amount || 0)) / 100
      }
    }
  }

  // If no payments configured, use a default basic salary
  if (grossPay === 0) {
    grossPay = 500000 // Default basic salary in RWF
  }

  // Calculate statutory deductions
  const rssb = Math.min(grossPay * 0.03, 30000) // 3% up to 30,000 RWF
  const cbhi = Math.min(grossPay * 0.03, 7500) // 3% up to 7,500 RWF

  // Calculate PAYE tax (simplified)
  if (grossPay > 30000) {
    const taxableIncome = grossPay - rssb
    if (taxableIncome > 360000) {
      taxAmount = 60000 + (taxableIncome - 360000) * 0.3
    } else if (taxableIncome > 120000) {
      taxAmount = 12000 + (taxableIncome - 120000) * 0.2
    } else if (taxableIncome > 60000) {
      taxAmount = (taxableIncome - 60000) * 0.1
    }
  }

  totalDeductions = rssb + cbhi + taxAmount

  // Calculate other deductions
  if (staffMember.staff_deductions && Array.isArray(staffMember.staff_deductions)) {
    for (const deduction of staffMember.staff_deductions) {
      if (deduction.deduction_type?.calculation_method === 'fixed') {
        totalDeductions += deduction.amount || 0
      } else if (deduction.deduction_type?.calculation_method === 'percentage') {
        totalDeductions += (grossPay * (deduction.deduction_type.amount || 0)) / 100
      }
    }
  }

  const netPay = grossPay - totalDeductions

  return {
    grossPay,
    totalDeductions,
    netPay,
    taxAmount,
    overtimeAmount,
    allowancesAmount,
    benefitsAmount
  }
}
