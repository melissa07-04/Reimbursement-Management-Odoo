import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { StatusStepper } from '../components/StatusStepper';

export const PublicFinance = () => {
  const [expenses, setExpenses] = useState<any[]>([]);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/api/public-expenses');
      setExpenses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleReview = async (id: string, status: string) => {
    try {
      await axios.post(`/api/public-expenses/${id}/review`, { status });
      fetchExpenses();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/" className="text-[#3A506B] hover:text-[#5BC0BE]">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-[#0B132B]">Finance Team - Public Dashboard</h1>
        </div>
        <div className="space-y-4">
          {expenses.map(exp => (
            <div key={exp._id} className="bg-white p-6 rounded-lg shadow-md border border-[#3A506B]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-[#0B132B]">{exp.description}</h3>
                  <p className="text-[#1C2541]">Submitted by: {exp.userId?.name} ({exp.userId?.email})</p>
                  <p className="text-lg font-bold text-[#5BC0BE] mt-2">{exp.amount} {exp.currency}</p>
                </div>
                <div className="flex space-x-2">
                  {exp.status !== 'Approved' && exp.status !== 'Rejected' && (
                    <>
                      <button onClick={() => handleReview(exp._id, 'Approved')} className="bg-[#5BC0BE] text-[#0B132B] font-semibold px-4 py-2 rounded hover:bg-[#3A506B] hover:text-white transition-colors">Approve</button>
                      <button onClick={() => handleReview(exp._id, 'Rejected')} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">Reject</button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <StatusStepper expense={exp} />
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <p className="text-[#1C2541] text-center py-8">No expenses found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
