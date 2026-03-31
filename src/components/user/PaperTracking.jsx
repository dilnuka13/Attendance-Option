import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, List } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const PAPER_MODELS = ['BLACK', 'WAVE', 'FULL PAPER', 'RANK PAPER', 'SPECIAL', 'OTHER'];

export default function PaperTracking({ user }) {
  const [model, setModel] = useState(PAPER_MODELS[0]);
  const [paperNumber, setPaperNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paperNumber || !quantity) {
      toast.error('Please enter paper number and quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const { error } = await supabase.from('papers_taken').insert({
        user_id: user.id,
        date: dateStr,
        paper_model: model,
        paper_number: paperNumber,
        quantity: parseInt(quantity, 10),
      });

      if (error) throw error;

      toast.success('Paper entry logged successfully');
      setPaperNumber('');
      setQuantity('');
    } catch (err) {
      toast.error('Failed to log paper entry.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6 mt-6 border-l-4 border-l-blue-500"
    >
      <div className="flex items-center gap-2 mb-6">
        <FileText className="text-blue-500" />
        <h2 className="text-xl font-bold">Paper Tracking Entry</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Paper Model</label>
            <div className="relative">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="input-field appearance-none"
              >
                {PAPER_MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                <List size={16} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Paper Number</label>
            <input
              type="text"
              value={paperNumber}
              onChange={(e) => setPaperNumber(e.target.value)}
              placeholder="e.g. B-101"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
              className="input-field"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary bg-blue-600 hover:bg-blue-700 w-full md:w-auto flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Logging...' : 'Log Papers'}
          {!isSubmitting && <Plus size={18} />}
        </button>
      </form>
    </motion.div>
  );
}
