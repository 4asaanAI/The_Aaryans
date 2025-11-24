import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, X, Edit2, Clock } from 'lucide-react';

interface Timetable {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number: string | null;
  class?: {
    id: string;
    name: string;
    grade_level: number;
    section: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  teacher?: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface Class {
  id: string;
  name: string;
  grade_level: number;
  section: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function CoordinatorTimetablePage() {
  const { profile } = useAuth();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTimetable, setDeletingTimetable] = useState<Timetable | null>(null);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    teacher_id: '',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    room_number: '',
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (profile?.role === 'admin' && profile.sub_role === 'coordinator') {
      fetchClasses();
      fetchSubjects();
      fetchTeachers();
      fetchTimetables();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedClass || selectedDay !== null) {
      fetchTimetables();
    }
  }, [selectedClass, selectedDay]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, grade_level, section')
        .eq('status', 'active')
        .order('grade_level', { ascending: true })
        .order('section', { ascending: true });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('role', ['professor', 'admin'])
        .eq('approval_status', 'approved')
        .order('full_name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchTimetables = async () => {
    try {
      let query = supabase
        .from('timetables')
        .select(`
          *,
          class:classes(id, name, grade_level, section),
          subject:subjects(id, name, code),
          teacher:profiles(id, full_name, email)
        `)
        .order('start_time');

      if (selectedClass) {
        query = query.eq('class_id', selectedClass);
      }
      if (selectedDay !== null) {
        query = query.eq('day_of_week', selectedDay);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTimetables(data || []);
    } catch (error) {
      console.error('Error fetching timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateTimetable = async () => {
    if (!formData.class_id || !formData.subject_id || !formData.teacher_id) return;

    try {
      if (editingTimetable) {
        const { error } = await supabase
          .from('timetables')
          .update({
            class_id: formData.class_id,
            subject_id: formData.subject_id,
            teacher_id: formData.teacher_id,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time,
            room_number: formData.room_number || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTimetable.id);

        if (error) throw error;

        setNotification({
          type: 'success',
          message: 'Timetable entry updated successfully',
        });
        setEditingTimetable(null);
      } else {
        const { error } = await supabase.from('timetables').insert({
          class_id: formData.class_id,
          subject_id: formData.subject_id,
          teacher_id: formData.teacher_id,
          day_of_week: formData.day_of_week,
          start_time: formData.start_time,
          end_time: formData.end_time,
          room_number: formData.room_number || null,
        });

        if (error) throw error;

        setNotification({
          type: 'success',
          message: 'Timetable entry created successfully',
        });
      }

      setShowCreateModal(false);
      setFormData({
        class_id: '',
        subject_id: '',
        teacher_id: '',
        day_of_week: 1,
        start_time: '09:00',
        end_time: '10:00',
        room_number: '',
      });
      fetchTimetables();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Error' });
    }
  };

  const openEditModal = (tt: Timetable) => {
    setEditingTimetable(tt);
    setFormData({
      class_id: tt.class_id,
      subject_id: tt.subject_id,
      teacher_id: tt.teacher_id,
      day_of_week: tt.day_of_week,
      start_time: tt.start_time,
      end_time: tt.end_time,
      room_number: tt.room_number || '',
    });
    setShowCreateModal(true);
  };

  const openDeleteModal = (tt: Timetable) => {
    setDeletingTimetable(tt);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTimetable) return;
    try {
      const { error } = await supabase
        .from('timetables')
        .delete()
        .eq('id', deletingTimetable.id);

      if (error) throw error;

      setNotification({ type: 'success', message: 'Timetable entry deleted' });
      setShowDeleteModal(false);
      setDeletingTimetable(null);
      fetchTimetables();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Error' });
    }
  };

  const isMyTimetable = (teacherId: string) => {
    return teacherId === profile?.id;
  };

  if (profile?.role !== 'admin' || profile.sub_role !== 'coordinator') {
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
              Timetable
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage class schedules and teacher assignments
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTimetable(null);
              setFormData({
                class_id: '',
                subject_id: '',
                teacher_id: '',
                day_of_week: 1,
                start_time: '09:00',
                end_time: '10:00',
                room_number: '',
              });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade_level}-{c.section})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Day
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {DAYS.map((day, idx) => (
                  <option key={idx} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
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
                        Day
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Time
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Class
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Subject
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Teacher
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Room
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetables.map((tt) => {
                      const isMine = isMyTimetable(tt.teacher_id);
                      return (
                        <tr
                          key={tt.id}
                          className={`border-b border-gray-100 dark:border-gray-700 ${
                            isMine ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            {DAYS[tt.day_of_week]}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {tt.start_time} - {tt.end_time}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {tt.class?.name}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {tt.subject?.name}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {tt.teacher?.full_name}
                            {isMine && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                You
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {tt.room_number || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditModal(tt)}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(tt)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
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
                {timetables.map((tt) => {
                  const isMine = isMyTimetable(tt.teacher_id);
                  return (
                    <div
                      key={tt.id}
                      className={`border rounded-lg p-4 ${
                        isMine
                          ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {DAYS[tt.day_of_week]} - {tt.start_time} to {tt.end_time}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <div>Class: {tt.class?.name}</div>
                            <div>Subject: {tt.subject?.name}</div>
                            <div className="flex items-center gap-2">
                              Teacher: {tt.teacher?.full_name}
                              {isMine && (
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            {tt.room_number && <div>Room: {tt.room_number}</div>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => openEditModal(tt)}
                            className="p-2 text-gray-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(tt)}
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTimetable ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTimetable(null);
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
                    Class *
                  </label>
                  <select
                    value={formData.class_id}
                    onChange={(e) =>
                      setFormData({ ...formData, class_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.grade_level}-{c.section})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) =>
                      setFormData({ ...formData, subject_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teacher *
                </label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) =>
                    setFormData({ ...formData, teacher_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Day *
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        day_of_week: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {DAYS.map((day, idx) => (
                      <option key={idx} value={idx}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  value={formData.room_number}
                  onChange={(e) =>
                    setFormData({ ...formData, room_number: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTimetable(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrUpdateTimetable}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTimetable ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deletingTimetable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delete Timetable Entry
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingTimetable(null);
                }}
                className="text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="font-medium text-gray-900 dark:text-white">
                  {deletingTimetable.subject?.name} - {deletingTimetable.class?.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {DAYS[deletingTimetable.day_of_week]} {deletingTimetable.start_time} - {deletingTimetable.end_time}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingTimetable(null);
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
