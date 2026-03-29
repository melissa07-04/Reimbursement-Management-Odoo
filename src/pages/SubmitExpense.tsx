import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const SubmitExpense = () => {
  const { dbUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [receiptFile, setReceiptFile] = useState('');
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
        
        if (dbUser?.companyId?.defaultCurrency && sortedCurrencies.includes(dbUser.companyId.defaultCurrency)) {
          setCurrency(dbUser.companyId.defaultCurrency);
        }
      } catch (err) {
        console.error('Failed to fetch currencies', err);
      }
    };
    fetchCurrencies();
  }, [dbUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser?.getIdToken();
      
      const baseCurrency = dbUser?.companyId?.defaultCurrency || 'USD';
      
      let convertedAmount = parseFloat(amount);
      if (currency !== baseCurrency) {
        const rateRes = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`);
        const rate = rateRes.data.rates[baseCurrency];
        if (!rate) throw new Error(`Exchange rate not found for ${baseCurrency}`);
        convertedAmount = parseFloat(amount) * rate;
      }

      await axios.post('/api/expenses', {
        amount: parseFloat(amount),
        currency,
        convertedAmount,
        description,
        date,
        receiptFile
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to submit expense');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow border border-[#3A506B]">
      <h2 className="text-2xl font-bold mb-6 text-[#0B132B]">Submit New Expense</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1C2541]">Amount</label>
            <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C2541]">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border">
              {currencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1C2541]">Date</label>
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1C2541]">Description</label>
          <textarea required value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A506B] focus:ring-[#3A506B] p-2 border" rows={3}></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1C2541]">Receipt (Image/PDF)</label>
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="mt-1 block w-full text-sm text-[#1C2541] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-[#0B132B] hover:file:bg-[#3A506B] hover:file:text-white transition-colors" />
        </div>
        <button type="submit" className="w-full bg-[#5BC0BE] text-[#0B132B] font-semibold py-2 px-4 rounded-md hover:bg-[#3A506B] hover:text-white transition-colors">Submit Expense</button>
      </form>
    </div>
  );
};
