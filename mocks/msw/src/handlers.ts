import { http, HttpResponse } from 'msw';

const mockPatients = [
  { id: 1, name: 'John Doe', age: 45, status: 'Stable', lastVisit: '2023-10-12', condition: 'Hypertension' },
  { id: 2, name: 'Jane Smith', age: 32, status: 'Critical', lastVisit: '2023-10-24', condition: 'Cardiac Arrhythmia' },
  { id: 3, name: 'Robert Johnson', age: 58, status: 'Under Observation', lastVisit: '2023-10-20', condition: 'Type 2 Diabetes' },
  { id: 4, name: 'Emily Davis', age: 29, status: 'Stable', lastVisit: '2023-10-05', condition: 'Asthma' },
  { id: 5, name: 'Michael Wilson', age: 71, status: 'Discharged', lastVisit: '2023-09-15', condition: 'Post-op Recovery' },
];

const mockAnalytics = {
  patientAdmissions: [
    { month: 'Jan', count: 400 },
    { month: 'Feb', count: 300 },
    { month: 'Mar', count: 550 },
    { month: 'Apr', count: 480 },
    { month: 'May', count: 600 },
    { month: 'Jun', count: 700 },
  ],
  departmentLoad: [
    { name: 'Cardiology', value: 400 },
    { name: 'Neurology', value: 300 },
    { name: 'Pediatrics', value: 300 },
    { name: 'Oncology', value: 200 },
  ]
};

export const handlers = [
  http.get('/api/patients', () => {
    return HttpResponse.json(mockPatients);
  }),
  
  http.get('/api/patients/:id', ({ params }) => {
    const patient = mockPatients.find(p => p.id === Number(params.id));
    if (!patient) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(patient);
  }),

  http.get('/api/analytics', () => {
    return HttpResponse.json(mockAnalytics);
  })
];
