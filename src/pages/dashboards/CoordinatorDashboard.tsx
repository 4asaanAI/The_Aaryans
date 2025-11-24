import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BookOpen, Users, Calendar } from 'lucide-react';

export function CoordinatorDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    classes: 0,
    timetableEntries: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;

    let mounted = true;
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const [coursesRes, classesRes, timetableRes] = await Promise.all([
          supabase
            .from('class_subjects')
            .select('id', { count: 'exact', head: true })
            .eq('teacher_id', profile.id),
          supabase
            .from('classes')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'active'),
          supabase
            .from('timetables')
            .select('id', { count: 'exact', head: true })
            .eq('teacher_id', profile.id),
        ]);

        // Log any individual query errors (helps debugging permissions / schema issues)
        if (coursesRes.error)
          console.error('coursesRes error:', coursesRes.error);
        if (classesRes.error)
          console.error('classesRes error:', classesRes.error);
        if (timetableRes.error)
          console.error('timetableRes error:', timetableRes.error);

        if (!mounted) return;

        setStats({
          courses: coursesRes?.count ?? 0,
          classes: classesRes?.count ?? 0,
          timetableEntries: timetableRes?.count ?? 0,
        });
      } catch (err: any) {
        console.error('Error fetching stats (Promise.all):', err);
        if (mounted) setError(err?.message ?? 'Failed to load stats');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, [profile?.id]); // depend on profile.id only

  return (
    <DashboardLayout>
      <div className="space-y-6 px-4 sm:px-6 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Coordinator Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Class and subject-level management
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg px-4 py-2">
            <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">
              Multi-Class Access
            </p>
          </div>
        </div>

        {loading && <div className="text-center p-4">Loading stats…</div>}

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/30 rounded">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  My Courses
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.courses}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Classes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.classes}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  My Schedule
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.timetableEntries}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
