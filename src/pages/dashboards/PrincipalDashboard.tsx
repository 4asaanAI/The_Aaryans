import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { MoreVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function PrincipalDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [students, teachers] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student').eq('status', 'active'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'professor')
      ]);

      setStats({
        totalStudents: students.count || 0,
        totalTeachers: teachers.count || 0,
        totalStaff: (teachers.count || 0) + 15
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const attendanceData = [
    { day: 'Mon', value: 92 },
    { day: 'Tue', value: 95 },
    { day: 'Wed', value: 88 },
    { day: 'Thu', value: 94 },
    { day: 'Fri', value: 90 }
  ];

  const studentDistribution = [
    { name: 'Boys', value: 55 },
    { name: 'Girls', value: 45 }
  ];

  const financeData = [
    { month: 'Jan', income: 45, expense: 32 },
    { month: 'Feb', income: 48, expense: 35 },
    { month: 'Mar', income: 52, expense: 38 },
    { month: 'Apr', income: 49, expense: 36 },
    { month: 'May', income: 55, expense: 40 }
  ];

  const COLORS = ['#3B82F6', '#EC4899'];

  return (
    <DashboardLayout>
      {/* Dashboard Grid - 2fr 1fr */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column - 2fr */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-purple-400 rounded-2xl p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-white text-green-600 text-xs font-semibold rounded-full">2024/25</span>
                <button className="text-gray-700">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="text-3xl font-semibold mb-1">{stats.totalStudents.toLocaleString()}</div>
              <div className="text-gray-700 text-sm font-medium">Students</div>
            </div>

            <div className="bg-yellow-300 rounded-2xl p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-white text-green-600 text-xs font-semibold rounded-full">2024/25</span>
                <button className="text-gray-700">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="text-3xl font-semibold mb-1">{stats.totalTeachers.toLocaleString()}</div>
              <div className="text-gray-700 text-sm font-medium">Teachers</div>
            </div>

            <div className="bg-purple-400 rounded-2xl p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-white text-green-600 text-xs font-semibold rounded-full">2024/25</span>
                <button className="text-gray-700">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="text-3xl font-semibold mb-1">{stats.totalStaff.toLocaleString()}</div>
              <div className="text-gray-700 text-sm font-medium">Staffs</div>
            </div>
          </div>

          {/* Charts Row - 1fr 2fr */}
          <div className="grid grid-cols-3 gap-5">
            {/* Student Distribution Chart */}
            <div className="bg-white rounded-2xl p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold">Students</h3>
                <button className="text-gray-400">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[300px] bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={studentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {studentDistribution.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-xs mt-2">
                  <div>Boys: 55% | Girls: 45%</div>
                </div>
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="col-span-2 bg-white rounded-2xl p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold">Attendance</h3>
                <button className="text-gray-400">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Finance Chart */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">Finance</h3>
              <button className="text-gray-400">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#10B981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="#EF4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column - 1fr */}
        <div className="space-y-5">
          {/* Calendar */}
          <div className="bg-white rounded-2xl p-5">
            <div className="h-[250px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
              📅 Calendar - November 2025
            </div>
          </div>

          {/* Events */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">Events</h3>
              <button className="text-gray-400">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 border-2 border-gray-100 border-t-4 border-t-sky-400 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700 text-sm">lorem ipsum dolor</span>
                  <span className="text-xs text-gray-300">12:00 PM - 02:00 PM</span>
                </div>
                <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet.</p>
              </div>

              <div className="p-4 border-2 border-gray-100 border-t-4 border-t-purple-400 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700 text-sm">lorem ipsum dolor</span>
                  <span className="text-xs text-gray-300">12:00 PM - 02:00 PM</span>
                </div>
                <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet.</p>
              </div>

              <div className="p-4 border-2 border-gray-100 border-t-4 border-t-sky-400 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700 text-sm">lorem ipsum dolor</span>
                  <span className="text-xs text-gray-300">12:00 PM - 02:00 PM</span>
                </div>
                <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet.</p>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">Announcements</h3>
              <span className="text-xs text-gray-400">View All</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-sky-100 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">Lorem ipsum dolor sit</span>
                  <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded">2025-01-01</span>
                </div>
                <p className="text-xs text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              </div>

              <div className="p-4 bg-purple-100 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">Lorem ipsum dolor sit</span>
                  <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded">2025-01-01</span>
                </div>
                <p className="text-xs text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              </div>

              <div className="p-4 bg-yellow-100 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">Lorem ipsum dolor sit</span>
                  <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded">2025-01-01</span>
                </div>
                <p className="text-xs text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
