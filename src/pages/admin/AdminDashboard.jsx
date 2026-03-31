import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, ShieldAlert, Users, Clock, 
  BarChart3, Menu, X, ClipboardList, FileStack, LayoutDashboard 
} from 'lucide-react';
import UserManagement from '../../components/admin/UserManagement';
import AttendanceApprovals from '../../components/admin/AttendanceApprovals';
import AttendanceLogs from '../../components/admin/AttendanceLogs';
import PaperAnalytics from '../../components/admin/PaperAnalytics';
import PaperManagement from '../../components/admin/PaperManagement';
import OverviewDashboard from '../../components/admin/OverviewDashboard';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Paper Analytics', icon: BarChart3 },
    { id: 'paper-management', label: 'Paper Management', icon: FileStack },
    { id: 'all-attendance', label: 'All Attendance', icon: ClipboardList },
    { id: 'attendance', label: 'Pending Approvals', icon: Clock },
    { id: 'users', label: 'Staff Management', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md3-2">
        <div className="flex items-center gap-2 font-bold text-lg">
          <ShieldAlert className="text-primary-400" /> Admin Portal
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar for Desktop / Mobile Overlay */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col
              md:static md:translate-x-0 transition-transform
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
          >
            <div className="p-6 hidden md:flex items-center gap-3 border-b border-slate-800">
              <div className="bg-primary-600 p-2 rounded-md3-sm">
                <ShieldAlert size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg leading-tight">Admin System</h2>
                <p className="text-xs text-slate-400">Control Panel</p>
              </div>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md3-md font-medium transition-all ${
                      isActive 
                        ? 'bg-primary-600 text-white shadow-md3-1 translate-x-1' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500'} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-md3-md transition-colors"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full h-screen">
        <header className="mb-8 hidden md:block">
          <h1 className="text-3xl font-bold text-on-surface capitalize flex items-center gap-3">
            {activeTab.replace('-', ' ')}
            <span className="h-6 w-2 bg-primary-600 rounded-full inline-block"></span>
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Manage your institute's attendance and paper tracking.
          </p>
        </header>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="pb-24 md:pb-0"
        >
          {activeTab === 'overview' && <OverviewDashboard />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'attendance' && <AttendanceApprovals />}
          {activeTab === 'all-attendance' && <AttendanceLogs />}
          {activeTab === 'analytics' && <PaperAnalytics />}
          {activeTab === 'paper-management' && <PaperManagement />}
        </motion.div>
      </main>
    </div>
  );
}
