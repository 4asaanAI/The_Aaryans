import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { RightSidebar } from '../../components/dashboard/RightSidebar';
import { MoreVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function HeadDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0
  });

  useEffect(() => {
    fetchStats();
    fetchAttendanceData();
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

  const fetchAttendanceData = async () => {
    try {
      const { error } = await supabase
        .from('attendance')
        .select('date, status')
        .gte('date', new Date(new Date().getFullYear(), 0, 1).toISOString())
        .order('date');

      if (error) throw error;
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const studentDistribution = [
    { name: 'Boys', value: 55 },
    { name: 'Girls', value: 45 }
  ];

  const financeData = [
    { month: 'Jan', revenue: 65, profit: 33, costs: 32 },
    { month: 'Feb', revenue: 68, profit: 33, costs: 35 },
    { month: 'Mar', revenue: 72, profit: 34, costs: 38 },
    { month: 'Apr', revenue: 69, profit: 33, costs: 36 },
    { month: 'May', revenue: 75, profit: 35, costs: 40 },
    { month: 'Jun', revenue: 78, profit: 36, costs: 42 }
  ];

  const attendanceData = [
    { month: 'Jan', rate: 92 },
    { month: 'Feb', rate: 88 },
    { month: 'Mar', rate: 90 },
    { month: 'Apr', rate: 85 },
    { month: 'May', rate: 89 },
    { month: 'Jun', rate: 91 }
  ];

  const COLORS = ['#3B82F6', '#EC4899'];

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Academic Year 2024/25</h2>
          </div>
            <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-400 rounded-2xl p-5">
              <div className="flex justify-end items-start mb-4">
                <button className="text-white opacity-70 hover:opacity-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="text-3xl font-semibold mb-1 text-white">{stats.totalStudents.toLocaleString()}</div>
              <div className="text-blue-50 text-sm font-medium">Students</div>
            </div>

            <div className="bg-blue-300 rounded-2xl p-5">
              <div className="flex justify-end items-start mb-4">
                <button className="text-white opacity-70 hover:opacity-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="text-3xl font-semibold mb-1 text-white">{stats.totalTeachers.toLocaleString()}</div>
              <div className="text-blue-50 text-sm font-medium">Teachers</div>
            </div>

            <div className="bg-blue-400 rounded-2xl p-5">
              <div className="flex justify-end items-start mb-4">
                <button className="text-white opacity-70 hover:opacity-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="text-3xl font-semibold mb-1 text-white">{stats.totalStaff.toLocaleString()}</div>
              <div className="text-blue-50 text-sm font-medium">Staffs</div>
            </div>
          </div>

          {/* Row 1: Attendance and Students side by side */}
          <div className="grid grid-cols-2 gap-5">
            {/* Attendance Chart */}
            <div className="bg-white rounded-2xl p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold">Attendance</h3>
                <button className="text-gray-400">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[300px] bg-gray-50 rounded-xl flex flex-col items-center justify-center p-4">
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: "#10B981" }} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600">Attendance Rate (%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Distribution Chart */}
            <div className="bg-white rounded-2xl p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold">Students</h3>
                <button className="text-gray-400">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[300px] bg-gray-50 rounded-xl flex flex-col items-center justify-center">
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
                <div className="text-xs mt-2 text-gray-500">
                  <div>Boys: 55% | Girls: 45%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Finance Chart - Full Width */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">Finance</h3>
              <button className="text-gray-400">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[300px] bg-gray-50 rounded-xl flex flex-col items-center justify-center p-4">
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={financeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="costs" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">Profit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">Costs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RightSidebar />
      </div>
    </DashboardLayout>
  );
}
