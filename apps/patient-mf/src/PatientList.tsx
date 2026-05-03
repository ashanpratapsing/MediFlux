import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@mediflux/api';
import type { Patient } from '@mediflux/api';

import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
  Badge, Button, Card, CardContent 
} from '@mediflux/ui';
import { 
  Search, SlidersHorizontal, List, LayoutGrid, 
  MoreVertical, Users, ArrowRight 
} from 'lucide-react';

export default function PatientList() {
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: patients, isLoading, isError, error } = useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: api.getPatients,
  });

  if (isError) {
    return (
      <div className="p-8 bg-alert/10 border border-alert/20 rounded-2xl text-alert flex flex-col items-center text-center">
        <h2 className="text-lg font-bold">Connection Interrupted</h2>
        <p className="text-sm mt-2">{(error as any)?.message || 'Failed to fetch the patient registry.'}</p>
        <Button 
          variant="danger"
          size="sm"
          onClick={() => window.location.reload()}
          className="mt-6 px-8"
        >
          Re-establish Connection
        </Button>
      </div>
    );
  }

  const filteredPatients = patients?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-surface-hover rounded-xl w-full max-w-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="h-64 bg-surface-hover rounded-2xl border border-border"></div>
           ))}
        </div>
      </div>
    );
  }

  // Premium Patient Card
  const PatientProfileCard = ({ patient }: { patient: Patient }) => (
    <Card 
      className="flex flex-col group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-premium border-border/50 hover:border-primary/40 bg-surface/50 backdrop-blur-sm"
      onClick={() => console.log('Viewing patient:', patient.id)}
    >
      <CardContent className="p-6">
        {/* Actions Menu */}
        <div className="absolute top-4 right-4 z-10">
          <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-hover transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center font-bold text-primary text-xl shadow-glow group-hover:scale-110 transition-transform duration-500">
            {patient.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-text text-lg leading-tight truncate group-hover:text-primary transition-colors">{patient.name}</h3>
            <p className="text-xs font-medium text-muted mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
              ID: #{patient.id.toString().padStart(4, '0')}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/40">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted mb-1">Condition</p>
            <p className="text-sm font-semibold text-text truncate">{patient.condition}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted mb-1">Age</p>
            <p className="text-sm font-semibold text-text">{patient.age} Yrs</p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-5 flex items-center justify-between">
          <Badge variant={
            patient.status === 'Stable' ? 'success' :
            patient.status === 'Critical' ? 'alert' :
            patient.status === 'Observation' ? 'default' : 'outline'
          }>
            {patient.status}
          </Badge>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted">Last Visit</p>
            <p className="text-xs font-medium text-text mt-0.5">{patient.lastVisit}</p>
          </div>
        </div>
      </CardContent>

      {/* Decorative hover element */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
    </Card>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Patient Registry</h1>
          <p className="text-sm text-muted mt-1">Manage and monitor your patient database in real-time.</p>
        </div>
        <Button className="hidden sm:flex gap-2 shadow-glow">
          <Users size={16} />
          Register Patient
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-6 items-center bg-surface/40 p-3 rounded-2xl border border-border/50 backdrop-blur-md">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID, or condition..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted/60"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto items-center justify-end">
          <Button variant="outline" size="sm" className="gap-2 text-muted hover:text-text border-border/50 bg-background/50"><SlidersHorizontal size={16} /> Filters</Button>
          <div className="w-px h-6 bg-border/50 mx-2 hidden md:block"></div>
          <div className="flex bg-background/50 border border-border/50 rounded-xl p-1.5 shadow-inner">
            <button 
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-all duration-300 ${view === 'grid' ? 'bg-primary text-white shadow-soft' : 'text-muted hover:text-text'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all duration-300 ${view === 'list' ? 'bg-primary text-white shadow-soft' : 'text-muted hover:text-text'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="animate-fade-in min-h-[400px]">
        {(!filteredPatients || filteredPatients.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-32 bg-surface/20 border border-dashed border-border rounded-3xl">
            <div className="w-20 h-20 bg-surface-hover/50 rounded-full flex items-center justify-center text-muted/40 mb-6 border border-border">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-text">No matches found</h3>
            <p className="text-sm text-muted mt-2 max-w-[280px] text-center">
              We couldn't find any patients matching your current search criteria.
            </p>
            <Button variant="outline" size="sm" className="mt-8" onClick={() => setSearchTerm('')}>Clear Search</Button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPatients.map(p => <PatientProfileCard key={p.id} patient={p} />)}
          </div>
        ) : (
          <Card className="overflow-hidden border-border/50 bg-surface/30 backdrop-blur-sm">
            <Table>
              <TableHeader className="bg-surface-hover/30">
                <TableRow>
                  <TableHead className="py-4 pl-6">Patient Details</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients?.map((patient) => (
                  <TableRow key={patient.id} className="group hover:bg-surface-hover/40 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                          {patient.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-text group-hover:text-primary transition-colors">{patient.name}</div>
                          <div className="text-[10px] font-medium text-muted uppercase tracking-tight">#{patient.id.toString().padStart(4, '0')}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-text">{patient.condition}</TableCell>
                    <TableCell className="text-muted font-medium">{patient.age} yrs</TableCell>
                    <TableCell>
                      <Badge variant={
                        patient.status === 'Stable' ? 'success' :
                        patient.status === 'Critical' ? 'alert' :
                        patient.status === 'Observation' ? 'default' : 'outline'
                      }>
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted text-sm">{patient.lastVisit}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="gap-2 group-hover:bg-primary group-hover:text-white transition-all">
                        Profile <ArrowRight size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
