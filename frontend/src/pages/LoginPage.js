import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, formatApiError } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate('/clarity/app');
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0B7A6F] mb-1">
              CLARITY
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium mb-8">
              A Performance Solution by Design
            </p>
            <h2 className="text-xl font-medium text-slate-900 mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500">
              Sign in to access your coaching dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100" data-testid="login-error">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                data-testid="login-email"
                className="h-11 bg-white border-slate-200 focus:border-[#0F2B3C] focus:ring-[#0F2B3C]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                data-testid="login-password"
                className="h-11 bg-white border-slate-200 focus:border-[#0F2B3C] focus:ring-[#0F2B3C]/20"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="login-submit"
              className="w-full h-11 bg-[#0F2B3C] hover:bg-[#0A2233] text-white font-medium transition-colors"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-xs text-slate-400 text-center">
            Accounts are provisioned by your coaching administrator
          </p>
          <div className="mt-4 text-center">
            <a href="/" className="text-xs text-[#0B7A6F] hover:text-[#096B62] font-medium transition-colors">
              &larr; Back to psbydesign.com
            </a>
          </div>
        </div>
      </div>

      {/* Right - Brand panel */}
      <div className="hidden lg:flex flex-1 bg-[#0F2B3C] items-center justify-center p-12">
        <div className="max-w-md text-center">
          <img
            src="https://psbydesign.com/wp-content/uploads/2021/07/Logo-Transparent-1024x211.png"
            alt="PSD"
            className="h-10 w-auto mx-auto mb-8 brightness-200"
          />
          <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight">
            Your leadership journey, structured.
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            A 10-session executive coaching program designed to accelerate your growth
            with structured assessments, resources, and community support.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-semibold text-white">10</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">6</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Resources</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">1:1</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Coaching</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
