import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, X, Clock } from 'lucide-react';

interface TimetableEntry {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number: string | null;
  class?: any;
  subject?: any;
  teacher?: any;
}

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function TimetablePage() {
  const { profile } = useAuth();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    teacher_id: '',
    day_of_week: 1,
    start_time: '',
    end_time: '',
    room_number: '',
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (
      profile?.role === 'admin' &&
      profile.sub_role === 'hod' &&
      profile.department_id
    ) {
      fetchTimetable();
      fetchSubjects();
      fetchClasses();
    }
  }, [profile]);

  useEffect(() => {
    if (formData.subject_id && formData.class_id) {
      fetchAvailableTeachers();
    } else {
      setAvailableTeachers([]);
      setFormData((prev) => ({ ...prev, teacher_id: '' }));
    }
  }, [formData.subject_id, formData.class_id]);

  // --- Fetch timetable only for class+subject pairs assigned to this HOD (hod_ids contains profile.id) ---
  const fetchTimetable = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      if (profile.role === 'professor') {
        const { data, error } = await supabase
          .from('timetables')
          .select(
            `
            *,
            class:classes(id, name, grade_level, section),
            subject:subjects(id, name, code, department_id),
            teacher:profiles(id, full_name)
          `
          )
          .eq('teacher_id', profile.id)
          .order('day_of_week')
          .order('start_time');

        if (error) throw error;

        const rawTimetables: TimetableEntry[] = (data || []).map((row: any) => ({
          id: row.id,
          class_id: row.class_id,
          subject_id: row.subject_id,
          teacher_id: row.teacher_id ?? null,
          day_of_week: row.day_of_week,
          start_time: row.start_time,
          end_time: row.end_time,
          room_number: row.room_number ?? null,
          class: Array.isArray(row.class) ? row.class[0] : row.class,
          subject: Array.isArray(row.subject) ? row.subject[0] : row.subject,
          teacher: Array.isArray(row.teacher) ? row.teacher[0] : row.teacher,
        }));

        setTimetable(rawTimetables);
        setLoading(false);
        return;
      }

      if (!profile?.department_id) return;

      const { data: hodSubjects, error: subjErr } = await supabase
        .from('subjects')
        .select('id')
        .eq('created_by', profile.id);

      if (subjErr) throw subjErr;

      const subjectIds = hodSubjects?.map(s => s.id).filter(Boolean) || [];

      if (subjectIds.length === 0) {
        setTimetable([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('timetables')
        .select(
          `
          *,
          class:classes(id, name, grade_level, section),
          subject:subjects(id, name, code, department_id),
          teacher:profiles(id, full_name)
        `
        )
        .in('subject_id', subjectIds)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;

      const rawTimetables: TimetableEntry[] = (data || []).map((row: any) => ({
        id: row.id,
        class_id: row.class_id,
        subject_id: row.subject_id,
        teacher_id: row.teacher_id ?? null,
        day_of_week: row.day_of_week,
        start_time: row.start_time,
        end_time: row.end_time,
        room_number: row.room_number ?? null,
        class: Array.isArray(row.class) ? row.class[0] : row.class,
        subject: Array.isArray(row.subject) ? row.subject[0] : row.subject,
        teacher: Array.isArray(row.teacher) ? row.teacher[0] : row.teacher,
      }));

      setTimetable(rawTimetables);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    if (profile?.role === 'professor') {
      try {
        const { data: csData } = await supabase
          .from('class_subjects')
          .select('subject_id')
          .eq('teacher_id', profile.id);

        const subjectIds = csData?.map(cs => cs.subject_id).filter(Boolean) || [];

        if (subjectIds.length === 0) {
          setSubjects([]);
          return;
        }

        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .in('id', subjectIds)
          .order('name');

        if (error) throw error;
        setSubjects(data || []);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
      return;
    }

    if (!profile?.department_id) return;
    try {
      if (profile.role === 'admin' && profile.sub_role === 'hod') {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('created_by', profile.id)
          .order('name');
        if (error) throw error;
        setSubjects(data || []);
        return;
      }

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('department_id', profile.department_id)
        .order('name');
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      if (profile?.role === 'professor') {
        const { data: csData } = await supabase
          .from('class_subjects')
          .select('class_id')
          .eq('teacher_id', profile.id);

        const classIds = csData?.map(cs => cs.class_id).filter(Boolean) || [];

        const { data: classTeacherData } = await supabase
          .from('classes')
          .select('id')
          .eq('class_teacher_id', profile.id);

        const classTeacherIds = classTeacherData?.map(c => c.id) || [];
        const allClassIds = [...new Set([...classIds, ...classTeacherIds])];

        if (allClassIds.length === 0) {
          setClasses([]);
          return;
        }

        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .in('id', allClassIds)
          .eq('status', 'active')
          .order('grade_level, section');

        if (error) throw error;
        setClasses(data || []);
        return;
      }

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

  // Only teachers from class_subjects rows where hod_ids contains this HOD
  const fetchAvailableTeachers = async () => {
    if (!formData.subject_id || !formData.class_id || !profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('class_subjects')
        .select(
          `
          teacher_id,
          teacher:profiles!class_subjects_teacher_id_fkey(id, full_name)
        `
        )
        .eq('class_id', formData.class_id)
        .eq('subject_id', formData.subject_id)
        .contains('hod_ids', [profile.id])
        .not('teacher_id', 'is', null);

      if (error) throw error;

      const uniqueTeachers = (data || []).reduce((acc: any[], item: any) => {
        const teacher = Array.isArray(item.teacher)
          ? item.teacher[0]
          : item.teacher;
        if (teacher && !acc.find((t) => t.id === teacher.id)) acc.push(teacher);
        return acc;
      }, []);

      setAvailableTeachers(uniqueTeachers);
    } catch (error) {
      console.error('Error fetching available teachers:', error);
      setAvailableTeachers([]);
    }
  };

  const handleCreateEntry = async () => {
    if (
      !formData.class_id ||
      !formData.subject_id ||
      !formData.start_time ||
      !formData.end_time ||
      !profile?.id
    )
      return;
    try {
      const { error: timetableError } = await supabase
        .from('timetables')
        .insert({
          class_id: formData.class_id,
          subject_id: formData.subject_id,
          teacher_id: formData.teacher_id || null,
          day_of_week: formData.day_of_week,
          start_time: formData.start_time,
          end_time: formData.end_time,
          room_number: formData.room_number || null,
        });
      if (timetableError) throw timetableError;

      // ensure class_subjects exist and that this HOD is recorded in hod_ids
      const { data: existing, error: exErr } = await supabase
        .from('class_subjects')
        .select('*')
        .eq('class_id', formData.class_id)
        .eq('subject_id', formData.subject_id)
        .maybeSingle();

      if (exErr) throw exErr;

      if (existing) {
        // update: make sure hod_ids contains profile.id and update teacher_id
        // We'll set hod_ids to include the current HOD (overwrite may remove others; if you prefer append, change logic)
        const newHodIds = Array.isArray(existing.hod_ids)
          ? Array.from(new Set([...existing.hod_ids, profile.id]))
          : [profile.id];
        const { error: updateError } = await supabase
          .from('class_subjects')
          .update({
            hod_ids: newHodIds,
            teacher_id: formData.teacher_id || null,
          })
          .eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        // insert new class_subjects row and set hod_ids to include current HOD
        const { error: insertError } = await supabase
          .from('class_subjects')
          .insert({
            class_id: formData.class_id,
            subject_id: formData.subject_id,
            teacher_id: formData.teacher_id || null,
            hod_ids: [profile.id],
          });
        if (insertError) throw insertError;
      }

      setNotification({ type: 'success', message: 'Timetable entry created' });
      setShowCreateModal(false);
      setFormData({
        class_id: '',
        subject_id: '',
        teacher_id: '',
        day_of_week: 1,
        start_time: '',
        end_time: '',
        room_number: '',
      });
      fetchTimetable();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Error' });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      const { error } = await supabase.from('timetables').delete().eq('id', id);
      if (error) throw error;
      setNotification({ type: 'success', message: 'Entry deleted' });
      fetchTimetable();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Error' });
    }
  };

  const groupedByDay = timetable.reduce((acc, entry) => {
    if (!acc[entry.day_of_week]) acc[entry.day_of_week] = [];
    acc[entry.day_of_week].push(entry);
    return acc;
  }, {} as Record<number, TimetableEntry[]>);

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
              Department Timetable
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage department class schedules
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((day) => (
              <div
                key={day}
                className="bg-white dark:bg-gray-800 rounded-xl p-6"
              >
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {days[day]}
                </h2>
                {groupedByDay[day] && groupedByDay[day].length > 0 ? (
                  <div className="space-y-3">
                    {groupedByDay[day].map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Class
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {entry.class?.name}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Subject
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {entry.subject?.name}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Teacher
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {entry.teacher?.full_name || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Time
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {entry.start_time} - {entry.end_time}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No classes scheduled
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Timetable Entry
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
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
                  {days.slice(1, 6).map((day, idx) => (
                    <option key={idx} value={idx + 1}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
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
                      {c.name}
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
                    setFormData({
                      ...formData,
                      subject_id: e.target.value,
                      teacher_id: '',
                    })
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
                  Teacher
                </label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) =>
                    setFormData({ ...formData, teacher_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={
                    !formData.subject_id ||
                    !formData.class_id ||
                    availableTeachers.length === 0
                  }
                >
                  <option value="">
                    {!formData.subject_id || !formData.class_id
                      ? 'Select class and subject first'
                      : availableTeachers.length === 0
                      ? 'No teachers assigned to this subject'
                      : 'Select teacher'}
                  </option>
                  {availableTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
                {formData.subject_id &&
                  formData.class_id &&
                  availableTeachers.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      No teachers assigned to this subject. Assign teachers in
                      the Subjects tab first.
                    </p>
                  )}
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEntry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
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
