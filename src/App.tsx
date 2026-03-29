import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { RegisterCompany } from './pages/RegisterCompany';
import { Dashboard } from './pages/Dashboard';
import { SubmitExpense } from './pages/SubmitExpense';
import { Approvals } from './pages/Approvals';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { PublicFinance } from './pages/PublicFinance';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, dbUser, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!currentUser || !dbUser) return <Navigate to="/login" />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/register-company" element={<RegisterCompany />} />
      <Route path="/public-finance" element={<PublicFinance />} />
      
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="expenses/new" element={<SubmitExpense />} />
        <Route path="approvals" element={<Approvals />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
