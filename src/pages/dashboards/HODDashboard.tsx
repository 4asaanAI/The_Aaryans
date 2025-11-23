import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { BookOpen, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  created_at: string;
}

interface ExamRow {
  id: string;
  name: string;
  exam_code: string;
  exam_date: string;
  status: string;
  classes?: { name?: string } | null;
  subject?: { id?: string; name?: string } | null;
}

export function HODDashboard() {
  const { profile } = useAuth();

  const [subjectsCount, setSubjectsCount] = useState<number | null>(null);
  const [teachersCount, setTeachersCount] = useState<number | null>(null);
  const [studentsCount, setStudentsCount] = useState<number | null>(null);
  const [recentExams, setRecentExams] = useState<ExamRow[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    Announcement[]
  >([]);
  const [loading, setLoading] = useState({
    counts: true,
    exams: true,
    announcements: true,
  });

  useEffect(() => {
    // only run if user is HOD and department_id exists
    if (!profile || profile.sub_role !== 'hod' || !profile.department_id)
      return;

    fetchCounts();
    fetchRecentExams();
    fetchRecentAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const fetchCounts = async () => {
    setLoading((s) => ({ ...s, counts: true }));
    try {
      // subjects count for department
      const { count: subjCount, error: subjErr } = await supabase
        .from('subjects')
        .select('*', { head: true, count: 'exact' })
        .eq('department_id', profile!.department_id);
      if (subjErr) throw subjErr;

      // teachers & coordinators count in department (role in)
      const { count: teacherCnt, error: teacherErr } = await supabase
        .from('profiles')
        .select('*', { head: true, count: 'exact' })
        .eq('department_id', profile!.department_id)
        .in('role', ['professor', 'coordinator'])
        .eq('approval_status', 'approved');
      if (teacherErr) throw teacherErr;

      // students count in same department
      const { count: studentsCnt, error: studentErr } = await supabase
        .from('profiles')
        .select('*', { head: true, count: 'exact' })
        .eq('department_id', profile!.department_id)
        .eq('role', 'student')
        .eq('status', 'active');
      if (studentErr) throw studentErr;

      setSubjectsCount(subjCount || 0);
      setTeachersCount(teacherCnt || 0);
      setStudentsCount(studentsCnt || 0);
    } catch (err) {
      console.error('Error fetching counts for HOD dashboard:', err);
      setSubjectsCount(0);
      setTeachersCount(0);
      setStudentsCount(0);
    } finally {
      setLoading((s) => ({ ...s, counts: false }));
    }
  };

  const fetchRecentExams = async () => {
    setLoading((s) => ({ ...s, exams: true }));
    try {
      // get exams where subject belongs to this HOD department
      const { data, error } = await supabase
        .from('exams')
        .select(
          `
          id,
          name,
          exam_code,
          exam_date,
          status,
          classes:classes(name),
          subject:subjects!inner(id, name, department_id)
        `
        )
        .eq('subject.department_id', profile!.department_id)
        .order('exam_date', { ascending: false })
        .limit(5);

      if (error) throw error;

      setRecentExams((data || []) as ExamRow[]);
    } catch (err) {
      console.error('Error fetching recent exams for HOD dashboard:', err);
      setRecentExams([]);
    } finally {
      setLoading((s) => ({ ...s, exams: false }));
    }
  };

  const fetchRecentAnnouncements = async () => {
    setLoading((s) => ({ ...s, announcements: true }));
    try {
      // announcements for this department (or global 'all' — show both)
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, created_at')
        .or(`department_id.eq.${profile!.department_id},target_audience.eq.all`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setRecentAnnouncements((data || []) as Announcement[]);
    } catch (err) {
      console.error('Error fetching announcements for HOD dashboard:', err);
      setRecentAnnouncements([]);
    } finally {
      setLoading((s) => ({ ...s, announcements: false }));
    }
  };

  // if not HOD, keep the same DashboardLayout but show an access message
  if (!profile || profile.sub_role !== 'hod' || !profile.department_id) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h2 className="text-lg font-semibold">Access denied</h2>
          <p className="text-sm text-gray-600 mt-2">
            This page is for HODs only.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HOD Dashboard</h1>
            <p className="text-sm text-gray-600">Department-level management</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-sm text-blue-800 font-medium">
              Department Access
            </p>
          </div>
        </div>

        {/* Top KPI Cards (kept compact and consistent) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Link to="/dashboard/subjects" className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Department Subjects
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading.counts ? '—' : subjectsCount ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/subjects" className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Department Teachers
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading.counts ? '—' : teachersCount ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/students" className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Department Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading.counts ? '—' : studentsCount ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Systematic Recent Exams & Announcements section placed below KPI cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Exams */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">
                Recent Exams
              </h3>
              <Link
                to="/dashboard/exams"
                className="text-sm text-blue-600 font-medium"
              >
                View all exams →
              </Link>
            </div>

            {loading.exams ? (
              <div className="text-sm text-gray-500">Loading exams...</div>
            ) : recentExams.length === 0 ? (
              <div className="text-sm text-gray-500">
                No exams found for your department.
              </div>
            ) : (
              <ul className="space-y-3">
                {recentExams.map((ex) => (
                  <li key={ex.id} className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{ex.name}</p>
                      <p className="text-xs text-gray-500">
                        {ex.exam_date
                          ? new Date(ex.exam_date).toLocaleDateString()
                          : '—'}{' '}
                        {ex.classes?.name ? `— ${ex.classes.name}` : ''}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {ex.status}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Announcements */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">
                Recent Announcements
              </h3>
              <Link
                to="/dashboard/announcements"
                className="text-sm text-blue-600 font-medium"
              >
                Manage announcements →
              </Link>
            </div>

            {loading.announcements ? (
              <div className="text-sm text-gray-500">
                Loading announcements...
              </div>
            ) : recentAnnouncements.length === 0 ? (
              <div className="text-sm text-gray-500">
                No recent announcements.
              </div>
            ) : (
              <ul className="space-y-3">
                {recentAnnouncements.map((a) => (
                  <li key={a.id}>
                    <p className="font-medium text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-500">
                      Published {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
