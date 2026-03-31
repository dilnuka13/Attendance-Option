import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function AutoAttendance({ user }) {
  const [isMarking, setIsMarking] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const markAttendance = async () => {
    setIsMarking(true);

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsMarking(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const now = new Date();
          const dateStr = now.toISOString().split('T')[0];
          const timeStr = now.toTimeString().split(' ')[0];

          // Insert into Supabase
          const { error } = await supabase.from('attendance').insert({
            user_id: user.id,
            date: dateStr,
            time: timeStr,
            lat: latitude,
            lng: longitude,
            type: 'auto',
            status: 'approved',
          });

          if (error) throw error;

          setSuccessData({ time: timeStr, lat: latitude, lng: longitude });
          toast.success('Attendance Marked Successfully');
        } catch (err) {
          toast.error('Failed to log attendance. Try again.');
          console.error(err);
        } finally {
          setIsMarking(false);
        }
      },
      (error) => {
        toast.error('Location access denied or unavailable.');
        setIsMarking(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 border-l-4 border-l-primary-500"
    >
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MapPin className="text-primary-600" /> Auto Attendance
      </h2>
      
      {!successData ? (
        <div className="flex flex-col items-center">
          <p className="text-sm text-on-surface-variant mb-6 text-center">
            Click the button below to mark your attendance using GPS location.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={markAttendance}
            disabled={isMarking}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-xl flex flex-col items-center justify-center gap-3 border-4 border-primary-100 disabled:opacity-70 disabled:scale-100"
          >
            <Clock size={40} />
            <span className="font-bold text-lg">{isMarking ? 'Fetching...' : 'Mark In'}</span>
          </motion.button>
        </div>
      ) : (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-50 border border-green-200 rounded-md3-md p-6 flex flex-col items-center text-center"
        >
          <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
          <h3 className="text-lg font-bold text-green-800 mb-1">Attendance Approved</h3>
          <p className="text-green-600 text-sm">
            Time: {successData.time} <br/>
            Location: {successData.lat.toFixed(4)}, {successData.lng.toFixed(4)}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
