import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { ArrowLeft } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/app/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.');
      } else {
        setError(err.response?.data?.error || err.message || 'Login failed');
      }
    }
  };

  const handleForgot = async () => {
    if (!email) return setError('Please enter your email first');
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg('Password reset email sent!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDemoLogin = async (email: string) => {
    setEmail(email);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg relative">
        <Link to="/" className="absolute top-4 left-4 text-[#3A506B] hover:text-[#5BC0BE]">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-center mb-6 text-[#0B132B]">Login</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {msg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{msg}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1C2541]">Work Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C2541]">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={handleForgot} className="text-sm text-[#5BC0BE] hover:underline">Forgot Password?</button>
          </div>
          <button type="submit" className="w-full bg-[#5BC0BE] text-[#0B132B] font-semibold py-2 px-4 rounded-md hover:bg-[#3A506B] hover:text-white transition-colors">Log In</button>
        </form>
        
        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-[#1C2541] mb-2 text-center">Demo Accounts (Password: password123):</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <button onClick={() => handleDemoLogin('admin@acme.com')} className="bg-gray-100 text-[#0B132B] px-2 py-1 rounded hover:bg-[#3A506B] hover:text-white transition-colors">Admin</button>
            <button onClick={() => handleDemoLogin('director1@acme.com')} className="bg-gray-100 text-[#0B132B] px-2 py-1 rounded hover:bg-[#3A506B] hover:text-white transition-colors">Director</button>
            <button onClick={() => handleDemoLogin('manager1@acme.com')} className="bg-gray-100 text-[#0B132B] px-2 py-1 rounded hover:bg-[#3A506B] hover:text-white transition-colors">Manager</button>
            <button onClick={() => handleDemoLogin('employee1@acme.com')} className="bg-gray-100 text-[#0B132B] px-2 py-1 rounded hover:bg-[#3A506B] hover:text-white transition-colors">Employee</button>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-[#1C2541]">
          Don't have an account? <Link to="/signup" className="text-[#5BC0BE] hover:underline">Sign up</Link>
        </p>
        <p className="mt-2 text-center text-sm text-[#1C2541]">
          Company not registered? <Link to="/register-company" className="text-[#5BC0BE] hover:underline">Register Company</Link>
        </p>
      </div>
    </div>
  );
};
