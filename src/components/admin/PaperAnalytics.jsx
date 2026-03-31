import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart3, Download, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

export default function PaperAnalytics() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    // Default dates: 16th of previous to 15th of current
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // If today is before 16th, range is 16th of (month-2) to 15th of (month-1)
    // Wait, requirement: "16th of the previous month to the 15th of the current month"
    // Usually means based on current date, but let's just implement exactly that:
    let prevMonthDate = new Date(currentYear, currentMonth - 1, 16);
    let currMonthDate = new Date(currentYear, currentMonth, 15);
    
    // Adjust logic if current date is before 16th so that the "current" window shifted appropriately
    if (now.getDate() < 16) {
      prevMonthDate = new Date(currentYear, currentMonth - 2, 16);
      currMonthDate = new Date(currentYear, currentMonth - 1, 15);
    }
    
    const fmt = (d) => {
      const offset = d.getTimezoneOffset();
      return new Date(d.getTime() - (offset*60*1000)).toISOString().split('T')[0];
    };
    
    setStartDate(fmt(prevMonthDate));
    setEndDate(fmt(currMonthDate));
    
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('papers_taken')
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
        .order('date', { ascending: false });

      if (error) throw error;
      
      const res = data || [];
      setRecords(res);
      
      const uniqueBranches = ['All', ...new Set(res.map(r => r.users?.branch_name).filter(Boolean))];
      setBranches(uniqueBranches);
      applyFilters(res, branchFilter);

    } catch (err) {
      toast.error('Failed to load paper analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (data, branch) => {
    let filtered = data;
    if (branch !== 'All') {
      filtered = data.filter(r => r.users?.branch_name === branch);
    }
    setFilteredRecords(filtered);
    
    // Compute Summary: Total count of papers categorized by 'Paper Model' per user
    const sumMap = {};
    filtered.forEach(r => {
      const key = `${r.users?.index_number}_${r.paper_model}`;
      if (!sumMap[key]) {
        sumMap[key] = {
          name: r.users?.name,
          index: r.users?.index_number,
          branch: r.users?.branch_name,
          model: r.paper_model,
          total: 0
        };
      }
      sumMap[key].total += r.quantity;
    });
    setSummary(Object.values(sumMap).sort((a,b) => a.index.localeCompare(b.index)));
  };

  const handleBranchChange = (e) => {
    const b = e.target.value;
    setBranchFilter(b);
    applyFilters(records, b);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Paper Analytics Report (${startDate} to ${endDate})`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Branch Filter: ${branchFilter}`, 14, 22);

    doc.autoTable({
      startY: 28,
      head: [['Index', 'Name', 'Branch', 'Paper Model', 'Total Quantity']],
      body: summary.map(s => [s.index, s.name, s.branch, s.model, s.total]),
      theme: 'grid',
      headStyles: { fillColor: [42, 77, 125] }
    });

    doc.save(`papers_summary_${startDate}_${endDate}.pdf`);
    toast.success('PDF Export Downloaded');
  };

  const exportCSV = () => {
    const csvData = summary.map(s => ({
      Index: s.index,
      Name: s.name,
      Branch: s.branch,
      'Paper Model': s.model,
      'Total Quantity': s.total
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `papers_summary_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export Downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="card p-5 flex flex-col md:flex-row gap-4 items-end bg-surface-variant/30">
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-bold text-primary-700 uppercase mb-1 flex items-center gap-1">
            <Filter size={14}/> Start Date
          </label>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)}
            className="input-field py-2 w-full bg-white transition-colors"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-primary-700 uppercase mb-1">End Date</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)}
            className="input-field py-2 w-full bg-white transition-colors"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-primary-700 uppercase mb-1">Branch</label>
          <select 
            value={branchFilter}
            onChange={handleBranchChange}
            className="input-field py-2 w-full bg-white"
          >
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
          <button onClick={exportPDF} className="btn-secondary py-2 flex items-center justify-center gap-2 flex-1 md:flex-none" title="Export PDF">
            <Download size={16} /> PDF
          </button>
          <button onClick={exportCSV} className="btn-secondary py-2 flex items-center justify-center gap-2 flex-1 md:flex-none bg-green-50 text-green-700 hover:bg-green-100" title="Export CSV">
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Table */}
        <div className="card h-fit max-h-[600px] flex flex-col border-t-4 border-t-primary-500">
          <div className="p-4 border-b border-on-surface-variant/10 flex items-center gap-2 sticky top-0 bg-white z-10 shadow-sm">
            <BarChart3 size={20} className="text-primary-600" />
            <h3 className="font-bold">Paper Summary</h3>
          </div>
          <div className="overflow-auto flex-1 p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface sticky top-0">
                <tr className="text-on-surface-variant font-medium">
                  <th className="p-3">Staff</th>
                  <th className="p-3">Model</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-on-surface-variant/5">
                {isLoading ? (
                  <tr><td colSpan="3" className="p-4 text-center">Loading...</td></tr>
                ) : summary.length === 0 ? (
                  <tr><td colSpan="3" className="p-4 text-center">No summarizable records.</td></tr>
                ) : (
                  summary.map((s, i) => (
                    <tr key={i} className="hover:bg-primary-50">
                      <td className="p-3">
                        <div className="font-bold">{s.name}</div>
                        <div className="text-xs text-on-surface-variant">{s.index}</div>
                      </td>
                      <td className="p-3 font-medium text-primary-800">
                        <span className="px-2 py-1 bg-primary-100 rounded-md3-xs">{s.model}</span>
                      </td>
                      <td className="p-3 text-right font-bold text-lg">{s.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Logs view */}
         <div className="card h-fit max-h-[600px] flex flex-col border-t-4 border-t-purple-500">
          <div className="p-4 border-b border-on-surface-variant/10 flex items-center gap-2 sticky top-0 bg-white z-10 shadow-sm">
            <Search size={20} className="text-purple-600" />
            <h3 className="font-bold">Detailed Entry Logs</h3>
          </div>
          <div className="overflow-auto flex-1 p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface sticky top-0">
                <tr className="text-on-surface-variant font-medium">
                  <th className="p-3">Date</th>
                  <th className="p-3">Paper Info</th>
                  <th className="p-3">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-on-surface-variant/5">
                {isLoading ? (
                  <tr><td colSpan="3" className="p-4 text-center">Loading...</td></tr>
                ) : filteredRecords.length === 0 ? (
                  <tr><td colSpan="3" className="p-4 text-center">No detailed logs found.</td></tr>
                ) : (
                  filteredRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-purple-50">
                      <td className="p-3 text-xs w-24">
                        <div className="font-bold">{r.date}</div>
                        <div className="text-on-surface-variant">{r.users?.index_number}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-purple-900">{r.paper_model}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">#{r.paper_number}</div>
                      </td>
                      <td className="p-3 font-bold text-purple-700 text-right">{r.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
