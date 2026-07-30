import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface DashboardResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  dashboardData: {
    welcomeMessage: string;
    sessionStatus: string;
    timestamp: string;
  };
}

export const Dashboard: React.FC = () => {
  const { user, accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardInfo, setDashboardInfo] = useState<DashboardResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch protected dashboard data using Bearer token in Authorization header
    const fetchDashboard = async () => {
      if (!accessToken) return;

      try {
        const response = await api.get<DashboardResponse>('/api/user/dashboard', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setDashboardInfo(response.data);
      } catch (err: unknown) {
        console.error('Error fetching dashboard:', err);
        setFetchError('Failed to load dashboard endpoint response');
      }
    };

    fetchDashboard();
  }, [accessToken]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="font-semibold text-slate-900 text-lg">MERN Auth App</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">
              Welcome, <strong className="text-slate-900">{user?.name}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Protected User Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">User ID</span>
              <p className="text-sm font-medium text-slate-900 mt-1 font-mono">{user?.id}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Name</span>
              <p className="text-sm font-medium text-slate-900 mt-1">{user?.name}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Email</span>
              <p className="text-sm font-medium text-slate-900 mt-1">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Protected API Verification</h2>
          {fetchError ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {fetchError}
            </div>
          ) : dashboardInfo ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                <strong className="font-semibold text-slate-900">Message:</strong> {dashboardInfo.message}
              </p>
              <p className="text-sm text-slate-700">
                <strong className="font-semibold text-slate-900">Session Status:</strong>{' '}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {dashboardInfo.dashboardData.sessionStatus}
                </span>
              </p>
              <p className="text-sm text-slate-700">
                <strong className="font-semibold text-slate-900">Welcome Text:</strong> {dashboardInfo.dashboardData.welcomeMessage}
              </p>
              <p className="text-xs text-slate-500 mt-2 font-mono">
                Fetched at: {dashboardInfo.dashboardData.timestamp}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Loading protected endpoint verification...</p>
          )}
        </div>
      </main>
    </div>
  );
};
