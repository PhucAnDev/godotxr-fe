import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Baby, 
  Calendar, 
  Activity, 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Star, 
  Cloud,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './HomeView';
import { cn } from '../../lib/utils';

interface RegisterParentViewProps {
  onBackToLogin: () => void;
  onRegisterSuccess: (parentData: any) => void;
}

export default function RegisterParentView({ onBackToLogin, onRegisterSuccess }: RegisterParentViewProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // --- Step 1: Parent states ---
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Step 2: Kid optional states ---
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number>(5);
  const [childGender, setChildGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [childLevel, setChildLevel] = useState('Chưa đánh giá (Cần huấn luyện cơ bản)');
  const [childNote, setChildNote] = useState('');

  // UI Error messages
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic step 1 validation logic
  const handleNextStep = () => {
    setValidationError(null);

    if (!parentName.trim()) {
      setValidationError('Họ và tên phụ huynh không được để trống.');
      return;
    }
    if (!parentEmail.trim() || !parentEmail.includes('@')) {
      setValidationError('Vui lòng nhập địa chỉ Email chính xác của bạn.');
      return;
    }
    if (!parentPhone.trim() || parentPhone.length < 8) {
      setValidationError('Số điện thoại liên hệ không hợp lệ. Vui lòng nhập tối thiểu 8 chữ số.');
      return;
    }
    if (!password) {
      setValidationError('Mật khẩu không được bỏ trống.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Mật khẩu của bạn phải có chiều dài ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Mật khẩu và Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setStep(2);
  };

  // Submit complete registration state action
  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // If Parent submits step 2, we can run simple final validation
    setIsSubmitting(true);

    // Simulate database write
    setTimeout(() => {
      setIsSubmitting(false);
      // Execute registration success callback to parent component (usually logs them in or navigates)
      onRegisterSuccess({
        parent: {
          FullName: parentName,
          Email: parentEmail,
          PhoneNumber: parentPhone,
          Role: 'Parent',
        },
        child: childName ? {
          FullName: childName,
          Age: childAge,
          Gender: childGender,
          LearningLevel: childLevel,
          Note: childNote
        } : null
      });
    }, 1200);
  };

  return (
    <div className="flex min-h-screen bg-[#FFFDF5] selection:bg-[#FF8E8E]/30 overflow-hidden text-left" id="register-parent-view-container">
      {/* Background soft pastel bubble decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#4EACAF]/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FF8E8E]/5 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10 w-full">
        {/* Left Side: Illustration Panel - Matching LoginView design */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-20 relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl relative"
          >
            <div className="relative group">
              <motion.div 
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 rounded-[64px] overflow-hidden border-[16px] border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] bg-white"
              >
                <img 
                  src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop" 
                  alt="Kid in virtual reality headset"
                  className="w-full aspect-square object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-lg">
                      <Logo className="scale-75 origin-left" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating elements matching GodotXR's style */}
              <motion.div 
                animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -left-10 bg-white p-6 rounded-[32px] shadow-2xl z-25 border-4 border-yellow-100"
              >
                <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
              </motion.div>

              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-10 right-1/4 bg-[#FF8E8E] p-6 rounded-full shadow-2xl z-25 border-[8px] border-white"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>

              <motion.div 
                animate={{ x: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -right-12 bg-white p-5 rounded-3xl shadow-xl z-25 border-2 border-sky-100"
              >
                <Cloud className="w-10 h-10 text-sky-400 fill-current opacity-30" />
              </motion.div>
            </div>

            <div className="mt-16 space-y-4 text-left">
              <h2 className="text-5xl font-black italic tracking-tighter text-gray-900 leading-tight">
                Tham gia <span className="text-[#FF8E8E]">cộng đồng</span> <br />
                đồng hành cùng <span className="text-[#4EACAF]">Trẻ</span>
              </h2>
              <p className="text-xl text-gray-400 font-bold max-w-sm">
                Đăng ký tài khoản phụ huynh để theo dõi, quản sát và đồng hành cùng tiến trình bật âm thông minh của con yêu.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side Mode: Form input area */}
        <div className="flex-1 flex items-center justify-center p-6 lg:bg-white/50 lg:backdrop-blur-3xl min-h-screen">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl"
          >
            {/* Mobile Logo centered */}
            <div className="lg:hidden flex justify-center mb-10">
              <Logo />
            </div>

            <div className="bg-white rounded-[56px] p-8 sm:p-14 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)] border-b-8 border-gray-100 relative overflow-hidden">
              
              {/* Registration Header */}
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-gray-900 mb-3">
                  Đăng Ký Thành Viên
                </h1>
                
                {/* Step indicators */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <div className={cn(
                    "h-3.5 rounded-full transition-all duration-300 font-bold text-[9px] px-3.5 flex items-center justify-center text-white",
                    step === 1 ? "w-32 bg-[#4EACAF]" : "w-10 bg-[#4EACAF]/30"
                  )}>
                    {step === 1 ? '1. Thông tin phụ huynh' : '1'}
                  </div>
                  <div className={cn(
                    "h-3.5 rounded-full transition-all duration-300 font-bold text-[9px] px-3.5 flex items-center justify-center text-white",
                    step === 2 ? "w-32 bg-[#FF8E8E]" : "w-10 bg-[#FF8E8E]/30"
                  )}>
                    {step === 2 ? '2. Thông tin con yêu' : '2'}
                  </div>
                </div>
              </div>

              {/* Form Validation alerts */}
              {validationError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-black flex items-start gap-2.5 leading-snug"
                >
                  <span className="shrink-0 w-2 h-2 rounded-full bg-rose-500 mt-1.5 animate-bounce" />
                  <span>{validationError}</span>
                </motion.div>
              )}

              {/* Form elements with animation container */}
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Fullname input */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                        Họ và tên của phụ huynh
                      </label>
                      <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">
                          <User className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Ví dụ: Nguyễn Văn A"
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          className="w-full pl-15 pr-6 py-4.5 rounded-[24px] bg-gray-50/50 border-4 border-gray-50 focus:border-[#4EACAF] focus:bg-white transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    {/* Email input */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input
                          type="email"
                          placeholder="vidu@email.com"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          className="w-full pl-15 pr-6 py-4.5 rounded-[24px] bg-gray-50/50 border-4 border-gray-50 focus:border-[#4EACAF] focus:bg-white transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    {/* Phone number */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                        Số điện thoại liên lạc
                      </label>
                      <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">
                          <Phone className="w-5 h-5" />
                        </div>
                        <input
                          type="tel"
                          placeholder="090xxxxxxx"
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          className="w-full pl-15 pr-6 py-4.5 rounded-[24px] bg-gray-50/50 border-4 border-gray-50 focus:border-[#4EACAF] focus:bg-white transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    {/* Password line */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-2 text-left">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                          Mật khẩu bảo mật
                        </label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                            <Lock className="w-4.5 h-4.5" />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Tối thiểu 6 ký tự"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-13 pr-12 py-4.5 rounded-[24px] bg-gray-50/50 border-4 border-gray-50 focus:border-[#4EACAF] focus:bg-white transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4EACAF]"
                          >
                            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                          Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                            <Lock className="w-4.5 h-4.5" />
                          </div>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-13 pr-12 py-4.5 rounded-[24px] bg-gray-50/50 border-4 border-gray-50 focus:border-[#4EACAF] focus:bg-white transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4EACAF]"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                      </div>

                    </div>

                    <div className="pt-4">
                      <motion.button
                        type="button"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNextStep}
                        className="w-full py-5 bg-[#4EACAF] text-white text-base font-black rounded-[28px] shadow-lg shadow-[#4EACAF]/20 transition-all flex items-center justify-center gap-2.5 border-b-[8px] border-[#388385] hover:bg-[#5bbdbf] cursor-pointer"
                      >
                        Bước tiếp theo
                        <ArrowRight className="w-5 h-5 animate-pulse" />
                      </motion.button>
                    </div>

                  </motion.div>
                ) : (
                  <form
                    key="step-2"
                    onSubmit={handleSubmitRegistration}
                    className="space-y-6"
                  >
                    
                    {/* Child full name input */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                        Tên đầy đủ của con <span className="text-gray-400 capitalize font-bold text-[10px]">(Không bắt buộc)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">
                          <Baby className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Ví dụ: Nguyễn Tiến Minh (Leo)"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          className="w-full pl-15 pr-6 py-4.5 rounded-[24px] bg-gray-50/50 border-4 border-gray-50 focus:border-[#FF8E8E] focus:bg-white transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    {/* Age and gender line */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Age selection */}
                      <div className="space-y-2 text-left">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                          Độ tuổi của trẻ
                        </label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                            <Calendar className="w-4.5 h-4.5" />
                          </div>
                          <select
                            value={childAge}
                            onChange={(e) => setChildAge(parseInt(e.target.value))}
                            className="w-full pl-13 pr-10 py-4.5 rounded-[24px] bg-gray-50/50 border-4 border-gray-400/10 focus:border-[#FF8E8E] focus:bg-white appearance-none transition-all outline-none font-bold text-sm text-gray-800"
                          >
                            {[3, 4, 5, 6, 7, 8, 9, 10].map(yr => (
                              <option key={yr} value={yr}>{yr} tuổi</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Gender Selector Button-radio cards */}
                      <div className="space-y-2 text-left">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                          Giới tính của con
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'Male', label: 'Bé Trai' },
                            { id: 'Female', label: 'Bé Gái' },
                            { id: 'Other', label: 'Khác' }
                          ].map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setChildGender(g.id as any)}
                              className={cn(
                                "py-4 text-xs font-black rounded-2xl border-4 transition-all uppercase tracking-tight text-center leading-none",
                                childGender === g.id
                                  ? "bg-[#FF8E8E] border-[#FF8E8E] text-white shadow-md border-b-6 border-b-[#d56161]"
                                  : "bg-gray-50 border-gray-50 text-gray-550 border-b-6 border-b-gray-200"
                              )}
                            >
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Learning Level selection */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                        Tiến độ/Mức nói hiện tại của con
                      </label>
                      <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">
                          <Activity className="w-5 h-5" />
                        </div>
                        <select
                          value={childLevel}
                          onChange={(e) => setChildLevel(e.target.value)}
                          className="w-full pl-15 pr-10 py-4.5 rounded-[24px] bg-gray-50/50 border-4 border-gray-400/10 focus:border-[#FF8E8E] focus:bg-white appearance-none transition-all outline-none font-bold text-sm text-gray-800"
                        >
                          <option value="Chưa đánh giá (Cần huấn luyện cơ bản)">Chưa đánh giá (Cần đi từ bước bập bẹ)</option>
                          <option value="Bậc 1 - Phát âm đơn chuẩn mộc">Bậc 1 - Mới uốn phát âm nguyên âm đơn</option>
                          <option value="Bậc 2 - Âm ghép kết nối cơ bản">Bậc 2 - Ghép phụ âm kép và từ ngắn</option>
                          <option value="Bậc 3 - Diễn đạt lưu loát VR">Bậc 3 - Đọc trôi chảy câu chuyện dài</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Child note */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                        Ghi chú/Điều trị đặc biệt của bé
                      </label>
                      <div className="relative">
                        <div className="absolute left-6 top-5 text-gray-300">
                          <FileText className="w-5 h-5" />
                        </div>
                        <textarea
                          placeholder="Mô tả tật chậm nói, lỗi ngọng nhẹ hoặc lưu ý cụ phế âm nếu có..."
                          value={childNote}
                          onChange={(e) => setChildNote(e.target.value)}
                          rows={2.5}
                          className="w-full pl-15 pr-6 py-4 rounded-[24px] bg-gray-50/50 border-4 border-gray-50 focus:border-[#FF8E8E] focus:bg-white transition-all outline-none font-bold text-sm text-gray-900 placeholder:text-gray-300 resize-none font-sans"
                        />
                      </div>
                    </div>

                    {/* Button flow line */}
                    <div className="flex items-center gap-4 pt-4">
                      
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="py-4.5 px-6 border-4 border-gray-100 hover:border-gray-200 bg-white rounded-[24px] text-xs font-black text-gray-500 transition-all flex items-center justify-center gap-2 border-b-[8px] active:border-b-[4px] cursor-pointer shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại
                      </button>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-5 bg-[#FF8E8E] text-white text-base font-black rounded-[28px] shadow-lg shadow-[#FF8E8E]/20 transition-all flex items-center justify-center gap-2.5 border-b-[8px] border-[#d86868] hover:bg-[#ffa7a7] cursor-pointer"
                      >
                        {isSubmitting ? 'Đang tạo hồ sơ...' : 'Hoàn thành & Tạo tài khoản'}
                        {!isSubmitting && <Check className="w-5 h-5" />}
                      </motion.button>

                    </div>

                  </form>
                )}
              </AnimatePresence>

              {/* Footer link navigate back to login view */}
              <div className="mt-10 pt-6 border-t border-gray-50 flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
                <span>Đã có tài khoản phụ huynh?</span>
                <button 
                  onClick={onBackToLogin}
                  className="font-black text-[#4EACAF] hover:underline decoration-2 underline-offset-4 decoration-[#4EACAF]/30 cursor-pointer"
                >
                  Đăng nhập ngay
                </button>
              </div>

            </div>

            <p className="mt-8 text-[11px] text-center text-gray-400 font-bold uppercase tracking-tighter">
              Bảo vệ sự riêng tư & quyền con nhỏ là kim chỉ nam an toàn tuyệt đối của GodotXR.
            </p>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
