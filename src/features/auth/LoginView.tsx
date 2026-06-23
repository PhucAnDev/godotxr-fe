import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../public/HomeView';
import { useLogin } from '../../hooks/useLogin';
import type { LoginUserRole } from '../../hooks/useLogin';

export default function LoginView({
  onLogin,
  onForgotPasswordClick,
  onBackToHome,
}: {
  onLogin: (role: 'PARENT' | 'TEACHER' | 'ADMIN') => void;
  onForgotPasswordClick?: () => void;
  onBackToHome?: () => void;
}) {
  const { email, password, isLoading, error, setEmail, setPassword, handleSubmit } =
    useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    handleSubmit(event, (role: LoginUserRole) => onLogin(role));
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#4EACAF]/8 rounded-full blur-[110px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#FF8E8E]/8 rounded-full blur-[110px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {onBackToHome && (
        <button
          onClick={onBackToHome}
          className="absolute top-5 left-5 z-20 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:border-[#4EACAF] hover:text-[#4EACAF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang chủ
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center relative z-10"
      >
        <div className="hidden lg:block">
          <div className="rounded-[40px] overflow-hidden border-8 border-white shadow-[0_30px_80px_-24px_rgba(0,0,0,0.18)]">
            <img
              src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop"
              alt="Hình minh họa GodotXR"
              className="w-full h-[640px] object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)] p-8 md:p-10">
          <div className="flex justify-center lg:justify-start mb-6">
            <Logo />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800">
              Đăng nhập hệ thống
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">
              Theo dõi quá trình luyện tập, quản lý tài khoản và đồng hành cùng
              trẻ trên nền tảng GodotXR.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <FieldLabel text="Email đăng nhập" />
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full pl-13 pr-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#4EACAF] focus:bg-white outline-none font-bold text-slate-800"
                required
              />
            </div>

            <FieldLabel text="Mật khẩu" />
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-13 pr-14 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#4EACAF] focus:bg-white outline-none font-bold text-slate-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4EACAF]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-[#4EACAF] text-white font-black text-lg hover:bg-[#3f9799] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-sm font-black text-[#FF8E8E] hover:text-[#db7171] transition-colors"
            >
              Quên mật khẩu?
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FieldLabel({ text }: { text: string }) {
  return (
    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
      {text}
    </label>
  );
}
