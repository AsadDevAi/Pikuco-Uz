import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Eye, Star, User, Trophy, Share2, RefreshCw, MessageCircle, Send,
  Clock, PlayCircle, ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { Test, Comment } from '../../types';
import { useAuthStore } from '../../store/authStore';
import {
  formatRelativeDate, formatNumber, getAvatarFallback,
  TEST_TYPE_LABELS, TEST_TYPE_COLORS
} from '../../lib/utils';
import { cn } from '../../lib/utils';
import QuizPlayer from '../../components/test/players/QuizPlayer';
import IdentificationPlayer from '../../components/test/players/IdentificationPlayer';
import TournamentPlayer from '../../components/test/players/TournamentPlayer';
import TreePlayer from '../../components/test/players/TreePlayer';
import { QuizContent, IdentificationContent, TournamentContent, TreeContent } from '../../types';

type GameState = 'info' | 'playing' | 'result';

interface ResultData {
  score?: number;
  total?: number;
  percentage?: number;
  resultId?: string;
  result?: { title: string; description: string; image?: string };
  winnerId?: string;
  winner?: { title: string; mediaUrl: string; mediaType: string };
  endingNodeId?: string;
  endingNode?: { text: string; image?: string };
  sameResultPercentage?: number;
  winnerPopularity?: number;
  totalPasses?: number;
}

function StarRating({ testId, targetType }: { testId: string; targetType: string }) {
  const { isAuthenticated } = useAuthStore();
  const [userRating, setUserRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (stars: number) => {
    if (!isAuthenticated) {
      toast.error('Reyting qo\'yish uchun kirish kerak');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/ratings', { targetType, targetId: testId, stars });
      setUserRating(stars);
      toast.success('Reytingingiz saqlandi!');
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => handleRate(star)}
          disabled={submitting}
          className="text-2xl transition-transform hover:scale-110 disabled:opacity-50"
        >
          <Star
            className={cn(
              'w-7 h-7 transition-colors',
              (hovered || userRating) >= star ? 'fill-amber-400 text-amber-400' : 'text-[rgb(var(--border))]'
            )}
          />
        </button>
      ))}
    </div>
  );
}

function CommentsSection({ testId, targetType }: { testId: string; targetType: string }) {
  const { isAuthenticated, user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/comments?targetType=${targetType}&targetId=${testId}`)
      .then(({ data }) => setComments(data.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [testId, targetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      toast.error('Izoh qoldirish uchun kirish kerak');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/comments', {
        targetType,
        targetId: testId,
        content: newComment.trim(),
      });
      setComments([data.comment, ...comments]);
      setNewComment('');
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="flex items-center gap-2 text-lg font-bold text-primary mb-4">
        <MessageCircle className="w-5 h-5" />
        Izohlar ({comments.length})
      </h3>

      {isAuthenticated && user && (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-bold">{getAvatarFallback(user.username)}</span>
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              className="input text-sm flex-1"
              placeholder="Izoh qoldiring..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={2000}
            />
            <button type="submit" disabled={submitting || !newComment.trim()} className="btn btn-primary btn-sm px-3">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 rounded w-1/4" />
                <div className="skeleton h-3 rounded w-3/4" />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <p className="text-center text-secondary py-8">Hali izoh yo'q. Birinchi bo'ling!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary-500/30 to-secondary-500/30 flex items-center justify-center flex-shrink-0">
                {comment.userId?.avatarUrl ? (
                  <img src={comment.userId.avatarUrl} alt={comment.userId.username} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-primary-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-primary">{comment.userId?.username}</span>
                  <span className="text-xs text-muted">{formatRelativeDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-secondary">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function TestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState>('info');
  const [result, setResult] = useState<ResultData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/tests/${id}`)
      .then(({ data }) => setTest(data.test))
      .catch(() => navigate('/tests'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleQuizComplete = async (answers: number[]) => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tests/${id}/submit/quiz`, { answers });
      setResult({ ...data.result, totalPasses: data.totalPasses });
      setGameState('result');
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIdentificationComplete = async (answers: number[]) => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tests/${id}/submit/identification`, { answers });
      setResult({ ...data.result, sameResultPercentage: data.sameResultPercentage, totalPasses: data.totalPasses });
      setGameState('result');
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTournamentComplete = async (winnerId: string) => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tests/${id}/submit/tournament`, { winnerId });
      setResult({ ...data.result, winnerPopularity: data.winnerPopularity, totalPasses: data.totalPasses });
      setGameState('result');
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTreeComplete = async (endingNodeId: string, path: string[]) => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tests/${id}/submit/tree`, { endingNodeId, path });
      setResult({ ...data.result, totalPasses: data.totalPasses });
      setGameState('result');
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    hasSubmitted.current = false;
    setResult(null);
    setGameState('playing');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => toast.success('Havola nusxa olindi!'));
  };

  if (loading) {
    return (
      <div className="page-container py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-8 rounded w-3/4" />
          <div className="skeleton h-4 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!test) return null;

  const author = typeof test.authorId === 'object' ? test.authorId : null;
  const category = typeof test.categoryId === 'object' ? test.categoryId : null;
  const avgRating = test.ratingCount > 0 ? (test.ratingSum / test.ratingCount).toFixed(1) : null;

  return (
    <div className="page-container py-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/tests" className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" />
          Testlarga qaytish
        </Link>

        {gameState === 'info' && (
          <>
            <div className="card overflow-hidden mb-6">
              {test.coverImage && (
                <div className="relative aspect-video overflow-hidden">
                  <img src={test.coverImage} alt={test.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4">
                    <span className={cn('badge font-semibold', TEST_TYPE_COLORS[test.type])}>
                      {TEST_TYPE_LABELS[test.type]}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-6">
                {!test.coverImage && (
                  <span className={cn('badge font-semibold mb-3 inline-block', TEST_TYPE_COLORS[test.type])}>
                    {TEST_TYPE_LABELS[test.type]}
                  </span>
                )}
                <h1 className="text-2xl font-display font-bold text-primary mb-3">{test.title}</h1>
                {test.description && <p className="text-secondary mb-4">{test.description}</p>}

                <div className="flex flex-wrap items-center gap-4 text-sm text-secondary mb-6">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {formatNumber(test.viewsCount)} ko'rish
                  </span>
                  <span className="flex items-center gap-1.5">
                    <PlayCircle className="w-4 h-4" />
                    {formatNumber(test.passCount)} o'tish
                  </span>
                  {avgRating && (
                    <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                      <Star className="w-4 h-4 fill-amber-500" />
                      {avgRating} ({test.ratingCount} ta baho)
                    </span>
                  )}
                  {category && (
                    <span className="badge badge-primary">{category.name}</span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatRelativeDate(test.createdAt)}
                  </span>
                </div>

                {author && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(var(--bg-secondary))]">
                    <Link to={`/profile/${author.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        {author.avatarUrl ? (
                          <img src={author.avatarUrl} alt={author.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold">{getAvatarFallback(author.username)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">{author.username}</p>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-muted">{formatNumber(author.points)} ball</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                <button
                  onClick={() => setGameState('playing')}
                  className="btn btn-primary btn-lg w-full mt-6"
                  id="start-test-btn"
                >
                  <PlayCircle className="w-5 h-5" />
                  Testni boshlash
                </button>
              </div>
            </div>

            <CommentsSection testId={test._id} targetType="test" />
          </>
        )}

        {gameState === 'playing' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-primary">{test.title}</h2>
              <button onClick={() => setGameState('info')} className="btn btn-ghost btn-sm">
                <ChevronLeft className="w-4 h-4" /> Orqaga
              </button>
            </div>
            {submitting && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-secondary mt-2">Natija hisoblanmoqda...</p>
              </div>
            )}
            {!submitting && test.type === 'quiz' && (
              <QuizPlayer content={test.content as QuizContent} onComplete={handleQuizComplete} />
            )}
            {!submitting && test.type === 'identification' && (
              <IdentificationPlayer content={test.content as IdentificationContent} onComplete={handleIdentificationComplete} />
            )}
            {!submitting && test.type === 'tournament' && (
              <TournamentPlayer content={test.content as TournamentContent} onComplete={handleTournamentComplete} />
            )}
            {!submitting && test.type === 'tree' && (
              <TreePlayer content={test.content as TreeContent} onComplete={handleTreeComplete} />
            )}
          </div>
        )}

        {gameState === 'result' && result && (
          <div className="text-center">
            <div className="card p-8 mb-6">
              <h2 className="text-2xl font-display font-bold text-primary mb-6">Natija</h2>

              {test.type === 'quiz' && (
                <div>
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(var(--border))" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="50" fill="none"
                        stroke="url(#grad)" strokeWidth="10"
                        strokeDasharray={`${(result.percentage || 0) * 3.14} 314`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold gradient-text">{result.percentage}%</span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-primary mb-2">
                    {result.score} ta to'g'ri / {result.total} ta savol
                  </p>
                  <p className="text-secondary">
                    {(result.percentage || 0) >= 80 ? '🎉 Ajoyib natija!' :
                     (result.percentage || 0) >= 60 ? '👍 Yaxshi natija!' :
                     (result.percentage || 0) >= 40 ? '📚 Ko\'proq o\'qing!' : '💪 Harakat qiling!'}
                  </p>
                </div>
              )}

              {test.type === 'identification' && result.result && (
                <div>
                  {result.result.image && (
                    <img src={result.result.image} alt={result.result.title} className="w-32 h-32 rounded-2xl object-cover mx-auto mb-4" />
                  )}
                  <h3 className="text-2xl font-bold gradient-text mb-3">{result.result.title}</h3>
                  <p className="text-secondary mb-4">{result.result.description}</p>
                  {result.sameResultPercentage !== undefined && (
                    <p className="text-sm text-muted">
                      Foydalanuvchilarning <strong className="text-primary">{result.sameResultPercentage}%</strong> sizga o'xshab shu natijani oldi
                    </p>
                  )}
                </div>
              )}

              {test.type === 'tournament' && result.winner && (
                <div>
                  {result.winner.mediaType === 'image' ? (
                    <img src={result.winner.mediaUrl} alt={result.winner.title} className="w-40 h-40 rounded-2xl object-cover mx-auto mb-4" />
                  ) : (
                    <video src={result.winner.mediaUrl} className="w-40 h-40 rounded-2xl mx-auto mb-4" controls />
                  )}
                  <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-primary mb-2">{result.winner.title}</h3>
                  {result.winnerPopularity !== undefined && (
                    <p className="text-sm text-muted">Bu g'olib foydalanuvchilarning <strong className="text-primary">{result.winnerPopularity}%</strong> tomonidan tanlangan</p>
                  )}
                </div>
              )}

              {test.type === 'tree' && result.endingNode && (
                <div>
                  {result.endingNode.image && (
                    <img src={result.endingNode.image} alt="Yakun" className="w-full max-h-48 rounded-xl object-cover mb-4" />
                  )}
                  <p className="text-lg text-primary mb-2">{result.endingNode.text}</p>
                </div>
              )}

              <div className="mt-6 text-sm text-muted">
                Jami {formatNumber(result.totalPasses || 0)} ta foydalanuvchi bu testni o'tdi
              </div>
            </div>

            <div className="card p-6 mb-6">
              <h3 className="font-semibold text-primary mb-3">Reytingingizni qo'ying</h3>
              <div className="flex justify-center">
                <StarRating testId={test._id} targetType="test" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleRestart} className="btn btn-secondary btn-lg flex-1">
                <RefreshCw className="w-5 h-5" />
                Qayta o'tish
              </button>
              <button onClick={handleShare} className="btn btn-ghost btn-lg flex-1 border border-[rgb(var(--border))]">
                <Share2 className="w-5 h-5" />
                Ulashish
              </button>
              <Link to="/tests" className="btn btn-primary btn-lg flex-1">
                Boshqa testlar
              </Link>
            </div>

            <CommentsSection testId={test._id} targetType="test" />
          </div>
        )}
      </div>
    </div>
  );
}
