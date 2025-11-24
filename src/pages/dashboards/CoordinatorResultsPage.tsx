import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Search, BookOpen, Target } from 'lucide-react';

interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  grade: string;
  remarks: string;
  exam?: {
    id: string;
    name: string;
    exam_code: string;
    total_marks: number;
    passing_marks: number;
    exam_type: string;
    exam_date: string;
  };
  student?: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface SubjectStats {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  total_exams: number;
  total_students: number;
  average_marks: number;
}

export function CoordinatorResultsPage() {
  const { profile } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [stats, setStats] = useState<SubjectStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  useEffect(() => {
    if (profile?.id) {
      fetchMyResults();
      fetchStats();
    }
  }, [profile, selectedSubject]);

  const fetchMyResults = async () => {
    try {
      const { data: mySubjects, error: subjectsError } = await supabase
        .from('class_subjects')
        .select('subject_id')
        .eq('teacher_id', profile?.id);

      if (subjectsError) throw subjectsError;

      const subjectIds = mySubjects?.map((s) => s.subject_id) || [];

      if (subjectIds.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      let examQuery = supabase
        .from('exams')
        .select('id')
        .in('subject_id', subjectIds);

      if (selectedSubject) {
        examQuery = examQuery.eq('subject_id', selectedSubject);
      }

      const { data: exams, error: examsError } = await examQuery;

      if (examsError) throw examsError;

      const examIds = exams?.map((e) => e.id) || [];

      if (examIds.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          exam:exams(id, name, exam_code, total_marks, passing_marks, exam_type, exam_date),
          student:profiles!results_student_id_fkey(id, full_name, email)
        `)
        .in('exam_id', examIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedResults = (data || []).map((item: any) => ({
        ...item,
        exam: Array.isArray(item.exam) ? item.exam[0] : item.exam,
        student: Array.isArray(item.student) ? item.student[0] : item.student,
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: mySubjects, error: subjectsError } = await supabase
        .from('class_subjects')
        .select(`
          subject_id,
          subject:subjects(id, name, code)
        `)
        .eq('teacher_id', profile?.id);

      if (subjectsError) throw subjectsError;

      const subjectStats: SubjectStats[] = [];

      for (const item of mySubjects || []) {
        const subjectData = Array.isArray(item.subject) ? item.subject[0] : item.subject;

        const { count: examCount } = await supabase
          .from('exams')
          .select('id', { count: 'exact', head: true })
          .eq('subject_id', item.subject_id);

        const { data: exams } = await supabase
          .from('exams')
          .select('id')
          .eq('subject_id', item.subject_id);

        const examIds = exams?.map((e) => e.id) || [];

        let totalMarks = 0;
        let totalResults = 0;

        if (examIds.length > 0) {
          const { data: resultsData } = await supabase
            .from('results')
            .select('marks_obtained')
            .in('exam_id', examIds);

          totalMarks = resultsData?.reduce((sum, r) => sum + r.marks_obtained, 0) || 0;
          totalResults = resultsData?.length || 0;
        }

        subjectStats.push({
          subject_id: item.subject_id,
          subject_name: subjectData?.name || 'Unknown',
          subject_code: subjectData?.code || 'N/A',
          total_exams: examCount || 0,
          total_students: totalResults,
          average_marks: totalResults > 0 ? totalMarks / totalResults : 0,
        });
      }

      setStats(subjectStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredResults = results.filter(
    (result) =>
      result.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.exam?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'D':
      case 'F':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Results</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View exam results for subjects assigned to you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.subject_id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                {stat.subject_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {stat.subject_code}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Exams</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stat.total_exams}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Results</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stat.total_students}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Avg Marks</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stat.average_marks.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student or exam..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Subjects</option>
              {stats.map((stat) => (
                <option key={stat.subject_id} value={stat.subject_id}>
                  {stat.subject_name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                There are no exam results for your assigned subjects.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Student
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Exam
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Marks
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Grade
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result) => (
                      <tr
                        key={result.id}
                        className="border-b border-gray-100 dark:border-gray-700"
                      >
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {result.student?.full_name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {result.exam?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {result.marks_obtained} / {result.exam?.total_marks || 0}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getGradeColor(result.grade)}`}>
                            {result.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {result.exam?.exam_date
                            ? new Date(result.exam.exam_date).toLocaleDateString()
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="font-semibold text-gray-900 dark:text-white mb-2">
                      {result.student?.full_name || 'Unknown'}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="text-gray-600 dark:text-gray-400">
                        Exam: {result.exam?.name || 'N/A'}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Marks: {result.marks_obtained} / {result.exam?.total_marks || 0}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">Grade:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Date: {result.exam?.exam_date
                          ? new Date(result.exam.exam_date).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
