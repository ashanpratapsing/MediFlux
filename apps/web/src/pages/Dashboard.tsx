import { useMemo } from 'react';
import { usePatientStore } from '../store/patients';
import { useNotificationStore } from '../store/notifications';
import { Activity, Users, AlertCircle, TrendingUp, TrendingDown, Clock, CheckCircle2, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@mediflux/ui';

const KpiCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <Card className="flex flex-col justify-between h-full group relative overflow-hidden transition-all duration-300 hover:shadow-premium border-border/50 bg-surface/40 backdrop-blur-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-[10px] font-bold text-muted uppercase tracking-widest">{title}</CardTitle>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${color || 'bg-surface-hover text-muted group-hover:text-primary shadow-soft'}`}>
        <Icon size={20} />
      </div>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="text-3xl font-bold tracking-tight text-text tabular-nums">{value}</div>
      <div className={`flex items-center gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-tighter ${trend === 'up' ? 'text-success' : 'text-alert'}`}>
        {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{trendValue} vs last month</span>
      </div>
    </CardContent>
    <div className={`absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-all duration-500 ${color ? 'bg-current' : 'bg-primary shadow-glow'}`}></div>
  </Card>
);

export const Dashboard = () => {
  const { patients } = usePatientStore();
  const { notifications } = useNotificationStore();

  // STEP 5: DASHBOARD SYNC (Derived & Memoized)
  const stats = useMemo(() => {
    const total = patients.length;
    const critical = patients.filter(p => p.status === 'Critical').length;
    const stable = patients.filter(p => p.status === 'Stable').length;
    const observation = patients.filter(p => p.status === 'Observation').length;
    const discharged = patients.filter(p => p.status === 'Discharged').length;
    const active = total - discharged;

    return { total, active, critical, stable, observation, discharged };
  }, [patients]);

  // STEP 4: CONDITION DISTRIBUTION (Count by status)
  const statusDistribution = useMemo(() => {
    return [
      { label: 'Stable', count: stats.stable, color: 'bg-success' },
      { label: 'Critical', count: stats.critical, color: 'bg-alert' },
      { label: 'Observation', count: stats.observation, color: 'bg-primary' },
    ];
  }, [stats]);

  const recentActivity = useMemo(() => notifications.slice(0, 5), [notifications]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Healthcare Shell</h1>
          <p className="text-sm text-muted mt-1 font-medium">Real-time platform synchronization and active patient monitoring.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-surface/40 border border-border/50 rounded-xl text-[10px] font-bold text-success shadow-soft backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-glow"></div>
          <span className="uppercase tracking-widest">Live Sync Active</span>
        </div>
      </div>

      {/* KPI Grid (Synced with Patient State) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total Registry" 
          value={stats.total} 
          icon={Users} 
          trend="up" 
          trendValue="+12.5%" 
        />
        <KpiCard 
          title="Active Cases" 
          value={stats.active} 
          icon={Activity} 
          trend="up" 
          trendValue="+4.2%" 
          color="bg-primary/10 text-primary"
        />
        <KpiCard 
          title="Critical Alerts" 
          value={stats.critical} 
          icon={AlertCircle} 
          trend="down" 
          trendValue="-2.1%" 
          color="bg-alert/10 text-alert"
        />
        <KpiCard 
          title="Stable Recovery" 
          value={stats.stable} 
          icon={CheckCircle2} 
          trend="up" 
          trendValue="+8.4%" 
          color="bg-success/10 text-success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* STEP 4: CONDITION DISTRIBUTION (Status-based bars) */}
          <Card className="p-8 bg-surface/30 backdrop-blur-sm border-border/50 shadow-premium">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                Clinical Status Distribution
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-auto">Real-time Stream</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-10">
              <div className="flex items-end justify-around h-56 gap-6 px-4">
                {statusDistribution.map((item, i) => {
                  const height = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                      <div className="w-full relative flex items-end justify-center h-full">
                         <div 
                           className={`w-full max-w-[72px] rounded-t-2xl transition-all duration-1000 ease-out shadow-glow group-hover:brightness-110 cursor-pointer ${item.color}`}
                           style={{ height: `${Math.max(height, 8)}%` }}
                         >
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-border px-3 py-1 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0 shadow-premium whitespace-nowrap">
                             {item.count} Active Case(s)
                           </div>
                         </div>
                      </div>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
             <Card className="p-6 border-l-4 border-l-primary bg-surface/30 backdrop-blur-sm shadow-soft">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Medical Insights</p>
                      <p className="text-lg font-bold mt-2 leading-tight">Patient data is now fully synchronized with the global store.</p>
                   </div>
                   <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-glow">
                      <LayoutGrid size={18} />
                   </div>
                </div>
                <div className="mt-6 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                   <span className="text-[10px] font-bold text-muted uppercase">Reactive Updates Enabled</span>
                </div>
             </Card>
             <Card className="p-6 border-l-4 border-l-success bg-surface/30 backdrop-blur-sm shadow-soft">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Platform Status</p>
                      <p className="text-lg font-bold mt-2 leading-tight">All analytics charts are reflecting the real-time state.</p>
                   </div>
                   <div className="p-2.5 bg-success/10 rounded-xl text-success shadow-glow">
                      <Activity size={18} />
                   </div>
                </div>
                <div className="mt-6 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                   <span className="text-[10px] font-bold text-muted uppercase">State Integrity: 100%</span>
                </div>
             </Card>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col bg-surface/30 backdrop-blur-sm border-border/50 shadow-premium overflow-hidden">
            <CardHeader className="bg-surface-hover/20 px-6 py-5">
              <CardTitle className="flex items-center justify-between text-base">
                Recent Activity
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">Live Feed</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-7 pt-8 px-6 overflow-y-auto max-h-[500px]">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                   <Clock size={40} className="mb-4 text-muted" />
                   <p className="text-xs font-bold uppercase tracking-widest">Analyzing system logs...</p>
                </div>
              ) : (
                recentActivity.map((notif, i) => (
                  <div key={notif.id} className="flex gap-5 group cursor-default">
                    <div className="relative mt-1">
                      <div className={`w-2.5 h-2.5 rounded-full border-2 border-background transition-all duration-500 z-10 relative ${notif.isRead ? 'bg-border' : 'bg-primary shadow-glow group-hover:scale-125'}`}></div>
                      {i !== recentActivity.length - 1 && <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-px h-14 bg-border/40"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold transition-colors truncate ${notif.isRead ? 'text-muted' : 'text-text group-hover:text-primary'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-1 font-medium">{notif.message}</p>
                      <p className="text-[10px] text-muted/40 mt-2 font-bold uppercase tracking-tighter tabular-nums">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <div className="p-4 border-t border-border/50 bg-surface-hover/30 text-center">
               <button className="text-[10px] font-bold text-muted hover:text-primary transition-all uppercase tracking-widest hover:scale-105">View Full System Audit</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
