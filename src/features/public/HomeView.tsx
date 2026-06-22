import { motion } from 'motion/react';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Mic, 
  BookOpen, 
  Smile, 
  Target, 
  RotateCcw, 
  History, 
  Settings, 
  FileText, 
  ShieldCheck, 
  Star, 
  Award,
  Users,
  GraduationCap,
  Sparkles,
  Heart,
  Cloud,
  Rocket,
  PlayCircle,
  Video,
  TrendingUp,
  Activity,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export function Logo({ className, onClick }: { className?: string, onClick?: () => void }) {
  return (
    <div 
      className={cn("flex items-center space-x-3 group cursor-pointer", className)}
      onClick={onClick}
    >
      <motion.div 
        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
        className="relative w-10 h-10 flex-shrink-0"
      >
        <div className="absolute inset-0 bg-[#FF6B6B] rounded-[12px] shadow-md transform rotate-3 transition-transform group-hover:rotate-0" />
        <div className="absolute inset-0 bg-[#FF8E8E] rounded-[12px] flex flex-col items-center justify-center p-1.5 border-2 border-white/50">
           {/* Robot Eyes */}
           <div className="flex space-x-2 mb-0.5">
             <div className="w-2 h-2 bg-[#4EE9FF] rounded-full shadow-[0_0_6px_#4EE9FF]" />
             <div className="w-2 h-2 bg-[#4EE9FF] rounded-full shadow-[0_0_6px_#4EE9FF]" />
           </div>
           {/* Robot Mouth Wave */}
           <div className="w-5 h-0.5 bg-[#4EE9FF] rounded-full opacity-80" />
        </div>
      </motion.div>
      <span className="text-xl font-black italic tracking-tighter select-none">
        Godot<span className="text-[#FF8E8E]">XR</span>
      </span>
    </div>
  );
}

export default function HomeView({ 
  onGetStarted, 
  onLogin 
}: { 
  onGetStarted: () => void; 
  onLogin: () => void;
}) {
  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FFFDF5] min-h-screen font-sans selection:bg-[#FF8E8E]/30 overflow-x-hidden relative">
      {/* Soft Decorative Ambient Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-100/40 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-orange-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-purple-100/20 rounded-full blur-[120px]" />
      </div>

      {/* Dynamic Floating VR Particles & Icons */}
      <div className="absolute inset-x-0 top-0 h-[850px] pointer-events-none z-0 overflow-hidden hidden md:block">
        <motion.div 
          animate={{ y: [0, -15, 0], x: [0, 10, 0], rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute top-[18%] left-[6%] w-14 h-14 bg-[#4EACAF]/10 rounded-full flex items-center justify-center p-3 text-[#4EACAF] border border-[#4EACAF]/20"
        >
          <Mic className="w-5 h-5 animate-pulse" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 20, 0], x: [0, -12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[48%] left-[3%] w-11 h-11 bg-[#FF8E8E]/10 rounded-xl flex items-center justify-center text-[#FF8E8E] border border-[#FF8E8E]/20"
        >
          <Sparkles className="w-4.5 h-4.5" />
        </motion.div>

        <motion.div 
          animate={{ y: [0, -25, 0], rotate: -45 }}
          transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[28%] right-[8%] w-16 h-16 bg-[#FFD93D]/10 rounded-[24px] flex items-center justify-center text-[#FFD93D] border border-[#FFD93D]/25"
        >
          <Star className="w-6 h-6 fill-current" />
        </motion.div>

        <motion.div 
          animate={{ scale: [1, 1.15, 1], y: [0, 12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[70%] right-[22%] w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center text-sky-500 opacity-60 border border-sky-100"
        >
          <Cloud className="w-5 h-5" />
        </motion.div>
      </div>

      <Header onLogin={onLogin} onGetStarted={onGetStarted} scrollToId={scrollToId} />

      {/* SECTION 1: Hero Section */}
      <section id="hero" className="relative pt-[110px] pb-16 px-6 overflow-hidden md:min-h-[90vh] flex items-center z-10">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content: Compact and Informative */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-orange-100 rounded-full shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#FF8E8E] animate-ping" />
              <span className="font-extrabold text-[#FF8E8E] tracking-wide uppercase text-xs">Hệ thống giám sát & đồng hành VR</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-gray-900 leading-[1.1] tracking-tighter italic">
              Luyện nói cùng <span className="text-[#FF8E8E] relative inline-block">VR<span className="absolute left-0 bottom-1 w-full h-2.5 bg-[#FF8E8E]/15 -z-10" /></span> <br />
              Theo dõi tiến độ trên <span className="text-[#4EACAF] relative inline-block">Dashboard<span className="absolute left-0 bottom-1 w-full h-2.5 bg-[#4EACAF]/15 -z-10" /></span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl font-bold">
              GodotXR hỗ trợ phụ huynh và giáo viên theo dõi quá trình luyện nói của trẻ 7–11 tuổi thông qua dữ liệu đồng bộ từ ứng dụng VR, bao gồm kết quả bài tập, phát âm, replay và phân tích tiến độ.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onGetStarted}
                className="group px-8 py-4 bg-[#4EACAF] hover:bg-[#3d8a8c] text-white text-base font-black rounded-full shadow-lg shadow-[#4EACAF]/20 transition-all cursor-pointer flex items-center gap-2"
              >
                Bắt đầu ngay <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onLogin}
                className="px-8 py-4 border-[3px] border-[#F2ECD8] hover:border-[#FF8E8E] text-gray-800 text-base font-black rounded-full bg-white/60 backdrop-blur-md transition-all shadow-md cursor-pointer"
              >
                Đăng nhập Dashboard
              </motion.button>
            </div>

            {/* Chips block: clarifying child vs parents right in Hero fold */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 w-fit">
              <div className="flex -space-x-3 mr-1">
                {[1, 2, 3].map(i => (
                  <img 
                    key={i} 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 6}`} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full border-2 border-white bg-white shadow-sm" 
                    referrerPolicy="no-referrer" 
                  />
                ))}
              </div>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-black rounded-full border border-teal-100">● Phụ huynh theo dõi</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-full border border-blue-100">● Giáo viên đồng hành</span>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-black rounded-full border border-amber-100">● Dữ liệu từ App VR</span>
            </div>
          </motion.div>

          {/* Right Hero Content: Premium Interactive Mockup Dashboard (No empty space) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-5 relative mt-8 lg:mt-0 flex items-center justify-center p-6"
          >
            {/* Visual background ornament */}
            <div className="absolute inset-0 bg-[#F2ECD8]/30 rounded-[48px] rotate-2 transform pointer-events-none -z-10 scale-95" />
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-[48px] -rotate-2 transform pointer-events-none -z-10 scale-95 border border-white" />

            {/* Central Main Dashboard Widget */}
            <div className="relative bg-white border-4 border-[#F2ECD8] rounded-[36px] p-6 shadow-2xl w-full max-w-[340px] z-10 transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Đồng bộ từ VR kính</span>
                </div>
                <Activity className="w-4 h-4 text-[#4EACAF]" />
              </div>

              {/* Kid Profile Header */}
              <div className="flex items-center gap-3">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=An" 
                  alt="Minh An" 
                  className="w-11 h-11 rounded-full bg-[#FFFDF5] border-2 border-[#4EACAF]/30 p-0.5"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-sm font-black text-gray-800 leading-tight">Minh An (Trẻ)</h4>
                  <p className="text-[11px] text-gray-400 font-bold">Phân lớp: Mầm xanh A · 8 tuổi</p>
                </div>
              </div>

              {/* Dynamic Speech Waves Visualizer */}
              <div className="mt-3.5 flex items-center justify-between px-3 py-1.5 bg-[#4EACAF]/5 rounded-xl border border-[#4EACAF]/10">
                <span className="text-[9.5px] font-black text-[#4EACAF] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF8E8E] animate-ping" />
                  Đang bầm âm VR
                </span>
                <div className="flex items-end gap-[2px] h-3 ml-2">
                  {[0.4, 0.9, 0.5, 0.8, 0.3, 0.75, 0.45, 0.6].map((h, i) => (
                    <motion.div 
                      key={i}
                      animate={{ scaleY: [1, h * 2.6, 1] }}
                      transition={{ 
                        duration: 0.6 + (i % 3) * 0.15, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="w-[2.5px] bg-gradient-to-t from-[#4EACAF] to-[#FF8E8E] rounded-full h-full origin-bottom"
                    />
                  ))}
                </div>
              </div>

              {/* Progress Slider Display */}
              <div className="space-y-1.5 mt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-gray-500">Tiến độ phát âm tuần này</span>
                  <span className="font-black text-[#4EACAF]">72%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#4EACAF] to-[#6CD3D6] rounded-full" style={{ width: '72%' }} />
                </div>
              </div>

              {/* Key Value Micro Statistics */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50 mt-4 text-center">
                <div className="p-2 bg-rose-50/50 rounded-xl border border-rose-100/50">
                  <p className="text-xs font-black text-rose-600">24</p>
                  <p className="text-[9px] text-gray-400 font-bold">Bài tập</p>
                </div>
                <div className="p-2 bg-teal-50/50 rounded-xl border border-teal-100/50">
                  <p className="text-xs font-black text-teal-600">86%</p>
                  <p className="text-[9px] text-gray-400 font-bold">Tỷ lệ đúng</p>
                </div>
                <div className="p-2 bg-amber-50/50 rounded-xl border border-amber-100/50">
                  <p className="text-xs font-black text-amber-600">18m</p>
                  <p className="text-[9px] text-gray-400 font-bold">Hôm nay</p>
                </div>
              </div>
            </div>

            {/* Floating Widget 1: Replay buổi học (Top-Right) */}
            <motion.div 
              {...floatAnimation(0)}
              whileHover={{ scale: 1.05 }}
              className="absolute -top-6 -right-4 md:-right-8 bg-white/95 border-2 border-[#E5DFCA]/40 rounded-2xl p-3 shadow-xl flex items-center gap-2.5 max-w-[190px] z-20 cursor-default"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <PlayCircle className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-black text-slate-800">Replay buổi học</p>
                <p className="text-[9px] text-slate-400 font-bold font-mono">Xem video ghi hình</p>
              </div>
            </motion.div>

            {/* Floating Widget 2: Chi tiết phát âm (Bottom-Left) */}
            <motion.div 
              {...floatAnimation(1)}
              whileHover={{ scale: 1.05 }}
              className="absolute -bottom-4 -left-4 md:-left-8 bg-white/95 border-2 border-[#E5DFCA]/40 rounded-2xl p-3 shadow-xl flex items-center gap-2.5 max-w-[190px] z-20 cursor-default"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-black text-slate-800">Chi tiết phát âm</p>
                <p className="text-[9px] text-slate-400 font-bold font-mono">Phân tích âm vị sai</p>
              </div>
            </motion.div>

            {/* Floating Widget 3: Khuyến nghị bài tập (Bottom-Right) */}
            <motion.div 
              {...floatAnimation(1.8)}
              whileHover={{ scale: 1.05 }}
              className="absolute bottom-[40px] -right-4 bg-white/95 border-2 border-[#E5DFCA]/40 rounded-2xl p-3 shadow-xl flex items-center gap-2.5 max-w-[190px] z-20 cursor-default"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-500 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-black text-slate-800">Khuyến nghị</p>
                <p className="text-[9px] text-slate-400 font-bold font-mono">Gợi ý lộ trình cá nhân</p>
              </div>
            </motion.div>

            {/* Floating Widget 4: Báo cáo tiến độ (Left/Top-Left) */}
            <motion.div 
              {...floatAnimation(2.5)}
              whileHover={{ scale: 1.05 }}
              className="absolute top-[40px] -left-8 bg-white/95 border-2 border-[#E5DFCA]/40 rounded-2xl p-3 shadow-xl flex items-center gap-2.5 max-w-[190px] z-20 cursor-default"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-500 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-black text-slate-800">Báo cáo tiến độ</p>
                <p className="text-[9px] text-slate-400 font-bold font-mono">Thống kê Tuần, Tháng</p>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* CLARIFICATION NOTE CHIP */}
      <section className="py-6 px-6 bg-[#F2ECD8]/20 border-y border-[#E5DFCA]/30 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-white p-4 rounded-2xl border border-orange-100 shadow-sm text-xs justify-center text-gray-500">
          <Info className="w-4.5 h-4.5 text-[#FF8E8E] shrink-0" />
          <span className="font-semibold leading-relaxed text-center">
            <strong>Ghi chú giáo dục:</strong> GodotXR là công cụ trực quan hóa tiến độ và đồng bộ bài tập, không tham gia chẩn đoán lâm sàng hay thay thế các chu trình phục hồi chức năng của trung tâm chuyên nghiệp.
          </span>
        </div>
      </section>

      {/* SECTION 2: Vì sao GodotXR hữu ích? */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-12"
        >
          <span className="font-extrabold text-xs text-[#4EACAF] uppercase tracking-widest bg-[#4EACAF]/10 px-3 py-1 rounded-full">Lợi Ích Cốt Lõi</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Vì sao GodotXR hữu ích?</h2>
          <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto font-bold">Giải pháp giúp kết nối dữ liệu luyện nói, nâng cao hiệu quả can thiệp ngôn ngữ.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BenefitCard 
            icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
            title="Theo dõi tiến độ luyện nói"
            description="Phụ huynh và giáo viên xem được kết quả bài tập, thời lượng luyện tập và mức độ hoàn thành của trẻ từ 7-11 tuổi."
            bgColor="bg-emerald-50"
            delay={0}
          />
          <BenefitCard 
            icon={<Video className="w-6 h-6 text-orange-500" />}
            title="Xem lại buổi luyện tập"
            description="Replay, audio và interaction log giúp người lớn quan sát quá trình rèn luyện khẩu hình thay vì chỉ xem điểm số."
            bgColor="bg-orange-50"
            delay={0.15}
          />
          <BenefitCard 
            icon={<Users className="w-6 h-6 text-[#4EACAF]" />}
            title="Đồng hành Gia đình & Nhà trường"
            description="Dữ liệu học tập được trình bày rõ ràng để giáo viên và phụ huynh phối hợp lập kế hoạch bài tập tiếp theo dễ dàng."
            bgColor="bg-sky-50"
            delay={0.3}
          />
        </div>
      </section>

      {/* SECTION 3: Hệ thống hoạt động như thế nào? */}
      <section id="how-it-works" className="py-20 px-6 bg-white border-y border-gray-100 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 mb-16"
          >
            <span className="font-extrabold text-xs text-[#FF8E8E] uppercase tracking-widest bg-[#FF8E8E]/10 px-3 py-1 rounded-full">Chu trình 3 bước</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Hệ thống hoạt động như thế nào?</h2>
            <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto font-bold">Mô hình đồng bộ từ không gian ảo VR đến giao diện quản lý trên Web.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
            <FlowStepCard 
              step="01"
              icon={<Rocket className="w-7 h-7 text-white" />}
              iconBg="bg-blue-400"
              title="Trẻ luyện tập trong App VR"
              description="Trẻ thực hiện bài tập phát âm, từ vựng và oral motor trong thế giới trò chơi thực tế ảo đầy sinh động."
              delay={0}
            />
            <FlowStepCard 
              step="02"
              icon={<Cloud className="w-7 h-7 text-white" />}
              iconBg="bg-[#FF8E8E]"
              title="Dữ liệu tự động đồng bộ"
              description="Kết quả chấm âm vị học, băng ghi âm và interaction log được mã hóa truyền gửi về cơ sở dữ liệu."
              delay={0.15}
            />
            <FlowStepCard 
              step="03"
              icon={<GraduationCap className="w-7 h-7 text-white" />}
              iconBg="bg-[#4EACAF]"
              title="Theo dõi trên Web Dashboard"
              description="Phụ huynh, Giáo viên mở trình duyệt xem biểu đồ tiến độ, quản lý hồ sơ và tinh chỉnh cấp độ bài tập."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: Tính năng theo vai trò */}
      <section id="roles" className="py-20 px-6 max-w-7xl mx-auto z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-14"
        >
          <span className="font-extrabold text-xs text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Đối Tượng Sử Dụng</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Tính năng theo vai trò</h2>
          <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto font-bold">Tính năng được thiết kế riêng biệt để đáp ứng vai trò điều phối.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Parent Role Column */}
          <RoleCard 
            title="Parent / Phụ huynh"
            desc="Trang giám sát cá nhân đồng hành cùng con tại gia."
            color="border-teal-200"
            colorText="text-[#4EACAF]"
            points={[
              "Xem thông tin hồ sơ và lộ trình của con",
              "Theo dõi lịch sử rèn rũa chi tiết qua biểu đồ",
              "Nghe file audio và replay khoảnh khắc nói",
              "Nhận khuyến nghị luyện nói bổ sung từ thầy cô"
            ]}
            delay={0}
          />

          {/* Teacher Role Column */}
          <RoleCard 
            title="Teacher / Giáo viên"
            desc="Trang tổng quan hỗ trợ chuyên môn và dạy học."
            color="border-orange-200"
            colorText="text-orange-500"
            points={[
              "Quản lý danh sách lớp học và từng học sinh",
              "Đăng ký thông tin phụ huynh và kích hoạt hồ sơ",
              "Đánh giá chính xác lỗi phát âm của từng cháu",
              "Thay đổi độ khó bài tập để phù hợp tiến bộ"
            ]}
            delay={0.15}
          />

          {/* Admin Role Column */}
          <RoleCard 
            title="Admin / Quản trị viên"
            desc="Quản lý toàn bộ hệ sinh thái lưu trữ học thuật."
            color="border-purple-200"
            colorText="text-purple-600"
            points={[
              "Phê duyệt và phân quyền tài khoản Giáo viên",
              "Tạo mới học kỳ, niên khóa giảng dạy",
              "Xây dựng kho câu hỏi và các gói từ vựng",
              "Xem tổng hợp báo cáo vận hành toàn bộ hệ thống"
            ]}
            delay={0.3}
          />

        </div>
      </section>

      {/* SECTION 5: Dữ liệu học tập được hiển thị */}
      <section id="analytics" className="py-20 px-6 bg-[#FDFCF5] border-t border-gray-100 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 mb-16"
          >
            <span className="font-extrabold text-xs text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">Các thông số theo dõi</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Dữ liệu học tập thực tế</h2>
            <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto font-bold font-sans">Các cấu phần thông tin trực quan hóa giúp phụ huynh nắm rõ lộ trình cải thiện.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <GridDataCard title="Kết quả bài tập" text="Xem thống kê tỷ lệ đúng sai từng câu hỏi bài thi." icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} delay={0} />
            <GridDataCard title="Thời lượng luyện" text="Tính toán số phút trẻ tương tác VR tránh mệt mỏi." icon={<History className="w-5 h-5 text-sky-500" />} delay={0.08} />
            <GridDataCard title="Trạng thái bài" text="Ghi nhận mốc bài tập đã vượt qua và các phần dang dở." icon={<Award className="w-5 h-5 text-amber-500" />} delay={0.16} />
            <GridDataCard title="Chi tiết phát âm" text="Phát hiện lỗi ghép vần, phát âm sai phụ âm đầu." icon={<Mic className="w-5 h-5 text-rose-500" />} delay={0.24} />
            <GridDataCard title="Replay & Audio" text="Lắng nghe giọng đọc gốc và clip VR tái hiện 3D." icon={<PlayCircle className="w-5 h-5 text-indigo-500" />} delay={0.32} />
            <GridDataCard title="Phân tích tiến bộ" text="Biểu đồ trực quan hóa tốc độ thăng tiến kỹ năng nói." icon={<TrendingUp className="w-5 h-5 text-teal-500" />} delay={0.4} />
          </div>
        </div>
      </section>

      {/* SECTION 6: Lợi ích giáo dục */}
      <section id="education" className="py-20 px-6 max-w-6xl mx-auto z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="bg-white border-2 border-[#F2ECD8] rounded-[48px] p-8 md:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-500">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Yếu tố giáo dục & Tính nhân văn</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-bold">
              Không chỉ là điểm số, GodotXR là cầu nối thông tin để phụ huynh có thể ôm con vào lòng và hiểu con đang gặp khó khăn gì khi phát âm ngoài đời thực.
            </p>
          </div>
          <div className="lg:col-span-1" />
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EduPoint title="Theo dõi tiến bộ" text="Cập nhật biểu đồ hằng tuần của trẻ chi tiết." delay={0} />
            <EduPoint title="Phát hiện sớm lỗi" text="Tìm ra từ khó phát âm để kèm cặp trực tiếp." delay={0.1} />
            <EduPoint title="Gắn kết giao tiếp" text="Giúp cha mẹ hiểu khó khăn của con khi nói." delay={0.2} />
            <EduPoint title="Học tập không áp lực" text="Học qua VR giúp trẻ tự tin phát âm tự nhiên." delay={0.3} />
          </div>
        </motion.div>
      </section>

      {/* SECTION 7: CTA cuối trang (Premium Dark Background) */}
      <section className="py-16 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="bg-[#1C1C1E] rounded-[48px] p-8 md:p-16 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#4EACAF1a_0%,_transparent_60%)] pointer-events-none" />
          
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight italic">
              Sẵn sàng đồng hành cùng trẻ <br /> trong <span className="text-[#FFD93D] underline decoration-wavy">hành trình luyện nói?</span>
            </h3>
            <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed">
              Hãy đăng nhập vào GodotXR để quản lý các lớp học, theo dõi kết quả đo âm và phân tích sâu tiến trình cải thiện phát âm của trẻ từ kính VR.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogin}
                className="px-8 py-4 bg-[#4EACAF] hover:bg-[#3d8a8c] text-white font-extrabold rounded-full shadow-lg cursor-pointer text-sm tracking-wide uppercase"
              >
                Đăng nhập Dashboard
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToId('how-it-works')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-full cursor-pointer text-sm border border-white/20"
              >
                Tìm hiểu cách hoạt động
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Footer */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-10 px-6 z-10 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-12">
          <div className="lg:col-span-5 space-y-4">
            <Logo />
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm font-semibold">
              Hệ thống website quản lý thông tin can thiệp, đồng bộ tài khoản và đo lường chỉ số rèn chữ bẩm âm của trẻ từ game VR GodotXR.
            </p>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <FooterCol title="Đường dẫn nhanh" links={[
              { name: "Cách hoạt động", id: "how-it-works" },
              { name: "Tính năng", id: "features" },
              { name: "Phân loại", id: "roles" }
            ]} scrollToId={scrollToId} />
            <FooterCol title="Tính năng" links={[
              { name: "Soi đồ tiến độ", id: "analytics" },
              { name: "Giá trị can thiệp", id: "education" }
            ]} scrollToId={scrollToId} />
            <div className="space-y-3">
              <h5 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Tài khoản</h5>
              <button onClick={onLogin} className="text-xs text-gray-500 font-bold hover:text-[#4EACAF] transition-colors uppercase tracking-wider block">Đăng nhập Dashboard</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-400">
          <p>© 2026 GodotXR Web. Phiên bản giáo dưỡng dành riêng cho Phụ huynh & Nhà trường.</p>
          <span className="px-3 py-1 bg-gray-100 rounded-full font-black text-[10px] tracking-widest uppercase text-gray-600">Trải nghiệm học tập thế hệ mới</span>
        </div>
      </footer>

    </div>
  );
}

// Small UI components & styling helpers

const floatAnimation = (delay = 0) => ({
  animate: {
    y: [0, -6, 0],
  },
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay,
  }
});

function BenefitCard({ icon, title, description, bgColor, delay = 0 }: { icon: any, title: string, description: string, bgColor: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white border-2 border-[#F2ECD8] hover:border-[#4EACAF]/40 rounded-[28px] p-6 shadow-sm hover:shadow-xl transition-all duration-350 space-y-4 cursor-pointer"
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", bgColor)}>
        {icon}
      </div>
      <div className="space-y-1.5">
        <h4 className="text-lg font-black text-slate-800 leading-tight">{title}</h4>
        <p className="text-xs text-gray-400 font-bold leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function FlowStepCard({ step, icon, iconBg, title, description, delay = 0 }: { step: string, icon: any, iconBg: string, title: string, description: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ y: -6, scale: 1.025 }}
      className="bg-white border hover:border-[#FF8E8E]/40 border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl relative space-y-4 transition-all duration-350"
    >
      <div className="flex justify-between items-start">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-md", iconBg)}>
          {icon}
        </div>
        <span className="text-2xl font-black italic text-gray-205">{step}</span>
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-black text-slate-800">{title}</h4>
        <p className="text-xs text-gray-400 font-bold leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function RoleCard({ title, desc, color, colorText, points, delay = 0 }: { title: string, desc: string, color: string, colorText: string, points: string[], delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.08)" }}
      className={cn("bg-white border-2 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden transition-all duration-350", color)}
    >
      <div>
        <h4 className={cn("text-lg font-black", colorText)}>{title}</h4>
        <p className="text-xs text-gray-400 font-bold mt-1">{desc}</p>
      </div>
      <ul className="space-y-2 border-t border-gray-50 pt-3">
        {points.map((p, idx) => (
          <li key={idx} className="flex gap-2 text-xs font-semibold text-slate-600 items-start">
            <span className="text-[#4EACAF] font-bold shrink-0">✓</span>
            <span className="leading-snug">{p}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function GridDataCard({ title, text, icon, delay = 0 }: { title: string, text: string, icon: any, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4, delay: delay }}
      whileHover={{ y: -5, scale: 1.04, borderColor: "#4EACAF" }}
      className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#4EACAF]/30 transition-all duration-300 text-center flex flex-col items-center justify-start space-y-2 cursor-pointer"
    >
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
        {icon}
      </div>
      <h5 className="text-[13px] font-black text-slate-800 leading-tight">{title}</h5>
      <p className="text-[10px] text-gray-400 font-bold leading-normal">{text}</p>
    </motion.div>
  );
}

function EduPoint({ title, text, delay = 0 }: { title: string, text: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-85px" }}
      transition={{ duration: 0.4, delay: delay }}
      whileHover={{ scale: 1.03, x: 5 }}
      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 hover:shadow-xs transition-all duration-200 rounded-2xl border border-slate-100 cursor-default"
    >
      <span className="text-zinc-800 text-xs font-black block">{title}</span>
      <span className="text-slate-400 text-[11px] font-bold mt-1 block leading-normal">{text}</span>
    </motion.div>
  );
}

function FooterCol({ title, links, scrollToId }: { title: string, links: { name: string, id: string }[], scrollToId: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <h5 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">{title}</h5>
      <ul className="space-y-2">
        {links.map((l, i) => (
          <li key={i}>
            <button 
              onClick={() => scrollToId(l.id)} 
              className="text-xs text-gray-500 font-semibold hover:text-[#4EACAF] transition-colors"
            >
              {l.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Header({ onLogin, onGetStarted, scrollToId }: { onLogin: () => void, onGetStarted: () => void, scrollToId: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const menu = [
    { name: "Cách hoạt động", id: "how-it-works" },
    { name: "Tính năng", id: "features" },
    { name: "Phân loại", id: "roles" },
    { name: "Chỉ số", id: "analytics" },
    { name: "Giáo dưỡng", id: "education" }
  ];

  return (
    <motion.header 
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100] bg-white/70 backdrop-blur-md border border-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] rounded-full px-6 py-3 flex items-center justify-between"
    >
      <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

      <nav className="hidden xl:flex items-center space-x-1">
        {menu.map(item => (
          <button 
            key={item.name} 
            onClick={() => {
              scrollToId(item.id);
              setIsOpen(false);
            }}
            className="px-4 py-2 rounded-full text-xs font-extrabold text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 transition-all uppercase tracking-wider"
          >
            {item.name}
          </button>
        ))}
      </nav>

      <div className="hidden lg:flex items-center gap-3">
        <button onClick={onLogin} className="px-5 py-2 font-black text-slate-700 hover:text-[#FF8E8E] transition-all uppercase tracking-wider text-xs">Đăng nhập</button>
        <button onClick={onGetStarted} className="px-6 py-3 bg-[#4EACAF] text-white font-extrabold rounded-full shadow-md shadow-[#4EACAF]/10 hover:scale-[1.03] active:scale-95 transition-all text-xs uppercase tracking-wider">Bắt đầu</button>
      </div>

      <button className="lg:hidden p-2 bg-slate-50 rounded-full" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="w-5 h-5 text-gray-900" /> : <Menu className="w-5 h-5 text-gray-900" />}
      </button>

      {/* Mobile Nav Placeholder */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-5 lg:hidden border border-slate-100 flex flex-col space-y-2 z-50">
          {menu.map(item => (
            <button 
              key={item.name} 
              onClick={() => {
                scrollToId(item.id);
                setIsOpen(false);
              }}
              className="py-2.5 text-left font-black text-gray-800 text-sm border-b border-gray-50 italic hover:text-[#4EACAF] transition-colors uppercase tracking-wider"
            >
              {item.name}
            </button>
          ))}
          <div className="pt-2 space-y-2 flex flex-col">
            <button onClick={() => { onLogin(); setIsOpen(false); }} className="w-full py-2.5 font-black text-gray-800 border border-gray-200 rounded-full text-xs hover:border-[#FF8E8E] uppercase tracking-wider">Đăng nhập</button>
            <button onClick={() => { onGetStarted(); setIsOpen(false); }} className="w-full py-3.5 bg-[#4EACAF] text-white font-black rounded-full text-xs shadow-md uppercase tracking-wider">Bắt đầu ngay</button>
          </div>
        </div>
      )}
    </motion.header>
  );
}
