import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, X, Search, Edit2 } from 'lucide-react';

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
  class_id: string | null;
  subject_id: string | null;
  teacher_id: string | null;
  class?: {
    id: string;
    name: string;
    grade_level: number;
    section?: string;
  } | null;
  teacher?: Teacher | null;
  subject?: Subject | null;
  hod_id?: string | null;
  created_at?: string | null;
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    grade_levels: [] as number[],
  });
  const [assignData, setAssignData] = useState({
    subject_id: '',
    class_id: '',
    teacher_ids: [] as string[], // multiple teachers
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (profile?.role === 'admin' && profile.sub_role === 'hod') {
      fetchSubjects();
      fetchTeachers();
      fetchClasses();
      fetchClassSubjects();
    }
  }, [profile]);

  const fetchSubjects = async () => {
    if (!profile?.id) return;

    try {
      // 1. Find departments where this HOD belongs (hod_ids contains user id)
      const { data: hodDepartments, error: deptErr } = await supabase
        .from('departments')
        .select('id, hod_ids')
        .contains('hod_ids', [profile.id]); // IMPORTANT: hod_ids is array

      if (deptErr) throw deptErr;

      if (!hodDepartments || hodDepartments.length === 0) {
        setSubjects([]);
        return;
      }

      const departmentIds = hodDepartments.map((d) => d.id);
      console.log('departmentId: ', departmentIds);
      // 2. Fetch subjects from ONLY these departments
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .in('department_id', departmentIds)
        .order('name');
      console.log(data);
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
        .in('role', ['professor', 'coordinator'])
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

  // *** FIXED: use explicit FK join alias so Supabase returns teacher object correctly ***
  const fetchClassSubjects = async () => {
    if (!profile?.department_id) return;
    try {
      const { data, error } = await supabase
        .from('class_subjects')
        .select(
          `
          id,
          class_id,
          subject_id,
          teacher_id,
          hod_id,
          created_at,
          class:classes(id, name, grade_level, section),
          subject:subjects!inner(id, name, department_id),
          teacher:profiles!class_subjects_teacher_id_fkey(id, full_name, email)
        `
        )
        .eq('subject.department_id', profile.department_id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Normalize returned shape: Supabase often returns joins as arrays even when single
      const normalized: ClassSubject[] = (data || []).map((row: any) => {
        const clsArr = row.class;
        const subjArr = row.subject;
        const teacherArr = row.teacher;

        const normalizedClass =
          Array.isArray(clsArr) && clsArr.length > 0
            ? clsArr[0]
            : clsArr || null;
        const normalizedSubject =
          Array.isArray(subjArr) && subjArr.length > 0
            ? subjArr[0]
            : subjArr || null;
        const normalizedTeacher =
          Array.isArray(teacherArr) && teacherArr.length > 0
            ? teacherArr[0]
            : teacherArr || null;

        return {
          id: row.id,
          class_id: row.class_id ?? null,
          subject_id: row.subject_id ?? null,
          teacher_id: row.teacher_id ?? null,
          hod_id: row.hod_id ?? null,
          created_at: row.created_at ?? null,
          class: normalizedClass
            ? {
                id: normalizedClass.id,
                name: normalizedClass.name,
                grade_level: normalizedClass.grade_level,
                section: normalizedClass.section,
              }
            : null,
          subject: normalizedSubject
            ? {
                id: normalizedSubject.id,
                name: normalizedSubject.name,
                code: (normalizedSubject as any).code || '', // optional
                department_id: normalizedSubject.department_id,
                description: (normalizedSubject as any).description || '',
                grade_levels: (normalizedSubject as any).grade_levels || [],
                created_at: (normalizedSubject as any).created_at || '',
              }
            : null,
          teacher: normalizedTeacher
            ? {
                id: normalizedTeacher.id,
                full_name: normalizedTeacher.full_name,
                email: normalizedTeacher.email,
              }
            : null,
        } as ClassSubject;
      });

      setClassSubjects(normalized);
    } catch (error) {
      console.error('Error fetching class subjects:', error);
      setClassSubjects([]);
    }
  };

  const handleCreateOrUpdateSubject = async () => {
    if (!formData.name || !formData.code || !profile?.department_id) return;

    try {
      if (editingSubject) {
        // update path
        const { error } = await supabase
          .from('subjects')
          .update({
            name: formData.name,
            code: formData.code,
            description: formData.description,
            grade_levels: formData.grade_levels,
          })
          .eq('id', editingSubject.id);

        if (error) throw error;

        setNotification({
          type: 'success',
          message: 'Subject updated successfully',
        });
        setEditingSubject(null);
      } else {
        // create path
        const { error } = await supabase.from('subjects').insert({
          name: formData.name,
          code: formData.code,
          description: formData.description,
          department_id: profile.department_id,
          grade_levels: formData.grade_levels,
        });
        if (error) throw error;

        setNotification({
          type: 'success',
          message: 'Subject created successfully',
        });
      }

      setShowCreateModal(false);
      setFormData({ name: '', code: '', description: '', grade_levels: [] });
      fetchSubjects();
      fetchClassSubjects();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Error' });
    }
  };

  const handleAssignTeacher = async () => {
    if (!assignData.subject_id || !assignData.teacher_ids.length) return;
    try {
      const classId = assignData.class_id || null;

      for (const tid of assignData.teacher_ids) {
        const { data: existing } = await supabase
          .from('class_subjects')
          .select('id')
          .eq('class_id', classId)
          .eq('subject_id', assignData.subject_id)
          .eq('teacher_id', tid)
          .maybeSingle();

        if (!existing) {
          await supabase.from('class_subjects').insert({
            class_id: classId,
            subject_id: assignData.subject_id,
            teacher_id: tid,
            hod_id: profile?.id,
          });
        }
      }

      setNotification({
        type: 'success',
        message: 'Teacher(s) assigned successfully',
      });

      setShowAssignModal(false);
      setAssignData({ subject_id: '', class_id: '', teacher_ids: [] });
      fetchClassSubjects();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    }
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      grade_levels: subject.grade_levels || [],
    });
    setShowCreateModal(true);
  };

  const openDeleteModal = (subject: Subject) => {
    setDeletingSubject(subject);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubject) return;
    try {
      // delete related class_subjects first to avoid FK issues (if any)
      await supabase
        .from('class_subjects')
        .delete()
        .eq('subject_id', deletingSubject.id);

      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', deletingSubject.id);
      if (error) throw error;
      setNotification({ type: 'success', message: 'Subject deleted' });
      setShowDeleteModal(false);
      setDeletingSubject(null);
      fetchSubjects();
      fetchClassSubjects();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Error' });
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // helper: get unique teacher names assigned to a subject
  const getTeachersForSubject = (subjectId: string) => {
    const assigned = classSubjects.filter(
      (cs) => cs.subject_id === subjectId && cs.teacher
    );
    const names = Array.from(
      new Set(assigned.map((a) => a.teacher?.full_name).filter(Boolean))
    );
    return names;
  };

  if (profile?.role !== 'admin' || profile.sub_role !== 'hod') {
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
              Subjects
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage department subjects and assignments
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingSubject(null);
                setFormData({
                  name: '',
                  code: '',
                  description: '',
                  grade_levels: [],
                });
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Subject
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Subject
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Code
                      </th>

                      {/* NEW Teachers column */}
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Teachers
                      </th>

                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Description
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.map((subject) => {
                      const teacherNames = getTeachersForSubject(subject.id);
                      return (
                        <tr
                          key={subject.id}
                          className="border-b border-gray-100 dark:border-gray-700"
                        >
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            {subject.name}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {subject.code}
                          </td>

                          {/* Teachers cell */}
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {teacherNames.length > 0
                              ? teacherNames.join(', ')
                              : 'Unassigned'}
                          </td>

                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {subject.description}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditModal(subject)}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                title="Edit subject"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(subject)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Delete subject"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredSubjects.map((subject) => {
                  const teacherNames = getTeachersForSubject(subject.id);
                  return (
                    <div
                      key={subject.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {subject.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {subject.code}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {subject.description}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <span className="font-medium">Teacher(s): </span>
                            {teacherNames.length > 0
                              ? teacherNames.join(', ')
                              : 'Unassigned'}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => openEditModal(subject)}
                            className="p-2 text-gray-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(subject)}
                            className="p-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingSubject ? 'Edit Subject' : 'Add Subject'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingSubject(null);
                }}
                className="text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject Name *
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
                  Subject Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* You kept grade_levels in state — not rendering inputs for them to keep UI same */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSubject(null);
                    setFormData({
                      name: '',
                      code: '',
                      description: '',
                      grade_levels: [],
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrUpdateSubject}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSubject ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal (supports multiple teacher selection) */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Assign Teacher(s)
              </h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <select
                  value={assignData.subject_id}
                  onChange={(e) =>
                    setAssignData({ ...assignData, subject_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Class (optional)
                </label>
                <select
                  value={assignData.class_id}
                  onChange={(e) =>
                    setAssignData({ ...assignData, class_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">(No specific class)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to assign teacher(s) at subject level (not tied to
                  a specific class).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teacher(s) *
                </label>

                {/* multiple select for teachers */}
                <select
                  multiple
                  value={assignData.teacher_ids}
                  onChange={(e) => {
                    const selected: string[] = Array.from(
                      e.target.selectedOptions
                    ).map((opt) => opt.value);
                    setAssignData({ ...assignData, teacher_ids: selected });
                  }}
                  className="w-full h-36 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} {t.email ? `— ${t.email}` : ''}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl (Cmd on Mac) / Shift to select multiple or use
                  checkboxes in supported UIs.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setAssignData({
                      subject_id: '',
                      class_id: '',
                      teacher_ids: [],
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTeacher}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (form style) */}
      {showDeleteModal && deletingSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delete Subject
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  This will remove the subject and unassign it from classes.
                  This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingSubject(null);
                }}
                className="text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="font-medium text-gray-900 dark:text-white">
                  {deletingSubject.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {deletingSubject.code}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingSubject(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
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
