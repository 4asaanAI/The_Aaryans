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

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    try {
      const [coursesRes, classesRes, timetableRes] = await Promise.all([
        supabase
          .from('class_subjects')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', profile?.id),
        supabase
          .from('classes')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('timetables')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', profile?.id),
      ]);

      setStats({
        courses: coursesRes.count || 0,
        classes: classesRes.count || 0,
        timetableEntries: timetableRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 px-4 sm:px-6 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coordinator Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Class and subject-level management</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg px-4 py-2">
            <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">Multi-Class Access</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.courses}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.classes}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Schedule</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.timetableEntries}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/dashboard/coordinator/courses"
              className="px-4 py-3 text-left text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              View My Courses
            </Link>
            <Link
              to="/dashboard/coordinator/timetable"
              className="px-4 py-3 text-left text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50"
            >
              Manage Timetables
            </Link>
            <Link
              to="/dashboard/coordinator/classes"
              className="px-4 py-3 text-left text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50"
            >
              Manage Classes
            </Link>
            <Link
              to="/dashboard/announcements"
              className="px-4 py-3 text-left text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50"
            >
              View Announcements
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
