import React from 'react';
import { useNotifications } from '../notificationsUtils';

// TODO: Replace with real user context
const mockUser = { id: 'demo-user' };

export default function SystemNotifications() {
  const notifications = useNotifications(mockUser.id);
  return (
    <div className="system-notifications" aria-live="polite" aria-atomic="true">
      <h4>System Notifications</h4>
      {notifications.length === 0 ? (
        <div>No notifications.</div>
      ) : (
        <ul>
          {notifications.map(n => (
            <li key={n.id} style={{ color: n.type === 'error' ? 'crimson' : n.type === 'success' ? 'green' : '#333' }}>
              {n.message} <span style={{ fontSize: 10, color: '#888' }}>({n.createdAt?.toDate?.().toLocaleString?.() || ''})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
