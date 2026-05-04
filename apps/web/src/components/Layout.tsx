import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Bell, LogOut, Activity, Search, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@mediflux/auth';
import { wsClient } from '@mediflux/websocket';
import { useNotificationStore } from '../store/notifications';
import { usePatientStore } from '../store/patients';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { 
    notifications: storeNotifications, 
    markAsRead, 
    markAllAsRead, 
    getUnreadCount,
    addNotification 
  } = useNotificationStore();
  const { patients, updatePatient } = usePatientStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Advanced Real-time Simulation
    const interval = setInterval(() => {
      const chance = Math.random();
      
      if (chance > 0.6 && patients.length > 0) {
        // Simulation: Patient status update
        const randomIdx = Math.floor(Math.random() * patients.length);
        const patient = patients[randomIdx];
        const statuses: Array<'Stable' | 'Critical' | 'Under Observation'> = ['Stable', 'Critical', 'Under Observation'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        if (newStatus !== patient.status) {
          updatePatient(patient.id, { status: newStatus });
          addNotification({
            title: 'Vitals Update',
            message: `${patient.name}'s status changed to ${newStatus}.`,
            type: newStatus === 'Critical' ? 'critical' : 'info'
          });
        }
      } else {
        // Simulation: Generic system event
        const titles = ['System Sync', 'Lab Results', 'New Memo', 'Security Audit'];
        const messages = ['Cloud metrics synchronized.', 'Lab results available for review.', 'New protocol update for Ward B.', 'Monthly security audit completed.'];
        const idx = Math.floor(Math.random() * titles.length);
        
        addNotification({
          title: titles[idx],
          message: messages[idx],
          type: 'info',
        });
      }
    }, 15000); // Trigger every 15 seconds as requested

    const unsubscribe = wsClient.on('notification', (data) => {
      const payload = data as { title: string; message: string; type?: string };
      addNotification({
        title: payload.title,
        message: payload.message,
        type: payload.type === 'CRITICAL_ALERT' ? 'critical' : 'info'
      });
    });
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [addNotification, patients, updatePatient]);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'doctor', 'staff'] },
    { path: '/patients', icon: Users, label: 'Patients', roles: ['admin', 'doctor', 'staff'] },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const unreadCount = getUnreadCount();

  const handleLogout = () => {
    localStorage.removeItem('mediflux_user');
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden font-sans">
      {/* Left Sidebar */}
      <aside className="w-[240px] bg-surface flex flex-col border-r border-border z-20 shrink-0">
        <div className="h-[64px] flex items-center px-6 gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-primary bg-primary/10 shadow-glow">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight">MediFlux</span>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-bold shadow-glow' 
                    : 'text-muted hover:text-text hover:bg-surface-hover/50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary' : 'text-muted'} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-muted hover:text-alert hover:bg-alert/5 transition-all rounded-xl group"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
            <span className="text-sm font-semibold">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className=" flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-[64px] shrink-0 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="relative w-96 hidden md:block group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search patients, doctors, or reports..." 
              className="w-full bg-surface/50 border border-border rounded-xl pl-11 pr-4 py-2 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted/60"
            />
          </div>

          <div className="flex items-center gap-6 ml-auto">
            {/* Notification Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`relative p-2 rounded-xl transition-all duration-300 ${dropdownOpen ? 'bg-primary text-white shadow-glow' : 'text-muted hover:text-text hover:bg-surface-hover/50'}`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-alert rounded-full border-2 border-background text-[9px] flex items-center justify-center font-bold text-white shadow-glow">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-4 w-80 bg-surface border border-border rounded-2xl shadow-premium z-20 animate-scale-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-surface-hover/30">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Alert Center</h3>
                      <button 
                        onClick={() => markAllAsRead()}
                        className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {storeNotifications.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                          <Bell size={32} className="mx-auto text-muted/20 mb-3" />
                          <p className="text-xs text-muted font-medium">System reports are all clear.</p>
                        </div>
                      ) : (
                        storeNotifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => markAsRead(n.id)}
                            className={`px-4 py-4 border-b border-border/50 cursor-pointer transition-all flex gap-3 ${n.isRead ? 'opacity-40 grayscale-[0.5]' : 'bg-primary/[0.03] hover:bg-primary/[0.08]'}`}
                          >
                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.type === 'critical' ? 'bg-alert shadow-glow animate-pulse' : 'bg-primary shadow-glow'}`} />
                            <div>
                              <p className={`text-sm ${n.isRead ? 'font-medium' : 'font-bold text-text'}`}>{n.title}</p>
                              <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-muted/50 mt-2 font-bold uppercase tracking-tighter">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-3 bg-surface-hover/30 text-center border-t border-border">
                       <button className="text-[10px] font-bold text-muted hover:text-text transition-colors uppercase tracking-widest">Open System Log</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-border cursor-pointer group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/60 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-glow group-hover:scale-105 transition-transform">
                {user?.displayName?.[0]}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-text leading-none">{user?.displayName}</p>
                <p className="text-[10px] text-muted font-bold uppercase mt-1 tracking-tighter">{user?.role}</p>
              </div>
              <ChevronDown size={14} className="text-muted group-hover:text-text transition-all group-hover:translate-y-0.5" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
