import React from 'react';
import { Link } from 'react-router-dom';
import { User, DollarSign, Building } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-[#0B132B] mb-8">ReimbursePro</h1>
      <p className="text-[#1C2541] mb-8 text-center max-w-md">
        Welcome to the Enterprise Reimbursement System. Please select your role to continue.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link to="/register-company" className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-[#5BC0BE]">
          <Building size={48} className="text-[#5BC0BE] mb-4" />
          <h2 className="text-2xl font-semibold text-[#0B132B]">Admin</h2>
          <p className="text-[#1C2541] text-center mt-2">Register a new company and set up your workspace.</p>
        </Link>
        
        <Link to="/signup" className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-[#3A506B]">
          <User size={48} className="text-[#3A506B] mb-4" />
          <h2 className="text-2xl font-semibold text-[#0B132B]">User</h2>
          <p className="text-[#1C2541] text-center mt-2">Submit expenses, track approvals, or log in to your account.</p>
        </Link>
        
        <Link to="/public-finance" className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-[#1C2541]">
          <DollarSign size={48} className="text-[#1C2541] mb-4" />
          <h2 className="text-2xl font-semibold text-[#0B132B]">Finance Team</h2>
          <p className="text-[#1C2541] text-center mt-2">Review and approve requests instantly (No login required).</p>
        </Link>
      </div>
    </div>
  );
};
