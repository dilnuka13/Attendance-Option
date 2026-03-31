import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CalendarDays, MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendanceLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Default: Last 7 days to today
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 7);

    const fmt = (d) => {
      const offset = d.getTimezoneOffset();
      return new Date(d.getTime() - (offset*60*1000)).toISOString().split('T')[0];
    };
    
    setStartDate(fmt(start));
    setEndDate(fmt(end));
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchLogs();
    }
  }, [startDate, endDate]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          users (
            name,
            index_number,
            branch_name
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      toast.error('Failed to fetch attendance logs');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card flex flex-col h-[calc(100vh-180px)] border-t-4 border-t-teal-500 overflow-hidden">
      {/* Header & Filters */}
      <div className="p-5 border-b border-on-surface-variant/10 flex flex-col md:flex-row items-center justify-between bg-surface-variant/30 gap-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <CalendarDays size={20} className="text-teal-600" />
          Full Attendance Logs
        </h3>
        
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-teal-700 uppercase mb-1">From</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="input-field py-1.5 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-teal-700 uppercase mb-1">To</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="input-field py-1.5 text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-surface sticky top-0 shadow-sm z-10">
            <tr className="text-on-surface-variant font-medium">
              <th className="p-4">Staff Member</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Method & Status</th>
              <th className="p-4">Location / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-on-surface-variant/5">
            {isLoading ? (
              <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">Fetching logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No attendance records found for this period.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-teal-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-teal-900">{log.users?.name || 'Unknown'}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">
                      {log.users?.index_number} • {log.users?.branch_name}
                    </div>
                  </td>
                  
                  <td className="p-4 whitespace-nowrap">
                    <div className="font-medium text-on-surface">{log.date}</div>
                    <div className="font-bold text-teal-700">{log.time}</div>
                  </td>

                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md3-sm mb-1 uppercase tracking-wide
                      ${log.type === 'auto' ? 'bg-primary-100 text-primary-800' : 'bg-amber-100 text-amber-800'}`}>
                      {log.type}
                    </span>
                    <br/>
                    <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-md3-sm uppercase tracking-wide
                      ${log.status === 'approved' ? 'text-green-600 bg-green-50' : 
                        log.status === 'pending' ? 'text-amber-600 bg-amber-50' : 
                        'text-red-600 bg-red-50'}`}>
                      {log.status}
                    </span>
                  </td>

                  <td className="p-4">
                    {log.type === 'auto' ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-xs font-medium text-teal-700">
                          <MapPin size={14} /> Lat: {log.lat?.toFixed(6)}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-teal-700">
                          <MapPin size={14} className="opacity-0"/> Lng: {log.lng?.toFixed(6)}
                        </div>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${log.lat},${log.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                        >
                          View on Maps
                        </a>
                      </div>
                    ) : (
                      <div className="text-xs text-on-surface-variant italic max-w-xs break-words">
                        "{log.reason_if_manual}"
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
