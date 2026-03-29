import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { StatusStepper } from '../components/StatusStepper';

export const Dashboard = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const { dbUser } = useAuth();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await axios.get('/api/expenses?type=my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExpenses(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchExpenses();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-[#0B132B]">My Expenses</h2>
      <div className="space-y-4">
        {expenses.map(exp => (
          <div key={exp._id} className="bg-white p-6 rounded-lg shadow-md border border-[#3A506B]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-[#0B132B]">{exp.description}</h3>
                <p className="text-[#1C2541] text-sm">{new Date(exp.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#5BC0BE]">{exp.amount} {exp.currency}</p>
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
  );
};
