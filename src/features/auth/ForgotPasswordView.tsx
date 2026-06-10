import React, { useState } from 'react';
import { 
  Mail, 
  KeyRound, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Star, 
  Cloud,
  Send,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  LockKeyhole,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../public/HomeView';
import { cn } from '../../lib/utils';
import { useForgotPassword } from '../../hooks/useForgotPassword';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
  onBackToHome?: () => void;
}

export default function ForgotPasswordView({ onBackToLogin, onBackToHome }: ForgotPasswordViewProps) {
  // ─── UI-only state (không liên quan đến business logic) ──────────────────
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ─── Toàn bộ logic & state từ hook ───────────────────────────────────────
  const {
    step,
    email, setEmail,
    otp, setOtp,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    isLoading,
    validationError,
    infoMessage,
    clearValidationError,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleResendOtp,
    handleChangeEmail,
    handleBack,
  } = useForgotPassword();

  return (
    <div className="flex min-h-screen lg:h-screen lg:overflow-hidden bg-[#FFFDF5] selection:bg-[#FF8E8E]/30 relative text-left" id="forgot-password-view-container">
      {/* Back to Home Button */}
      {onBackToHome && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
          <motion.button
            whileHover={{ x: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBackToHome}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-4 border-[#F2ECD8] hover:border-[#FF8E8E] text-gray-700 hover:text-gray-900 bg-white/90 hover:bg-white shadow-md font-black text-xs uppercase tracking-wider transition-all cursor-pointer select-none active:translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-[#4EACAF]" />
            <span>Quay lại trang chủ</span>
          </motion.button>
        </div>
      )}

      {/* Background soft pastel bubble decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4EACAF]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF8E8E]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10 w-full">
        {/* Left Side: Illustration Panel - Matching LoginView and RegisterParentView */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-10 xl:p-14 relative overflow-hidden h-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl relative flex flex-col justify-center"
          >
            <div className="relative group">
              <motion.div 
                animate={{ rotate: [1.5, -1.5, 1.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 rounded-[40px] overflow-hidden border-[12px] border-white shadow-[0_24px_60px_-15px_rgba(0,0,0,0.12)] bg-white"
              >
                <img 
                  src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop" 
                  alt="Kid in virtual reality headset"
                  className="w-full h-[40vh] xl:h-[48vh] object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white rounded-xl shadow-lg scale-90 origin-left">
                      <Logo className="scale-75 origin-left" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating elements matching GodotXR's style */}
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [3, -3, 3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white p-4 rounded-[24px] shadow-xl z-25 border-2 border-yellow-101"
              >
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </motion.div>

              <motion.div 
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-6 left-1/4 bg-[#4EACAF] p-4 rounded-full shadow-xl z-25 border-[4px] border-white"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>

              <motion.div 
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -left-8 bg-white p-3.5 rounded-2xl shadow-lg z-25 border border-pink-100"
              >
                <Cloud className="w-7 h-7 text-pink-300 fill-current opacity-30" />
              </motion.div>
            </div>

            <div className="mt-8 space-y-2 text-left">
              <h2 className="text-3xl xl:text-4xl font-black italic tracking-tighter text-gray-900 leading-tight">
                Khôi phục tài khoản <br />
                cùng <span className="text-[#4EACAF]">GodotXR</span>
              </h2>
              <p className="text-sm xl:text-base text-gray-400 font-bold max-w-sm">
                Nhập email, xác nhận mã OTP và tạo mật khẩu mới để tiếp tục truy cập hệ thống.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Form View Area */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 lg:bg-white/50 lg:backdrop-blur-3xl lg:h-full lg:overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl flex flex-col justify-center animate-fade-in"
          >
            {/* Mobile view top logo display */}
            <div className="lg:hidden flex justify-center mb-6">
              <Logo />
            </div>

            <div className="bg-white rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] border-b-8 border-gray-100 relative overflow-hidden">
              
              {/* Back button at top-left of the card */}
              <button 
                onClick={() => handleBack(onBackToLogin)}
                className="absolute left-6 top-6 w-9 h-9 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center transition-all cursor-pointer border border-slate-100 z-20"
                title="Quay lại"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>

              <div className="flex flex-col items-center justify-center mt-4 mb-6 text-center text-slate-800">
                <div className="w-12 h-12 bg-[#FF8E8E]/10 rounded-[22px] border-2 border-dashed border-[#FF8E8E]/30 flex items-center justify-center mb-3">
                  {step === 'EMAIL' && <KeyRound className="w-6 h-6 text-[#FF8E8E]" />}
                  {step === 'OTP' && <ShieldCheck className="w-6 h-6 text-[#4EACAF]" />}
                  {step === 'RESET_PASSWORD' && <LockKeyhole className="w-6 h-6 text-[#FF8E8E]" />}
                  {step === 'SUCCESS' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-gray-900 mb-1.5">
                  {step === 'EMAIL' && 'Quên mật khẩu'}
                  {step === 'OTP' && 'Nhập mã OTP'}
                  {step === 'RESET_PASSWORD' && 'Tạo mật khẩu mới'}
                  {step === 'SUCCESS' && 'Đặt lại mật khẩu thành công'}
                </h1>
                <p className="text-gray-400 font-bold text-xs max-w-xs leading-normal">
                  {step === 'EMAIL' && 'Nhập email tài khoản đã được cấp để nhận mã OTP đặt lại mật khẩu.'}
                  {step === 'OTP' && `Chúng tôi đã gửi mã OTP đến email ${email}. Vui lòng nhập mã gồm 6 chữ số để tiếp tục.`}
                  {step === 'RESET_PASSWORD' && `Đặt mật khẩu mới cho tài khoản ${email}. Mật khẩu mới sẽ được dùng cho lần đăng nhập tiếp theo.`}
                  {step === 'SUCCESS' && `Mật khẩu của tài khoản ${email} đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.`}
                </p>
              </div>

              {/* Step indicator */}
              {step !== 'SUCCESS' && (
                <div className="flex items-center justify-center gap-2.5 mb-6 bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100/80 max-w-sm mx-auto select-none">
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-black",
                    step === 'EMAIL' ? "text-[#FF8E8E]" : "text-emerald-600"
                  )}>
                    <span className={cn(
                      "w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black border-2",
                      step === 'EMAIL' ? "bg-[#FF8E8E]/10 border-[#FF8E8E]" : "bg-emerald-50 border-emerald-500 text-emerald-600"
                    )}>
                      {step !== 'EMAIL' ? "✓" : "1"}
                    </span>
                    <span>Email</span>
                  </div>
                  <div className="w-3.5 h-0.5 bg-slate-200" />
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-black",
                    step === 'OTP' ? "text-[#FF8E8E]" : (step === 'RESET_PASSWORD' ? "text-emerald-600" : "text-gray-300")
                  )}>
                    <span className={cn(
                      "w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black border-2",
                      step === 'OTP' ? "bg-[#FF8E8E]/10 border-[#FF8E8E]" : (step === 'RESET_PASSWORD' ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "bg-gray-100 border-gray-200 text-gray-400")
                    )}>
                      {step === 'RESET_PASSWORD' ? "✓" : "2"}
                    </span>
                    <span>OTP</span>
                  </div>
                  <div className="w-3.5 h-0.5 bg-slate-200" />
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-black",
                    step === 'RESET_PASSWORD' ? "text-[#FF8E8E]" : "text-gray-300"
                  )}>
                    <span className={cn(
                      "w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black border-2",
                      step === 'RESET_PASSWORD' ? "bg-[#FF8E8E]/10 border-[#FF8E8E]" : "bg-gray-100 border-gray-200 text-gray-400"
                    )}>
                      3
                    </span>
                    <span>Mật khẩu</span>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* ── BƯỚC 1: Nhập email ──────────────────────────────────── */}
                {step === 'EMAIL' && (
                  <motion.form 
                    key="email-step"
                    onSubmit={handleSendOtp}
                    className="space-y-4"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {validationError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-black flex items-start gap-2 leading-snug">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 animate-bounce" />
                        <span>{validationError}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#FFC0C0] md:text-gray-400 ml-1">
                        Email tài khoản
                      </label>
                      <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearValidationError();
                          }}
                          className="w-full pl-12 pr-6 py-3 rounded-2xl bg-gray-50/50 border-4 border-gray-50 focus:border-[#FF8E8E] focus:bg-white focus:ring-4 focus:ring-[#FF8E8E]/5 transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    <div className="pt-3">
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 bg-[#FF8E8E] hover:bg-[#ef7e7e] text-white text-base font-black rounded-2xl shadow-lg shadow-[#FF8E8E]/10 transition-all flex items-center justify-center gap-2 border-b-4 border-[#d46565] cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang gửi mã...
                          </>
                        ) : (
                          <>
                            Gửi mã OTP
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.form>
                )}

                {/* ── BƯỚC 2: Nhập OTP ────────────────────────────────────── */}
                {step === 'OTP' && (
                  <motion.form 
                    key="otp-step"
                    onSubmit={handleVerifyOtp}
                    className="space-y-4"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {validationError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-black flex items-start gap-2 leading-snug">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 animate-bounce" />
                        <span>{validationError}</span>
                      </div>
                    )}

                    {infoMessage && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-bold flex items-start gap-2 leading-snug">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 animate-pulse" />
                        <span>{infoMessage}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#FFC0C0] md:text-gray-400 ml-1">
                        Mã OTP
                      </label>
                      <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Nhập 6 chữ số"
                          value={otp}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setOtp(val);
                            clearValidationError();
                          }}
                          className="w-full pl-12 pr-6 py-3 rounded-2xl bg-gray-50/50 border-4 border-gray-50 focus:border-[#FF8E8E] focus:bg-white focus:ring-4 focus:ring-[#FF8E8E]/5 transition-all outline-none font-black text-center text-lg tracking-[0.25em] text-gray-905 placeholder:tracking-normal placeholder:font-bold placeholder:text-gray-300 placeholder:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-1 text-xs font-bold text-gray-400 select-none">
                      <button 
                        type="button" 
                        onClick={handleChangeEmail}
                        className="text-[#4EACAF] hover:underline cursor-pointer"
                      >
                        Đổi Email
                      </button>
                      <button 
                        type="button" 
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="flex items-center gap-1 text-[#FF8E8E] hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {isLoading
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <RefreshCcw className="w-3.5 h-3.5" />
                        }
                        Gửi lại mã
                      </button>
                    </div>

                    <div className="pt-3">
                      <motion.button
                        type="submit"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 bg-[#FF8E8E] hover:bg-[#ef7e7e] text-white text-base font-black rounded-2xl shadow-lg shadow-[#FF8E8E]/10 transition-all flex items-center justify-center gap-2 border-b-4 border-[#d46565] cursor-pointer"
                      >
                        Xác nhận OTP
                        <Send className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.form>
                )}

                {/* ── BƯỚC 3: Đặt mật khẩu mới ───────────────────────────── */}
                {step === 'RESET_PASSWORD' && (
                  <motion.form 
                    key="reset-password-step"
                    onSubmit={handleResetPassword}
                    className="space-y-4"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {validationError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-black flex items-start gap-2 leading-snug">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 animate-bounce" />
                        <span>{validationError}</span>
                      </div>
                    )}

                    {/* New Password Input */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                          <LockKeyhole className="w-5 h-5" />
                        </div>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Mật khẩu tối thiểu 8 ký tự"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            clearValidationError();
                          }}
                          className="w-full pl-12 pr-12 py-3 rounded-2xl bg-gray-50/50 border-4 border-gray-50 focus:border-[#FF8E8E] focus:bg-white focus:ring-4 focus:ring-[#FF8E8E]/5 transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                          <LockKeyhole className="w-5 h-5" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Xác nhận lại mật khẩu mới"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            clearValidationError();
                          }}
                          className="w-full pl-12 pr-12 py-3 rounded-2xl bg-gray-50/50 border-4 border-gray-50 focus:border-[#FF8E8E] focus:bg-white focus:ring-4 focus:ring-[#FF8E8E]/5 transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-3">
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 bg-[#FF8E8E] hover:bg-[#ef7e7e] text-white text-base font-black rounded-2xl shadow-lg shadow-[#FF8E8E]/10 transition-all flex items-center justify-center gap-2 border-b-4 border-[#d46565] cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang cập nhật...
                          </>
                        ) : (
                          <>
                            Cập nhật mật khẩu
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.form>
                )}

                {/* ── BƯỚC 4: Thành công ──────────────────────────────────── */}
                {step === 'SUCCESS' && (
                  <motion.div 
                    key="success-state"
                    className="space-y-4 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col items-center gap-2 text-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                      <div>
                        <h4 className="text-[#107F4A] font-black text-sm mb-1">Cập nhật thành công!</h4>
                        <p className="text-gray-500 font-bold text-xs leading-relaxed">
                          Mật khẩu mới cho tài khoản <strong className="text-gray-700">{email}</strong> đã được thiết lập thành công. Vui lòng quay lại màn hình chính để đăng nhập.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <motion.button
                        type="button"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onBackToLogin}
                        className="w-full py-3.5 bg-[#4EACAF] text-white text-base font-black rounded-2xl shadow-lg shadow-[#4EACAF]/10 transition-all flex items-center justify-center gap-2 border-b-4 border-[#378183] hover:bg-[#3d9092] cursor-pointer"
                      >
                        Quay lại đăng nhập
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Direct links footer line */}
              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 select-none">
                <span>Nhớ mật khẩu tài khoản?</span>
                <button 
                  onClick={onBackToLogin}
                  className="font-black text-[#4EACAF] hover:underline decoration-2 underline-offset-4 decoration-[#4EACAF]/30 cursor-pointer"
                >
                  Đăng nhập ngay
                </button>
              </div>

            </div>

            <p className="mt-4 text-[10.5px] text-center text-gray-400 font-bold">
              GodotXR bảo mật dữ liệu luyện tập và thông tin trẻ.
            </p>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
