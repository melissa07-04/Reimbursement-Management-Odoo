import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { LogOut, Home, FileText, CheckSquare } from 'lucide-react';

export const Layout = () => {
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0B132B] text-white shadow-md flex flex-col">
        <div className="p-6 border-b border-[#1C2541]">
          <h1 className="text-xl font-bold text-white">ReimbursePro</h1>
          <p className="text-sm text-[#5BC0BE] mt-1">{dbUser?.companyId?.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/app/dashboard" className="flex items-center space-x-2 p-2 rounded hover:bg-[#1C2541] text-white transition-colors">
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/app/expenses/new" className="flex items-center space-x-2 p-2 rounded hover:bg-[#1C2541] text-white transition-colors">
            <FileText size={20} />
            <span>Submit Expense</span>
          </Link>
          {(dbUser?.roles.includes('Manager') || dbUser?.roles.includes('Finance') || dbUser?.roles.includes('Director')) && (
            <Link to="/app/approvals" className="flex items-center space-x-2 p-2 rounded hover:bg-[#1C2541] text-white transition-colors">
              <CheckSquare size={20} />
              <span>Approvals</span>
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-[#1C2541]">
          <div className="mb-4">
            <p className="text-sm font-medium text-white">{dbUser?.name}</p>
            <p className="text-xs text-[#5BC0BE]">{dbUser?.roles?.join(', ')}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-[#5BC0BE] hover:text-white w-full transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
