import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, X, Search, BookOpen } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  department_id: string;
  grade_levels: number[];
  created_at: string;
}

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

interface ClassSubject {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  class?: any;
  teacher?: Teacher;
}

export function SubjectsPage() {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    grade_levels: [] as number[]
  });
  const [assignData, setAssignData] = useState({
    subject_id: '',
    class_id: '',
    teacher_id: ''
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (profile?.role === 'admin' && profile.sub_role === 'hod' && profile.department_id) {
      fetchSubjects();
      fetchTeachers();
      fetchClasses();
      fetchClassSubjects();
    }
  }, [profile]);

  const fetchSubjects = async () => {
    if (!profile?.department_id) return;
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('department_id', profile.department_id)
        .order('name');
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    if (!profile?.department_id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('department_id', profile.department_id)
        .eq('role', 'professor')
        .eq('approval_status', 'approved')
        .order('full_name');
      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('status', 'active')
        .order('grade_level, section');
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchClassSubjects = async () => {
    if (!profile?.department_id) return;
    try {
      const { data, error } = await supabase
        .from('class_subjects')
        .select(`
          *,
          class:classes(id, name, grade_level, section),
          subject:subjects!inner(id, name, department_id),
          teacher:profiles(id, full_name, email)
        `)
        .eq('subject.department_id', profile.department_id);
      if (error) throw error;
      setClassSubjects(data || []);
    } catch (error) {
      console.error('Error fetching class subjects:', error);
    }
  };

  const handleCreateSubject = async () => {
    if (!formData.name || !formData.code || !profile?.department_id) return;
    try {
      const { error } = await supabase.from('subjects').insert({
        name: formData.name,
        code: formData.code,
        description: formData.description,
        department_id: profile.department_id,
        grade_levels: formData.grade_levels
      });
      if (error) throw error;
      setNotification({ type: 'success', message: 'Subject created successfully' });
      setShowCreateModal(false);
      setFormData({ name: '', code: '', description: '', grade_levels: [] });
      fetchSubjects();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    }
  };

  const handleAssignTeacher = async () => {
    if (!assignData.subject_id || !assignData.class_id || !assignData.teacher_id) return;
    try {
      const { error } = await supabase.from('class_subjects').insert({
        class_id: assignData.class_id,
        subject_id: assignData.subject_id,
        teacher_id: assignData.teacher_id
      });
      if (error) throw error;
      setNotification({ type: 'success', message: 'Teacher assigned successfully' });
      setShowAssignModal(false);
      setAssignData({ subject_id: '', class_id: '', teacher_id: '' });
      fetchClassSubjects();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
      setNotification({ type: 'success', message: 'Subject deleted' });
      fetchSubjects();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    }
  };

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (profile?.role !== 'admin' || profile.sub_role !== 'hod') {
    return <DashboardLayout><div className="p-6">Access denied</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full min-w-0 px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subjects</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage department subjects and assignments</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Subject
            </button>
            <button onClick={() => setShowAssignModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Assign Teacher
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search subjects..."
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Subject</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Code</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Description</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.map((subject) => (
                      <tr key={subject.id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{subject.name}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{subject.code}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{subject.description}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleDeleteSubject(subject.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredSubjects.map((subject) => (
                  <div key={subject.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">{subject.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{subject.code}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subject.description}</div>
                      </div>
                      <button onClick={() => handleDeleteSubject(subject.id)} className="p-2 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Class Assignments</h2>
          <div className="space-y-3">
            {classSubjects.map((cs) => (
              <div key={cs.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white">{cs.class?.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{cs.teacher?.full_name || 'Unassigned'}</div>
                </div>
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Subject</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject Code *</label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">Cancel</button>
                <button onClick={handleCreateSubject} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assign Teacher</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-500"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject *</label>
                <select value={assignData.subject_id} onChange={(e) => setAssignData({...assignData, subject_id: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Select subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Class *</label>
                <select value={assignData.class_id} onChange={(e) => setAssignData({...assignData, class_id: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Select class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teacher *</label>
                <select value={assignData.teacher_id} onChange={(e) => setAssignData({...assignData, teacher_id: e.target.value})} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Select teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">Cancel</button>
                <button onClick={handleAssignTeacher} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-6 right-6 z-60 max-w-sm">
          <div className={`px-4 py-3 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">{notification.message}</div>
              <button onClick={() => setNotification(null)}><X className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
