import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, User, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter your NIC or Index Number');
      return;
    }

    setIsLoading(true);
    try {
      // Check if it's NIC or Index Number
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`nic.eq.${identifier},index_number.eq.${identifier}`)
        .single();

      if (error || !data) {
        toast.error('Invalid Credentials. Please check and try again.');
        setIsLoading(false);
        return;
      }

      // If valid, save session pseudo-state to localStorage
      // Real auth would use Supabase auth, but prompt asks for login using index/nic
      localStorage.setItem('user', JSON.stringify(data));
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/dashboard');

    } catch (err) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-variant p-4 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 rounded-md3-xl flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-6 shadow-md3-1">
            <User size={32} />
          </div>
          
          <h1 className="text-2xl font-bold text-on-surface mb-2">Staff Portal</h1>
          <p className="text-on-surface-variant mb-8 text-center">
            Sign in using your NIC or Index Number to mark attendance or track papers.
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                NIC / Index Number
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 260001 or 982342123V"
                className="input-field"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? 'Verifying...' : 'Sign In'}
              {!isLoading && <LogIn size={18} />}
            </button>
          </form>

          <div className="mt-8 text-sm text-on-surface-variant/70 text-center flex flex-col items-center gap-3">
            <span>Attendance and Paper Tracking System</span>
            <Link to="/admin/login" className="flex items-center gap-1.5 text-primary-600 hover:text-primary-800 transition-colors font-medium bg-primary-50 px-3 py-1.5 rounded-md3-full">
              <ShieldAlert size={14} /> Admin Portal Access
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
