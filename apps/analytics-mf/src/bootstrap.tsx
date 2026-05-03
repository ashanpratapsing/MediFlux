import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AnalyticsDashboard from './AnalyticsDashboard'
import './index.css'

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <div className="p-8 bg-[#0A0A0B] min-h-screen text-white">
      <h1>DEBUG: Analytics MFE Running</h1>
      <AnalyticsDashboard />
    </div>
  </QueryClientProvider>
);
