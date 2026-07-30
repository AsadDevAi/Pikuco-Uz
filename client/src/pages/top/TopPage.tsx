import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, PlayCircle, BookOpen, Users, Eye, Calendar } from 'lucide-react';
import api from '../../lib/api';
import { User, Test, Post, Squad } from '../../types';
import { cn, formatNumber, getAvatarFallback, formatRelativeDate, TEST_TYPE_LABELS } from '../../lib/utils';

type TopTab = 'users' | 'tests' | 'posts' | 'squads';
type Period = 'allTime' | 'monthly';

function MedalIcon({ rank }: { rank: number }) {
  const colors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
  return (
    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
      rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40' :
      rank === 2 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800' :
      rank === 3 ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/40' :
      'bg-[rgb(var(--bg-secondary))] text-muted'
    )}>
      {rank <= 3 ? <Trophy className={cn('w-4 h-4', colors[rank - 1])} /> : rank}
    </div>
  );
}

export default function TopPage() {
  const [activeTab, setActiveTab] = useState<TopTab>('users');
  const [period, setPeriod] = useState<Period>('allTime');
  const [users, setUsers] = useState<User[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const promises: Promise<void>[] = [];

    if (activeTab === 'users') {
      promises.push(api.get(`/top/users?period=${period}&limit=30`).then(({ data }) => setUsers(data.users || [])));
    } else if (activeTab === 'tests') {
      promises.push(api.get('/top/tests?limit=30').then(({ data }) => setTests(data.tests || [])));
    } else if (activeTab === 'posts') {
      promises.push(api.get('/top/posts?limit=30').then(({ data }) => setPosts(data.posts || [])));
    } else if (activeTab === 'squads') {
      promises.push(api.get('/top/squads?limit=30').then(({ data }) => setSquads(data.squads || [])));
    }

    Promise.all(promises).finally(() => setLoading(false));
  }, [activeTab, period]);

  const tabs = [
    { key: 'users' as TopTab, label: 'Foydalanuvchilar', icon: Users },
    { key: 'tests' as TopTab, label: 'Testlar', icon: PlayCircle },
    { key: 'posts' as TopTab, label: 'Postlar', icon: BookOpen },
    { key: 'squads' as TopTab, label: 'Skvadlar', icon: Users },
  ];

  return (
    <div className="page-container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">Top Reyting</h1>
          <p className="text-secondary">Eng yaxshi foydalanuvchilar, testlar va postlar</p>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                activeTab === tab.key ? 'bg-primary-500 text-white shadow-lg' : 'bg-[rgb(var(--bg-secondary))] text-secondary hover:text-primary'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <div className="flex items-center gap-2 mb-4">
            {[{ value: 'allTime', label: 'Barcha vaqt' }, { value: 'monthly', label: 'Bu oy' }].map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value as Period)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  period === p.value ? 'bg-amber-500 text-white' : 'bg-[rgb(var(--bg-secondary))] text-secondary hover:text-primary'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        <div className="card overflow-hidden">
          {loading ? (
            <div className="divide-y divide-[rgb(var(--border))]">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="skeleton w-8 h-8 rounded-full" />
                  <div className="skeleton w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 rounded w-1/3" />
                    <div className="skeleton h-3 rounded w-1/4" />
                  </div>
                  <div className="skeleton h-4 rounded w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--border))]">
              {activeTab === 'users' && users.map((user, idx) => (
                <Link key={user._id} to={`/profile/${user.username}`} className="flex items-center gap-3 p-4 hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                  <MedalIcon rank={idx + 1} />
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                    {user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" /> : <span className="text-white font-bold text-sm">{getAvatarFallback(user.username)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary text-sm">{user.username}</p>
                    {user.bio && <p className="text-xs text-muted truncate">{user.bio}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-sm">{formatNumber(period === 'monthly' ? user.monthlyPoints || 0 : user.points)}</p>
                    <p className="text-xs text-muted">ball</p>
                  </div>
                </Link>
              ))}

              {activeTab === 'tests' && tests.map((test, idx) => {
                const author = typeof test.authorId === 'object' ? test.authorId : null;
                const avg = test.ratingCount > 0 ? (test.ratingSum / test.ratingCount).toFixed(1) : null;
                return (
                  <Link key={test._id} to={`/tests/${test._id}`} className="flex items-center gap-3 p-4 hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                    <MedalIcon rank={idx + 1} />
                    {test.coverImage ? (
                      <img src={test.coverImage} alt={test.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                        <PlayCircle className="w-5 h-5 text-primary-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary text-sm truncate">{test.title}</p>
                      <p className="text-xs text-muted">{TEST_TYPE_LABELS[test.type]} • {author?.username}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span className="text-sm font-bold">{avg || '—'}</span>
                    </div>
                  </Link>
                );
              })}

              {activeTab === 'posts' && posts.map((post, idx) => {
                const author = typeof post.authorId === 'object' ? post.authorId : null;
                const avg = post.ratingCount > 0 ? (post.ratingSum / post.ratingCount).toFixed(1) : null;
                return (
                  <Link key={post._id} to={`/posts/${post._id}`} className="flex items-center gap-3 p-4 hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                    <MedalIcon rank={idx + 1} />
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-10 rounded-lg bg-secondary-500/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-secondary-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary text-sm truncate">{post.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span>{author?.username}</span>
                        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{formatNumber(post.viewsCount)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span className="text-sm font-bold">{avg || '—'}</span>
                    </div>
                  </Link>
                );
              })}

              {activeTab === 'squads' && squads.map((squad, idx) => {
                const leader = typeof squad.leaderId === 'object' ? squad.leaderId : null;
                return (
                  <Link key={squad._id} to={`/squads/${squad._id}`} className="flex items-center gap-3 p-4 hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                    <MedalIcon rank={idx + 1} />
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center flex-shrink-0">
                      {squad.avatarUrl ? <img src={squad.avatarUrl} alt={squad.name} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary text-sm">{squad.name}</p>
                      <p className="text-xs text-muted">Lider: {leader?.username || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-sm">{formatNumber(squad.totalPoints)}</p>
                      <p className="text-xs text-muted">ball</p>
                    </div>
                  </Link>
                );
              })}

              {((activeTab === 'users' && users.length === 0) ||
                (activeTab === 'tests' && tests.length === 0) ||
                (activeTab === 'posts' && posts.length === 0) ||
                (activeTab === 'squads' && squads.length === 0)) && (
                <div className="p-12 text-center">
                  <Trophy className="w-12 h-12 text-muted mx-auto mb-3" />
                  <p className="text-secondary">Hali ma'lumot yo'q</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
