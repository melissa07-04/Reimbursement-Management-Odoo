import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';

export const Approvals = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const { dbUser } = useAuth();

  const fetchExpenses = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.get('/api/expenses?type=approvals', {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = await auth.currentUser?.getIdToken();
      await axios.post(`/api/expenses/${id}/review`, { status, comment: '' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExpenses(); // Refresh list
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-[#0B132B]">Pending Approvals</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden border border-[#3A506B]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#0B132B]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map(exp => (
              <tr key={exp._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0B132B]">{exp.userId?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1C2541]">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1C2541]">{exp.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#5BC0BE]">{exp.amount} {exp.currency}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => handleReview(exp._id, 'Approved')} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded transition-colors">Approve</button>
                  <button onClick={() => handleReview(exp._id, 'Rejected')} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded transition-colors">Reject</button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-[#1C2541]">No pending approvals.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
