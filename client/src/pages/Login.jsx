import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { validateEmail, validatePassword, validateRequired } from '../utils/helpers';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!validateRequired(form.email)) errs.email = 'Email is required';
    else if (!validateEmail(form.email)) errs.email = 'Invalid email format';
    if (!validateRequired(form.password)) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      addToast('Login successful! Welcome back.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setErrors({ general: msg });
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-2xl font-bold text-gray-900 mx-auto mb-4">W</div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your wellness dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-xl">
          {errors.general && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{errors.general}</div>}

          <div className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input id="login-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
                placeholder="student@university.edu" aria-label="Email address" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input id="login-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
                placeholder="••••••••" aria-label="Password" />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Sign in">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account? <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
