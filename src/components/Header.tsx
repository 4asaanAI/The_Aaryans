import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Infrastructure', href: '#infrastructure' },
    { name: 'Facilities', href: '#facilities' },
    { name: 'Admission', href: '#admission' },
    { name: 'Contact', href: '#contact' }
  ];

  const topBarLinks = [
    { name: 'Fee 2025-26', href: '#fee' },
    { name: 'Online Registration', href: '#registration' },
    { name: 'Admission Open 2024-25', href: '#admission' },
    { name: 'Career @ Aaryans', href: '#career' },
    { name: 'Enquiry', href: '#contact' },
    { name: 'Verify TC', href: '#verify-tc' }
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="bg-slate-900 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-end items-center gap-x-6 gap-y-1 text-xs">
          {topBarLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-orange-400 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">TA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">THE AARYANS</h1>
              <p className="text-xs text-slate-600">Chariot of Knowledge</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
