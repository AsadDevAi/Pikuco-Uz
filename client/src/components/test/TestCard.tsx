import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Star, PlayCircle, User } from 'lucide-react';
import { Test } from '../../types';
import { cn, formatRelativeDate, formatNumber, TEST_TYPE_LABELS, TEST_TYPE_COLORS } from '../../lib/utils';

interface TestCardProps {
  test: Test;
  className?: string;
}

export default function TestCard({ test, className }: TestCardProps) {
  const author = typeof test.authorId === 'object' ? test.authorId : null;
  const category = typeof test.categoryId === 'object' ? test.categoryId : null;
  const avgRating = test.ratingCount > 0 ? (test.ratingSum / test.ratingCount).toFixed(1) : null;

  return (
    <Link to={`/tests/${test._id}`} className={cn('block group', className)}>
      <div className="card-hover overflow-hidden h-full flex flex-col">
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
          {test.coverImage ? (
            <img
              src={test.coverImage}
              alt={test.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-primary-400/50" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={cn('badge text-xs font-semibold', TEST_TYPE_COLORS[test.type])}>
              {TEST_TYPE_LABELS[test.type]}
            </span>
          </div>
          {category && (
            <div className="absolute top-3 right-3">
              <span className="badge badge-primary">{category.name}</span>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-primary text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
            {test.title}
          </h3>

          {test.description && (
            <p className="text-xs text-secondary line-clamp-2 mb-3 flex-1">{test.description}</p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-[rgb(var(--border))]">
            <div className="flex items-center gap-1.5">
              {author?.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.username} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary-500" />
                </div>
              )}
              <span className="text-xs text-muted">{author?.username || 'Anonim'}</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted">
              {avgRating && (
                <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {avgRating}
                </span>
              )}
              <span className="flex items-center gap-0.5">
                <Eye className="w-3.5 h-3.5" />
                {formatNumber(test.viewsCount)}
              </span>
              <span className="text-muted">{formatRelativeDate(test.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
