import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Zap } from 'lucide-react';
import api from '../../lib/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (!token) {
      setStatus('error');
      setMessage('Token topilmadi');
      return;
    }

    api
      .get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('success');
        setMessage('Email muvaffaqiyatli tasdiqlandi!');
      })
      .catch((err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } };
        setStatus('error');
        setMessage(error.response?.data?.message || 'Token yaroqsiz yoki muddati tugagan');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl gradient-text">Sinov</span>
        </Link>

        <div className="card p-8">
          {status === 'loading' && (
            <>
              <Loader className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-primary mb-2">Tekshirilmoqda...</h1>
              <p className="text-secondary">Email tasdiqlash jarayoni davom etmoqda</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-primary mb-2">Barakalla!</h1>
              <p className="text-secondary mb-6">{message}</p>
              <Link to="/login" className="btn btn-primary btn-lg w-full">
                Kirish sahifasiga o'tish
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-primary mb-2">Xatolik!</h1>
              <p className="text-secondary mb-6">{message}</p>
              <Link to="/register" className="btn btn-primary btn-lg w-full">
                Qayta ro'yxatdan o'tish
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
