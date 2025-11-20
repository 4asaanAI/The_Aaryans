import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { BookOpen, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HODDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Department Subjects
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Department Teachers
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Department Students
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">156</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Department Management Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Department Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Redirects to Subjects Page */}
            <Link
              to="/dashboard/subjects"
              className="px-4 py-3 text-left text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 block"
            >
              Manage Subjects
            </Link>

            {/* Same target as requested */}
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

            <button className="px-4 py-3 text-left text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100">
              Performance Reports
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity / Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Recent Exams
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">Calculus Midterm</p>
                <p className="text-xs text-gray-500">
                  Nov 29, 2025 — Class 12A
                </p>
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </li>

            <li className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">Physics Quiz</p>
                <p className="text-xs text-gray-500">
                  Nov 25, 2025 — Class 11B
                </p>
              </div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </li>
          </ul>
          <div className="mt-4">
            <Link
              to="/dashboard/exams"
              className="text-sm text-blue-600 font-medium"
            >
              View all exams →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Recent Announcements
          </h3>
          <ul className="space-y-3">
            <li>
              <p className="font-medium text-gray-900">
                Semester break schedule
              </p>
              <p className="text-xs text-gray-500">Published Nov 11, 2025</p>
            </li>
            <li>
              <p className="font-medium text-gray-900">
                Exam centre allocation
              </p>
              <p className="text-xs text-gray-500">Published Nov 9, 2025</p>
            </li>
          </ul>
          <div className="mt-4">
            <Link
              to="/dashboard/announcements"
              className="text-sm text-blue-600 font-medium"
            >
              Manage announcements →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
