import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Search, Calendar, BookOpen, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  total_marks: number;
  created_at: string;
  class?: { name: string };
  subject?: { name: string; code: string };
  teacher?: { full_name: string };
}

export function AssignmentsPage() {
  const { theme } = useTheme();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isDark = theme === 'dark';
  const chartColors = {
    text: isDark ? '#e5e7eb' : '#374151',
    grid: isDark ? '#374151' : '#e5e7eb',
    tooltip: isDark ? '#1f2937' : '#ffffff'
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          class:classes(name),
          subject:subjects(name, code),
          teacher:profiles!assignments_teacher_id_fkey(full_name)
        `)
        .order('due_date', { ascending: false });

      if (error) throw error;

      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.subject?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.class?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const classPerformanceData = [
    { class: 'Class 1', avgScore: 85, submissions: 28, totalStudents: 30 },
    { class: 'Class 2', avgScore: 78, submissions: 25, totalStudents: 30 },
    { class: 'Class 3', avgScore: 92, submissions: 29, totalStudents: 30 },
    { class: 'Class 4', avgScore: 88, submissions: 27, totalStudents: 30 },
    { class: 'Class 5', avgScore: 76, submissions: 24, totalStudents: 30 }
  ];

  const submissionTrendData = [
    { week: 'Week 1', submitted: 120, pending: 30, late: 10 },
    { week: 'Week 2', submitted: 135, pending: 20, late: 5 },
    { week: 'Week 3', submitted: 140, pending: 15, late: 8 },
    { week: 'Week 4', submitted: 145, pending: 10, late: 12 }
  ];

  const statusDistribution = [
    { name: 'Completed', value: 75, color: '#10B981' },
    { name: 'Pending', value: 15, color: '#F59E0B' },
    { name: 'Late', value: 10, color: '#EF4444' }
  ];

  const getOverallStats = () => {
    const totalAssignments = assignments.length;
    const avgCompletion = 82;
    const onTimeSubmissions = 88;
    const avgScore = 85;

    return { totalAssignments, avgCompletion, onTimeSubmissions, avgScore };
  };

  const stats = getOverallStats();

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage assignment performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-blue-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Assignments</span>
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalAssignments}</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">Active this term</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-green-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Completion</span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.avgCompletion}%</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">+5% from last month</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-orange-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">On-Time Rate</span>
              <CheckCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.onTimeSubmissions}%</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">+3% from last month</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-purple-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Score</span>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.avgScore}%</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">+2% from last month</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Class-wise Performance Analysis
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="class" stroke={chartColors.text} />
                  <YAxis stroke={chartColors.text} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltip,
                      border: `1px solid ${chartColors.grid}`,
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: chartColors.text }}
                  />
                  <Legend wrapperStyle={{ color: chartColors.text }} />
                  <Bar dataKey="avgScore" fill="#3B82F6" name="Avg Score %" />
                  <Bar dataKey="submissions" fill="#10B981" name="Submissions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Submission Status
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltip,
                      border: `1px solid ${chartColors.grid}`,
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Submission Trends (Last 4 Weeks)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={submissionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="week" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltip,
                    border: `1px solid ${chartColors.grid}`,
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: chartColors.text }}
                />
                <Legend wrapperStyle={{ color: chartColors.text }} />
                <Line type="monotone" dataKey="submitted" stroke="#10B981" strokeWidth={3} name="Submitted" />
                <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={3} name="Pending" />
                <Line type="monotone" dataKey="late" stroke="#EF4444" strokeWidth={3} name="Late" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">All Assignments</h3>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No assignments found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search' : 'No assignments have been created yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Class</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Teacher</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Due Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total Marks</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{assignment.title}</p>
                          {assignment.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                              {assignment.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {assignment.class?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {assignment.subject?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {assignment.teacher?.full_name || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {assignment.total_marks}
                      </td>
                      <td className="py-3 px-4">
                        {isOverdue(assignment.due_date) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                            <Clock className="h-3 w-3" />
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
