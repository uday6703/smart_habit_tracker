import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
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
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Log in to track your habits and check smart tips</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50 glow-btn"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center border-t border-[#334155]/50 pt-5 text-xs text-slate-400">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold">
            Create Account
          </Link>
          <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-[#334155]/30">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Demo Credentials</p>
            <p className="text-[11px] text-slate-400">User: <strong className="text-slate-200">demo</strong> | Pass: <strong className="text-slate-200">password123</strong></p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
