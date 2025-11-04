import { ReactNode, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, Home, Users, BookOpen, FileText, Bell, Settings,
  LogOut, GraduationCap, BarChart3, Calendar, Library
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getNavigationItems = () => {
    if (!profile) return [];

    const commonItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home }
    ];

    if (profile.role === 'admin') {
      return [
        ...commonItems,
        { name: 'Users', href: '/dashboard/users', icon: Users },
        { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
        { name: 'Enrollments', href: '/dashboard/enrollments', icon: FileText },
        { name: 'Departments', href: '/dashboard/departments', icon: GraduationCap },
        { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 }
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
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 h-16 bg-blue-600 text-white z-30 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-blue-700"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="text-xl font-bold">School ERP System</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-md hover:bg-blue-700 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {profile?.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{profile?.full_name}</p>
              <p className="text-xs text-blue-100 capitalize">{profile?.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex pt-16">
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200
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
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-200">
              <Link
                to="/dashboard/settings"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
