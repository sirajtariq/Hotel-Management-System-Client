import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xs p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-10 w-10 rounded-lg bg-indigo-900 flex items-center justify-center text-white mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hotel & Serviced Apartments Portal</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-Tenant Hotel Operations & Management System</p>

        </div>

        <LoginForm />

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Enterprise Security Enabled • PKR Currency Standard
        </div>
      </div>
    </div>
  );
}
