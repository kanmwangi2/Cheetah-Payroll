// Entry point for React frontend (SPA)
import React from 'react';
import { createRoot } from 'react-dom/client';
import RootRoutes from './RootRoutes';
import { AppProvider } from './core/providers/AppProvider';

console.log('React app starting...');

const container = document.getElementById('root');
if (container) {
  console.log('Root container found, rendering app...');
  try {
    createRoot(container).render(
      <AppProvider>
        <RootRoutes />
      </AppProvider>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    container.innerHTML = `<div style="padding: 20px; color: red;">Error loading app: ${errorMessage}</div>`;
  }
} else {
  console.error('Root container not found!');
  document.body.innerHTML =
    '<div style="padding: 20px; color: red;">Error: Root container not found!</div>';
}
