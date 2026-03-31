import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function ManualAttendance({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!time || !reason) {
      toast.error('Please fill in both time and reason.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const { error } = await supabase.from('attendance').insert({
        user_id: user.id,
        date: dateStr,
        time: time,
        type: 'manual',
        status: 'pending',
        reason_if_manual: reason,
      });

      if (error) throw error;

      toast.success('Manual attendance request submitted (Pending Approval)');
      setTime('');
      setReason('');
      setIsOpen(false);
    } catch (err) {
      toast.error('Failed to submit request.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-6 mt-6 border-l-4 border-l-amber-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <AlertCircle className="text-amber-500" /> Location Error?
        </h2>
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={isOpen}
              onChange={() => setIsOpen(!isOpen)}
            />
            <div className={`block w-14 h-8 rounded-full transition-colors ${isOpen ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isOpen ? 'transform translate-x-6' : ''}`}></div>
          </div>
        </label>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <p className="text-sm text-on-surface-variant">
                If the auto-attendance failed, submit a manual request. This requires admin approval.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Time of Arrival</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason for Manual Entry</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. GPS Error, Phone dead"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary bg-amber-600 hover:bg-amber-700 focus:ring-amber-600 flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Request Approval'}
                  {!isSubmitting && <Send size={16} />}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
