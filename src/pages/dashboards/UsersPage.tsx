import { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { RightSidebar } from '../../components/dashboard/RightSidebar';
import { ColumnFilter } from '../../components/ColumnFilter';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Users as UsersIcon, GraduationCap, Briefcase, Eye, Edit, Trash2, Plus, ChevronDown, ChevronUp, UserCheck, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Notification } from '../../components/Notification';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  sub_role?: string;
  phone?: string;
  status: string;
  department_id?: string;
  employee_id?: string;
  admission_no?: string;
  created_at: string;
  approval_status?: string;
}

interface ColumnFilters {
  role: string[];
  status: string[];
  subRole: string[];
}

export function UsersPage() {
  const { profile: currentProfile } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPendingDropdown, setShowPendingDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    role: [],
    status: [],
    subRole: []
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{ type: 'approve' | 'delete'; profile: Profile } | null>(null);

  const isDark = theme === 'dark';

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    employees: 0
  });

  useEffect(() => {
    fetchProfiles();
    if (currentProfile?.role === 'admin') {
      fetchPendingApprovals();
      subscribeToPendingApprovals();
    }
  }, [currentProfile]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProfiles(data || []);

      const students = data?.filter(p => p.role === 'student').length || 0;
      const teachers = data?.filter(p => p.role === 'professor' || p.role === 'teacher').length || 0;
      const employees = data?.filter(p => p.role === 'admin' || p.role === 'staff').length || 0;

      setStats({ students, teachers, employees });
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false});

      if (error) throw error;
      setPendingApprovals(data || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const subscribeToPendingApprovals = () => {
    const channel = supabase
      .channel('pending-approvals-users-page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'approval_status=eq.pending'
        },
        () => {
          fetchPendingApprovals();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleApprove = async (profileId: string) => {
    setShowConfirmModal(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: currentProfile?.id,
          status: 'active'
        })
        .eq('id', profileId);

      if (error) throw error;

      setPendingApprovals(prev => prev.filter(p => p.id !== profileId));
      fetchProfiles();
      setNotification({ type: 'success', message: 'User approved successfully!' });
    } catch (error) {
      console.error('Error approving user:', error);
      setNotification({ type: 'error', message: 'Failed to approve user. Please try again.' });
    }
  };

  const canEditUser = (targetProfile: Profile): boolean => {
    if (!currentProfile) return false;

    if (currentProfile.sub_role !== 'head' && currentProfile.sub_role !== 'principal') {
      return false;
    }

    if (targetProfile.id === currentProfile.id) {
      return false;
    }

    if (targetProfile.sub_role === 'head') {
      return false;
    }

    if (currentProfile.sub_role === 'head' && targetProfile.sub_role === 'principal') {
      return false;
    }

    return true;
  };

  const canDeleteUser = (targetProfile: Profile): boolean => {
    return canEditUser(targetProfile);
  };

  const handleEditClick = (profile: Profile) => {
    setEditingProfile(profile);
    setShowEditModal(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: editingProfile.role,
          sub_role: editingProfile.sub_role
        })
        .eq('id', editingProfile.id);

      if (error) throw error;

      setNotification({ type: 'success', message: 'User updated successfully!' });
      setShowEditModal(false);
      setEditingProfile(null);
      fetchProfiles();
    } catch (error) {
      console.error('Error updating user:', error);
      setNotification({ type: 'error', message: 'Failed to update user. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (profile: Profile) => {
    if (!canDeleteUser(profile)) {
      setNotification({ type: 'error', message: 'You do not have permission to delete this user.' });
      return;
    }

    setShowConfirmModal(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);

      if (error) throw error;

      setNotification({ type: 'success', message: 'User deleted successfully.' });
      fetchProfiles();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (error.message.includes('foreign key')) {
        setNotification({ type: 'error', message: 'Cannot delete user: This user is referenced in other records (e.g., as HOD, class teacher, or assignment teacher). Please reassign those roles first.' });
      } else {
        setNotification({ type: 'error', message: 'Failed to delete user. Please try again.' });
      }
    }
  };

  const filteredProfiles = useMemo(() => {
    let filtered = [...profiles];

    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.admission_no?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (columnFilters.role.length > 0) {
      filtered = filtered.filter(profile => columnFilters.role.includes(profile.role));
    }

    if (columnFilters.status.length > 0) {
      filtered = filtered.filter(profile => columnFilters.status.includes(profile.status));
    }

    if (columnFilters.subRole.length > 0) {
      filtered = filtered.filter(profile => columnFilters.subRole.includes(profile.sub_role || ''));
    }

    return filtered;
  }, [profiles, searchTerm, columnFilters]);

  const handleColumnFilterChange = (column: keyof ColumnFilters, values: string[]) => {
    setColumnFilters(prev => ({ ...prev, [column]: values }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'professor':
      case 'teacher':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'inactive':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'suspended':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const availableRoles = ['admin', 'professor', 'student'];
  const availableSubRoles: Record<string, string[]> = {
    admin: ['head', 'principal', 'hod', 'other'],
    professor: ['coordinator', 'teacher'],
    student: ['student']
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Users Management</h2>
              {currentProfile?.role === 'admin' && pendingApprovals.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowPendingDropdown(!showPendingDropdown)}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    title={`${pendingApprovals.length} pending approvals`}
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold">{pendingApprovals.length}</span>
                    {showPendingDropdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {showPendingDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-orange-900/20">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Pending Approvals</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {pendingApprovals.length} new registration{pendingApprovals.length !== 1 ? 's' : ''} awaiting approval
                        </p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {pendingApprovals.slice(0, 5).map((pending) => (
                          <div
                            key={pending.id}
                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {pending.full_name}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{pending.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(pending.role)}`}>
                                    {pending.role}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-500">
                                    {new Date(pending.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => setShowConfirmModal({ type: 'approve', profile: pending })}
                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium flex items-center gap-1"
                              >
                                <UserCheck className="h-3 w-3" />
                                Approve
                              </button>
                            </div>
                          </div>
                        ))}
                        {pendingApprovals.length > 5 && (
                          <button
                            onClick={() => {
                              setShowPendingDropdown(false);
                              navigate('/dashboard/approvals');
                            }}
                            className="w-full px-4 py-3 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            See more ({pendingApprovals.length - 5} remaining)
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-400 dark:bg-blue-600 rounded-2xl p-5 cursor-pointer hover:bg-blue-500 dark:hover:bg-blue-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <GraduationCap className="h-8 w-8 text-white" />
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.students}</div>
              <div className="text-blue-50 text-sm font-medium">Students</div>
            </div>

            <div className="bg-green-400 dark:bg-green-600 rounded-2xl p-5 cursor-pointer hover:bg-green-500 dark:hover:bg-green-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Briefcase className="h-8 w-8 text-white" />
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.teachers}</div>
              <div className="text-green-50 text-sm font-medium">Teachers</div>
            </div>

            <div className="bg-purple-400 dark:bg-purple-600 rounded-2xl p-5 cursor-pointer hover:bg-purple-500 dark:hover:bg-purple-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <UsersIcon className="h-8 w-8 text-white" />
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.employees}</div>
              <div className="text-purple-50 text-sm font-medium">Employees</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5">
            <div className="flex flex-col lg:flex-row gap-4 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading users...</p>
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No users found matching your criteria
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          Role
                          <ColumnFilter
                            column="Role"
                            values={profiles.map(p => p.role)}
                            selectedValues={columnFilters.role}
                            onFilterChange={(values) => handleColumnFilterChange('role', values)}
                            isDark={isDark}
                          />
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          Sub Role
                          <ColumnFilter
                            column="Sub Role"
                            values={profiles.map(p => p.sub_role || '')}
                            selectedValues={columnFilters.subRole}
                            onFilterChange={(values) => handleColumnFilterChange('subRole', values)}
                            isDark={isDark}
                          />
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Contact
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          Status
                          <ColumnFilter
                            column="Status"
                            values={profiles.map(p => p.status)}
                            selectedValues={columnFilters.status}
                            onFilterChange={(values) => handleColumnFilterChange('status', values)}
                            isDark={isDark}
                          />
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.map((profile) => (
                      <tr key={profile.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                {profile.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white">{profile.full_name}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{profile.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(profile.role)}`}>
                            {profile.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">
                          {profile.sub_role || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{profile.phone || '-'}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {profile.employee_id || profile.admission_no || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(profile.status)}`}>
                            {profile.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            {canEditUser(profile) && (
                              <button
                                onClick={() => handleEditClick(profile)}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {canDeleteUser(profile) && (
                              <button
                                onClick={() => setShowConfirmModal({ type: 'delete', profile })}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredProfiles.length} of {profiles.length} users
              </div>
            </div>
          </div>
        </div>

        <RightSidebar />
      </div>

      {showEditModal && editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit User Role</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-300">
                    <p className="font-semibold mb-1">Editing: {editingProfile.full_name}</p>
                    <p className="text-blue-800 dark:text-blue-400">{editingProfile.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={editingProfile.role}
                  onChange={(e) => setEditingProfile({ ...editingProfile, role: e.target.value, sub_role: '' })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sub Role
                </label>
                <select
                  value={editingProfile.sub_role || ''}
                  onChange={(e) => setEditingProfile({ ...editingProfile, sub_role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select sub role</option>
                  {availableSubRoles[editingProfile.role]?.map(subRole => (
                    <option key={subRole} value={subRole}>{subRole}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {showConfirmModal.type === 'approve' ? 'Approve User' : 'Delete User'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {showConfirmModal.type === 'approve'
                    ? `Are you sure you want to approve ${showConfirmModal.profile.full_name}? This action cannot be undone.`
                    : `Are you sure you want to delete ${showConfirmModal.profile.full_name}?`}
                </p>
                {showConfirmModal.type === 'delete' && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-900 dark:text-red-300 font-semibold mb-2">This will permanently delete:</p>
                    <ul className="text-xs text-red-800 dark:text-red-400 list-disc list-inside space-y-1">
                      <li>User profile</li>
                      <li>All messages sent/received</li>
                      <li>Student records (attendance, assignments, exam results, fees, etc.)</li>
                      <li>Leave applications</li>
                      <li>Library transactions</li>
                      <li>Transport records</li>
                    </ul>
                    <p className="text-sm text-red-900 dark:text-red-300 font-semibold mt-2">This action CANNOT be undone!</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => showConfirmModal.type === 'approve' ? handleApprove(showConfirmModal.profile.id) : handleDeleteUser(showConfirmModal.profile)}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  showConfirmModal.type === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {showConfirmModal.type === 'approve' ? 'Approve' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
