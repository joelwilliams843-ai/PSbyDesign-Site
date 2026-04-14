import { useState } from 'react';
import { api } from '../contexts/AuthContext';
import { useAuth, formatApiError } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { AlertCircle, Check, Loader2, Lock, ShieldCheck } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ChangePasswordPage({ forced = false, onComplete }) {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post(`${API}/auth/change-password`, {
        current_password: currentPassword,
        new_password: newPassword
      });
      setSuccess(true);
      if (onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${forced ? 'min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6' : 'p-6 md:p-8 max-w-lg mx-auto'}`}>
      <Card className="border border-slate-200 shadow-sm w-full max-w-md" data-testid="change-password-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center">
              {forced ? <ShieldCheck size={20} className="text-[#1E3A5F]" /> : <Lock size={20} className="text-[#1E3A5F]" />}
            </div>
            <div>
              <CardTitle className="text-lg">
                {forced ? 'Set Your Password' : 'Change Password'}
              </CardTitle>
              <CardDescription>
                {forced
                  ? 'For security, please set a new password before continuing.'
                  : 'Update your account password'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center py-6 gap-3" data-testid="password-changed-success">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check size={24} className="text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">Password updated successfully</p>
              {forced && <p className="text-xs text-slate-400">Redirecting to dashboard...</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100" data-testid="password-error">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="current" className="text-sm font-medium text-slate-700">
                  {forced ? 'Temporary Password' : 'Current Password'}
                </Label>
                <Input
                  id="current"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder={forced ? 'Enter the password provided to you' : 'Enter current password'}
                  required
                  data-testid="current-password-input"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new" className="text-sm font-medium text-slate-700">New Password</Label>
                <Input
                  id="new"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  data-testid="new-password-input"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-sm font-medium text-slate-700">Confirm New Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  data-testid="confirm-password-input"
                  className="h-10"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                data-testid="change-password-submit"
                className="w-full h-10 bg-[#1E3A5F] hover:bg-[#152D4A]"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : (forced ? 'Set Password & Continue' : 'Update Password')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
