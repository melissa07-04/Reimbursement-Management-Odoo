import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUid = userCredential.user.uid;
      
      // Determine role based on email or just default to Employee
      let roles = ['Employee'];
      if (email.includes('director')) roles = ['Director', 'Employee'];
      if (email.includes('manager')) roles = ['Manager', 'Employee'];
      if (email.includes('finance')) roles = ['Finance', 'Employee'];

      // Create in DB
      await axios.post('/api/auth/signup', {
        firebaseUid,
        name,
        email,
        roles,
        managerId: null // Removed manager selection from UI
      });
      
      navigate('/app/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.');
      } else {
        setError(err.response?.data?.error || err.message || 'Signup failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg relative">
        <Link to="/" className="absolute top-4 left-4 text-[#3A506B] hover:text-[#5BC0BE]">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-center mb-6 text-[#0B132B]">User Signup</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1C2541]">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C2541]">Work Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C2541]">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" />
          </div>
          <button type="submit" className="w-full bg-[#5BC0BE] text-[#0B132B] font-semibold py-2 px-4 rounded-md hover:bg-[#3A506B] hover:text-white transition-colors">Sign Up</button>
        </form>
        <p className="mt-4 text-center text-sm text-[#1C2541]">
          Already have an account? <Link to="/login" className="text-[#5BC0BE] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};
