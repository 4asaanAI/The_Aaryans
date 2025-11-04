import { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Users, BookOpen, Calendar, DollarSign, Settings, UserCheck, Bell, FileText } from 'lucide-react';

export function PrincipalDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'staff' | 'classes' | 'finance'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'staff', label: 'Staff', icon: UserCheck },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'finance', label: 'Finance', icon: DollarSign }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Principal Dashboard</h1>
            <p className="text-sm text-gray-600">Full CRUD access to school management</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <p className="text-sm text-green-800 font-medium">Full Access</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Students</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">523</p>
                      </div>
                      <Users className="h-12 w-12 text-blue-600 opacity-20" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Staff Members</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">48</p>
                      </div>
                      <UserCheck className="h-12 w-12 text-green-600 opacity-20" />
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Active Classes</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">24</p>
                      </div>
                      <Calendar className="h-12 w-12 text-purple-600 opacity-20" />
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">This Month</p>
                        <p className="text-3xl font-bold text-orange-900 mt-2">$45.2K</p>
                      </div>
                      <DollarSign className="h-12 w-12 text-orange-600 opacity-20" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                      <Settings className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-3 text-left text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        Add New Student
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        Add Staff Member
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        Create Class
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                        Generate Report
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Recent Activities</h3>
                      <Bell className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-0">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">New student enrollment approved</p>
                            <p className="text-xs text-gray-500">{i} hour ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Student Management</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Student
                  </button>
                </div>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Student management module</p>
                  <p className="text-sm text-gray-500 mt-2">View, add, edit, and manage students</p>
                </div>
              </div>
            )}

            {activeTab === 'staff' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Staff Management</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Staff
                  </button>
                </div>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Staff management module</p>
                  <p className="text-sm text-gray-500 mt-2">View, add, edit, and manage staff members</p>
                </div>
              </div>
            )}

            {activeTab === 'classes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Class Management</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Create Class
                  </button>
                </div>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Class management module</p>
                  <p className="text-sm text-gray-500 mt-2">Create, edit classes and assign teachers</p>
                </div>
              </div>
            )}

            {activeTab === 'finance' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Finance Management</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Fee Record
                  </button>
                </div>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Finance management module</p>
                  <p className="text-sm text-gray-500 mt-2">Track fees, payments, and financial reports</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
