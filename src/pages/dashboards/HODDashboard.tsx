import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import {
  BookOpen,
  Users,
  FileText,
  Calendar,
  ClipboardList,
  Bell,
  Award,
  UserCheck,
  MapPin,
  CalendarDays,
  Clipboard,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function HODDashboard() {
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
            <p className="text-sm text-blue-800 font-medium">Department Access</p>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Link to="/dashboard/subjects" className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Department Subjects</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/teachers" className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Department Teachers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
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
                  <p className="text-sm font-medium text-gray-600">Department Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">156</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/classes" className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Classes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">6</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link to="/dashboard/exams" className="block">
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3 hover:shadow-md transition">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Upcoming Exams</p>
                <p className="font-medium text-gray-900">3 next week</p>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/results" className="block">
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3 hover:shadow-md transition">
              <Award className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Pending Results</p>
                <p className="font-medium text-gray-900">7 awaiting</p>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/timetable" className="block">
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3 hover:shadow-md transition">
              <CalendarDays className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Timetable Entries</p>
                <p className="font-medium text-gray-900">42 slots</p>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/announcements" className="block">
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3 hover:shadow-md transition">
              <Bell className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-xs text-gray-500">Announcements</p>
                <p className="font-medium text-gray-900">4 active</p>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/events" className="block">
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3 hover:shadow-md transition">
              <MapPin className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Events</p>
                <p className="font-medium text-gray-900">2 upcoming</p>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/assignments" className="block">
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3 hover:shadow-md transition">
              <Clipboard className="h-6 w-6 text-teal-600" />
              <div>
                <p className="text-xs text-gray-500">Assignments</p>
                <p className="font-medium text-gray-900">5 active</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Department Management Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Department Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/dashboard/subjects"
              className="px-4 py-3 text-left text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 block"
            >
              Manage Subjects
            </Link>

            <Link
              to="/dashboard/subjects"
              className="px-4 py-3 text-left text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 block"
            >
              Assign Coordinators
            </Link>

            <Link to="/dashboard/timetable">
              <button className="px-4 py-3 text-left text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100">
                Department Timetable
              </button>
            </Link>

            <Link to="/dashboard/reports">
              <button className="px-4 py-3 text-left text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100">
                Performance Reports
              </button>
            </Link>

            <Link to="/dashboard/announcements" className="block">
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
                Publish Announcement
              </button>
            </Link>

            <Link to="/dashboard/attendance" className="block">
              <button className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
                Mark Attendance
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Activity / Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Recent Exams</h3>
            <ul className="space-y-3">
              <li className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">Calculus Midterm</p>
                  <p className="text-xs text-gray-500">Nov 29, 2025 — Class 12A</p>
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </li>

              <li className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">Physics Quiz</p>
                  <p className="text-xs text-gray-500">Nov 25, 2025 — Class 11B</p>
                </div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </li>
            </ul>
            <div className="mt-4">
              <Link to="/dashboard/exams" className="text-sm text-blue-600 font-medium">View all exams →</Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Recent Announcements</h3>
            <ul className="space-y-3">
              <li>
                <p className="font-medium text-gray-900">Semester break schedule</p>
                <p className="text-xs text-gray-500">Published Nov 11, 2025</p>
              </li>
              <li>
                <p className="font-medium text-gray-900">Exam centre allocation</p>
                <p className="text-xs text-gray-500">Published Nov 9, 2025</p>
              </li>
            </ul>
            <div className="mt-4">
              <Link to="/dashboard/announcements" className="text-sm text-blue-600 font-medium">Manage announcements →</Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
