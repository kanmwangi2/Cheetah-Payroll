/**
 * Staff List Component with Enhanced Error Handling and Modern UI
 * Displays staff members with search, filtering, and management capabilities
 */

import React, { useEffect, useState } from 'react';
import { getStaffLegacy } from '../services/staff.service';
import { useService } from '../../../shared/hooks/useService';
import StaffForm from './StaffForm';
import StaffProfile from './StaffProfile';
import StaffImportExport from './StaffImportExport';
import PageContainer from '../../../shared/components/ui/PageContainer';
import Card from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ui/ErrorMessage';
import FormField from '../../../shared/components/ui/FormField';

interface StaffListProps {
  companyId: string;
}

const StaffList: React.FC<StaffListProps> = ({ companyId }) => {
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);

  const { data: staff = [], loading, error, execute, reset } = useService<any[]>([]);

  useEffect(() => {
    loadStaff();
  }, [companyId, refresh]);

  const loadStaff = async () => {
    await execute(async () => {
      const data = await getStaffLegacy(companyId);
      return { data, loading: false, success: true };
    });
  };

  const handleRefresh = () => {
    setRefresh(r => r + 1);
    reset();
  };

  const handleStaffAdded = () => {
    setShowForm(false);
    handleRefresh();
  };

  const handleImportCompleted = () => {
    setShowImportExport(false);
    handleRefresh();
  };

  const filteredStaff = staff.filter(s => {
    const searchTerm = search.toLowerCase();
    return (
      (s.personalDetails?.firstName || '').toLowerCase().includes(searchTerm) ||
      (s.personalDetails?.lastName || '').toLowerCase().includes(searchTerm) ||
      (s.personalDetails?.idNumber || '').toLowerCase().includes(searchTerm) ||
      (s.employmentDetails?.department || '').toLowerCase().includes(searchTerm) ||
      (s.employmentDetails?.position || '').toLowerCase().includes(searchTerm)
    );
  });

  const headerActions = (
    <div style={headerActionsStyles}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowImportExport(true)}
        disabled={loading}
      >
        Import/Export
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setShowForm(true)}
        disabled={loading}
      >
        Add Staff
      </Button>
    </div>
  );

  if (loading && staff.length === 0) {
    return (
      <PageContainer 
        title="Staff Management" 
        subtitle="Manage your team members and employee information"
        headerActions={headerActions}
      >
        <LoadingSpinner message="Loading staff members..." size="large" />
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="Staff Management" 
      subtitle="Manage your team members and employee information"
      headerActions={headerActions}
    >
      {/* Error Display */}
      {error && (
        <ErrorMessage
          error={error}
          type="network"
          onRetry={loadStaff}
        />
      )}

      {/* Search and Filters */}
      <Card style={searchCardStyles}>
        <div style={searchContainerStyles}>
          <FormField
            id="staff-search"
            label="Search Staff"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, department, or position..."
            fieldClassName="search-field"
          />
          <div style={searchStatsStyles}>
            {loading ? (
              <span>Loading...</span>
            ) : (
              <span>
                {filteredStaff.length} of {staff.length} staff members
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Staff Table */}
      <Card>
        {filteredStaff.length === 0 ? (
          <div style={emptyStateStyles}>
            {search ? (
              <>
                <SearchIcon />
                <h3>No staff members found</h3>
                <p>Try adjusting your search criteria or add new staff members.</p>
                <Button
                  variant="primary"
                  onClick={() => setShowForm(true)}
                >
                  Add First Staff Member
                </Button>
              </>
            ) : (
              <>
                <UsersIcon />
                <h3>No staff members yet</h3>
                <p>Get started by adding your first team member.</p>
                <Button
                  variant="primary"
                  onClick={() => setShowForm(true)}
                >
                  Add Staff Member
                </Button>
              </>
            )}
          </div>
        ) : (
          <div style={tableContainerStyles}>
            <table style={tableStyles}>
              <thead>
                <tr style={tableHeaderRowStyles}>
                  <th style={tableHeaderStyles}>Name</th>
                  <th style={tableHeaderStyles}>ID/Passport</th>
                  <th style={tableHeaderStyles}>Department</th>
                  <th style={tableHeaderStyles}>Position</th>
                  <th style={tableHeaderStyles}>Status</th>
                  <th style={tableHeaderStyles}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staffMember) => (
                  <tr key={staffMember.id} style={tableRowStyles}>
                    <td style={tableCellStyles}>
                      <div style={nameContainerStyles}>
                        <div style={nameStyles}>
                          {staffMember.personalDetails?.firstName || ''} {staffMember.personalDetails?.lastName || ''}
                        </div>
                        <div style={emailStyles}>
                          {staffMember.personalDetails?.email || ''}
                        </div>
                      </div>
                    </td>
                    <td style={tableCellStyles}>
                      {staffMember.personalDetails?.idNumber || 'N/A'}
                    </td>
                    <td style={tableCellStyles}>
                      {staffMember.employmentDetails?.department || 'N/A'}
                    </td>
                    <td style={tableCellStyles}>
                      {staffMember.employmentDetails?.position || 'N/A'}
                    </td>
                    <td style={tableCellStyles}>
                      <span style={getStatusStyles(staffMember.employmentDetails?.status)}>
                        {staffMember.employmentDetails?.status || 'Active'}
                      </span>
                    </td>
                    <td style={tableCellStyles}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(staffMember.id)}
                      >
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showForm && (
        <StaffForm 
          companyId={companyId} 
          onAdded={handleStaffAdded}
        />
      )}

      {showImportExport && (
        <StaffImportExport
          companyId={companyId}
          onImported={handleImportCompleted}
          staff={staff}
        />
      )}

      {selected && (
        <StaffProfile 
          companyId={companyId} 
          staffId={selected} 
          onClose={() => setSelected(null)}
        />
      )}

      {/* Loading Overlay */}
      {loading && staff.length > 0 && (
        <div style={loadingOverlayStyles}>
          <LoadingSpinner message="Refreshing staff list..." size="small" />
        </div>
      )}
    </PageContainer>
  );
};

// Icons
const SearchIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const UsersIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// Styles
const headerActionsStyles: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-sm)',
};

const searchCardStyles: React.CSSProperties = {
  marginBottom: 'var(--spacing-lg)',
};

const searchContainerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: 'var(--spacing-lg)',
};

const searchFieldStyles: React.CSSProperties = {
  flex: 1,
  marginBottom: 0,
};

const searchStatsStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-secondary)',
  whiteSpace: 'nowrap',
};

const emptyStateStyles: React.CSSProperties = {
  textAlign: 'center',
  padding: 'var(--spacing-4xl)',
  color: 'var(--color-text-secondary)',
};

const tableContainerStyles: React.CSSProperties = {
  overflowX: 'auto',
};

const tableStyles: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const tableHeaderRowStyles: React.CSSProperties = {
  borderBottom: '2px solid var(--color-border-primary)',
};

const tableHeaderStyles: React.CSSProperties = {
  padding: 'var(--spacing-md)',
  textAlign: 'left',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-size-sm)',
};

const tableRowStyles: React.CSSProperties = {
  borderBottom: '1px solid var(--color-border-secondary)',
  transition: 'background-color var(--transition-normal)',
};

const tableCellStyles: React.CSSProperties = {
  padding: 'var(--spacing-md)',
  verticalAlign: 'middle',
};

const nameContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-xs)',
};

const nameStyles: React.CSSProperties = {
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-primary)',
};

const emailStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-secondary)',
};

const getStatusStyles = (status?: string): React.CSSProperties => {
  const isActive = status?.toLowerCase() === 'active' || !status;
  return {
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-medium)',
    backgroundColor: isActive ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
    color: isActive ? 'var(--color-success-text)' : 'var(--color-warning-text)',
    border: `1px solid ${isActive ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`,
  };
};

const loadingOverlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

export default StaffList;