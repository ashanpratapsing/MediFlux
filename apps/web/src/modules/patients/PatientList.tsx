import { useState, useMemo } from 'react';
import { usePatientStore } from '../../store/patients';
import { useNotificationStore } from '../../store/notifications';
import type { Patient } from '@mediflux/api';

import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
  Badge, Button, Card, CardContent, Modal 
} from '@mediflux/ui';
import { 
  Search, SlidersHorizontal, List, LayoutGrid, 
  Users, Plus, Trash2, Edit2, AlertTriangle, X, ChevronDown
} from 'lucide-react';


export default function PatientList() {
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  const { patients, addPatient, updatePatient, deletePatient } = usePatientStore();
  const { addNotification } = useNotificationStore();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<{id: number, name: string} | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    condition: '',
    status: 'Stable' as Patient['status']
  });

  const handleOpenModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        name: patient.name,
        age: patient.age.toString(),
        condition: patient.condition,
        status: patient.status
      });
    } else {
      setEditingPatient(null);
      setFormData({ name: '', age: '', condition: '', status: 'Stable' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.condition) return;

    const patientData = {
      name: formData.name,
      age: parseInt(formData.age),
      condition: formData.condition,
      status: formData.status,
      lastVisit: new Date().toISOString().split('T')[0]
    };

    if (editingPatient) {
      updatePatient(editingPatient.id, patientData);
      addNotification({
        title: 'Registry Updated',
        message: `${patientData.name}'s record successfully modified.`,
        type: 'success'
      });
    } else {
      const newPatient = addPatient(patientData);
      addNotification({
        title: 'New Patient Registered',
        message: `${newPatient.name} added to the central registry.`,
        type: 'success'
      });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      deletePatient(patientToDelete.id);
      addNotification({
        title: 'Record Removed',
        message: `${patientToDelete.name} has been deleted from the registry.`,
        type: 'warning'
      });
      setIsDeleteModalOpen(false);
      setPatientToDelete(null);
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.id.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      // Note: No change needed here if statusFilter matches the select values, 
      // but I will ensure the select options are also updated.
      return matchesSearch && matchesStatus;
    });
  }, [patients, searchTerm, statusFilter]);

  // Premium Patient Card
  const PatientProfileCard = ({ patient }: { patient: Patient }) => (
    <Card 
      className="flex flex-col group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-premium border-border/50 hover:border-primary/40 bg-surface/50 backdrop-blur-sm"
    >
      <CardContent className="p-6">
        {/* Actions Menu */}
        <div className="absolute top-4 right-4 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => handleOpenModal(patient)}
            className="p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={() => { setPatientToDelete({id: patient.id, name: patient.name}); setIsDeleteModalOpen(true); }}
            className="p-2 rounded-xl text-muted hover:text-alert hover:bg-alert/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center font-bold text-primary text-xl shadow-glow group-hover:scale-110 transition-transform duration-500">
            {patient.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-text text-lg leading-tight truncate group-hover:text-primary transition-colors">{patient.name}</h3>
            <p className="text-xs font-bold text-muted mt-1 flex items-center gap-1.5 uppercase tracking-tighter">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
              ID: #{patient.id.toString().padStart(4, '0')}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/40">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted mb-1">Condition</p>
            <p className="text-sm font-bold text-text truncate">{patient.condition}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted mb-1">Age</p>
            <p className="text-sm font-bold text-text">{patient.age} Yrs</p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-5 flex items-center justify-between">
          <Badge variant={
            patient.status === 'Stable' ? 'success' :
            patient.status === 'Critical' ? 'alert' :
            patient.status === 'Under Observation' ? 'default' : 'outline'
          }>
            {patient.status}
          </Badge>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted">Last Visit</p>
            <p className="text-xs font-bold text-text mt-0.5">{patient.lastVisit}</p>
          </div>
        </div>
      </CardContent>

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
        <Button 
          className="flex gap-2 shadow-glow px-6 h-11"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} />
          Register Patient
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 items-center bg-surface/40 p-3 rounded-2xl border border-border/50 backdrop-blur-md shadow-soft">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID or condition..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted/40 font-medium"
          />
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto items-center justify-end">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-primary/50 transition-all cursor-pointer font-bold"
          >
            <option value="All">All Statuses</option>
            <option value="Stable">Stable Only</option>
            <option value="Critical">Critical Alerts</option>
            <option value="Under Observation">Observation</option>
            <option value="Discharged">Discharged</option>
          </select>

          <div className="w-px h-6 bg-border/50 mx-2 hidden lg:block"></div>
          <div className="flex bg-background/50 border border-border/50 rounded-xl p-1.5 shadow-inner">
            <button 
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-all duration-300 ${view === 'grid' ? 'bg-primary text-white shadow-soft' : 'text-muted hover:text-text'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all duration-300 ${view === 'list' ? 'bg-primary text-white shadow-soft' : 'text-muted hover:text-text'}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="animate-fade-in min-h-[400px]">
        {filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-surface/20 border border-dashed border-border rounded-3xl text-center px-6">
            <div className="w-20 h-20 bg-surface-hover/50 rounded-full flex items-center justify-center text-muted/40 mb-6 border border-border shadow-inner">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-text">No records found</h3>
            <p className="text-sm text-muted mt-2 max-w-[320px] font-medium leading-relaxed">
              {searchTerm || statusFilter !== 'All' 
                ? 'Try adjusting your search query or filter settings to locate the desired record.' 
                : 'Your patient registry is currently empty. Use the button above to register your first patient.'}
            </p>
            <Button variant="outline" size="sm" className="mt-8 px-8" onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>Clear Filters</Button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPatients.map(p => <PatientProfileCard key={p.id} patient={p} />)}
          </div>
        ) : (
          <Card className="overflow-hidden border-border/50 bg-surface/30 backdrop-blur-sm shadow-premium">
            <Table>
              <TableHeader className="bg-surface-hover/30">
                <TableRow>
                  <TableHead className="py-5 pl-8 text-[10px] font-bold uppercase tracking-widest text-muted">Patient Profile</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted">Condition</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted">Age</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted">Last Assessment</TableHead>
                  <TableHead className="text-right pr-8 text-[10px] font-bold uppercase tracking-widest text-muted">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-border/20 last:border-0">
                    <TableCell className="py-5 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm shadow-soft">
                          {patient.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-text group-hover:text-primary transition-colors text-base">{patient.name}</div>
                          <div className="text-[10px] font-bold text-muted uppercase tracking-tighter mt-0.5">#{patient.id.toString().padStart(4, '0')}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-text/90">{patient.condition}</TableCell>
                    <TableCell className="text-muted font-bold">{patient.age} yrs</TableCell>
                    <TableCell>
                      <Badge variant={
                        patient.status === 'Stable' ? 'success' :
                        patient.status === 'Critical' ? 'alert' :
                        patient.status === 'Under Observation' ? 'default' : 'outline'
                      }>
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted font-semibold text-sm">{patient.lastVisit}</TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(patient)} className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"><Edit2 size={16} /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setPatientToDelete({id: patient.id, name: patient.name}); setIsDeleteModalOpen(true); }} className="h-9 w-9 p-0 rounded-xl hover:bg-alert/10 hover:text-alert"><Trash2 size={16} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Register/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingPatient ? 'Modify Patient Record' : 'Register New Patient'}
        footer={
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none px-6" onClick={() => setIsModalOpen(false)}>Discard</Button>
            <Button className="flex-1 sm:flex-none px-8 shadow-glow" onClick={handleSubmit}>{editingPatient ? 'Save Changes' : 'Complete Registration'}</Button>
          </div>
        }
      >
        <form className="space-y-7" onSubmit={handleSubmit}>
          <div className="space-y-2.5">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.1em] ml-1">Full Patient Name</label>
            <input 
              required
              className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted/20"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Jonathan Smith"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2.5">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.1em] ml-1">Age</label>
              <input 
                required
                type="number"
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                placeholder="Years"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.1em] ml-1">Condition</label>
              <input 
                required
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value})}
                placeholder="Primary Diagnosis"
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.1em] ml-1">Clinical Status</label>
            <div className="relative group">
              <select 
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer appearance-none"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as Patient['status']})}
              >
                <option value="Stable">Stable Recovery</option>
                <option value="Critical">Critical Alert</option>
                <option value="Under Observation">Under Observation</option>
                <option value="Discharged">Ready for Discharge</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted group-hover:text-primary transition-colors">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        </form>

      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1 shadow-glow" onClick={confirmDelete}>Delete Record</Button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
           <div className="w-16 h-16 bg-alert/10 rounded-full flex items-center justify-center text-alert mb-6 shadow-glow">
              <AlertTriangle size={32} />
           </div>
           <h4 className="text-lg font-bold text-text mb-2">Are you absolutely sure?</h4>
           <p className="text-sm text-muted leading-relaxed">
             This action will permanently remove <strong>{patientToDelete?.name}</strong> from the MediFlux central registry. This action cannot be undone.
           </p>
        </div>
      </Modal>
    </div>
  );
}
