import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../hooks/useAuth';
import { toast } from '@/components/ui/ToastProvider';


const loginSchema = z.object({
  email: z.string().min(1, 'Please enter email or username'),
  password: z.string().min(3, 'Password must be at least 3 characters'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    // defaultValues: {
    //   email: 'admin',
    //   password: 'Admin!@#',
    // },
  });

  const onSubmit = async (data: LoginSchema) => {

    try {
      await login(data.email, data.password);
      setError(null);
      toast.success('Welcome Back!', 'Authentication successful. Loading workspace...');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : 'Invalid email or password credentials';
      setError(msg);
      toast.error('Authentication Error', msg);
    }
  };


  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Username or Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            {...register('email')}
            type="text"
            placeholder="admin or admin@example.com"
            className="pl-9 text-xs"
          />
        </div>
        {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Password</label>
          {/* <a href="#forgot" className="text-[11px] text-slate-500 hover:text-slate-900 font-medium">
            Forgot password?
          </a> */}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="pl-9 text-xs"
          />
        </div>
        {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>}
      </div>

      {/* Persistent Error Alert at the Bottom */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-medium animate-in fade-in transition-all">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full h-10 text-xs font-semibold mt-2">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Authenticating...
          </>
        ) : (
          'Sign In to Dashboard'
        )}
      </Button>
    </form>
  );
}

