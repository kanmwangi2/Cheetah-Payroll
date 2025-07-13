/**
 * Email Sender Component
 * Provides email functionality for payslips and reports
 */

import React, { useState } from 'react';
import Button from './Button';
import { sendPayslipEmail, sendDeductionReport, sendPaymentReport, PayslipEmailData, ReportEmailData } from '../../services/email.service';

interface EmailSenderProps {
  type: 'payslip' | 'deduction_report' | 'payment_report';
  data: PayslipEmailData | ReportEmailData;
  buttonText?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  buttonSize?: 'sm' | 'md' | 'lg';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

const EmailSender: React.FC<EmailSenderProps> = ({
  type,
  data,
  buttonText,
  buttonVariant = 'outline',
  buttonSize = 'sm',
  onSuccess,
  onError,
  disabled = false
}) => {
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const getDefaultButtonText = () => {
    switch (type) {
      case 'payslip':
        return '📧 Email Payslip';
      case 'deduction_report':
        return '📧 Email Report';
      case 'payment_report':
        return '📧 Email Report';
      default:
        return '📧 Send Email';
    }
  };

  const getConfirmationMessage = () => {
    switch (type) {
      case 'payslip':
        const payslipData = data as PayslipEmailData;
        return `Send payslip for ${payslipData.payrollPeriod} to ${payslipData.staffName} (${payslipData.staffEmail})?`;
      case 'deduction_report':
      case 'payment_report':
        const reportData = data as ReportEmailData;
        return `Send ${type.replace('_', ' ')} for ${reportData.reportPeriod} to ${reportData.recipientName} (${reportData.recipientEmail})?`;
      default:
        return 'Send this email?';
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    setShowConfirm(false);

    try {
      let result;
      
      switch (type) {
        case 'payslip':
          result = await sendPayslipEmail(data as PayslipEmailData);
          break;
        case 'deduction_report':
          result = await sendDeductionReport(data as ReportEmailData);
          break;
        case 'payment_report':
          result = await sendPaymentReport(data as ReportEmailData);
          break;
        default:
          throw new Error('Invalid email type');
      }

      if (result.success) {
        onSuccess?.();
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Email sending failed:', error);
      onError?.(error.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setShowConfirm(true)}
        disabled={disabled || sending}
        loading={sending}
      >
        {buttonText || getDefaultButtonText()}
      </Button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={overlayStyles}>
          <div style={modalStyles}>
            <h3 style={titleStyles}>Confirm Email</h3>
            
            <p style={messageStyles}>
              {getConfirmationMessage()}
            </p>

            <div style={buttonContainerStyles}>
              <Button
                variant="secondary"
                onClick={() => setShowConfirm(false)}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSendEmail}
                loading={sending}
                disabled={sending}
              >
                Send Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Bulk Email Sender for multiple payslips
interface BulkEmailSenderProps {
  payslips: PayslipEmailData[];
  onSuccess?: (result: { sent: number; failed: number; errors: string[] }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const BulkEmailSender: React.FC<BulkEmailSenderProps> = ({
  payslips,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBulkSend = async () => {
    setSending(true);
    setShowConfirm(false);

    try {
      // Import the bulk send function dynamically to avoid issues
      const { sendBulkPayslips } = await import('../../services/email.service');
      const result = await sendBulkPayslips(payslips);

      if (result.success && result.data) {
        onSuccess?.(result.data);
      } else {
        throw new Error(result.error || 'Failed to send bulk emails');
      }
    } catch (error: any) {
      console.error('Bulk email sending failed:', error);
      onError?.(error.message || 'Failed to send bulk emails');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setShowConfirm(true)}
        disabled={disabled || sending || payslips.length === 0}
        loading={sending}
      >
        📧 Email All Payslips ({payslips.length})
      </Button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={overlayStyles}>
          <div style={modalStyles}>
            <h3 style={titleStyles}>Confirm Bulk Email</h3>
            
            <p style={messageStyles}>
              Send payslips to {payslips.length} staff members?
            </p>

            <div style={recipientListStyles}>
              <h4>Recipients:</h4>
              <ul style={listStyles}>
                {payslips.slice(0, 5).map((payslip, index) => (
                  <li key={index} style={listItemStyles}>
                    {payslip.staffName} ({payslip.staffEmail})
                  </li>
                ))}
                {payslips.length > 5 && (
                  <li style={listItemStyles}>
                    ... and {payslips.length - 5} more
                  </li>
                )}
              </ul>
            </div>

            <div style={buttonContainerStyles}>
              <Button
                variant="secondary"
                onClick={() => setShowConfirm(false)}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleBulkSend}
                loading={sending}
                disabled={sending}
              >
                Send All Emails
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Styles
const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
};

const modalStyles: React.CSSProperties = {
  backgroundColor: 'var(--color-card-bg)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 'var(--spacing-xl)',
  maxWidth: '500px',
  width: '90%',
  maxHeight: '90vh',
  overflow: 'auto',
  border: '1px solid var(--color-card-border)',
  boxShadow: 'var(--shadow-2xl)'
};

const titleStyles: React.CSSProperties = {
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--spacing-lg)',
  textAlign: 'center',
  fontSize: 'var(--font-size-xl)',
  fontWeight: 'var(--font-weight-semibold)'
};

const messageStyles: React.CSSProperties = {
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--spacing-lg)',
  fontSize: 'var(--font-size-base)',
  lineHeight: 'var(--line-height-relaxed)',
  textAlign: 'center'
};

const recipientListStyles: React.CSSProperties = {
  marginBottom: 'var(--spacing-lg)',
  padding: 'var(--spacing-md)',
  backgroundColor: 'var(--color-bg-secondary)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--color-border-primary)'
};

const listStyles: React.CSSProperties = {
  margin: 'var(--spacing-sm) 0 0 0',
  padding: '0 0 0 var(--spacing-lg)',
  maxHeight: '150px',
  overflow: 'auto'
};

const listItemStyles: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--font-size-sm)',
  marginBottom: 'var(--spacing-xs)'
};

const buttonContainerStyles: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-md)',
  justifyContent: 'flex-end'
};

export default EmailSender;