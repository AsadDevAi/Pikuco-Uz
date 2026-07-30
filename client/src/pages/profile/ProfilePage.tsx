import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, PlayCircle, BookOpen, User, Calendar } from 'lucide-react';
import api from '../../lib/api';
import { User as UserType, Test, Post } from '../../types';
import { formatDate, formatNumber, formatRelativeDate, getAvatarFallback, TEST_TYPE_LABELS, TEST_TYPE_COLORS } from '../../lib/utils';
import { cn } from '../../lib/utils';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<UserType | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'tests' | 'posts'>('tests');

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    Promise.all([
      api.get(`/users/${username}`).then(({ data }) => setUser(data.user)),
      api.get(`/tests?authorId=placeholder&status=published&limit=20`),
      api.get(`/posts?authorId=placeholder&limit=20`),
    ])
    .then(([, testsRes, postsRes]) => {
      if (testsRes?.data?.tests) setTests(testsRes.data.tests);
      if (postsRes?.data?.posts) setPosts(postsRes.data.posts);
    })
    .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (!user) return;
    api.get(`/tests?authorId=${user._id}&status=published&limit=20`).then(({ data }) => setTests(data.tests || [])).catch(() => {});
    api.get(`/posts?authorId=${user._id}&limit=20`).then(({ data }) => setPosts(data.posts || [])).catch(() => {});
  }, [user]);

  if (loading) {
    return (
      <div className="page-container py-8 max-w-3xl mx-auto">
        <div className="card p-8 flex gap-6 mb-6">
          <div className="skeleton w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-6 rounded w-1/3" />
            <div className="skeleton h-4 rounded w-1/2" />
            <div className="skeleton h-4 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <div className="page-container py-20 text-center text-secondary">Foydalanuvchi topilmadi</div>;

  const squad = typeof user.squadId === 'object' && user.squadId ? user.squadId : null;

  return (
    <div className="page-container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="card p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-4xl font-bold">{getAvatarFallback(user.username)}</span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-display font-bold text-primary mb-1">{user.username}</h1>
              {user.bio && <p className="text-secondary mb-3">{user.bio}</p>}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-secondary">
                <div className="flex items-center gap-1.5 font-semibold text-amber-600">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  {formatNumber(user.points)} ball
                </div>
                <div className="flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4" />
                  {tests.length} ta test
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {posts.length} ta post
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(user.createdAt)}
                </div>
              </div>

              {squad && (
                <Link to={`/squads/${squad._id}`} className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary-500/10 rounded-lg text-sm text-primary-500 hover:bg-primary-500/20 transition-colors">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500">
                    {squad.avatarUrl ? <img src={squad.avatarUrl} alt={squad.name} className="w-full h-full object-cover" /> : null}
                  </div>
                  {squad.name}
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setTab('tests')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              tab === 'tests' ? 'bg-primary-500 text-white shadow-lg' : 'bg-[rgb(var(--bg-secondary))] text-secondary hover:text-primary'
            )}
          >
            <PlayCircle className="w-4 h-4" />
            Testlar ({tests.length})
          </button>
          <button
            onClick={() => setTab('posts')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              tab === 'posts' ? 'bg-primary-500 text-white shadow-lg' : 'bg-[rgb(var(--bg-secondary))] text-secondary hover:text-primary'
            )}
          >
            <BookOpen className="w-4 h-4" />
            Postlar ({posts.length})
          </button>
        </div>

        {tab === 'tests' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tests.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <PlayCircle className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-secondary">Hali testlar yo'q</p>
              </div>
            ) : tests.map((test) => (
              <Link key={test._id} to={`/tests/${test._id}`} className="card-hover overflow-hidden flex gap-3 p-4">
                {test.coverImage ? (
                  <img src={test.coverImage} alt={test.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-7 h-7 text-primary-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className={cn('badge text-xs mb-1', TEST_TYPE_COLORS[test.type])}>{TEST_TYPE_LABELS[test.type]}</span>
                  <p className="text-sm font-semibold text-primary truncate">{test.title}</p>
                  <p className="text-xs text-muted">{formatRelativeDate(test.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === 'posts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <BookOpen className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-secondary">Hali postlar yo'q</p>
              </div>
            ) : posts.map((post) => (
              <Link key={post._id} to={`/posts/${post._id}`} className="card-hover overflow-hidden flex gap-3 p-4">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-secondary-500/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-7 h-7 text-secondary-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary line-clamp-2">{post.title}</p>
                  <p className="text-xs text-muted">{formatRelativeDate(post.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
