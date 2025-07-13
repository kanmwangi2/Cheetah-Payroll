/**
 * Email Service
 * Handles sending emails for payslips, reports, and notifications
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { logger } from '../utils/logger';
import { withErrorHandling, ServiceResult } from '../utils/service-wrapper';

const functions = getFunctions();

// Email template types
export type EmailTemplate = 
  | 'payslip'
  | 'deduction_report'
  | 'payment_report'
  | 'monthly_summary'
  | 'notification';

// Email data interfaces
export interface PayslipEmailData {
  staffId: string;
  staffName: string;
  staffEmail: string;
  payrollPeriod: string;
  payslipUrl?: string;
  payslipData: {
    basicSalary: number;
    allowances: Record<string, number>;
    deductions: Record<string, number>;
    netSalary: number;
    grossSalary: number;
  };
}

export interface ReportEmailData {
  recipientEmail: string;
  recipientName: string;
  reportType: 'deductions' | 'payments';
  reportPeriod: string;
  reportUrl?: string;
  summary: {
    totalRecords: number;
    totalAmount: number;
    generatedAt: string;
  };
}

export interface EmailRequest {
  template: EmailTemplate;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  data: PayslipEmailData | ReportEmailData | Record<string, any>;
  attachments?: {
    filename: string;
    content: string; // base64 encoded
    contentType: string;
  }[];
}

// Send individual payslip
export const sendPayslipEmail = async (emailData: PayslipEmailData): Promise<ServiceResult<void>> => {
  return withErrorHandling(async () => {
    const sendEmail = httpsCallable(functions, 'sendPayslipEmail');
    
    const emailRequest: EmailRequest = {
      template: 'payslip',
      to: emailData.staffEmail,
      subject: `Payslip for ${emailData.payrollPeriod} - ${emailData.staffName}`,
      data: emailData
    };

    await sendEmail(emailRequest);
    
    logger.info('Payslip email sent successfully', { 
      staffId: emailData.staffId, 
      email: emailData.staffEmail 
    });
  }, {
    logOperation: 'Send payslip email',
    retries: 2
  });
};

// Send bulk payslips
export const sendBulkPayslips = async (
  payslips: PayslipEmailData[]
): Promise<ServiceResult<{ sent: number; failed: number; errors: string[] }>> => {
  return withErrorHandling(async () => {
    const sendBulkEmails = httpsCallable(functions, 'sendBulkPayslips');
    
    const result = await sendBulkEmails({ payslips });
    
    const responseData = result.data as { sent: number; failed: number; errors: string[] };
    
    logger.info('Bulk payslips sent', { 
      total: payslips.length,
      sent: responseData.sent,
      failed: responseData.failed
    });
    
    return responseData;
  }, {
    logOperation: 'Send bulk payslips',
    retries: 1
  });
};

// Send deduction report
export const sendDeductionReport = async (emailData: ReportEmailData): Promise<ServiceResult<void>> => {
  return withErrorHandling(async () => {
    const sendEmail = httpsCallable(functions, 'sendReportEmail');
    
    const emailRequest: EmailRequest = {
      template: 'deduction_report',
      to: emailData.recipientEmail,
      subject: `Deduction Report - ${emailData.reportPeriod}`,
      data: emailData
    };

    await sendEmail(emailRequest);
    
    logger.info('Deduction report email sent successfully', { 
      email: emailData.recipientEmail,
      period: emailData.reportPeriod
    });
  }, {
    logOperation: 'Send deduction report email',
    retries: 2
  });
};

// Send payment report
export const sendPaymentReport = async (emailData: ReportEmailData): Promise<ServiceResult<void>> => {
  return withErrorHandling(async () => {
    const sendEmail = httpsCallable(functions, 'sendReportEmail');
    
    const emailRequest: EmailRequest = {
      template: 'payment_report',
      to: emailData.recipientEmail,
      subject: `Payment Report - ${emailData.reportPeriod}`,
      data: emailData
    };

    await sendEmail(emailRequest);
    
    logger.info('Payment report email sent successfully', { 
      email: emailData.recipientEmail,
      period: emailData.reportPeriod
    });
  }, {
    logOperation: 'Send payment report email',
    retries: 2
  });
};

// Send staff notification about deductions
export const sendDeductionNotification = async (
  staffEmail: string,
  staffName: string,
  deductionDetails: {
    type: string;
    amount: number;
    description: string;
    effectiveDate: string;
  }
): Promise<ServiceResult<void>> => {
  return withErrorHandling(async () => {
    const sendEmail = httpsCallable(functions, 'sendNotificationEmail');
    
    const emailRequest: EmailRequest = {
      template: 'notification',
      to: staffEmail,
      subject: `Deduction Notification - ${deductionDetails.type}`,
      data: {
        staffName,
        deductionDetails,
        message: `A new deduction has been applied to your account.`
      }
    };

    await sendEmail(emailRequest);
    
    logger.info('Deduction notification sent', { 
      email: staffEmail,
      type: deductionDetails.type,
      amount: deductionDetails.amount
    });
  }, {
    logOperation: 'Send deduction notification',
    retries: 2
  });
};

// Email validation helper
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate email preview (for testing)
export const generateEmailPreview = async (
  template: EmailTemplate,
  data: any
): Promise<ServiceResult<{ subject: string; htmlContent: string; textContent: string }>> => {
  return withErrorHandling(async () => {
    const generatePreview = httpsCallable(functions, 'generateEmailPreview');
    
    const result = await generatePreview({ template, data });
    
    return result.data as { subject: string; htmlContent: string; textContent: string };
  }, {
    logOperation: 'Generate email preview',
    retries: 1
  });
};

// Get email sending status
export const getEmailStatus = async (emailId: string): Promise<ServiceResult<{
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  timestamp: string;
  error?: string;
}>> => {
  return withErrorHandling(async () => {
    const getStatus = httpsCallable(functions, 'getEmailStatus');
    
    const result = await getStatus({ emailId });
    
    return result.data as { status: 'pending' | 'sent' | 'failed' | 'bounced'; timestamp: string; error?: string };
  }, {
    logOperation: 'Get email status',
    retries: 2
  });
};

// Email configuration for different templates
export const emailTemplateConfig = {
  payslip: {
    subject: (data: PayslipEmailData) => `Payslip for ${data.payrollPeriod} - ${data.staffName}`,
    description: 'Individual staff payslip with salary breakdown'
  },
  deduction_report: {
    subject: (data: ReportEmailData) => `Deduction Report - ${data.reportPeriod}`,
    description: 'Comprehensive deduction report for management'
  },
  payment_report: {
    subject: (data: ReportEmailData) => `Payment Report - ${data.reportPeriod}`,
    description: 'Payment summary report for management'
  },
  monthly_summary: {
    subject: (data: any) => `Monthly Summary - ${data.period}`,
    description: 'Monthly payroll summary for stakeholders'
  },
  notification: {
    subject: (data: any) => data.subject || 'Payroll Notification',
    description: 'General notification emails to staff'
  }
};