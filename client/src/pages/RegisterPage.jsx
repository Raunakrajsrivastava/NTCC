import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth.js';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    if (globalError) setGlobalError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setGlobalError('');

    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setGlobalError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your Account</CardTitle>
          <CardDescription>Join ArchAdvisor to generate production-ready architectures</CardDescription>
        </CardHeader>

        <CardContent>
          {globalError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300 font-medium">{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="Alex Johnson"
              icon={User}
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              error={errors.name}
              id="register-name"
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="alex@company.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              error={errors.email}
              id="register-email"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              error={errors.password}
              id="register-password"
            />

            <Button
              type="submit"
              variant="primary"
              icon={UserPlus}
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
              id="register-submit"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#35D0BA] hover:text-[#36BFC7] font-medium">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
