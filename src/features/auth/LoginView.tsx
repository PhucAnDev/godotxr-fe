import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ChevronDown, Sparkles, Star, Cloud, Users, GraduationCap, Shield, AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../public/HomeView';
import { mockLogin } from '../../lib/authMock';

export default function LoginView({ 
  onLogin, 
  onForgotPasswordClick,
  onBackToHome 
}: { 
  onLogin: (role: 'PARENT' | 'TEACHER' | 'ADMIN') => void; 
  onForgotPasswordClick?: () => void;
  onBackToHome?: () => void;
}) {
  const [email, setEmail] = useState('parent@godotxr.com');
  const [password, setPassword] = useState('parent123');
  const [role, setRole] = useState<'PARENT' | 'TEACHER' | 'ADMIN'>('PARENT');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync default credentials when selecting role of demo for supreme ease of evaluation
  const handleRoleSelect = (selectedRole: 'PARENT' | 'TEACHER' | 'ADMIN') => {
    setRole(selectedRole);
    setError(null);
    if (selectedRole === 'PARENT') {
      setEmail('parent@godotxr.com');
      setPassword('parent123');
    } else if (selectedRole === 'TEACHER') {
      setEmail('teacher@godotxr.com');
      setPassword('teacher123');
    } else if (selectedRole === 'ADMIN') {
      setEmail('admin@godotxr.com');
      setPassword('admin12345');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let formattedEmail = email.trim();
    if (!formattedEmail) {
      setError('Vui lòng nhập Email hoặc tên tài khoản của bạn.');
      return;
    }

    // Automatically append domain if it's a simple username/word
    if (!formattedEmail.includes('@')) {
      formattedEmail = `${formattedEmail.toLowerCase()}@godotxr.com`;
    }

    const result = mockLogin(formattedEmail, password, role);
    if (result.success && result.user) {
      onLogin(result.user.Role);
    } else {
      setError(result.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="flex min-h-screen lg:h-screen lg:overflow-hidden bg-[#FFFDF5] selection:bg-[#FF8E8E]/30 relative animate-fade-in">
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
                animate={{ rotate: [1.5, -1.5, 1.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 rounded-[40px] overflow-hidden border-[12px] border-white shadow-[0_24px_60px_-15px_rgba(0,0,0,0.12)] bg-white"
              >
                <img 
                  src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop" 
                  alt="Kid in VR"
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

              {/* Floating Elements - scaled down for compact fit */}
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [3, -3, 3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white p-4 rounded-[24px] shadow-xl z-20 border-2 border-yellow-100"
              >
                <Star className="w-8 h-8 text-yellow-400 fill-current" />
              </motion.div>

              <motion.div 
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-6 left-1/4 bg-[#4EACAF] p-4 rounded-full shadow-xl z-20 border-[4px] border-white"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>

              <motion.div 
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -left-8 bg-white p-3.5 rounded-2xl shadow-lg z-20 border border-sky-100"
              >
                <Cloud className="w-7 h-7 text-sky-400 fill-current opacity-30" />
              </motion.div>
            </div>

            {/* Content under image */}
            <div className="mt-8 space-y-2">
               <h2 className="text-3xl xl:text-4xl font-black italic tracking-tighter text-gray-900 leading-tight">
                 Khám phá thế giới <br /> luyện nói cùng <span className="text-[#FF8E8E]">GodotXR</span>
               </h2>
               <p className="text-sm xl:text-base text-gray-400 font-bold max-w-md">
                 Trẻ luyện tập trong ứng dụng VR, phụ huynh và giáo viên theo dõi tiến độ trên Web Dashboard.
               </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Login Form - Polished, Space-saving & Playful */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 lg:bg-white/50 lg:backdrop-blur-3xl lg:h-full lg:overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl flex flex-col justify-center animate-fade-in"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <Logo />
            </div>

            <div className="bg-white rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] border-b-8 border-gray-100 relative overflow-hidden group">
              {/* Form Header */}
              <div className="text-center mb-6 relative z-10">
                <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-gray-900 mb-1.5">
                  Chào mừng đến <span className="text-[#4EACAF]">GodotXR</span>!
                </h1>
                <p className="text-xs text-gray-400 font-extrabold tracking-normal">
                  Đăng nhập để quản lý và theo dõi quá trình luyện nói được đồng bộ từ ứng dụng VR.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-black flex items-start gap-2 leading-snug">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                    Email của bạn
                  </label>
                  <div className="relative group/input">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-[#4EACAF] transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="vidu@email.com hoặc tên tài khoản"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-6 py-3 rounded-2xl bg-gray-50/50 border-4 border-gray-50 focus:border-[#4EACAF] focus:bg-white focus:ring-4 focus:ring-[#4EACAF]/5 transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                    Mật khẩu
                  </label>
                  <div className="relative group/input">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-[#4EACAF] transition-colors">
                      <Shield className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-14 py-3 rounded-2xl bg-gray-50/50 border-4 border-gray-50 focus:border-[#4EACAF] focus:bg-white focus:ring-4 focus:ring-[#4EACAF]/5 transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#4EACAF] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Compact Accounts selectors */}
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#4EACAF] ml-1">
                      Tài khoản demo nhanh
                    </label>
                    <p className="text-[10.5px] text-gray-400 font-bold ml-1 mt-0.5 leading-tight">
                      Chọn loại tài khoản để tự điền thông tin demo. Quyền truy cập thực tế vẫn được xác định theo tài khoản đăng nhập.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'PARENT', label: 'Phụ huynh', icon: Users },
                      { id: 'TEACHER', label: 'Giáo viên', icon: GraduationCap },
                      { id: 'ADMIN', label: 'Admin', icon: Shield },
                    ].map((item) => (
                      <motion.button
                        key={item.id}
                        type="button"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleRoleSelect(item.id as any)}
                        className={`relative py-2.5 px-3 rounded-2xl border-4 transition-all flex flex-col items-center gap-1 active:translate-y-0.5 ${
                          role === item.id 
                            ? 'bg-[#4EACAF] border-[#4EACAF] text-white shadow-md shadow-[#4EACAF]/10 border-b-4 border-b-[#3d8a8c]' 
                            : 'bg-gray-50 border-gray-50 text-gray-450 hover:border-gray-100 hover:bg-gray-100 border-b-gray-200 border-b-4'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${role === item.id ? 'text-white' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="pt-3">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3.5 bg-[#4EACAF] hover:bg-[#398d90] text-white text-lg font-black rounded-2xl shadow-lg shadow-[#4EACAF]/10 transition-all italic tracking-tight border-b-4 border-b-[#3d8a8c] active:border-b-2 active:translate-y-0.5 cursor-pointer"
                  >
                    Đăng nhập ngay
                  </motion.button>
                </div>
              </form>

              <div className="mt-4 text-center relative z-10">
                <button type="button" onClick={onForgotPasswordClick} className="text-xs font-black uppercase tracking-wider text-[#FF8E8E] hover:text-[#d36666] transition-colors cursor-pointer">Quên mật khẩu?</button>
              </div>

              {/* Decorative circle */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF8E8E]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl group-hover:bg-[#FF8E8E]/10 transition-colors" />
            </div>

            <p className="mt-4 text-[10.5px] text-center text-gray-400 leading-relaxed max-w-sm mx-auto font-bold">
              GodotXR bảo mật dữ liệu luyện tập và thông tin trẻ.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
