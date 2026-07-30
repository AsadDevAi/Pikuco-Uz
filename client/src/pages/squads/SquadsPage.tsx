import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { Squad } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { formatNumber, getAvatarFallback } from '../../lib/utils';

export default function SquadsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    api.get('/squads').then(({ data }) => setSquads(data.squads || [])).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Skvad nomi talab qilinadi'); return; }
    setCreating(true);
    try {
      const { data } = await api.post('/squads', form);
      setSquads([data.squad, ...squads]);
      setShowForm(false);
      setForm({ name: '', description: '' });
      toast.success('Skvad muvaffaqiyatli yaratildi!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (squadId: string) => {
    if (!isAuthenticated) { toast.error('Kirish talab qilinadi'); return; }
    try {
      await api.post(`/squads/${squadId}/join`);
      toast.success('Skvadga qo\'shildingiz!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-1">Skvadlar</h1>
          <p className="text-secondary">Jamoangizni toping yoki yangi skvad yarating</p>
        </div>
        {isAuthenticated && !user?.squadId && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-md">
            <Plus className="w-4 h-4" />
            Skvad yaratish
          </button>
        )}
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Yangi Skvad</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Skvad nomi *</label>
              <input
                id="squad-name"
                type="text"
                className="input"
                placeholder="Skvad nomini kiriting"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={50}
              />
            </div>
            <div>
              <label className="label">Tavsif</label>
              <textarea
                className="input h-24 resize-none"
                placeholder="Skvad haqida ma'lumot"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={500}
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost btn-md flex-1">Bekor qilish</button>
              <button type="submit" disabled={creating} className="btn btn-primary btn-md flex-1">
                {creating ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Yaratish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeleton w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 rounded w-1/2" />
                  <div className="skeleton h-3 rounded w-1/3" />
                </div>
              </div>
              <div className="skeleton h-3 rounded w-full mb-2" />
              <div className="skeleton h-8 rounded" />
            </div>
          ))}
        </div>
      ) : squads.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">Hali skvadlar yo'q</h3>
          <p className="text-secondary">Birinchi skvadni yarating!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {squads.map((squad, idx) => {
            const leader = typeof squad.leaderId === 'object' ? squad.leaderId : null;
            const isInThisSquad = user?.squadId === squad._id || (user?.squadId as any)?._id === squad._id;
            return (
              <div key={squad._id} className="card-hover p-6">
                <div className="flex items-center gap-3 mb-3">
                  {idx < 3 && (
                    <div className="absolute -top-2 -right-2">
                      <span className="badge badge-warning text-xs">#{idx + 1}</span>
                    </div>
                  )}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                    {squad.avatarUrl ? (
                      <img src={squad.avatarUrl} alt={squad.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg">{squad.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary truncate">{squad.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      {formatNumber(squad.totalPoints)} ball
                    </div>
                  </div>
                </div>

                {squad.description && (
                  <p className="text-sm text-secondary mb-3 line-clamp-2">{squad.description}</p>
                )}

                {leader && (
                  <p className="text-xs text-muted mb-3">Lider: <span className="text-primary font-medium">{leader.username}</span></p>
                )}

                <div className="flex gap-2">
                  <Link to={`/squads/${squad._id}`} className="btn btn-ghost btn-sm flex-1 border border-[rgb(var(--border))]">
                    Ko'rish
                  </Link>
                  {isAuthenticated && !user?.squadId && !isInThisSquad && (
                    <button onClick={() => handleJoin(squad._id)} className="btn btn-primary btn-sm flex-1">
                      Qo'shilish
                    </button>
                  )}
                  {isInThisSquad && (
                    <span className="badge badge-success">A'zosiz</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
