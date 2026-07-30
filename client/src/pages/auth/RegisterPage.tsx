import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock, User, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Parol kamida 6 ta belgi bo\'lishi kerak');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Ro\'yxatdan o\'tdingiz! Emailingizni tasdiqlang.');
      navigate('/login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 200 + 50 + 'px',
                height: Math.random() * 200 + 50 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                transform: 'translate(-50%, -50%)',
                opacity: Math.random() * 0.5,
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">Sinov</span>
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            Bilimingizni sinab ko'ring!
          </h2>
          <p className="text-white/80 text-lg">
            Minglab testlar, viktorinalar va turnirlar. O'yin va qiziqish bilan o'rganing.
          </p>
          <div className="flex gap-6 mt-8">
            {[
              { label: '10K+', desc: 'Foydalanuvchilar' },
              { label: '5K+', desc: 'Testlar' },
              { label: '500+', desc: 'Kategoriyalar' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.label}</p>
                <p className="text-white/70 text-sm">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-base">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl gradient-text">Sinov</span>
            </Link>
            <h1 className="text-3xl font-display font-bold text-primary mb-2">Hisob yaratish</h1>
            <p className="text-secondary">Platformaga qo'shiling va testlar yarating</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Ism Familiya</label>
              <div className="relative">
                <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none" />
                <input
                  id="fullName"
                  type="text"
                  className="input pl-10"
                  placeholder="Kamol Kamolov"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Foydalanuvchi nomi</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none" />
                <input
                  id="username"
                  type="text"
                  className="input pl-10"
                  placeholder="kamolxon99"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  pattern="[a-zA-Z0-9_]+"
                />
              </div>
              <p className="text-xs text-muted mt-1">Faqat harflar, raqamlar va _ belgisi</p>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  className="input pl-10"
                  placeholder="siz@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Kamida 6 ta belgi"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full mt-6"
              id="register-btn"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Ro\'yxatdan o\'tish'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-secondary mt-6">
            Hisobingiz bormi?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
