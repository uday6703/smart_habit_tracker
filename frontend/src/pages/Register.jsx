import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await register(username, email, password);
    setLoading(false);

    if (result.success) {
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-3xl border border-[#334155] shadow-2xl p-8 relative z-10">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-3 rounded-2xl text-white shadow-xl shadow-indigo-500/10 mb-4">
            <Activity size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Build consistency and unlock smart suggestions</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {success && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Pick a unique username"
              className="w-full bg-slate-900 border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-900 border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full bg-slate-900 border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50 glow-btn"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center border-t border-[#334155]/50 pt-5 text-xs text-slate-400">
          <span>Already have an account? </span>
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
