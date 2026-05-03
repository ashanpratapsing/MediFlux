import { create } from 'zustand';
import type { Patient } from '@mediflux/api';

interface PatientState {
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
  addPatient: (patient: Omit<Patient, 'id'>) => Patient;
  updatePatient: (id: number, updates: Partial<Patient>) => void;
  deletePatient: (id: number) => void;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [
    { id: 1, name: 'James Wilson', age: 45, condition: 'Hypertension', status: 'Stable', lastVisit: '2024-05-01' },
    { id: 2, name: 'Sarah Chen', age: 32, condition: 'Type 2 Diabetes', status: 'Stable', lastVisit: '2024-04-28' },
    { id: 3, name: 'Michael Brown', age: 68, condition: 'Post-Op Recovery', status: 'Observation', lastVisit: '2024-05-02' },
    { id: 4, name: 'Emily Davis', age: 24, condition: 'Acute Asthma', status: 'Critical', lastVisit: '2024-05-02' },
    { id: 5, name: 'Robert Miller', age: 54, condition: 'Cardiac Arrhythmia', status: 'Stable', lastVisit: '2024-04-15' },
    { id: 6, name: 'Linda Garcia', age: 41, condition: 'Chronic Migraine', status: 'Stable', lastVisit: '2024-04-30' },
  ],

  setPatients: (patients) => set({ patients }),

  addPatient: (patientData) => {
    const newId = Math.max(0, ...get().patients.map(p => p.id)) + 1;
    const newPatient = { ...patientData, id: newId };
    set((state) => ({ patients: [newPatient, ...state.patients] }));
    return newPatient;
  },

  updatePatient: (id, updates) => set((state) => ({
    patients: state.patients.map((p) => p.id === id ? { ...p, ...updates } : p)
  })),

  deletePatient: (id) => set((state) => ({
    patients: state.patients.filter((p) => p.id !== id)
  })),
}));
