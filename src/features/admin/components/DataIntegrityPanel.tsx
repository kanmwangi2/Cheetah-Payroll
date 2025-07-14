/**
 * Data Integrity Panel
 * Administrative component for checking and fixing data integrity issues
 */

import React, { useState } from 'react';
import { 
  checkDataIntegrity, 
  quickFixInvalidData, 
  migrateAllData,
  type MigrationReport 
} from '../../../shared/utils/data-migration';
import Button from '../../../shared/components/ui/Button';
import { useAuth } from '../../../shared/hooks/useAuth';

interface DataIntegrityPanelProps {
  companyId: string;
}

const DataIntegrityPanel: React.FC<DataIntegrityPanelProps> = ({ companyId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<MigrationReport[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Only allow company admins and above to access this panel
  const canManageData = user?.role && ['primary_admin', 'app_admin', 'company_admin'].includes(user.role);

  if (!canManageData) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'var(--color-warning-bg)', 
        color: 'var(--color-warning-text)',
        borderRadius: '8px',
        border: '1px solid var(--color-warning-border)'
      }}>
        ⚠️ Access Denied: You need company admin privileges to access data integrity tools.
      </div>
    );
  }

  const handleIntegrityCheck = async () => {
    setLoading(true);
    try {
      const integrityReports = await checkDataIntegrity(companyId);
      setReports(integrityReports);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Integrity check failed:', error);
      alert('Failed to check data integrity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFix = async () => {
    if (!confirm('This will attempt to automatically fix data integrity issues. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const fixReports = await quickFixInvalidData(companyId);
      setReports(fixReports);
      setLastCheck(new Date());
      alert('Quick fix completed. Check the results below.');
    } catch (error) {
      console.error('Quick fix failed:', error);
      alert('Failed to fix data integrity issues. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFullMigration = async () => {
    if (!confirm(
      'This will perform a comprehensive data migration including fixes and cleanup. ' +
      'This action cannot be undone. Are you sure?'
    )) {
      return;
    }

    setLoading(true);
    try {
      const migrationReports = await migrateAllData({
        companyId,
        dryRun: false,
        deleteInvalidRecords: false, // Safe option - don't delete, just fix
        fixMissingFields: true
      });
      setReports(migrationReports);
      setLastCheck(new Date());
      alert('Full migration completed. Check the results below.');
    } catch (error) {
      console.error('Migration failed:', error);
      alert('Migration failed. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getTotalIssues = () => {
    return reports.reduce((sum, report) => sum + report.invalidRecords, 0);
  };

  const getTotalFixed = () => {
    return reports.reduce((sum, report) => sum + report.fixedRecords, 0);
  };

  return (
    <div style={{ 
      backgroundColor: 'var(--color-bg-primary)', 
      padding: '24px', 
      borderRadius: '12px',
      border: '1px solid var(--color-border-primary)'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          color: 'var(--color-text-primary)',
          fontSize: '20px',
          fontWeight: 600
        }}>
          🔍 Data Integrity Management
        </h2>
        <p style={{ 
          margin: '0', 
          color: 'var(--color-text-secondary)',
          fontSize: '14px'
        }}>
          Check and fix data integrity issues in your company database
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <Button
          onClick={handleIntegrityCheck}
          disabled={loading}
          style={{
            backgroundColor: 'var(--color-info-600)',
            color: 'white',
            padding: '10px 16px',
            fontSize: '14px'
          }}
        >
          {loading ? 'Checking...' : '🔍 Check Data Integrity'}
        </Button>

        <Button
          onClick={handleQuickFix}
          disabled={loading || reports.length === 0 || getTotalIssues() === 0}
          style={{
            backgroundColor: 'var(--color-warning-600)',
            color: 'white',
            padding: '10px 16px',
            fontSize: '14px'
          }}
        >
          {loading ? 'Fixing...' : '⚡ Quick Fix Issues'}
        </Button>

        <Button
          onClick={handleFullMigration}
          disabled={loading}
          style={{
            backgroundColor: 'var(--color-error-600)',
            color: 'white',
            padding: '10px 16px',
            fontSize: '14px'
          }}
        >
          {loading ? 'Migrating...' : '🔧 Full Migration'}
        </Button>
      </div>

      {/* Status Summary */}
      {lastCheck && (
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--color-border-secondary)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h3 style={{ 
              margin: '0', 
              color: 'var(--color-text-primary)',
              fontSize: '16px',
              fontWeight: 600
            }}>
              Last Check: {lastCheck.toLocaleString()}
            </h3>
            <div style={{ 
              display: 'flex', 
              gap: '16px',
              fontSize: '14px'
            }}>
              <span style={{ color: 'var(--color-error-600)' }}>
                Issues: {getTotalIssues()}
              </span>
              <span style={{ color: 'var(--color-success-600)' }}>
                Fixed: {getTotalFixed()}
              </span>
            </div>
          </div>
          
          {getTotalIssues() === 0 ? (
            <div style={{ 
              color: 'var(--color-success-600)',
              fontSize: '14px',
              fontWeight: 500
            }}>
              ✅ All data integrity checks passed!
            </div>
          ) : (
            <div style={{ 
              color: 'var(--color-warning-600)',
              fontSize: '14px',
              fontWeight: 500
            }}>
              ⚠️ {getTotalIssues()} data integrity issues found
            </div>
          )}
        </div>
      )}

      {/* Detailed Reports */}
      {reports.length > 0 && (
        <div>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: 'var(--color-text-primary)',
            fontSize: '18px',
            fontWeight: 600
          }}>
            Detailed Reports
          </h3>
          
          {reports.map((report, index) => (
            <div key={index} style={{ 
              marginBottom: '16px',
              padding: '16px',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--color-border-secondary)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <h4 style={{ 
                  margin: '0', 
                  color: 'var(--color-text-primary)',
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}>
                  {report.collectionName}
                </h4>
                <div style={{ 
                  display: 'flex', 
                  gap: '12px',
                  fontSize: '12px'
                }}>
                  <span>Total: {report.totalRecords}</span>
                  <span style={{ color: 'var(--color-success-600)' }}>
                    Valid: {report.validRecords}
                  </span>
                  <span style={{ color: 'var(--color-error-600)' }}>
                    Invalid: {report.invalidRecords}
                  </span>
                  {report.fixedRecords > 0 && (
                    <span style={{ color: 'var(--color-warning-600)' }}>
                      Fixed: {report.fixedRecords}
                    </span>
                  )}
                  {report.deletedRecords > 0 && (
                    <span style={{ color: 'var(--color-error-600)' }}>
                      Deleted: {report.deletedRecords}
                    </span>
                  )}
                </div>
              </div>
              
              {report.errors.length > 0 && (
                <details style={{ marginTop: '8px' }}>
                  <summary style={{ 
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    fontSize: '14px'
                  }}>
                    View {report.errors.length} error(s)
                  </summary>
                  <div style={{ 
                    marginTop: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {report.errors.slice(0, 10).map((error: any, errorIndex: number) => (
                      <div key={errorIndex} style={{ 
                        marginBottom: '8px',
                        padding: '8px',
                        backgroundColor: 'var(--color-error-bg)',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                          ID: {error.id} ({error.action})
                        </div>
                        <ul style={{ margin: '0', paddingLeft: '16px' }}>
                          {error.errors.map((err: any, i: number) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {report.errors.length > 10 && (
                      <div style={{ 
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                        textAlign: 'center',
                        marginTop: '8px'
                      }}>
                        ... and {report.errors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Usage Instructions */}
      <div style={{ 
        marginTop: '24px',
        padding: '16px',
        backgroundColor: 'var(--color-info-bg)',
        borderRadius: '8px',
        border: '1px solid var(--color-info-border)'
      }}>
        <h4 style={{ 
          margin: '0 0 8px 0', 
          color: 'var(--color-info-text)',
          fontSize: '14px',
          fontWeight: 600
        }}>
          💡 Usage Instructions
        </h4>
        <ul style={{ 
          margin: '0',
          paddingLeft: '16px',
          fontSize: '13px',
          color: 'var(--color-info-text)'
        }}>
          <li><strong>Check Data Integrity:</strong> Scans all data without making changes</li>
          <li><strong>Quick Fix:</strong> Automatically fixes common issues like missing fields</li>
          <li><strong>Full Migration:</strong> Comprehensive fix for all data integrity problems</li>
        </ul>
      </div>
    </div>
  );
};

export default DataIntegrityPanel;