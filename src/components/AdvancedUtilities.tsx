import React, { useState } from 'react';
import { backupCollectionToCloud } from '../cloudBackupUtils';
import { restoreCollectionFromCloud } from '../cloudRestoreUtils';

export default function AdvancedUtilities() {
  const [companyId, setCompanyId] = useState('');
  const [collection, setCollection] = useState('staff');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restorePath, setRestorePath] = useState('');
  const [restoreResult, setRestoreResult] = useState<string | null>(null);

  const handleBackup = async () => {
    setLoading(true); setError(null); setDownloadUrl(null);
    try {
      const url = await backupCollectionToCloud(companyId, collection);
      setDownloadUrl(url);
    } catch (e: any) {
      setError(e.message || 'Backup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true); setError(null); setRestoreResult(null);
    try {
      await restoreCollectionFromCloud(companyId, collection, restorePath);
      setRestoreResult('Restore successful!');
    } catch (e: any) {
      setError(e.message || 'Restore failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advanced-utilities">
      <h4>Advanced Utilities</h4>
      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Company ID"
          value={companyId}
          onChange={e => setCompanyId(e.target.value)}
          style={{ width: 180, marginRight: 8 }}
        />
        <select value={collection} onChange={e => setCollection(e.target.value)} style={{ marginRight: 8 }}>
          <option value="staff">Staff</option>
          <option value="payrolls">Payrolls</option>
          <option value="payments">Payments</option>
          <option value="deductions">Deductions</option>
        </select>
        <button onClick={handleBackup} disabled={!companyId || loading}>Backup to Cloud</button>
      </div>
      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Cloud Storage backup path (e.g. backups/companyId/staff_123456.json)"
          value={restorePath}
          onChange={e => setRestorePath(e.target.value)}
          style={{ width: 400, marginRight: 8 }}
        />
        <button onClick={handleRestore} disabled={!companyId || !restorePath || loading}>Restore from Cloud</button>
      </div>
      {loading && <div>{restorePath ? 'Restoring...' : 'Backing up...'}</div>}
      {downloadUrl && <div>Backup complete: <a href={downloadUrl} target="_blank" rel="noopener noreferrer">Download JSON</a></div>}
      {restoreResult && <div style={{ color: 'green' }}>{restoreResult}</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
    </div>
  );
}
