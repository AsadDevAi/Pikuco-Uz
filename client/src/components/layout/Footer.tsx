import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Code, ExternalLink, Globe } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] mt-20">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl gradient-text">Sinov</span>
            </Link>
            <p className="text-sm text-secondary max-w-xs">
              O'zbek tilidagi eng katta test va viktorina platformasi. O'yin, bilim va qiziqish uchun!
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-lg bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] flex items-center justify-center text-secondary hover:text-primary hover:border-primary-500 transition-colors">
                <Code className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] flex items-center justify-center text-secondary hover:text-primary hover:border-primary-500 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] flex items-center justify-center text-secondary hover:text-primary hover:border-primary-500 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4 text-sm uppercase tracking-wider">Platforma</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Testlar', href: '/tests' },
                { label: 'Postlar', href: '/posts' },
                { label: 'Top Reyting', href: '/top' },
                { label: 'Skvadlar', href: '/squads' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-secondary hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4 text-sm uppercase tracking-wider">Test turlari</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Viktorina', href: '/tests?type=quiz' },
                { label: 'Identifikatsiya', href: '/tests?type=identification' },
                { label: 'Turnir', href: '/tests?type=tournament' },
                { label: 'Daraxt', href: '/tests?type=tree' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-secondary hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4 text-sm uppercase tracking-wider">Hisobingiz</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Ro\'yxatdan o\'tish', href: '/register' },
                { label: 'Kirish', href: '/login' },
                { label: 'Test yaratish', href: '/create-test' },
                { label: 'Post yozish', href: '/create-post' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-secondary hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[rgb(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">© {year} Sinov. Barcha huquqlar himoyalangan.</p>
          <p className="text-xs text-muted">O'zbek tilida eng yaxshi test platformasi</p>
        </div>
      </div>
    </footer>
  );
}
