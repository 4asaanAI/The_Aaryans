import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { Calendar, Search, Bell, AlertCircle, Info } from 'lucide-react';
import { Announcement } from '../../types';

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*, author:profiles!announcements_author_id_fkey(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = selectedPriority === 'all' || announcement.priority === selectedPriority;
    const matchesAudience = selectedAudience === 'all' || announcement.target_audience === selectedAudience;

    const matchesDate = !selectedDate ||
      new Date(announcement.created_at).toISOString().split('T')[0] === selectedDate;

    return matchesSearch && matchesPriority && matchesAudience && matchesDate;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage school announcements</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Audiences</option>
                <option value="all">Everyone</option>
                <option value="students">Students</option>
                <option value="professors">Professors</option>
                <option value="department">Department</option>
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {(searchQuery || selectedPriority !== 'all' || selectedAudience !== 'all' || selectedDate) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAnnouncements.length} results found
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPriority('all');
                  setSelectedAudience('all');
                  setSelectedDate('');
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No announcements found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || selectedPriority !== 'all' || selectedAudience !== 'all' || selectedDate
                  ? 'Try adjusting your filters'
                  : 'There are no announcements at this time'}
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {announcement.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          announcement.priority
                        )}`}
                      >
                        {getPriorityIcon(announcement.priority)}
                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(announcement.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {announcement.author && (
                        <span>By {announcement.author.full_name}</span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs capitalize">
                        {announcement.target_audience === 'all' ? 'Everyone' : announcement.target_audience}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
