import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { validateEmail, validatePassword, validateRequired } from '../utils/helpers';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!validateRequired(form.name)) errs.name = 'Name is required';
    if (!validateRequired(form.email)) errs.email = 'Email is required';
    else if (!validateEmail(form.email)) errs.email = 'Invalid email format';
    if (!validateRequired(form.password)) errs.password = 'Password is required';
    else if (!validatePassword(form.password)) errs.password = 'Password must be at least 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      addToast('Registration successful! Welcome aboard.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setErrors({ general: msg });
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-2xl font-bold text-gray-900 mx-auto mb-4">W</div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Start tracking your wellness journey</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-xl">
          {errors.general && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{errors.general}</div>}

          <div className="space-y-5">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input id="reg-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
                placeholder="John Doe" aria-label="Full name" />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input id="reg-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
                placeholder="student@university.edu" aria-label="Email address" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input id="reg-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
                placeholder="Min 8 characters" aria-label="Password" />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="reg-role" className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <select id="reg-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" aria-label="Role">
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
            aria-label="Create account">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account? <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
