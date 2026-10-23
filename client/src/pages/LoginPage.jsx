import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to original destination after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Architecture Advisor account</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2.5 mb-4">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300 font-medium">{error}</p>
            </div>
          )}

          {/* Quick Demo Credentials Autofill Banner */}
          <div className="p-3 bg-[#35D0BA]/10 border border-[#35D0BA]/20 rounded-xl flex items-center justify-between text-xs mb-4">
            <div>
              <p className="text-[#35D0BA] font-semibold text-[11px] uppercase tracking-wider">Demo Credentials</p>
              <p className="text-slate-300 font-mono text-[11px] mt-0.5">ravi@example.com · password123</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ email: 'ravi@example.com', password: 'password123' })}
              className="px-2.5 py-1 bg-[#35D0BA]/20 hover:bg-[#35D0BA]/30 text-[#35D0BA] rounded-lg text-xs font-medium transition-colors"
            >
              Auto Fill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="developer@company.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              id="login-email"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              id="login-password"
            />

            <Button
              type="submit"
              variant="primary"
              icon={LogIn}
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
              id="login-submit"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#35D0BA] hover:text-[#36BFC7] font-medium">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
