import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Trophy, BookOpen, Users, ChevronRight,
  Brain, Swords, GitBranch, HelpCircle, Star, ArrowRight
} from 'lucide-react';
import api from '../../lib/api';
import { Test, Post, User } from '../../types';
import TestCard from '../../components/test/TestCard';
import PostCard from '../../components/post/PostCard';
import { cn, formatNumber, getAvatarFallback } from '../../lib/utils';

interface HomeData {
  popularTests: Test[];
  recentPosts: Post[];
  topUsers: User[];
}

const testTypes = [
  {
    type: 'quiz',
    label: 'Viktorina',
    desc: 'To\'g\'ri javobni tanlang va natijangizni biling',
    icon: HelpCircle,
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    type: 'identification',
    label: 'Identifikatsiya',
    desc: 'Savollarga javob berib, o\'zingizni biling',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    type: 'tournament',
    label: 'Turnir',
    desc: 'Eng yaxshisini tanlang — bracket usulida',
    icon: Swords,
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
  },
  {
    type: 'tree',
    label: 'Daraxt',
    desc: 'Tanlovlar asosida o\'z yo\'lingizni oching',
    icon: GitBranch,
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50 dark:bg-green-950/20',
  },
];

function TestCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-video" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [data, setData] = useState<HomeData>({ popularTests: [], recentPosts: [], topUsers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, postsRes, usersRes] = await Promise.all([
          api.get('/tests?sort=popular&limit=8&status=published'),
          api.get('/posts?sort=newest&limit=6'),
          api.get('/top/users?limit=5'),
        ]);
        setData({
          popularTests: testsRes.data.tests || [],
          recentPosts: postsRes.data.posts || [],
          topUsers: usersRes.data.users || [],
        });
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 opacity-95" />
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-pulse"
              style={{
                width: (i + 1) * 80 + 'px',
                height: (i + 1) * 80 + 'px',
                left: (i * 13) % 100 + '%',
                top: (i * 17 + 10) % 80 + '%',
                animationDelay: i * 0.5 + 's',
                animationDuration: (i + 3) * 1.5 + 's',
              }}
            />
          ))}
        </div>

        <div className="relative page-container py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-white/90 text-sm font-medium mb-8">
            <Zap className="w-4 h-4 text-yellow-300" />
            O'zbekistonning #1 Test Platformasi
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Bilimingizni{' '}
            <span className="relative">
              <span className="text-yellow-300">Sinov</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0 6 Q100 0 200 6" stroke="rgba(253,224,71,0.6)" strokeWidth="3" fill="none" />
              </svg>
            </span>
            {' '}dan o'tkaz
          </h1>

          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            4 xil test turi, minglab savollar va turnirlar. O'yin va bilim bir joyda!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/tests" className="btn btn-lg bg-white text-primary-600 hover:bg-white/90 shadow-xl hover:-translate-y-1">
              Testlarni ko'rish
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/create-test" className="btn btn-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm">
              <Zap className="w-5 h-5" />
              Test yaratish
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-14">
            {[
              { label: '10K+', desc: 'Foydalanuvchi' },
              { label: '5K+', desc: 'Test' },
              { label: '1M+', desc: "O'tish" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-display font-bold text-white">{stat.label}</p>
                <p className="text-white/70 text-sm">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-primary mb-3">Test Turlari</h2>
          <p className="text-secondary">Har bir test turi o'ziga xos qiziqarli tajriba taqdim etadi</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {testTypes.map((t) => (
            <Link key={t.type} to={`/tests?type=${t.type}`} className="group">
              <div className={cn('p-6 rounded-[var(--radius-card)] border border-[rgb(var(--border))] transition-all duration-300 hover:-translate-y-2 hover:shadow-[var(--shadow-elevated)] cursor-pointer h-full', t.bg)}>
                <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg', t.color)}>
                  <t.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-primary mb-2">{t.label}</h3>
                <p className="text-sm text-secondary">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[rgb(var(--bg-secondary))] py-16">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold text-primary">Mashhur Testlar</h2>
            <Link to="/tests?sort=popular" className="btn btn-ghost btn-sm gap-1">
              Barchasi <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? [...Array(8)].map((_, i) => <TestCardSkeleton key={i} />)
              : data.popularTests.map((test) => <TestCard key={test._id} test={test} />)
            }
          </div>
          {!loading && data.popularTests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary">Hali testlar yo'q. Birinchi bo'ling!</p>
              <Link to="/create-test" className="btn btn-primary btn-md mt-4">Test yaratish</Link>
            </div>
          )}
        </div>
      </section>

      <section className="page-container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display font-bold text-primary">So'nggi Postlar</h2>
              <Link to="/posts" className="btn btn-ghost btn-sm gap-1">
                Barchasi <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading
                ? [...Array(4)].map((_, i) => <TestCardSkeleton key={i} />)
                : data.recentPosts.map((post) => <PostCard key={post._id} post={post} />)
              }
              {!loading && data.recentPosts.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <BookOpen className="w-12 h-12 text-muted mx-auto mb-3" />
                  <p className="text-secondary">Hali postlar yo'q</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold text-primary">Top Foydalanuvchilar</h2>
              <Link to="/top" className="btn btn-ghost btn-sm">
                <Trophy className="w-4 h-4" />
              </Link>
            </div>
            <div className="card overflow-hidden">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="skeleton w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <div className="skeleton h-3 rounded w-2/3" />
                        <div className="skeleton h-2.5 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-[rgb(var(--border))]">
                  {data.topUsers.map((user, idx) => (
                    <Link
                      key={user._id}
                      to={`/profile/${user.username}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-[rgb(var(--bg-secondary))] text-muted'
                      )}>
                        {idx + 1}
                      </div>
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-xs font-bold">{getAvatarFallback(user.username)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">{user.username}</p>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-muted">{formatNumber(user.points)} ball</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {data.topUsers.length === 0 && (
                    <div className="p-8 text-center">
                      <Users className="w-10 h-10 text-muted mx-auto mb-2" />
                      <p className="text-sm text-secondary">Foydalanuvchilar yo'q</p>
                    </div>
                  )}
                </div>
              )}
              <div className="p-3 border-t border-[rgb(var(--border))]">
                <Link to="/top" className="btn btn-ghost btn-sm w-full">
                  To'liq ro'yxat ko'rish <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 py-20">
        <div className="page-container text-center">
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            O'z testingizni yarating!
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
            Viktorina, identifikatsiya, turnir yoki daraxt — istalgan turda test yarating va do'stlaringizni sinab ko'ring.
          </p>
          <Link to="/create-test" className="btn btn-lg bg-white text-primary-600 hover:bg-white/90 shadow-xl">
            <Zap className="w-5 h-5" />
            Hoziroq boshlash
          </Link>
        </div>
      </section>
    </div>
  );
}
