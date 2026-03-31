import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendanceApprovals() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
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
        .eq('type', 'manual')
        .eq('status', 'pending')
        .order('date', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      toast.error('Failed to load pending requests');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Request ${status} successfully`);
      setRequests(requests.filter(req => req.id !== id));
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-5 border-b border-on-surface-variant/10 flex items-center justify-between bg-surface-variant/30">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Clock size={20} className="text-amber-500" />
          Pending Manual Attendance
        </h3>
        <span className="text-sm font-medium px-3 py-1 bg-amber-100 text-amber-800 rounded-md3-full">
          {requests.length} Requests
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-variant/50 text-sm text-on-surface-variant">
              <th className="p-4 font-medium">Staff Member</th>
              <th className="p-4 font-medium">Branch</th>
              <th className="p-4 font-medium">Date & Time</th>
              <th className="p-4 font-medium">Reason Provided</th>
              <th className="p-4 font-medium text-right bg-white sticky right-0 shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-on-surface-variant/5">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-on-surface-variant">Loading requests...</td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                  <CheckCircle size={40} className="text-green-300 mb-3" />
                  <p>All caught up! No pending requests.</p>
                </td>
              </tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} className="hover:bg-surface-variant/20 transition-colors">
                  <td className="p-4">
                    <div className="font-bold">{req.users?.name}</div>
                    <div className="text-xs text-on-surface-variant">{req.users?.index_number}</div>
                  </td>
                  <td className="p-4 text-sm">{req.users?.branch_name}</td>
                  <td className="p-4">
                    <div className="font-medium">{req.date}</div>
                    <div className="text-sm text-amber-600 font-bold">{req.time}</div>
                  </td>
                  <td className="p-4 text-sm max-w-xs truncate" title={req.reason_if_manual}>
                    {req.reason_if_manual}
                  </td>
                  <td className="p-4 text-right bg-white/50 sticky right-0 flex justify-end gap-2">
                    <button 
                      onClick={() => handleAction(req.id, 'approved')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md3-sm text-sm font-medium transition-colors border border-green-200"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md3-sm text-sm font-medium transition-colors border border-red-200"
                    >
                      <XCircle size={14} /> Reject
                    </button>
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
