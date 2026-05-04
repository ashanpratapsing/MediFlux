import React, { useMemo, type ReactNode } from 'react';
import { usePatientStore } from '../../store/patients';
import { Card, CardContent, CardHeader, CardTitle } from '@mediflux/ui';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, BarChart, Bar, CartesianGrid, 
  Cell, PieChart, Pie
} from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = React.useState('30D');
  const { patients } = usePatientStore();

  // 1. Condition Distribution (Disease Statistics)
  // Counts patients per unique condition string
  const conditionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach(p => {
      counts[p.condition] = (counts[p.condition] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by prevalence
  }, [patients]);

  // 2. Status Distribution (Clinical Status)
  // Counts patients by clinical status (Stable, Critical, etc.)
  const statusStats = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [patients]);

  // 3. Patient Growth Trend (Grouped by Month)
  // Real data derived from 'lastVisit' field
  const growthData = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group patients by the month of their last visit
    patients.forEach(p => {
      if (p.lastVisit) {
        const monthIndex = new Date(p.lastVisit).getMonth();
        const monthName = months[monthIndex];
        monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
      }
    });

    // Create an ordered timeline for the chart
    // We'll show the last 6 months that have data or just the full year's active months
    return months
      .map(month => ({
        month,
        count: monthCounts[month] || 0
      }))
      .filter(m => m.count > 0 || months.indexOf(m.month) <= new Date().getMonth());
  }, [patients]);

  const COLORS = ['#5e6ad2', '#2fb380', '#e25858', '#f59e0b', '#8b8d98', '#6366f1'];

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center animate-fade-in">
        <div className="w-20 h-20 bg-surface/50 border border-dashed border-border rounded-full flex items-center justify-center text-muted/30 mb-6">
          <BarChart3 size={32} />
        </div>
        <h2 className="text-xl font-bold text-text">No analytics data available</h2>
        <p className="text-sm text-muted mt-2 max-w-sm">
          Register patients in the registry to generate real-time clinical insights and growth trends.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Medical Analytics</h1>
          <p className="text-sm text-muted mt-1 font-medium">Real-time clinical insights derived from current patient state.</p>
        </div>
        <div className="flex bg-surface/50 border border-border/50 rounded-xl p-1.5 backdrop-blur-md shadow-soft">
          {['7D', '30D', '90D', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${
                timeRange === range 
                  ? 'bg-primary text-white shadow-glow' 
                  : 'text-muted hover:text-text hover:bg-surface-hover/50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Patient Growth (Line Chart) */}
        <Card className="flex flex-col group min-h-[420px] bg-surface/30 backdrop-blur-sm border-border/50 overflow-hidden relative shadow-premium">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              Admissions Trend
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg uppercase tracking-tighter ml-auto">Monthly View</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="month" 
                  stroke="#8b8d98" 
                  fontSize={11} 
                  fontWeight={700}
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#8b8d98" 
                  fontSize={11} 
                  fontWeight={700}
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#141416', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#f2f2f2', fontSize: '12px', fontWeight: 700 }}
                  labelStyle={{ color: '#8b8d98', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 800 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Patients"
                  stroke="#5e6ad2" 
                  strokeWidth={4} 
                  dot={{ fill: '#5e6ad2', strokeWidth: 2, r: 4, stroke: '#141416' }} 
                  activeDot={{ r: 6, fill: '#5e6ad2', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-glow"></div>
        </Card>

        {/* Condition Bar Chart */}
        <Card className="flex flex-col group min-h-[420px] bg-surface/30 backdrop-blur-sm border-border/50 overflow-hidden relative shadow-premium">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              Condition Prevalence
              <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-lg uppercase tracking-tighter ml-auto">Clinical Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conditionStats} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#8b8d98" 
                  fontSize={11} 
                  fontWeight={700}
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#8b8d98" 
                  fontSize={11} 
                  fontWeight={700}
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: '#141416', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#f2f2f2', fontSize: '12px', fontWeight: 700 }}
                  labelStyle={{ color: '#8b8d98', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 800 }}
                />
                <Bar 
                  dataKey="value" 
                  name="Count"
                  fill="#5e6ad2" 
                  radius={[8, 8, 0, 0]} 
                  barSize={45}
                >
                  {conditionStats.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-glow"></div>
        </Card>

        {/* Recovery Status (Pie Chart) */}
        <Card className="lg:col-span-2 flex flex-col group min-h-[380px] bg-surface/30 backdrop-blur-sm border-border/50 overflow-hidden relative shadow-premium">
          <CardHeader>
            <CardTitle className="text-base font-bold">Clinical Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col sm:flex-row items-center justify-center p-8 gap-12">
            <div className="w-full sm:w-1/2 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={10}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {statusStats.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#141416', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-4 w-full sm:w-1/2">
              {statusStats.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg shadow-soft" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none">{item.name}</p>
                    <p className="text-xl font-bold text-text mt-1">{item.value} <span className="text-[10px] text-muted font-medium uppercase ml-1">Case(s)</span></p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-glow"></div>
        </Card>
      </div>
    </div>
  );
}
