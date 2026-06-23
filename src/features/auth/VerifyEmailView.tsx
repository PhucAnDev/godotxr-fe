import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, MailCheck, TriangleAlert } from 'lucide-react';
import { verifyEmail } from '../../services/authService';

type VerifyState = 'loading' | 'success' | 'error';

export default function VerifyEmailView() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerifyState>('loading');
  const [message, setMessage] = useState('Đang xác minh email của bạn...');

  useEffect(() => {
    const token = searchParams.get('token')?.trim();

    if (!token) {
      setState('error');
      setMessage('Liên kết xác minh không hợp lệ hoặc đã thiếu mã xác minh.');
      return;
    }

    let isMounted = true;

    verifyEmail(token).then((result) => {
      if (!isMounted) return;

      if (result.success) {
        setState('success');
        setMessage(
          result.message || 'Email đã được xác minh thành công. Bạn có thể đăng nhập.'
        );
        return;
      }

      setState('error');
      setMessage(result.errors.join(' ') || result.message);
    });

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-[36px] border border-slate-100 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)] p-8 md:p-10 text-center">
        <div
          className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
            state === 'success'
              ? 'bg-emerald-50 text-emerald-600'
              : state === 'error'
                ? 'bg-rose-50 text-rose-600'
                : 'bg-sky-50 text-sky-600'
          }`}
        >
          {state === 'loading' && <Loader2 className="w-8 h-8 animate-spin" />}
          {state === 'success' && <MailCheck className="w-8 h-8" />}
          {state === 'error' && <TriangleAlert className="w-8 h-8" />}
        </div>

        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-800">
          {state === 'loading' && 'Đang xác minh email'}
          {state === 'success' && 'Xác minh thành công'}
          {state === 'error' && 'Không thể xác minh email'}
        </h1>

        <p className="mt-3 text-sm md:text-base text-slate-500 font-medium leading-relaxed">
          {message}
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            to="/login"
            className="px-6 py-3 rounded-2xl bg-[#4EACAF] text-white font-black hover:bg-[#3f9799] transition-colors"
          >
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
