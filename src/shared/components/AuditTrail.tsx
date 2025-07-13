import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../services/fetchAuditLogs';

export default function AuditTrail({
  companyId,
  entityId,
  entityType,
}: {
  companyId: string;
  entityId?: string;
  entityType?: string;
}) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setError('Company ID is required');
      return;
    }
    
    setLoading(true);
    fetchAuditLogs(companyId, entityType, entityId)
      .then(setLogs)
      .catch(e => setError(e.message || 'Failed to load audit logs'))
      .finally(() => setLoading(false));
  }, [companyId, entityId, entityType]);

  return (
    <div className="audit-trail">
      <h4>Audit Trail</h4>
      {loading && <div>Loading...</div>}
      {error && (
        <div className="audit-error" role="alert">
          {error}
        </div>
      )}
      {logs.length === 0 && !loading ? (
        <div>No audit logs found for this {entityType}.</div>
      ) : (
        <ul>
          {logs.map(log => (
            <li key={log.id}>
              <b>{log.action}</b> by {log.userId} at{' '}
              {log.timestamp?.toDate?.().toLocaleString?.() || 'unknown'}
              {log.details && (
                <pre style={{ fontSize: 10, background: '#f4f4f4', padding: 4 }}>
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
