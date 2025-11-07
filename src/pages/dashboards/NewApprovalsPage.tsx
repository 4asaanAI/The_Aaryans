import { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { ColumnFilter } from '../../components/ColumnFilter';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, UserCheck, XCircle, AlertCircle, CheckCircle, Calendar, Mail, Phone } from 'lucide-react';
import { Notification } from '../../components/Notification';

interface PendingProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  sub_role?: string;
  phone?: string;
  admission_no?: string;
  employee_id?: string;
  created_at: string;
  approval_status: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  parent_name?: string;
  parent_phone?: string;
}

interface ColumnFilters {
  role: string[];
  gender: string[];
}

export function NewApprovalsPage() {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [pendingProfiles, setPendingProfiles] = useState<PendingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    role: [],
    gender: []
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{ type: 'approve' | 'reject'; profileId: string; profileName: string } | null>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchPendingProfiles();
      subscribeToProfiles();
    }
  }, [profile]);

  const fetchPendingProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingProfiles(data || []);
    } catch (error) {
      console.error('Error fetching pending profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToProfiles = () => {
    const channel = supabase
      .channel('pending-profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'approval_status=eq.pending'
        },
        () => {
          fetchPendingProfiles();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleApprove = async (profileId: string) => {
    setApproving(profileId);
    setShowConfirmModal(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: profile?.id,
          status: 'active'
        })
        .eq('id', profileId);

      if (error) throw error;

      setPendingProfiles(prev => prev.filter(p => p.id !== profileId));
      setNotification({ type: 'success', message: 'User approved successfully!' });
    } catch (error) {
      console.error('Error approving user:', error);
      setNotification({ type: 'error', message: 'Failed to approve user. Please try again.' });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (profileId: string) => {
    setApproving(profileId);
    setShowConfirmModal(null);
    try {
      // Delete the user's profile from the database
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      setPendingProfiles(prev => prev.filter(p => p.id !== profileId));
      setNotification({ type: 'success', message: 'User rejected and data deleted successfully.' });
    } catch (error) {
      console.error('Error rejecting user:', error);
      setNotification({ type: 'error', message: 'Failed to reject user. Please try again.' });
    } finally {
      setApproving(null);
    }
  };

  const filteredProfiles = useMemo(() => {
    let filtered = [...pendingProfiles];

    if (searchQuery) {
      filtered = filtered.filter(profile =>
        profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.admission_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (columnFilters.role.length > 0) {
      filtered = filtered.filter(p => columnFilters.role.includes(p.role));
    }

    if (columnFilters.gender.length > 0) {
      filtered = filtered.filter(p => columnFilters.gender.includes(p.gender || ''));
    }

    return filtered;
  }, [pendingProfiles, searchQuery, columnFilters]);

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

  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400">Only administrators can access this page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Approvals</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Review and approve pending user registrations</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-900 dark:text-blue-300">{pendingProfiles.length} Pending</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Pending Approvals</h3>
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery || Object.values(columnFilters).some(f => f.length > 0)
                  ? 'No matching pending approvals'
                  : 'All caught up!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || Object.values(columnFilters).some(f => f.length > 0)
                  ? 'Try adjusting your filters'
                  : 'There are no pending approval requests at the moment.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      User Details
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        Role
                        <ColumnFilter
                          column="Role"
                          values={pendingProfiles.map(p => p.role)}
                          selectedValues={columnFilters.role}
                          onFilterChange={(values) => handleColumnFilterChange('role', values)}
                          isDark={isDark}
                        />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        Gender
                        <ColumnFilter
                          column="Gender"
                          values={pendingProfiles.map(p => p.gender || '')}
                          selectedValues={columnFilters.gender}
                          onFilterChange={(values) => handleColumnFilterChange('gender', values)}
                          isDark={isDark}
                        />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Registration Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map((pendingProfile) => (
                    <tr
                      key={pendingProfile.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                              {pendingProfile.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{pendingProfile.full_name}</div>
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <Mail className="h-3 w-3" />
                              {pendingProfile.email}
                            </div>
                            {pendingProfile.sub_role && (
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 capitalize">
                                {pendingProfile.sub_role}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getRoleBadgeColor(pendingProfile.role)}`}>
                          {pendingProfile.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {pendingProfile.phone ? (
                          <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {pendingProfile.phone}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                        {pendingProfile.role === 'student' && pendingProfile.parent_phone && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Parent: {pendingProfile.parent_phone}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {pendingProfile.gender || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(pendingProfile.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(pendingProfile.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowConfirmModal({ type: 'approve', profileId: pendingProfile.id, profileName: pendingProfile.full_name })}
                            disabled={approving === pendingProfile.id}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            <UserCheck className="h-4 w-4" />
                            {approving === pendingProfile.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => setShowConfirmModal({ type: 'reject', profileId: pendingProfile.id, profileName: pendingProfile.full_name })}
                            disabled={approving === pendingProfile.id}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredProfiles.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-300">
                <p className="font-semibold mb-1">Important Information</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-400">
                  <li>Approval actions are permanent and cannot be undone</li>
                  <li>Approved users will gain immediate access to the dashboard</li>
                  <li>Rejected users will be marked as inactive and cannot log in</li>
                  <li>Review all user details carefully before taking action</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
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
                  {showConfirmModal.type === 'approve' ? 'Approve User' : 'Reject User'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {showConfirmModal.type === 'approve'
                    ? `Are you sure you want to approve ${showConfirmModal.profileName}? This action cannot be undone.`
                    : `Are you sure you want to reject ${showConfirmModal.profileName}? This will permanently delete their data and they will need to sign up again.`}
                </p>
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
                onClick={() => showConfirmModal.type === 'approve' ? handleApprove(showConfirmModal.profileId) : handleReject(showConfirmModal.profileId)}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  showConfirmModal.type === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {showConfirmModal.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
