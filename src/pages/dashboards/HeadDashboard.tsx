import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function HeadDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const allEvents = [
    { date: '2025-11-05', title: 'Science Fair Preparation', time: '09:00 AM - 11:00 AM', description: 'Students showcase their innovative projects' },
    { date: '2025-11-05', title: 'Parent-Teacher Meeting', time: '02:00 PM - 05:00 PM', description: 'Quarterly academic performance review' },
    { date: '2025-11-10', title: 'Sports Day Practice', time: '03:30 PM - 05:00 PM', description: 'Athletic events preparation session' },
    { date: '2025-11-15', title: 'Music Recital', time: '04:00 PM - 06:00 PM', description: 'Annual music performance by students' }
  ];

  const allAnnouncements = [
    { date: '2025-11-05', title: 'Mid-Term Examination Schedule Released', text: 'All students must check their exam timetable on the portal.' },
    { date: '2025-11-08', title: 'New Library Books Available', text: 'Over 500 new titles added to the school library collection.' },
    { date: '2025-11-10', title: 'Winter Break Schedule Update', text: 'School will remain closed from December 20th to January 5th.' }
  ];

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

  const filteredEvents = allEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  const filteredAnnouncements = allAnnouncements.filter(announcement => {
    const announcementDate = new Date(announcement.date);
    return announcementDate.toDateString() === selectedDate.toDateString();
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const previousMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const selectDate = (day: number) => setSelectedDate(new Date(year, month, day));
  const isSelectedDate = (day: number) => new Date(year, month, day).toDateString() === selectedDate.toDateString();
  const hasEvent = (day: number) => {
    const date = new Date(year, month, day);
    return allEvents.some(event => new Date(event.date).toDateString() === date.toDateString()) || allAnnouncements.some(ann => new Date(ann.date).toDateString() === date.toDateString());
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const COLORS = ['#3B82F6', '#EC4899'];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Academic Year 2024/25</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
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

            {/* Finance Chart */}
            <div className="col-span-2 bg-white rounded-2xl p-5">
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
        </div>

        {/* Right Column - 1fr */}
        <div className="space-y-5">
          {/* Calendar */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <button onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-semibold">{monthNames[month]} {year}</h3>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={'empty-' + index} className="aspect-square"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                return (
                  <button
                    key={day}
                    onClick={() => selectDate(day)}
                    className={'aspect-square rounded-lg text-sm font-medium transition-colors relative ' +
                      (isSelectedDate(day) ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 ') +
                      (hasEvent(day) && !isSelectedDate(day) ? 'bg-blue-50 text-blue-600' : '')}
                  >
                    {day}
                    {hasEvent(day) && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
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
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => (
                  <div
                    key={index}
                    className={'p-4 border-2 border-gray-100 border-t-4 rounded-lg ' +
                      (index % 2 === 0 ? 'border-t-blue-400' : 'border-t-blue-300')}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-700 text-sm">{event.title}</span>
                      <span className="text-xs text-gray-400">{event.time}</span>
                    </div>
                    <p className="text-sm text-gray-500">{event.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No events for this date
                </div>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">Announcements</h3>
              <span className="text-xs text-gray-400">View All</span>
            </div>

            <div className="space-y-3">
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((announcement, index) => (
                  <div
                    key={index}
                    className={'p-4 rounded-lg ' +
                      (index === 0 ? 'bg-blue-50' : index === 1 ? 'bg-blue-100' : 'bg-blue-50')}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-sm">{announcement.title}</span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">{announcement.date}</span>
                    </div>
                    <p className="text-xs text-gray-600">{announcement.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No announcements for this date
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
