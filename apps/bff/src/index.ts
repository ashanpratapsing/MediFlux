import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.BFF_PORT || 4000;
const ACCESS_SECRET = process.env.ACCESS_SECRET || "MEDIFLUX_ACCESS_SECRET";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "MEDIFLUX_REFRESH_SECRET";

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3010",
  "http://localhost:3001",
  "http://localhost:3002",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ─── HEALTH ───────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "MediFlux BFF", timestamp: new Date().toISOString() });
});

// ─── AUTH: LOGIN ──────────────────────────────────────────────────────────────
// Accepts either a Firebase idToken (real) OR fallback email/password credentials
app.post("/auth/login", async (req, res) => {
  const { idToken, email, password } = req.body;

  try {
    let userPayload: { uid: string; email: string; role: string };

    if (idToken) {
      // Real Firebase token path — requires firebase-admin with valid credentials
      try {
        const { default: admin } = await import("firebase-admin");
        if (!admin.apps.length) {
          admin.initializeApp({ credential: admin.credential.applicationDefault() });
        }
        const decoded = await admin.auth().verifyIdToken(idToken);
        userPayload = { uid: decoded.uid, email: decoded.email || "", role: "admin" };
      } catch {
        return res.status(401).json({ error: "Firebase token invalid" });
      }
    } else if (email && password) {
      // Fallback credential check
      const MOCK_USERS: Record<string, { uid: string; role: string }> = {
        "admin@test.com": { uid: "admin-001", role: "admin" },
        "doctor@test.com": { uid: "doctor-001", role: "doctor" },
        "staff@test.com": { uid: "staff-001", role: "staff" },
      };
      const knownUser = MOCK_USERS[email];
      if (!knownUser || password !== "123456") {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      userPayload = { uid: knownUser.uid, email, role: knownUser.role };
    } else {
      return res.status(400).json({ error: "Provide idToken or email/password" });
    }

    const accessToken = jwt.sign(userPayload, ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(userPayload, REFRESH_SECRET, { expiresIn: "7d" });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken, user: userPayload });
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── AUTH: REFRESH ────────────────────────────────────────────────────────────
app.post("/auth/refresh", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as { uid: string; email: string; role: string };
    const newAccessToken = jwt.sign(
      { uid: decoded.uid, email: decoded.email, role: decoded.role },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    return res.json({ accessToken: newAccessToken });
  } catch {
    return res.sendStatus(403);
  }
});

// ─── AUTH: LOGOUT ─────────────────────────────────────────────────────────────
app.post("/auth/logout", (_req, res) => {
  res.clearCookie("refreshToken");
  res.json({ success: true });
});

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
const mockPatients = [
  { id: 1, name: "John Doe",      age: 45, status: "Stable",            lastVisit: "2024-03-20", condition: "Hypertension" },
  { id: 2, name: "Jane Smith",    age: 32, status: "Critical",          lastVisit: "2024-03-21", condition: "Diabetes Type 1" },
  { id: 3, name: "Robert Brown",  age: 67, status: "Under Observation", lastVisit: "2024-03-19", condition: "Post-Surgery" },
  { id: 4, name: "Alice Wilson",  age: 29, status: "Discharged",        lastVisit: "2024-03-18", condition: "Checkup" },
  { id: 5, name: "Michael Chen",  age: 54, status: "Stable",            lastVisit: "2024-03-17", condition: "Asthma" },
];

app.get("/api/patients", (_req, res) => res.json(mockPatients));
app.get("/api/patients/:id", (req, res) => {
  const patient = mockPatients.find(p => p.id === Number(req.params.id));
  if (!patient) return res.status(404).json({ error: "Not found" });
  return res.json(patient);
});

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
const mockAnalytics = {
  patientAdmissions: [
    { month: "Jan", count: 400 },
    { month: "Feb", count: 300 },
    { month: "Mar", count: 600 },
    { month: "Apr", count: 800 },
    { month: "May", count: 500 },
    { month: "Jun", count: 700 },
  ],
  departmentLoad: [
    { name: "Cardiology",  value: 80 },
    { name: "Neurology",   value: 65 },
    { name: "Pediatrics",  value: 45 },
    { name: "Oncology",    value: 90 },
  ],
};

app.get("/api/analytics", (_req, res) => res.json(mockAnalytics));

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  MediFlux BFF running on http://localhost:${PORT}`);
  console.log(`   GET  /health`);
  console.log(`   POST /auth/login   (email + password or Firebase idToken)`);
  console.log(`   POST /auth/refresh`);
  console.log(`   GET  /api/patients`);
  console.log(`   GET  /api/analytics\n`);
});
