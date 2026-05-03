export type Role = 'admin' | 'doctor' | 'staff';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  status: 'Stable' | 'Critical' | 'Under Observation' | 'Discharged';
  lastVisit: string;
  condition: string;
}

export interface Analytics {
  patientAdmissions: { month: string; count: number }[];
  departmentLoad: { name: string; value: number }[];
}
