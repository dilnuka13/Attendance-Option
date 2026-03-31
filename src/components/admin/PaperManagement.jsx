import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { FileStack, Search, Trash2, Edit, Save, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaperManagement() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Edit states
  const [editModel, setEditModel] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editQuantity, setEditQuantity] = useState('');

  // The PAPER_MODELS list from user UI. Ideally this would be fetched from a DB table in a real next-level system!
  const PAPER_MODELS = ['BLACK', 'WAVE', 'FULL PAPER', 'RANK PAPER', 'SPECIAL', 'OTHER'];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('papers_taken')
        .select(`
          *,
          users (
            name,
            index_number
          )
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      toast.error('Failed to load paper management records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this paper log?')) return;
    try {
      const { error } = await supabase.from('papers_taken').delete().eq('id', id);
      if (error) throw error;
      toast.success('Log deleted successfully');
      setLogs(logs.filter(log => log.id !== id));
    } catch (err) {
      toast.error('Failed to delete log');
    }
  };

  const initiateEdit = (log) => {
    setEditingId(log.id);
    setEditModel(log.paper_model);
    setEditNumber(log.paper_number);
    setEditQuantity(log.quantity.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditModel('');
    setEditNumber('');
    setEditQuantity('');
  };

  const handleSaveEdit = async (id) => {
    if (!editNumber || !editQuantity) {
      toast.error('Please fill in valid numbers.');
      return;
    }
    try {
      const { error } = await supabase
        .from('papers_taken')
        .update({
          paper_model: editModel,
          paper_number: editNumber,
          quantity: parseInt(editQuantity, 10)
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Record updated successfully');
      setLogs(logs.map(log => 
        log.id === id 
          ? { ...log, paper_model: editModel, paper_number: editNumber, quantity: parseInt(editQuantity, 10) } 
          : log
      ));
      cancelEdit();
    } catch (err) {
      toast.error('Failed to update record');
    }
  };

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      log.paper_number.toLowerCase().includes(term) ||
      log.paper_model.toLowerCase().includes(term) ||
      log.users?.name?.toLowerCase().includes(term) ||
      log.users?.index_number?.toLowerCase().includes(term)
    );
  });

  // Framer Motion staggered animation config
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="card p-6 border-l-4 border-l-indigo-500 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-surface to-indigo-50/30">
        <div>
          <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-3">
            <FileStack className="text-indigo-600" />
            Paper Log Management
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Edit, audit, or delete staff paper logging records in real-time.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, Model, User..."
            className="input-field pl-10 bg-white"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-on-surface-variant/50" />
        </div>
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="flex justify-center p-12 text-on-surface-variant font-medium">
          Loading Data...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card p-12 text-center text-on-surface-variant">
          No paper logs found matching your criteria.
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence>
            {filteredLogs.map(log => {
              const isEditing = editingId === log.id;

              return (
                <motion.div 
                  key={log.id}
                  variants={itemAnim}
                  layout
                  className={`card transition-shadow hover:shadow-md3-3
                    ${isEditing ? 'ring-2 ring-indigo-500 shadow-md3-3' : ''}
                  `}
                >
                  <div className={`p-4 border-b ${isEditing ? 'bg-indigo-50' : 'bg-surface-variant/30 flex justify-between items-center'}`}>
                    {isEditing ? (
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold text-indigo-700 text-sm">Editing Output</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEdit(log.id)} className="p-1.5 bg-green-100 text-green-700 rounded-md3-xs hover:bg-green-200 transition-colors">
                            <Save size={16} />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 bg-red-100 text-red-700 rounded-md3-xs hover:bg-red-200 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-xs font-bold text-indigo-800 bg-indigo-100 px-3 py-1 rounded-md3-full inline-block">
                          {log.date}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => initiateEdit(log)} className="text-on-surface-variant hover:text-indigo-600 transition-colors" title="Edit Log">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(log.id)} className="text-on-surface-variant hover:text-red-500 transition-colors" title="Delete Log">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-5 space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant">Staff Member</span>
                      <span className="font-bold text-right">
                        {log.users?.name}<br/>
                        <span className="text-xs text-on-surface-variant font-normal">{log.users?.index_number}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant">Model</span>
                      {isEditing ? (
                        <select 
                          value={editModel} 
                          onChange={e => setEditModel(e.target.value)}
                          className="input-field py-1 px-2 text-sm w-32 bg-white"
                        >
                          {PAPER_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      ) : (
                        <span className="font-medium text-indigo-900">{log.paper_model}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant">Paper Number</span>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editNumber}
                          onChange={e => setEditNumber(e.target.value)}
                          className="input-field py-1 px-2 text-sm w-32 bg-white text-right"
                        />
                      ) : (
                        <span className="font-mono bg-surface-variant px-2 py-0.5 rounded-md text-on-surface">{log.paper_number}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-on-surface-variant/10">
                      <span className="text-on-surface-variant font-medium">Quantity Distributed</span>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editQuantity}
                          onChange={e => setEditQuantity(e.target.value)}
                          className="input-field py-1 px-2 text-sm w-24 bg-white text-right font-bold text-lg"
                        />
                      ) : (
                        <span className="text-xl font-bold text-indigo-600">{log.quantity}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
