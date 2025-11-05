import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Users, BookOpen, TrendingUp, Calendar, MoreVertical, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function HeadDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0
  });
  const [, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const attendanceData = [
    { day: 'Mon', present: 920, absent: 80 },
    { day: 'Tue', present: 950, absent: 50 },
    { day: 'Wed', present: 880, absent: 120 },
    { day: 'Thu', present: 940, absent: 60 },
    { day: 'Fri', present: 910, absent: 90 }
  ];

  const studentDistribution = [
    { name: 'Boys', value: 550 },
    { name: 'Girls', value: 450 }
  ];

  const financeData = [
    { month: 'Jan', income: 45000, expense: 32000 },
    { month: 'Feb', income: 48000, expense: 35000 },
    { month: 'Mar', income: 52000, expense: 38000 },
    { month: 'Apr', income: 49000, expense: 36000 },
    { month: 'May', income: 55000, expense: 40000 }
  ];

  const COLORS = ['#3B82F6', '#EC4899'];

  const events = [
    { title: 'Science Fair Preparation', time: '09:00 AM - 11:00 AM', description: 'Students showcase their innovative projects' },
    { title: 'Parent-Teacher Meeting', time: '02:00 PM - 05:00 PM', description: 'Quarterly academic performance review' },
    { title: 'Sports Day Practice', time: '03:30 PM - 05:00 PM', description: 'Athletic events preparation session' }
  ];

  const announcements = [
    { title: 'Mid-Term Examination Schedule Released', date: '2025-11-08', text: 'All students must check their exam timetable on the portal.' },
    { title: 'New Library Books Available', date: '2025-11-06', text: 'Over 500 new titles added to the school library collection.' },
    { title: 'Winter Break Schedule Update', date: '2025-11-05', text: 'School will remain closed from December 20th to January 5th.' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-white text-purple-600 text-xs font-semibold rounded-full">2024/25</span>
                <button className="text-white opacity-60 hover:opacity-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="text-4xl font-bold mb-1">{stats.totalStudents.toLocaleString()}</div>
              <div className="text-purple-100 font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Students
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-gray-900 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-white text-yellow-600 text-xs font-semibold rounded-full">2024/25</span>
                <button className="opacity-60 hover:opacity-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="text-4xl font-bold mb-1">{stats.totalTeachers.toLocaleString()}</div>
              <div className="text-gray-800 font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Teachers
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-white text-purple-600 text-xs font-semibold rounded-full">2024/25</span>
                <button className="text-white opacity-60 hover:opacity-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="text-4xl font-bold mb-1">{stats.totalStaff.toLocaleString()}</div>
              <div className="text-purple-100 font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Staff
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Students</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={studentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {studentDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">Boys: 550 (55%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span className="text-sm text-gray-600">Girls: 450 (45%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="present" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Finance</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={financeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="income" fill="#10B981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Events</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {events.map((event, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-l-4 ${
                    index % 2 === 0 ? 'border-blue-500 bg-blue-50/50' : 'border-purple-500 bg-purple-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <span className="text-xs text-gray-400">{event.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex justify-center items-center h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">November 2025</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <Eye className="h-4 w-4" />
              View All
            </button>
          </div>
          <div className="space-y-3">
            {announcements.map((announcement, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl ${
                  index === 0 ? 'bg-blue-50' : index === 1 ? 'bg-purple-50' : 'bg-yellow-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                  <span className="px-2 py-1 bg-white text-xs text-gray-600 rounded-md">{announcement.date}</span>
                </div>
                <p className="text-sm text-gray-600">{announcement.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full text-sm font-medium">
            <Eye className="h-4 w-4" />
            <span>Head - View Only Access</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
