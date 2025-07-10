// Entry point for React frontend (SPA)
import React from 'react';
import { createRoot } from 'react-dom/client';
import RootRoutes from './RootRoutes';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<RootRoutes />);
}
