import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, BookOpen } from 'lucide-react';
import api from '../../lib/api';
import { Post } from '../../types';
import PostCard from '../../components/post/PostCard';
import { cn } from '../../lib/utils';

function PostSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-video" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function PostsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) { next.set(key, value); } else { next.delete(key); }
    next.delete('page');
    setSearchParams(next);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '12');
      params.set('sort', sort);
      if (search) params.set('search', search);

      const { data } = await api.get(`/posts?${params.toString()}`);
      setPosts(data.posts || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [sort, search, page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const sortOptions = [
    { value: 'newest', label: 'Eng yangi' },
    { value: 'popular', label: 'Mashhur' },
    { value: 'top', label: 'Top reyting' },
  ];

  return (
    <div className="page-container py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-1">Postlar</h1>
          <p className="text-secondary">{total > 0 ? `${total} ta post` : 'Blog va maqolalar'}</p>
        </div>
        <Link to="/create-post" className="btn btn-primary btn-md">
          <BookOpen className="w-4 h-4" />
          Post yozish
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            className="input pl-10 text-sm"
            placeholder="Post qidirish..."
            defaultValue={search}
            onChange={(e) => updateParam('search', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam('sort', opt.value)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                sort === opt.value ? 'bg-primary-500 text-white shadow-lg' : 'bg-[rgb(var(--bg-secondary))] text-secondary hover:text-primary'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? [...Array(8)].map((_, i) => <PostSkeleton key={i} />) : posts.map((post) => <PostCard key={post._id} post={post} />)}
      </div>

      {!loading && posts.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">Post topilmadi</h3>
          <p className="text-secondary mb-4">Birinchi post yozuvchi bo'ling!</p>
          <Link to="/create-post" className="btn btn-primary btn-md">Post yozish</Link>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => { const n = new URLSearchParams(searchParams); n.set('page', String(i + 1)); setSearchParams(n); }}
              className={cn('w-10 h-10 rounded-xl font-medium text-sm', page === i + 1 ? 'bg-primary-500 text-white' : 'bg-[rgb(var(--bg-secondary))] text-secondary')}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
