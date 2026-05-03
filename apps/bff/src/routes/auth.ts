import express from "express";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";

const router = express.Router();

// Mock secret keys for demonstration - In production, use environment variables
const ACCESS_SECRET = process.env.ACCESS_SECRET || "ACCESS_SECRET_KEY_FAANG";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "REFRESH_SECRET_KEY_FAANG";

router.post("/login", async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify Firebase token
    // Note: This requires admin to be initialized correctly in index.ts
    const decoded = await admin.auth().verifyIdToken(idToken);

    const user = {
      uid: decoded.uid,
      email: decoded.email,
    };

    // Create custom JWT
    const accessToken = jwt.sign(user, ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(user, REFRESH_SECRET, { expiresIn: "7d" });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({ accessToken });
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

router.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as any;
    
    const user = {
      uid: decoded.uid,
      email: decoded.email,
    };

    const newAccessToken = jwt.sign(user, ACCESS_SECRET, {
      expiresIn: "15m",
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.sendStatus(403);
  }
});

export default router;
