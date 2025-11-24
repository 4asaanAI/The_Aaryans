import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, MapPin, Target, BookOpen, Users } from 'lucide-react';

interface Exam {
  id: string;
  name: string;
  exam_code: string;
  exam_type: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  status: string;
  total_marks: number;
  passing_marks: number;
  duration_minutes: number;
  class_id: string | null;
  subject_id: string | null;
  instructions?: string;
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
}

export function CoordinatorExamsPage() {
  const { profile } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchMyExams();
    }
  }, [profile]);

  const fetchMyExams = async () => {
    try {
      const { data: mySubjects, error: subjectsError } = await supabase
        .from('class_subjects')
        .select('subject_id')
        .eq('teacher_id', profile?.id);

      if (subjectsError) throw subjectsError;

      const subjectIds = mySubjects?.map((s) => s.subject_id) || [];

      if (subjectIds.length === 0) {
        setExams([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          class:classes(id, name, grade_level, section),
          subject:subjects(id, name, code)
        `)
        .in('subject_id', subjectIds)
        .order('exam_date', { ascending: false });

      if (error) throw error;

      const formattedExams = (data || []).map((item: any) => ({
        ...item,
        class: Array.isArray(item.class) ? item.class[0] : item.class,
        subject: Array.isArray(item.subject) ? item.subject[0] : item.subject,
      }));

      setExams(formattedExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'ongoing':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'midterm':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      case 'final':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200';
      case 'quiz':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Exams</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View exams for subjects assigned to you
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : exams.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No exams found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              There are no exams scheduled for your assigned subjects.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedExam(exam)}
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {exam.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(exam.exam_type)}`}>
                        {exam.exam_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <BookOpen className="h-4 w-4" />
                        <span>{exam.subject?.name || 'N/A'} ({exam.subject?.code || 'N/A'})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{exam.class?.name || 'All Classes'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{exam.start_time} - {exam.end_time}</span>
                      </div>
                      {exam.venue && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{exam.venue}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Target className="h-4 w-4" />
                        <span>{exam.total_marks} marks (Pass: {exam.passing_marks})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedExam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedExam.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Code: {selectedExam.exam_code}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedExam(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedExam.status)}`}>
                    {selectedExam.status}
                  </span>
                  <span className={`px-3 py-1 text-sm rounded-full ${getTypeColor(selectedExam.exam_type)}`}>
                    {selectedExam.exam_type}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Subject
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {selectedExam.subject?.name} ({selectedExam.subject?.code})
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Class
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {selectedExam.class?.name || 'All Classes'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Date
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {new Date(selectedExam.exam_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Time
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {selectedExam.start_time} - {selectedExam.end_time}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Duration
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {selectedExam.duration_minutes} minutes
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Venue
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {selectedExam.venue || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Total Marks
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {selectedExam.total_marks}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Passing Marks
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {selectedExam.passing_marks}
                    </div>
                  </div>
                </div>

                {selectedExam.instructions && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Instructions
                    </div>
                    <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {selectedExam.instructions}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedExam(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
