import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Patient {
  id: number;
  name: string;
  age: number;
  status: "Stable" | "Critical" | "Under Observation" | "Discharged";
  lastVisit: string;
  condition: string;
}

export interface Analytics {
  patientAdmissions: { month: string; count: number }[];
  departmentLoad: { name: string; value: number }[];
}

// ─── Axios instance ───────────────────────────────────────────────────────────
const instance = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true,
  timeout: 5000,
});

// ─── API client ───────────────────────────────────────────────────────────────
export const apiClient = {
  getPatients: (): Promise<Patient[]> =>
    instance.get("/api/patients").then(r => r.data),
  getPatientById: (id: number): Promise<Patient> =>
    instance.get(`/api/patients/${id}`).then(r => r.data),
  getAnalytics: (): Promise<Analytics> =>
    instance.get("/api/analytics").then(r => r.data),
  login: (idToken: string) =>
    instance.post("/auth/login", { idToken }).then(r => r.data),
  loginFallback: (email: string, password: string) =>
    instance.post("/auth/login", { email, password }).then(r => r.data),
  refresh: () =>
    instance.post("/auth/refresh").then(r => r.data),
};

export const api = apiClient;
export { apiClient as api_client };
export { instance as axiosInstance };
