import { useState } from 'react';
import { Plus, Edit2, X, Check, Search, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const kids = [
  { id: 1, name: 'Leo', age: 17, level: 1, teacher: 'Parent Filmany', color: 'bg-blue-300' },
  { id: 2, name: 'Martin', age: 17, level: 2, teacher: 'Parent Manim', color: 'bg-teal-300' },
  { id: 3, name: 'Northh', age: 16, level: 2, teacher: 'Parent Minih', color: 'bg-green-300' },
  { id: 4, name: 'Karen', age: 15, level: 1, teacher: 'Parent Knahlan', color: 'bg-purple-300' },
  { id: 5, name: 'Lena', age: 17, level: 1, teacher: 'Parent Lirona', color: 'bg-orange-300' },
  { id: 6, name: 'Leo', age: 17, level: 2, teacher: 'Parent Fanon', color: 'bg-red-300' },
  { id: 7, name: 'Martin', age: 17, level: 2, teacher: 'Parent Janson', color: 'bg-purple-400' },
  { id: 8, name: 'Karen', age: 18, level: 1, teacher: 'Parent Hobalo', color: 'bg-violet-400' },
];

export default function ProfileManagement() {
  const [editingChild, setEditingChild] = useState<any>(null);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản Lý Hồ Sơ Của Bé</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kids.map((kid) => (
          <div 
            key={kid.id} 
            onClick={() => setEditingChild(kid)}
            className={cn(
              "rounded-[32px] p-8 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 group",
              kid.color
            )}
          >
             <div className="flex items-start gap-5">
                <div className="w-20 h-20 bg-white/40 rounded-[28px] p-2 backdrop-blur-md overflow-hidden relative border-4 border-white/50">
                   <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${kid.id}`} alt={kid.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Edit2 className="w-6 h-6 text-white" />
                   </div>
                </div>
                <div className="space-y-1 text-gray-900">
                   <h4 className="text-2xl font-black">{kid.name}</h4>
                   <div className="text-xs font-bold opacity-80 space-y-0.5">
                      <p>Tuổi: {kid.age}</p>
                      <p>Cấp độ: {kid.level}</p>
                      <p className="line-clamp-1">Giáo viên phụ trách: {kid.teacher}</p>
                   </div>
                </div>
             </div>
          </div>
        ))}

        <button className="rounded-[32px] bg-sky-50 border-4 border-dashed border-sky-300 p-8 flex flex-col items-center justify-center gap-4 group hover:bg-sky-100 transition-all">
          <div className="w-16 h-16 rounded-full bg-sky-200 flex items-center justify-center text-sky-600 transition-transform group-hover:scale-110">
             <Plus className="w-8 h-8" />
          </div>
          <span className="text-xl font-bold text-sky-800">Thêm hồ sơ mới</span>
        </button>
      </div>

      <p className="text-center text-gray-400 font-bold italic pt-12">Không còn hồ sơ nào để hiển thị</p>

      {/* Edit Modal Simulation */}
      {editingChild && (
        <div className="app-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-blue-900/10 animate-in fade-in duration-300">
           <div className="app-modal-panel bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-sky-100 px-10 py-6 flex items-center justify-between">
                 <h2 className="text-2xl font-black text-gray-900 italic">Chỉnh sửa hồ sơ: {editingChild.name}</h2>
                 <button onClick={() => setEditingChild(null)} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-500" />
                 </button>
              </div>

              <div className="app-modal-body p-10 flex flex-col md:flex-row gap-10">
                 <div className="space-y-8 flex-1">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Tên của bé</label>
                       <input type="text" defaultValue={editingChild.name} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-lg outline-none focus:ring-4 focus:ring-sky-100 transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Tuổi</label>
                       <input type="number" defaultValue={editingChild.age} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-lg outline-none focus:ring-4 focus:ring-sky-100 transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Ghi chú</label>
                       <div className="relative">
                          <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-lg outline-none appearance-none cursor-pointer">
                            <option>Tiếng Anh</option>
                            <option>Tây Ban Nha</option>
                            <option>Pháp</option>
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col items-center justify-center gap-8 w-full md:w-64">
                    <div className="w-48 h-48 bg-orange-100 rounded-full border-8 border-gray-50 shadow-inner overflow-hidden relative group">
                       <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${editingChild.id === 1 ? 'Leo' : editingChild.id}`} alt="profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Plus className="w-10 h-10 text-white" />
                       </div>
                    </div>
                    
                    <div className="flex gap-4 w-full">
                       <button onClick={() => setEditingChild(null)} className="flex-1 py-4 border-4 border-gray-100 text-gray-400 font-black rounded-2xl hover:bg-gray-50 transition-all">Hủy</button>
                       <button onClick={() => setEditingChild(null)} className="flex-1 py-4 bg-sky-500 text-white font-black rounded-2xl shadow-lg shadow-sky-200 active:scale-95 transition-all">Lưu</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Floating Bot Illustration (from Image 10) */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-[55%] animate-bounce pointer-events-none">
         <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Lucky&backgroundColor=ffffff" alt="Bot" className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full p-3 shadow-2xl border-4 border-orange-200" referrerPolicy="no-referrer" />
      </div>
    </div>
  );
}
