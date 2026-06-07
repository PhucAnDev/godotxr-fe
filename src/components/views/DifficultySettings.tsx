import { Mic, BookOpen, Smile, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

type Level = 'Dễ' | 'Trung bình' | 'Khó';
type Module = {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  levels: Level[];
}

const modules: Module[] = [
  {
    id: '1',
    name: 'Luyện phát âm',
    description: 'Focuses on clear speech articulation.',
    icon: Mic,
    color: 'bg-blue-500',
    levels: ['Trung bình', 'Trung bình'],
  },
  {
    id: '2',
    name: 'Học từ vựng',
    description: 'Builds word knowledge and usage.',
    icon: BookOpen,
    color: 'bg-orange-500',
    levels: ['Dễ', 'Dễ'],
  },
  {
    id: '3',
    name: 'Vận động miệng',
    description: 'Strengthens mouth and tongue muscles.',
    icon: Smile,
    color: 'bg-green-500',
    levels: ['Khó', 'Khó'],
  }
];

export default function DifficultySettings() {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Tùy Chỉnh Độ Khó Bài Tập</h1>
        <p className="text-gray-500 text-lg">Điều chỉnh mức độ khó cho các bài tập của lớp bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((mod) => (
          <div key={mod.id} className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden group">
            {/* Header */}
            <div className={cn("p-8 bg-gradient-to-br transition-all group-hover:scale-105 duration-500", mod.color, "from-white/10 to-transparent border-b border-gray-100")}>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center p-3 shadow-inner">
                  <mod.icon className="w-full h-full text-white" />
                </div>
                <div className="text-white">
                   <h3 className="text-2xl font-black leading-tight">{mod.name}</h3>
                   <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{mod.description}</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-8 space-y-6">
               {[1, 2].map((row, i) => (
                  <div key={row} className="grid grid-cols-3 gap-2">
                     {['Dễ', 'Trung bình', 'Khó'].map((lvl) => (
                        <button
                          key={lvl}
                          className={cn(
                            "py-3 rounded-full text-sm font-bold border-2 transition-all",
                            mod.levels[i] === lvl 
                              ? cn(mod.color, "text-white border-transparent shadow-md") 
                              : "bg-gray-50 text-gray-400 border-gray-50 hover:border-gray-200"
                          )}
                        >
                          {lvl}
                        </button>
                     ))}
                  </div>
               ))}

               <button 
                onClick={handleSave}
                className={cn("w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 mt-4", mod.color)}
               >
                 Lưu Độ Khó
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Success Toast Placeholder */}
      <div className={cn(
        "fixed bottom-8 right-8 z-[100] transform transition-all duration-500",
        saveSuccess ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
      )}>
        <div className="bg-[#E8F5E9] text-[#2E7D32] px-6 py-4 rounded-2xl shadow-2xl border-2 border-[#A5D6A7] flex items-center gap-4">
          <div className="bg-[#2E7D32] text-white rounded-full p-1">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
             <p className="font-black text-lg">Cập nhật độ khó thành công</p>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="ml-4 text-[#2E7D32] font-mono text-xl opacity-40 hover:opacity-100">×</button>
        </div>
      </div>
    </div>
  );
}
