import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Plus, Trash2, Building, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // New User Form State
  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [phone, setPhone] = useState('');
  const [branchName, setBranchName] = useState('');
  
  // New Branch State
  const [newBranch, setNewBranch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Mock branching for now since we don't have a strict schema for branches
      // In a real app, you'd fetch from a `branches` table
      // Let's just extract unique branches from users for this demo if a branch table doesn't exist
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('index_number', { ascending: false });

      if (usersError) throw usersError;
      
      setUsers(usersData || []);
      
      const uniqueBranches = [...new Set(usersData?.map(u => u.branch_name).filter(Boolean))];
      setBranches(uniqueBranches.length ? uniqueBranches : ['Main Branch']);
      if (!branchName) setBranchName(uniqueBranches[0] || 'Main Branch');

    } catch (err) {
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUser = (u) => {
    const text = `*Staff Details*\nName: ${u.name}\nIndex Number: ${u.index_number}\nNIC: ${u.nic}\nBranch: ${u.branch_name}\nPhone: ${u.phone_number}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Details copied for WhatsApp!');
    }).catch(() => {
      toast.error('Failed to copy text');
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!name || !nic || !phone || !branchName) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      // Auto-generate index number
      // Find max index number currently
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('index_number')
        .order('index_number', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      let nextIndex = 260001;
      if (data && data.length > 0 && data[0].index_number) {
        // If it's a string or number, parse and increment
        const lastIndex = parseInt(data[0].index_number, 10);
        if (!isNaN(lastIndex) && lastIndex >= 260000) {
          nextIndex = lastIndex + 1;
        }
      }

      const { error } = await supabase.from('users').insert({
        name,
        nic,
        phone_number: phone,
        branch_name: branchName,
        index_number: nextIndex.toString(),
        role: 'user'
      });

      if (error) throw error;
      
      toast.success(`User added successfully with Index: ${nextIndex}`);
      setName('');
      setNic('');
      setPhone('');
      fetchData();
    } catch (err) {
      toast.error('Failed to add user');
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      toast.success('User deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!newBranch) return;
    if (!branches.includes(newBranch)) {
      setBranches([...branches, newBranch]);
      setBranchName(newBranch);
      setNewBranch('');
      toast.success('Branch added for selection');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Branch Form */}
        <div className="card p-5 h-fit">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Building size={20} className="text-primary-600" />
            Manage Branches
          </h3>
          <form onSubmit={handleAddBranch} className="space-y-4">
            <div>
              <input
                type="text"
                value={newBranch}
                onChange={(e) => setNewBranch(e.target.value)}
                placeholder="New Branch Name"
                className="input-field py-2"
              />
            </div>
            <button type="submit" className="btn-secondary w-full text-sm py-2">
              Add Branch
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {branches.map((b, i) => (
              <span key={i} className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full">
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Add User Form */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Plus size={20} className="text-primary-600" />
            Add New Staff
          </h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">NIC</label>
              <input type="text" value={nic} onChange={(e) => setNic(e.target.value)} className="input-field py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branch</label>
              <select value={branchName} onChange={(e) => setBranchName(e.target.value)} className="input-field py-2" required>
                {branches.map((b, i) => (
                  <option key={i} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="btn-primary">Add Staff Member</button>
            </div>
          </form>
        </div>
      </div>

      {/* User List Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-on-surface-variant/10 flex items-center justify-between bg-surface-variant/30">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Users size={20} className="text-primary-600" />
            Staff Directory
          </h3>
          <span className="text-sm font-medium px-3 py-1 bg-primary-100 text-primary-800 rounded-md3-full">
            Total: {users.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/50 text-sm text-on-surface-variant">
                <th className="p-4 font-medium">Index No.</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">NIC</th>
                <th className="p-4 font-medium">Branch</th>
                <th className="p-4 font-medium">Phone</th>
                <th className="p-4 font-medium text-right bg-white sticky right-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant">No users found.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-on-surface-variant/5 hover:bg-surface-variant/20 transition-colors">
                    <td className="p-4 font-bold text-primary-700">{u.index_number}</td>
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-sm text-on-surface-variant">{u.nic}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-surface-variant text-xs rounded-md">{u.branch_name}</span>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">{u.phone_number}</td>
                    <td className="p-4 text-right bg-white/50 sticky right-0 flex justify-end gap-2">
                      <button 
                        onClick={() => handleCopyUser(u)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                        title="Copy Details for WhatsApp"
                      >
                        <Copy size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
