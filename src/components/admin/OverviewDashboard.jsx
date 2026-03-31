import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, UserCheck, Clock, FileStack, TrendingUp 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

export default function OverviewDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    attendanceToday: 0,
    pendingApprovals: 0,
    papersThisMonth: 0
  });
  
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [paperStats, setPaperStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      const monthStartStr = firstDayOfMonth.toISOString().split('T')[0];

      // 1. Total Users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // 2. Attendance Today
      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'approved');

      // 3. Pending Approvals
      const { count: pendingCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // 4. Papers Distributed This Month
      const { data: papersData } = await supabase
        .from('papers_taken')
        .select('quantity, paper_model')
        .gte('date', monthStartStr);
        
      const papersSum = papersData?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;

      // Calculate Chart Data (Last 7 Days)
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        return format(d, 'yyyy-MM-dd');
      });

      const { data: trendData } = await supabase
        .from('attendance')
        .select('date')
        .in('date', last7Days)
        .eq('status', 'approved');

      const trendMap = {};
      last7Days.forEach(day => trendMap[day] = 0);
      trendData?.forEach(row => {
        if(trendMap[row.date] !== undefined) trendMap[row.date]++;
      });

      const formattedTrend = Object.keys(trendMap).map(date => ({
        day: format(parseISO(date), 'EEE'), // e.g., Mon, Tue
        FullDate: date,
        Count: trendMap[date]
      }));

      // Calculate Paper distribution for a Pie/Bar Chart
      const paperMap = {};
      papersData?.forEach(row => {
        paperMap[row.paper_model] = (paperMap[row.paper_model] || 0) + row.quantity;
      });
      const formattedPapers = Object.keys(paperMap).map(model => ({
        name: model,
        Quantity: paperMap[model]
      })).sort((a,b) => b.Quantity - a.Quantity);

      setStats({
        totalUsers: userCount || 0,
        attendanceToday: attendanceCount || 0,
        pendingApprovals: pendingCount || 0,
        papersThisMonth: papersSum
      });
      
      setAttendanceTrend(formattedTrend);
      setPaperStats(formattedPapers);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Cards */}
        <div className="card p-6 border-b-4 border-b-blue-500 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-on-surface-variant font-medium text-sm text-blue-900/60 uppercase tracking-wide">Total Staff</p>
              <h3 className="text-3xl font-bold text-blue-950">{stats.totalUsers}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-md3-lg">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 border-b-4 border-b-emerald-500 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-on-surface-variant font-medium text-sm text-emerald-900/60 uppercase tracking-wide">Today's Active</p>
              <h3 className="text-3xl font-bold text-emerald-950">{stats.attendanceToday}</h3>
            </div>
            <div className="p-3 bg-emerald-100 rounded-md3-lg">
              <UserCheck size={24} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 border-b-4 border-b-amber-500 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-on-surface-variant font-medium text-sm text-amber-900/60 uppercase tracking-wide">Pending Req</p>
              <h3 className="text-3xl font-bold text-amber-950">{stats.pendingApprovals}</h3>
            </div>
            <div className="p-3 bg-amber-100 rounded-md3-lg">
              <Clock size={24} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 border-b-4 border-b-purple-500 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-on-surface-variant font-medium text-sm text-purple-900/60 uppercase tracking-wide">Papers Distributed</p>
              <h3 className="text-3xl font-bold text-purple-950">{stats.papersThisMonth}</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-md3-lg">
              <FileStack size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Line Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-primary-600" />
            Staff Attendance Trend (7 Days)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#487cb7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#487cb7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e2ec" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#44474e', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#44474e', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  cursor={{stroke: '#487cb7', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="Count" stroke="#487cb7" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Paper Distribution Bar Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <FileStack size={20} className="text-purple-600" />
            Monthly Paper Distribution
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paperStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e2ec" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#44474e', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#44474e', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f0f5fa'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="Quantity" fill="#8884d8" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
