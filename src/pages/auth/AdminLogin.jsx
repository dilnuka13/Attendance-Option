import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter all credentials');
      return;
    }

    setIsLoading(true);
    // Simple mock admin check since no admin table is explicitly specified 
    // Usually you'd use Supabase auth for this, but for this exercise we map to a simple hardcoded or users table check
    // Let's assume a hardcoded admin for simplicity, or check `role === 'admin'` in users.
    
    // We'll mimic an admin auth check:
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('admin_token', 'true');
        toast.success('Admin Authenticated');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid Admin Credentials');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Dark mode liquid glass background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="glass-dark p-8 rounded-md3-xl flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-800 text-white rounded-md3-md flex items-center justify-center mb-6 shadow-md3-2 border border-slate-700">
            <ShieldCheck size={32} />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Admin Secure Portal</h1>
          <p className="text-slate-400 mb-8 text-center text-sm">
            Please enter your administrative credentials to access the analytics dashboard.
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md3-md border border-slate-700 px-4 py-3 bg-slate-800/80 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder-slate-500"
                placeholder="Username"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md3-md border border-slate-700 px-4 py-3 bg-slate-800/80 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder-slate-500"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-slate-900 rounded-md3-full px-6 py-3 font-semibold hover:bg-slate-100 hover:shadow-md3-2 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 mt-4"
            >
              {isLoading ? 'Authenticating...' : 'Secure Login'}
              {!isLoading && <Lock size={18} />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
