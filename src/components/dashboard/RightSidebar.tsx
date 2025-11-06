import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function RightSidebar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'events' | 'announcements'>('events');

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

  return (
    <div className="space-y-5">
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

      <div className="bg-white rounded-2xl p-5">
        <div className="flex border-b border-gray-200 mb-5">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'events'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'announcements'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Announcements
          </button>
        </div>

        {activeTab === 'events' ? (
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
        ) : (
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
        )}
      </div>
    </div>
  );
}
