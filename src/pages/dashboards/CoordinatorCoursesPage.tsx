import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BookOpen, Users, Calendar } from 'lucide-react';

interface Course {
  id: string;
  subject_id: string;
  class_id: string | null;
  subject?: {
    id: string;
    name: string;
    code: string;
    description: string;
  };
  class?: {
    id: string;
    name: string;
    grade_level: number;
    section: string;
  };
}

export function CoordinatorCoursesPage() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchMyCourses();
    }
  }, [profile]);

  const fetchMyCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('class_subjects')
        .select(`
          id,
          subject_id,
          class_id,
          subject:subjects!class_subjects_subject_id_fkey(id, name, code, description),
          class:classes!class_subjects_class_id_fkey(id, name, grade_level, section)
        `)
        .eq('teacher_id', profile?.id);

      if (error) throw error;

      const formattedCourses = (data || []).map((item: any) => ({
        id: item.id,
        subject_id: item.subject_id,
        class_id: item.class_id,
        subject: Array.isArray(item.subject) ? item.subject[0] : item.subject,
        class: Array.isArray(item.class) ? item.class[0] : item.class,
      }));

      setCourses(formattedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Courses
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Subjects assigned to you by HOD
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No courses assigned yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your HOD will assign subjects to you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                    Active
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {course.subject?.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Code: {course.subject?.code}
                </p>

                {course.subject?.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 line-clamp-2">
                    {course.subject.description}
                  </p>
                )}

                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {course.class ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>
                        Class: {course.class.name} (Grade {course.class.grade_level}-
                        {course.class.section})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>General Assignment</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
