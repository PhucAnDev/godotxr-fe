import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  User,
  Shield,
  Star,
  Sparkles,
  Cloud,
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
    <div className="flex min-h-screen lg:h-screen lg:overflow-hidden bg-[#FFFDF5] selection:bg-[#FF8E8E]/30 relative animate-fade-in w-full">
      {/* Back to Home Button */}
      {onBackToHome && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
          <motion.button
            whileHover={{ x: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBackToHome}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border-4 border-[#F2ECD8] hover:border-[#FF8E8E] text-gray-700 hover:text-gray-900 bg-white shadow-md font-black text-xs uppercase tracking-wider transition-all cursor-pointer select-none active:translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-[#4EACAF]" />
            <span className="font-extrabold tracking-wider">QUAY LẠI TRANG CHỦ</span>
          </motion.button>
        </div>
      )}

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4EACAF]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF8E8E]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10 w-full">
        {/* Left Side: Illustration - Immersive, Compact & Dynamic */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-10 xl:p-14 relative overflow-hidden h-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl relative flex flex-col justify-center"
          >
            {/* Main Image Container */}
            <div className="relative group">
              <motion.div 
                animate={{ rotate: [-1.5, -2.5, -1.5], y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 rounded-[32px] overflow-hidden border-[12px] border-white shadow-[0_24px_60px_-15px_rgba(0,0,0,0.12)] bg-white"
              >
                <img 
                  src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop" 
                  alt="Kid in VR"
                  className="w-full aspect-[3/2] object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Floating Elements - scaled and styled to match webMau exactly */}
              {/* 1. Yellow Star Badge at Top-Right */}
              <motion.div 
                animate={{ y: [0, -8, 0], rotate: [3, -3, 3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white p-3.5 rounded-[24px] shadow-xl z-20 border-2 border-[#F2ECD8] flex items-center justify-center cursor-default select-none"
              >
                <Star className="w-8 h-8 text-[#FFD93D] fill-[#FFD93D]" />
              </motion.div>

              {/* 2. Cloud Badge at Middle-Left */}
              <motion.div 
                animate={{ x: [0, 8, 0], y: [0, -4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[40%] -left-8 bg-white p-3.5 rounded-2xl shadow-xl z-20 border-2 border-[#F2ECD8] flex items-center justify-center cursor-default select-none"
              >
                <Cloud className="w-7 h-7 text-[#5DCEE7] fill-[#5DCEE7]" />
              </motion.div>

              {/* 3. Logo Badge at Bottom-Left */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-6 left-6 bg-white px-4 py-2.5 rounded-[20px] shadow-xl z-20 border-2 border-[#F2ECD8] flex items-center gap-2 cursor-default select-none"
              >
                <Logo className="scale-90 origin-left" />
              </motion.div>

              {/* 4. Sparkles Circle Badge at Bottom-Middle-Left */}
              <motion.div 
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 left-[180px] bg-[#4EACAF] p-3.5 rounded-full shadow-xl z-20 border-4 border-white flex items-center justify-center cursor-default select-none"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
            </div>

            {/* Content under image */}
            <div className="mt-10 space-y-3">
               <h2 className="text-3xl xl:text-4xl font-black italic tracking-tighter text-gray-900 leading-tight">
                 Khám phá thế giới <br /> luyện nói cùng <span className="text-[#FF8E8E]">GodotXR</span>
               </h2>
               <p className="text-sm xl:text-base text-gray-400 font-bold max-w-md leading-relaxed">
                 Trẻ luyện tập trong ứng dụng VR, phụ huynh và giáo viên theo dõi tiến độ trên Web Dashboard.
               </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Login Form - Polished, Space-saving & Playful */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 lg:h-full lg:overflow-y-auto z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[500px] flex flex-col justify-center animate-fade-in"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <Logo />
            </div>

            <div className="bg-white rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] border border-gray-100/50 relative overflow-hidden group">
              {/* Form Header */}
              <div className="text-center mb-8 relative z-10">
                <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-gray-900 mb-2">
                  Chào mừng đến <span className="text-[#4EACAF]">GodotXR</span>!
                </h1>
                <p className="text-xs text-gray-400 font-extrabold tracking-normal">
                  Đăng nhập để quản lý và theo dõi quá trình luyện nói được đồng bộ từ ứng dụng VR.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5 relative z-10">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-black flex items-start gap-2 leading-snug">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    EMAIL CỦA BẠN
                  </label>
                  <div className="relative group/input">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-[#4EACAF] transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="vidu@email.com hoặc tên tài khoản"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#FFFDF5]/50 border-2 border-[#F2ECD8]/50 focus:border-[#4EACAF] focus:bg-white focus:ring-4 focus:ring-[#4EACAF]/5 transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    MẬT KHẨU
                  </label>
                  <div className="relative group/input">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-[#4EACAF] transition-colors">
                      <Shield className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full pl-14 pr-14 py-4 rounded-2xl bg-[#FFFDF5]/50 border-2 border-[#F2ECD8]/50 focus:border-[#4EACAF] focus:bg-white focus:ring-4 focus:ring-[#4EACAF]/5 transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#4EACAF] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-3">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-[#4EACAF] hover:bg-[#398d90] text-white text-lg font-black rounded-2xl shadow-lg shadow-[#4EACAF]/10 transition-all italic tracking-tight border-b-4 border-b-[#3d8a8c] active:border-b-2 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang đăng nhập...
                      </>
                    ) : (
                      'Đăng nhập ngay'
                    )}
                  </motion.button>
                </div>
              </form>

              <div className="mt-5 text-center relative z-10">
                <button type="button" onClick={onForgotPasswordClick} className="text-xs font-black uppercase tracking-wider text-[#FF8E8E] hover:text-[#d36666] transition-colors cursor-pointer">QUÊN MẬT KHẨU?</button>
              </div>

              {/* Decorative circle */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF8E8E]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl group-hover:bg-[#FF8E8E]/10 transition-colors" />
            </div>

            <p className="mt-5 text-[10.5px] text-center text-gray-400 leading-relaxed max-w-sm mx-auto font-bold">
              GodotXR bảo mật dữ liệu luyện tập và thông tin trẻ.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
