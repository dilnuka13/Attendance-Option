import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import AutoAttendance from '../../components/user/AutoAttendance';
import ManualAttendance from '../../components/user/ManualAttendance';
import PaperTracking from '../../components/user/PaperTracking';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionUser = localStorage.getItem('user');
    if (!sessionUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(sessionUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface pb-12">
      {/* App Bar */}
      <header className="bg-primary-600 text-white shadow-md3-2 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <UserIcon size={20} />
            </div>
            <div>
              <h1 className="font-bold leading-tight">{user.name}</h1>
              <p className="text-xs text-primary-100">{user.index_number} • {user.branch_name}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <span className="hidden sm:inline">Logout</span>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        <AutoAttendance user={user} />
        <ManualAttendance user={user} />
        <PaperTracking user={user} />
      </main>
    </div>
  );
}
