import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ColumnFilter } from '../../components/ColumnFilter';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import {
  Calendar, Clock, MapPin, Users, UserPlus, Search,
  Download, Plus, Eye, Edit2, Trash2, Award
} from 'lucide-react';

interface Event {
  id: string;
  name: string;
  description: string;
  event_type: string;
  event_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  venue: string;
  status: string;
  max_participants: number;
  current_volunteers: number;
  budget: number;
  coordinator_name?: string;
  coordinator_email?: string;
}

export function EventsPage() {
  const { theme } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCoordinators, setSelectedCoordinators] = useState<string[]>([]);

  const isDark = theme === 'dark';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .order('event_date', { ascending: false });

      if (error) throw error;

      const formattedEvents: Event[] = (data || []).map((event: any) => ({
        id: event.id,
        name: event.name,
        description: event.description || '',
        event_type: event.event_type,
        event_date: event.event_date,
        end_date: event.end_date,
        start_time: event.start_time,
        end_time: event.end_time,
        venue: event.venue,
        status: event.status,
        max_participants: event.max_participants || 0,
        current_volunteers: event.current_volunteers || 0,
        budget: event.budget || 0,
        coordinator_name: event.profiles?.full_name || 'N/A',
        coordinator_email: event.profiles?.email || 'N/A'
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.coordinator_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(event.event_type);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(event.status);
    const matchesCoordinator = selectedCoordinators.length === 0 || selectedCoordinators.includes(event.coordinator_name || '');

    return matchesSearch && matchesType && matchesStatus && matchesCoordinator;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      upcoming: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
      ongoing: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
      completed: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' }
    };

    const config = statusConfig[status] || statusConfig.upcoming;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { bg: string; text: string }> = {
      cultural: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
      sports: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
      academic: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
      technical: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
      social: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300' },
      other: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' }
    };

    const config = typeConfig[type] || typeConfig.other;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const calculateStats = () => {
    const totalEvents = filteredEvents.length;
    const upcomingEvents = filteredEvents.filter(e => e.status === 'upcoming').length;
    const ongoingEvents = filteredEvents.filter(e => e.status === 'ongoing').length;
    const totalVolunteers = filteredEvents.reduce((sum, e) => sum + e.current_volunteers, 0);

    return { totalEvents, upcomingEvents, ongoingEvents, totalVolunteers };
  };

  const stats = calculateStats();

  return (
    <DashboardLayout>
      <div className="space-y-5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Events Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage school events, coordinators, and student volunteers
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-5 w-5" />
              Add New Event
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Events</span>
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalEvents}</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming</span>
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.upcomingEvents}</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ongoing</span>
                <Award className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.ongoingEvents}</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Volunteers</span>
                <UserPlus className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalVolunteers}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Events List</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Event Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          Type
                          <ColumnFilter
                            column="Type"
                            values={events.map(e => e.event_type)}
                            selectedValues={selectedTypes}
                            onFilterChange={setSelectedTypes}
                            isDark={isDark}
                          />
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          Coordinator
                          <ColumnFilter
                            column="Coordinator"
                            values={events.map(e => e.coordinator_name || '')}
                            selectedValues={selectedCoordinators}
                            onFilterChange={setSelectedCoordinators}
                            isDark={isDark}
                          />
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Date & Time
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Venue
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Volunteers
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          Status
                          <ColumnFilter
                            column="Status"
                            values={events.map(e => e.status)}
                            selectedValues={selectedStatuses}
                            onFilterChange={setSelectedStatuses}
                            isDark={isDark}
                          />
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">{event.name}</div>
                            {event.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                {event.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">{getTypeBadge(event.event_type)}</td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                              {event.coordinator_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {event.coordinator_email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.event_date).toLocaleDateString()}
                          </div>
                          {event.start_time && (
                            <div className="flex items-center gap-2 text-xs mt-1">
                              <Clock className="h-3 w-3" />
                              {event.start_time} - {event.end_time}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {event.venue && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.venue}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {event.current_volunteers}
                              {event.max_participants > 0 && `/${event.max_participants}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(event.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEvents.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No events found matching your filters
                  </div>
                )}
              </div>
            )}
          </div>
      </div>
    </DashboardLayout>
  );
}
