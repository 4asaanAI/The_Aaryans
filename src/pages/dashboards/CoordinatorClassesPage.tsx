import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { X, Search, Edit2 } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  capacity: number;
  current_strength: number;
  class_teacher_id: string | null;
  academic_year: string;
  status: string;
  remarks: string | null;
  class_teacher?: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

export function CoordinatorClassesPage() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    grade_level: 1,
    section: '',
    capacity: 30,
    class_teacher_id: '',
    academic_year: new Date().getFullYear().toString(),
    status: 'active',
    remarks: '',
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if ((profile?.role === 'admin' && profile.sub_role === 'coordinator') ||
        (profile?.role === 'professor' && profile.sub_role === 'coordinator')) {
      fetchClasses();
      fetchTeachers();
    }
  }, [profile]);

  const fetchClasses = async () => {
    try {
      let query = supabase
        .from('classes')
        .select(`
          *,
          class_teacher:profiles!classes_class_teacher_id_fkey(id, full_name, email)
        `);

      if (profile?.role === 'professor' && profile.sub_role === 'coordinator') {
        query = query.eq('class_teacher_id', profile.id);
      }

      const { data, error } = await query
        .order('grade_level', { ascending: true })
        .order('section', { ascending: true });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('role', ['professor'])
        .eq('approval_status', 'approved')
        .order('full_name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleCreateOrUpdateClass = async () => {
    if (!formData.name || !formData.section) return;

    try {
      if (editingClass) {
        const { error } = await supabase
          .from('classes')
          .update({
            name: formData.name,
            grade_level: formData.grade_level,
            section: formData.section,
            capacity: formData.capacity,
            class_teacher_id: formData.class_teacher_id || null,
            academic_year: formData.academic_year,
            status: formData.status,
            remarks: formData.remarks,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingClass.id);

        if (error) throw error;

        setNotification({
          type: 'success',
          message: 'Class updated successfully',
        });
      }

      setShowCreateModal(false);
      setEditingClass(null);
      setFormData({
        name: '',
        grade_level: 1,
        section: '',
        capacity: 30,
        class_teacher_id: '',
        academic_year: new Date().getFullYear().toString(),
        status: 'active',
        remarks: '',
      });
      fetchClasses();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Error' });
    }
  };

  const openEditModal = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade_level: cls.grade_level,
      section: cls.section,
      capacity: cls.capacity,
      class_teacher_id: cls.class_teacher_id || '',
      academic_year: cls.academic_year,
      status: cls.status,
      remarks: cls.remarks || '',
    });
    setShowCreateModal(true);
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!(
    (profile?.role === 'admin' && profile.sub_role === 'coordinator') ||
    (profile?.role === 'professor' && profile.sub_role === 'coordinator')
  )) {
    return (
      <DashboardLayout>
        <div className="p-6">Access denied</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full min-w-0 px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Classes
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {profile?.role === 'professor' && profile.sub_role === 'coordinator'
                ? 'View and manage your assigned classes'
                : 'Manage classes and assign class teachers'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Class
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Grade
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Class Teacher
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Capacity
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClasses.map((cls) => (
                      <tr
                        key={cls.id}
                        className="border-b border-gray-100 dark:border-gray-700"
                      >
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {cls.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {cls.grade_level} - {cls.section}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {cls.class_teacher?.full_name || 'Unassigned'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {cls.current_strength || 0} / {cls.capacity}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              cls.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {cls.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(cls)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {cls.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Grade {cls.grade_level} - {cls.section}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Teacher: {cls.class_teacher?.full_name || 'Unassigned'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Capacity: {cls.current_strength || 0} / {cls.capacity}
                        </div>
                        <span
                          className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                            cls.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {cls.status}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => openEditModal(cls)}
                          className="p-2 text-gray-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingClass ? 'Edit Class' : 'Add Class'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingClass(null);
                }}
                className="text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section *
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grade Level *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.grade_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        grade_level: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Teacher
                  </label>
                  <select
                    value={formData.class_teacher_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        class_teacher_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select teacher</option>
                    <option value={profile?.id || ''}>Myself</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={formData.academic_year}
                    onChange={(e) =>
                      setFormData({ ...formData, academic_year: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrUpdateClass}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingClass ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {notification && (
        <div className="fixed bottom-6 right-6 z-60 max-w-sm">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">{notification.message}</div>
              <button onClick={() => setNotification(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
