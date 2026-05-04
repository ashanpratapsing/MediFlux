import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@mediflux/api';
import type { Analytics } from '@mediflux/api';

import { Card, CardContent, CardHeader, CardTitle } from '@mediflux/ui';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = React.useState('30D');
  const { data: analytics, isLoading, isError, error } = useQuery<Analytics>({
    queryKey: ['analytics', timeRange],
    queryFn: api.getAnalytics,
  });

  if (isError) {
    return (
      <div className="p-8 bg-alert/10 border border-alert/20 rounded-2xl text-alert">
        <h2 className="text-lg font-bold">Analytics Error</h2>
        <p className="text-sm">{(error instanceof Error) ? error.message : 'Failed to fetch analytics data'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-alert text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton w-48"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
          <div className="h-[400px] skeleton"></div>
          <div className="h-[400px] skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex bg-surface border border-border rounded-lg p-1">
          {['7D', '30D', '90D', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                timeRange === range 
                  ? 'bg-primary text-white shadow-soft' 
                  : 'text-muted hover:text-text hover:bg-surface-hover'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
      <Card className="h-[420px] flex flex-col group">
        <CardHeader>
          <CardTitle>Patient Growth</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.patientAdmissions || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="month" 
                stroke="#8b8d98" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#8b8d98" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1c1f26', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)'
                }}
                itemStyle={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 500 }}
                labelStyle={{ color: '#8b8d98', fontSize: '12px', marginBottom: '4px' }}
                cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#5e6ad2" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4, fill: '#5e6ad2', stroke: '#fff', strokeWidth: 2 }}
                style={{ filter: 'drop-shadow(0 0 8px rgba(94, 106, 210, 0.4))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="h-[420px] flex flex-col group">
        <CardHeader>
          <CardTitle>Disease Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.departmentLoad || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="name" 
                stroke="#8b8d98" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#8b8d98" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ 
                  backgroundColor: '#1c1f26', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)'
                }}
                itemStyle={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 500 }}
                labelStyle={{ color: '#8b8d98', fontSize: '12px', marginBottom: '4px' }}
              />
              <Bar 
                dataKey="value" 
                fill="#4c56b5" 
                radius={[4, 4, 0, 0]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
