import { ReactNode, useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, Home, Users, BookOpen, Bell, Moon, Sun, FileText,
  LogOut, Calendar, Library, MessageSquare, UserCircle, BarChart3,
  ClipboardList, Award, CheckSquare
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const messagesRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const messages: any[] = [];
  const notifications: any[] = [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setMessagesOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    if (messagesOpen || notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [messagesOpen, notificationsOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getNavigationItems = () => {
    if (!profile) return [];

    const commonItems = [
      { name: 'Home', href: '/dashboard', icon: Home }
    ];

    if (profile.role === 'admin') {
      return [
        ...commonItems,
        { name: 'Users', href: '/dashboard/users', icon: Users },
        { name: 'Classes', href: '/dashboard/classes', icon: BookOpen },
        { name: 'Exams', href: '/dashboard/exams', icon: ClipboardList },
        { name: 'Assignments', href: '/dashboard/assignments', icon: Award },
        { name: 'Results', href: '/dashboard/results', icon: BarChart3 },
        { name: 'Attendance', href: '/dashboard/attendance', icon: CheckSquare },
        { name: 'Events', href: '/dashboard/events', icon: Calendar },
        { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
        { name: 'Announcements', href: '/dashboard/announcements', icon: Bell }
      ];
    }

    if (profile.role === 'professor') {
      return [
        ...commonItems,
        { name: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
        { name: 'Students', href: '/dashboard/students', icon: Users },
        { name: 'Attendance', href: '/dashboard/attendance', icon: Calendar },
        { name: 'Grades', href: '/dashboard/grades', icon: FileText }
      ];
    }

    if (profile.role === 'student') {
      return [
        ...commonItems,
        { name: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
        { name: 'Enrollments', href: '/dashboard/enrollments', icon: FileText },
        { name: 'Library', href: '/dashboard/library', icon: Library },
        { name: 'Grades', href: '/dashboard/grades', icon: BarChart3 }
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 h-16 bg-blue-600 dark:bg-gray-800 text-white z-30 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-blue-700 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="text-xl font-bold">School ERP System</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <div className="relative" ref={messagesRef}>
            <button
              onClick={() => setMessagesOpen(!messagesOpen)}
              className="p-2 rounded-md hover:bg-blue-700 dark:hover:bg-gray-700 relative"
            >
              <MessageSquare className="h-5 w-5" />
              {messages.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"></span>
              )}
            </button>

            {messagesOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Messages</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      You don't have any messages
                    </div>
                  ) : (
                    <>
                      {messages.slice(0, 5).map((msg: any, idx: number) => (
                        <div
                          key={idx}
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 cursor-pointer"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{msg.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{msg.preview}</p>
                        </div>
                      ))}
                      {messages.length > 5 && (
                        <Link
                          to="/dashboard/messages"
                          onClick={() => setMessagesOpen(false)}
                          className="block px-4 py-3 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          See all messages
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-md hover:bg-blue-700 dark:hover:bg-gray-700 relative"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  ) : (
                    <>
                      {notifications.slice(0, 5).map((notif: any, idx: number) => (
                        <div
                          key={idx}
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 cursor-pointer"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                        </div>
                      ))}
                      {notifications.length > 5 && (
                        <Link
                          to="/dashboard/announcements"
                          onClick={() => setNotificationsOpen(false)}
                          className="block px-4 py-3 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          See all notifications
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-700 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {profile?.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{profile?.full_name}</p>
              <p className="text-xs text-blue-100 dark:text-gray-400 capitalize">{profile?.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex pt-16">
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-20 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            transform transition-transform duration-300 ease-in-out lg:transform-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            mt-16 lg:mt-0
          `}
        >
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <Link
                to="/dashboard/profile"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <UserCircle className="h-5 w-5" />
                <span className="font-medium">Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden mt-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
