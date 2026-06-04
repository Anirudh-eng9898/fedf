import { useEffect, useState } from 'react';
import { goalsService } from '../services/services';
import { useNotifications } from '../context/NotificationContext';
import Skeleton from '../components/Skeleton';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ activityMinutes: 150, sleepHours: 8, hydrationMl: 2500, steps: 10000 });
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const { addToast } = useNotifications();

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalsService.getAll();
      const data = res.data.data;
      setGoals(data);
      if (data.length > 0) {
        const latest = data[0];
        setForm({ activityMinutes: latest.activityMinutes, sleepHours: latest.sleepHours, hydrationMl: latest.hydrationMl, steps: latest.steps });
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const validate = () => {
    const e = {};
    if (form.activityMinutes < 1 || form.activityMinutes > 1000) e.activityMinutes = '1-1000 minutes';
    if (form.sleepHours < 1 || form.sleepHours > 24) e.sleepHours = '1-24 hours';
    if (form.hydrationMl < 500 || form.hydrationMl > 10000) e.hydrationMl = '500-10000 ml';
    if (form.steps < 1000 || form.steps > 100000) e.steps = '1000-100000 steps';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (goals.length > 0) {
        await goalsService.update(goals[0].id, form);
        addToast('Goals updated!', 'success');
      } else {
        await goalsService.create(form);
        addToast('Goals set!', 'success');
      }
      setEditing(false);
      fetchGoals();
    } catch (err) { addToast('Failed to save goals', 'error'); }
  };

  const inputCls = (f) => `w-full px-4 py-3 bg-gray-800 border ${errors[f] ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`;

  if (loading) return <div className="space-y-6"><Skeleton type="card" count={4} /></div>;

  const goalItems = [
    { key: 'activityMinutes', label: 'Weekly Activity', unit: 'minutes/week', icon: '🏃', color: 'blue' },
    { key: 'sleepHours', label: 'Nightly Sleep', unit: 'hours/night', icon: '😴', color: 'purple' },
    { key: 'hydrationMl', label: 'Daily Water', unit: 'ml/day', icon: '💧', color: 'cyan' },
    { key: 'steps', label: 'Daily Steps', unit: 'steps/day', icon: '👟', color: 'emerald' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Goals</h1><p className="text-gray-400 text-sm">Set and track your wellness targets</p></div>
        <button onClick={() => setEditing(!editing)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors">
          {editing ? 'Cancel' : '✏️ Edit Goals'}
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goalItems.map(g => (
              <div key={g.key}>
                <label className="block text-sm font-medium text-gray-300 mb-2">{g.icon} {g.label} ({g.unit})</label>
                <input type="number" value={form[g.key]} onChange={e => setForm({ ...form, [g.key]: parseFloat(e.target.value) })} className={inputCls(g.key)} aria-label={g.label} />
                {errors[g.key] && <p className="mt-1 text-xs text-red-400">{errors[g.key]}</p>}
              </div>
            ))}
          </div>
          <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors">Save Goals</button>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goalItems.map(g => (
            <div key={g.key} className={`bg-${g.color}-500/10 border border-${g.color}-500/30 rounded-2xl p-6`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <p className="text-white font-semibold">{g.label}</p>
                  <p className="text-gray-400 text-xs">{g.unit}</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{form[g.key]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Goals;
