import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Star, User, Calendar } from 'lucide-react';
import { Post } from '../../types';
import { cn, formatRelativeDate, formatNumber } from '../../lib/utils';

interface PostCardProps {
  post: Post;
  className?: string;
}

export default function PostCard({ post, className }: PostCardProps) {
  const author = typeof post.authorId === 'object' ? post.authorId : null;
  const category = typeof post.categoryId === 'object' ? post.categoryId : null;
  const avgRating = post.ratingCount > 0 ? (post.ratingSum / post.ratingCount).toFixed(1) : null;

  return (
    <Link to={`/posts/${post._id}`} className={cn('block group', className)}>
      <div className="card-hover overflow-hidden h-full flex flex-col">
        {post.coverImage && (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {category && (
              <div className="absolute top-3 left-3">
                <span className="badge badge-primary">{category.name}</span>
              </div>
            )}
          </div>
        )}

        <div className="p-4 flex-1 flex flex-col">
          {!post.coverImage && category && (
            <span className="badge badge-primary mb-2 self-start">{category.name}</span>
          )}

          <h3 className="font-semibold text-primary text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
            {post.title}
          </h3>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-[rgb(var(--border))]">
            <div className="flex items-center gap-1.5">
              {author?.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.username} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-secondary-500/20 flex items-center justify-center">
                  <User className="w-3 h-3 text-secondary-500" />
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
                {formatNumber(post.viewsCount)}
              </span>
              <span className="flex items-center gap-0.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatRelativeDate(post.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
