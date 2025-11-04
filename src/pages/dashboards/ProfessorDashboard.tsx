import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { BookOpen, Users, Calendar, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { dummyGradesData, dummyAttendanceData } from '../../lib/seedData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function ProfessorDashboard() {
  const courses = [
    { id: 1, name: 'Data Structures', code: 'CS201', students: 45, schedule: 'Mon, Wed 10:00 AM' },
    { id: 2, name: 'Database Systems', code: 'CS301', students: 38, schedule: 'Tue, Thu 2:00 PM' },
    { id: 3, name: 'Web Development', code: 'CS302', students: 42, schedule: 'Mon, Wed 2:00 PM' }
  ];

  const attendanceData = dummyAttendanceData.byCourse.map(course => ({
    name: course.courseName.split(' ')[0],
    attendance: course.attendance
  }));

  const gradeDistribution = Object.entries(dummyGradesData.distribution).map(([grade, count]) => ({
    name: grade,
    value: count
  }));

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Professor Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your courses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">125</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{courses.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{dummyAttendanceData.overall}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Grade</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{dummyGradesData.gpa}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">My Courses</h2>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.name}</h3>
                      <p className="text-sm text-gray-500">{course.code}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {course.students} students
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.schedule}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Attendance by Course (Hardcoded)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2 text-center">Feature coming soon - Mark attendance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Grade Distribution (Hardcoded)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gradeDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2 text-center">Feature coming soon - Enter grades</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Classes</h2>
            <div className="space-y-3">
              {[
                { course: 'Data Structures', time: 'Today, 10:00 AM', room: 'Room 301' },
                { course: 'Database Systems', time: 'Tomorrow, 2:00 PM', room: 'Room 205' },
                { course: 'Web Development', time: 'Tomorrow, 2:00 PM', room: 'Room 308' }
              ].map((cls, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{cls.course}</p>
                    <p className="text-sm text-gray-500">{cls.time}</p>
                  </div>
                  <span className="text-sm text-gray-600">{cls.room}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Note</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Attendance and Grade entry features are currently under development and showing dummy data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}