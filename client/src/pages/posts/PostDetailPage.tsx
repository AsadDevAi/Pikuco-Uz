import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, Star, User, Clock, ChevronLeft, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { Post, Comment } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { formatDate, formatRelativeDate, formatNumber, getAvatarFallback } from '../../lib/utils';
import { cn } from '../../lib/utils';

function StarRating({ postId }: { postId: string }) {
  const { isAuthenticated } = useAuthStore();
  const [userRating, setUserRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const handleRate = async (stars: number) => {
    if (!isAuthenticated) { toast.error('Reyting qo\'yish uchun kirish kerak'); return; }
    try {
      await api.post('/ratings', { targetType: 'post', targetId: postId, stars });
      setUserRating(stars);
      toast.success('Reytingingiz saqlandi!');
    } catch { toast.error('Xatolik'); }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)} onClick={() => handleRate(star)}>
          <Star className={cn('w-6 h-6 transition-colors', (hovered || userRating) >= star ? 'fill-amber-400 text-amber-400' : 'text-[rgb(var(--border))]')} />
        </button>
      ))}
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/posts/${id}`).then(({ data }) => setPost(data.post)).finally(() => setLoading(false));
    api.get(`/comments?targetType=post&targetId=${id}`).then(({ data }) => setComments(data.comments || [])).catch(() => {});
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/comments', { targetType: 'post', targetId: id, content: newComment.trim() });
      setComments([data.comment, ...comments]);
      setNewComment('');
    } catch { toast.error('Xatolik'); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="page-container py-8 max-w-3xl mx-auto">
        <div className="skeleton h-64 rounded-2xl mb-6" />
        <div className="skeleton h-8 rounded w-3/4 mb-4" />
        <div className="skeleton h-4 rounded w-full mb-2" />
        <div className="skeleton h-4 rounded w-full mb-2" />
      </div>
    );
  }

  if (!post) return <div className="page-container py-20 text-center text-secondary">Post topilmadi</div>;

  const author = typeof post.authorId === 'object' ? post.authorId : null;
  const category = typeof post.categoryId === 'object' ? post.categoryId : null;
  const avgRating = post.ratingCount > 0 ? (post.ratingSum / post.ratingCount).toFixed(1) : null;

  return (
    <div className="page-container py-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/posts" className="flex items-center gap-2 text-secondary hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Postlarga qaytish
        </Link>

        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className="w-full rounded-2xl object-cover max-h-80 mb-6" />
        )}

        {category && <span className="badge badge-primary mb-3 inline-block">{category.name}</span>}

        <h1 className="text-3xl font-display font-bold text-primary mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-secondary mb-6 pb-6 border-b border-[rgb(var(--border))]">
          {author && (
            <Link to={`/profile/${author.username}`} className="flex items-center gap-2 hover:text-primary transition-colors">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                {author.avatarUrl ? <img src={author.avatarUrl} alt={author.username} className="w-full h-full object-cover" /> : <span className="text-white text-sm font-bold">{getAvatarFallback(author.username)}</span>}
              </div>
              <span className="font-medium">{author.username}</span>
            </Link>
          )}
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{formatDate(post.createdAt)}</span>
          <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{formatNumber(post.viewsCount)}</span>
          {avgRating && <span className="flex items-center gap-1.5 text-amber-500 font-medium"><Star className="w-4 h-4 fill-amber-500" />{avgRating}</span>}
        </div>

        <div
          className="prose prose-sm max-w-none text-[rgb(var(--text))] [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h1,&_h2,&_h3]:font-bold [&_h1,&_h2,&_h3]:text-primary [&_p]:text-secondary [&_p]:leading-relaxed [&_a]:text-primary-500 [&_img]:rounded-xl [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="card p-6 mb-8">
          <h3 className="font-semibold text-primary mb-3">Reytingingizni qo'ying</h3>
          <StarRating postId={post._id} />
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-primary mb-4">
            <MessageCircle className="w-5 h-5" />Izohlar ({comments.length})
          </h3>

          {isAuthenticated && user && (
            <form onSubmit={handleComment} className="flex gap-3 mb-6">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                {user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" /> : <span className="text-white text-sm font-bold">{getAvatarFallback(user.username)}</span>}
              </div>
              <div className="flex-1 flex gap-2">
                <input type="text" className="input text-sm flex-1" placeholder="Izoh qoldiring..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <button type="submit" disabled={submitting || !newComment.trim()} className="btn btn-primary btn-sm px-3"><Send className="w-4 h-4" /></button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[rgb(var(--bg-secondary))] flex items-center justify-center flex-shrink-0">
                  {comment.userId?.avatarUrl ? <img src={comment.userId.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : <User className="w-4 h-4 text-muted" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-primary">{comment.userId?.username}</span>
                    <span className="text-xs text-muted">{formatRelativeDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-secondary">{comment.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-center text-secondary py-8">Hali izoh yo'q</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
