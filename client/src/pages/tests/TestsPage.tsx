import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import api from '../../lib/api';
import { Test, Category } from '../../types';
import TestCard from '../../components/test/TestCard';
import { cn, TEST_TYPE_LABELS } from '../../lib/utils';

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

export default function TestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tests, setTests] = useState<Test[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const type = searchParams.get('type') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete('page');
    setSearchParams(next);
  };

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('status', 'published');
      params.set('page', page.toString());
      params.set('limit', '12');
      params.set('sort', sort);
      if (type) params.set('type', type);
      if (category) params.set('categoryId', category);
      if (search) params.set('search', search);

      const { data } = await api.get(`/tests?${params.toString()}`);
      setTests(data.tests || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [type, category, sort, search, page]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const sortOptions = [
    { value: 'newest', label: 'Eng yangi' },
    { value: 'popular', label: 'Mashhur' },
    { value: 'top', label: 'Eng yuqori reyting' },
  ];

  return (
    <div className="page-container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-primary mb-2">Testlar</h1>
        <p className="text-secondary">{total > 0 ? `${total} ta test topildi` : 'Testlarni ko\'ring va o\'ting'}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="card p-4 space-y-6 sticky top-20">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-primary mb-3">
                <Search className="w-4 h-4" />
                Qidiruv
              </label>
              <input
                type="text"
                className="input text-sm"
                placeholder="Test nomini kiriting..."
                defaultValue={search}
                onChange={(e) => updateParam('search', e.target.value)}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-primary mb-3">
                <Filter className="w-4 h-4" />
                Test turi
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateParam('type', '')}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    !type ? 'bg-primary-500/10 text-primary-500 font-medium' : 'text-secondary hover:bg-[rgb(var(--bg-secondary))]'
                  )}
                >
                  Barchasi
                </button>
                {Object.entries(TEST_TYPE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => updateParam('type', key)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      type === key ? 'bg-primary-500/10 text-primary-500 font-medium' : 'text-secondary hover:bg-[rgb(var(--bg-secondary))]'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-primary mb-3">
                  <SlidersHorizontal className="w-4 h-4" />
                  Kategoriya
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => updateParam('category', '')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      !category ? 'bg-primary-500/10 text-primary-500 font-medium' : 'text-secondary hover:bg-[rgb(var(--bg-secondary))]'
                    )}
                  >
                    Barchasi
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => updateParam('category', cat._id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        category === cat._id ? 'bg-primary-500/10 text-primary-500 font-medium' : 'text-secondary hover:bg-[rgb(var(--bg-secondary))]'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateParam('sort', opt.value)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    sort === opt.value
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-[rgb(var(--bg-secondary))] text-secondary hover:text-primary'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading
              ? [...Array(9)].map((_, i) => <TestCardSkeleton key={i} />)
              : tests.map((test) => <TestCard key={test._id} test={test} />)
            }
          </div>

          {!loading && tests.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">Test topilmadi</h3>
              <p className="text-secondary">Boshqa parametrlar bilan qidiring</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', String(i + 1));
                    setSearchParams(next);
                  }}
                  className={cn(
                    'w-10 h-10 rounded-xl font-medium text-sm transition-all',
                    page === i + 1
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-[rgb(var(--bg-secondary))] text-secondary hover:text-primary'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
