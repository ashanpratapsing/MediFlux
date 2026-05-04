import React, { useState } from 'react';
import { useAuthStore } from '@mediflux/auth';
import type { User, Role } from '@mediflux/types';
import type { AuthError } from 'firebase/auth';

import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';

const MOCK_USERS: Record<string, { uid: string; displayName: string; role: Role }> = {
  'admin@test.com':  { uid: 'admin-001',  displayName: 'Admin User',      role: 'admin' },
  'doctor@test.com': { uid: 'doctor-001', displayName: 'Dr. Sarah Chen',  role: 'doctor' },
  'staff@test.com':  { uid: 'staff-001',  displayName: 'Nurse Williams',  role: 'staff' },
};

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const trimmedEmail = email.toLowerCase().trim();

    try {
      // 1. Try Real Firebase Auth first
      const { loginWithEmail } = await import('@mediflux/firebase');
      const firebaseUser = await loginWithEmail(trimmedEmail, password);
      
      const user: User = {
        uid: firebaseUser.email || '',
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || trimmedEmail.split('@')[0],
        role: 'admin' as const, // Default role for firebase login in this demo
      };

      setUser(user);
      localStorage.setItem('mediflux_user', JSON.stringify(user));
      navigate('/');
      return;
    } catch (error: unknown) {
      const err = error as AuthError;
      console.warn("Firebase Auth failed, checking mock fallback...", err.code);
      
      // 2. Fallback to Mock if it's a test account
      if (trimmedEmail.endsWith('@test.com')) {
        const found = MOCK_USERS[trimmedEmail];
        if (found && password === '123456') {
          const user: User = { uid: found.uid, email: trimmedEmail, displayName: found.displayName, role: found.role };
          setUser(user);
          localStorage.setItem('mediflux_user', JSON.stringify(user));
          navigate('/');
          return;
        }
      }

      // 3. Final Error Handling
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid clinical credentials. Please check your email and password.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Connection error. Please check your internet connectivity.');
      } else {
        setError('Authentication failed. Use demo credentials below if you don\'t have a Firebase account.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { loginWithGoogle } = await import('@mediflux/firebase');
      const firebaseUser = await loginWithGoogle();
      
      // Try to sync with BFF if possible, but don't block login if it fails in this demo
      try {
        const { apiClient } = await import('@mediflux/api');
        const bffResponse = await apiClient.login(firebaseUser.idToken!);
        localStorage.setItem('accessToken', bffResponse.accessToken);
      } catch (bffErr) {
        console.warn("BFF synchronization skipped:", bffErr);
      }

      const user: User = {
        uid: firebaseUser.email || 'google-user',
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Healthcare Professional',
        role: 'admin' as const,
      };

      localStorage.setItem('mediflux_user', JSON.stringify(user));
      setUser(user);
      navigate('/');
    } catch (error: unknown) {
      const err = error as AuthError;
      console.error("Google Login Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please complete the Google popup to continue.');
      } else {
        setError('Google Sign-In is currently unavailable. Please use email/password.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #5e6ad2 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-[400px] relative">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8 gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#5e6ad2]" style={{ background: 'rgba(94,106,210,0.1)', boxShadow: '0 0 20px rgba(94,106,210,0.2)' }}>
            <Activity size={22} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">MediFlux</h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: '#141416', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.5)' }}>
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-1.5">Welcome back</h2>
            <p className="text-sm" style={{ color: '#8b8d98' }}>Sign in to your MediFlux account</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl text-xs text-left flex gap-2.5" style={{ background: 'rgba(226,88,88,0.08)', border: '1px solid rgba(226,88,88,0.2)', color: '#e25858' }}>
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 ml-0.5" style={{ color: '#8b8d98' }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@test.com"
                required
                className="w-full text-sm text-white rounded-xl px-4 py-2.5 outline-none transition-all"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(94,106,210,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 ml-0.5" style={{ color: '#8b8d98' }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-sm text-white rounded-xl px-4 py-2.5 pr-10 outline-none transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(94,106,210,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#8b8d98' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: isLoading ? 'rgba(94,106,210,0.5)' : '#5e6ad2',
                boxShadow: isLoading ? 'none' : '0 0 20px rgba(94,106,210,0.3)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 text-xs" style={{ background: '#141416', color: '#8b8d98' }}>or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-bold text-[#1F1F1F] transition-all hover:bg-gray-50 active:scale-[0.98]"
            style={{ 
              background: 'white', 
              cursor: isLoading ? 'not-allowed' : 'pointer', 
              opacity: isLoading ? 0.7 : 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.5 12.2c0-.8-.1-1.6-.2-2.4H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" fill="#4285F4"/>
              <path d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.7-4.9H1.4v3.1C3.4 21.5 7.4 24 12 24z" fill="#34A853"/>
              <path d="M5.3 14.4c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4V6.5H1.4C.5 8.1 0 10 0 12s.5 3.9 1.4 5.5l3.9-3.1z" fill="#FBBC05"/>
              <path d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.5 1.4 6.5l3.9 3.1c1-2.8 3.6-4.8 6.7-4.8z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

        </div>

        {/* Quick credentials hint */}
        <div className="mt-5 p-4 rounded-xl text-center text-xs space-y-1.5" style={{ background: 'rgba(94,106,210,0.06)', border: '1px solid rgba(94,106,210,0.12)' }}>
          <p className="font-semibold" style={{ color: '#5e6ad2' }}>Demo Credentials</p>
          <p style={{ color: '#8b8d98' }}>admin@test.com · doctor@test.com · staff@test.com</p>
          <p style={{ color: '#8b8d98' }}>Password: <span className="text-white font-mono">123456</span></p>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: '#8b8d98' }}>
          MediFlux Healthcare SaaS • v1.0.0
        </p>
      </div>
    </div>
  );
};
