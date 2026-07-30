import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, PlusCircle, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '../../lib/utils';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const navLinks = [
  { label: 'Testlar', href: '/tests' },
  { label: 'Postlar', href: '/posts' },
  { label: 'Top', href: '/top' },
  { label: 'Skvadlar', href: '/squads' },
];

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">Sinov</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  location.pathname.startsWith(link.href)
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-secondary hover:bg-[rgb(var(--bg-secondary))] hover:text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn btn-ghost btn-sm w-9 h-9 p-0 rounded-lg"
              aria-label="Mavzuni o'zgartirish"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <SignedIn>
              <div className="flex items-center gap-4">
                <Link to="/create-test" className="hidden md:flex btn btn-primary btn-sm gap-1.5">
                  <PlusCircle className="w-4 h-4" />
                  Yaratish
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn btn-ghost btn-sm">Kirish</Link>
                <Link to="/register" className="btn btn-primary btn-sm hidden sm:flex">Ro'yxatdan o'tish</Link>
              </div>
            </SignedOut>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn btn-ghost btn-sm w-9 h-9 p-0 rounded-lg"
              aria-label="Menyu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
          <div className="page-container py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  location.pathname.startsWith(link.href)
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-secondary hover:bg-[rgb(var(--bg-secondary))]'
                )}
              >
                {link.label}
              </Link>
            ))}
            <SignedIn>
              <Link
                to="/create-test"
                onClick={() => setMobileOpen(false)}
                className="btn btn-primary btn-md mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                Test yaratish
              </Link>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}
