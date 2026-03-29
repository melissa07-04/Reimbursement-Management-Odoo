import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

export const RegisterCompany = () => {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [currencies, setCurrencies] = useState<string[]>(['USD', 'EUR', 'INR']);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
        const currencySet = new Set<string>();
        res.data.forEach((country: any) => {
          if (country.currencies) {
            Object.keys(country.currencies).forEach(code => currencySet.add(code));
          }
        });
        const sortedCurrencies = Array.from(currencySet).sort();
        setCurrencies(sortedCurrencies);
      } catch (err) {
        console.error('Failed to fetch currencies', err);
      }
    };
    fetchCurrencies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create Firebase Auth User for Admin
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const firebaseUid = userCredential.user.uid;

      await axios.post('/api/auth/register-company', { 
        name, 
        domain, 
        defaultCurrency: currency,
        adminName,
        adminEmail,
        firebaseUid
      });
      navigate('/app/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.');
      } else {
        setError(err.response?.data?.error || err.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg relative">
        <Link to="/" className="absolute top-4 left-4 text-[#3A506B] hover:text-[#5BC0BE]">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-center mb-6 text-[#0B132B]">Register Company</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1C2541]">Company Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C2541]">Domain (e.g., acme.com)</label>
            <input type="text" required value={domain} onChange={e => setDomain(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C2541]">Default Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border">
              {currencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium text-[#0B132B] mb-2">Admin User Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C2541]">Admin Full Name</label>
                <input type="text" required value={adminName} onChange={e => setAdminName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C2541]">Admin Work Email</label>
                <input type="email" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C2541]">Admin Password</label>
                <input type="password" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-[#5BC0BE] text-[#0B132B] font-semibold py-2 px-4 rounded-md hover:bg-[#3A506B] hover:text-white transition-colors">Register Company & Admin</button>
        </form>
        <p className="mt-4 text-center text-sm text-[#1C2541]">
          Already registered? <Link to="/signup" className="text-[#5BC0BE] hover:underline">Sign up user</Link>
        </p>
      </div>
    </div>
  );
};
