import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Zap, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">Sinov</span>
          </Link>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <Mail className="w-16 h-16 text-primary-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-primary mb-2">Xat yuborildi!</h1>
              <p className="text-secondary mb-6">
                Agar bu email ro'yxatdan o'tgan bo'lsa, parol tiklash havolasi yuborildi. Spam papkasini ham tekshiring.
              </p>
              <Link to="/login" className="btn btn-primary btn-md w-full">
                Kirish sahifasiga qaytish
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-primary mb-2">Parolni tiklash</h1>
              <p className="text-secondary mb-6">Email manzilingizni kiriting, tiklash havolasini yuboramiz</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none" />
                    <input
                      id="forgot-email"
                      type="email"
                      className="input pl-10"
                      placeholder="siz@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Havolani yuborish'}
                </button>
              </form>
            </>
          )}
        </div>

        <Link to="/login" className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mt-6 justify-center">
          <ArrowLeft className="w-4 h-4" />
          Kirish sahifasiga qaytish
        </Link>
      </div>
    </div>
  );
}
