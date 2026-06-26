/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Baby, 
  UserPlus, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  CheckCircle, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Sparkles, 
  Heart, 
  ArrowRight, 
  GraduationCap, 
  BookOpen, 
  Info,
  Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getStoredUsers, saveStoredUsers, MockUser } from '../../lib/authMock';
import CustomSelect from '../../components/common/CustomSelect';

// Define Child interface
export interface Child {
  ChildId: string;
  ParentUserId: string;
  FullName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  LearningLevel: string;
  Note: string;
  Status: 'Active' | 'Inactive';
  CreatedAt: string;
  UpdatedAt: string;
  ProgressLevel: 'Improving' | 'Stable' | 'Need Support';
  ClassId?: string;
}

const DEFAULT_CHILDREN: Child[] = [
  { 
    ChildId: 'CHD-001', 
    ParentUserId: 'USR-P1', 
    FullName: 'Nguyễn Tiến Minh (Leo)', 
    Age: 8, 
    Gender: 'Male', 
    LearningLevel: 'Bậc 1 - Phát âm đơn', 
    Note: 'Bé thông minh nhưng thỉnh thoảng mất tập trung giữa buổi chơi. Thích trò chơi Nông trại 3D. Cần hỗ trợ phụ âm trượt sóng.',
    Status: 'Active',
    ProgressLevel: 'Improving',
    CreatedAt: '2026-01-10',
    UpdatedAt: '2026-05-30',
    ClassId: 'CLS-801'
  },
  { 
    ChildId: 'CHD-002', 
    ParentUserId: 'USR-P2', 
    FullName: 'Trần Thảo Linh (Sophia)', 
    Age: 9, 
    Gender: 'Female', 
    LearningLevel: 'Bậc 2 - Âm đôi ghép từ', 
    Note: 'Phản xạ phát âm nhạy bén, lực hơi khá tốt. Thỉnh thoảng bị mỏi hàm khi uốn cụm âm kép ngắn.',
    Status: 'Active',
    ProgressLevel: 'Stable',
    CreatedAt: '2026-01-12',
    UpdatedAt: '2026-05-29',
    ClassId: 'CLS-802'
  },
  { 
    ChildId: 'CHD-003', 
    ParentUserId: 'USR-P3', 
    FullName: 'Phạm Minh Khang', 
    Age: 7, 
    Gender: 'Male', 
    LearningLevel: 'Bậc 1 - Sửa ngọng S', 
    Note: 'Bé rụt rè trước micro mộc. Phát hơi dẹt lưỡi, đặc biệt là dải âm gió S và X. Điểm luyện tập gần đây thấp, cần giáo viên hỗ trợ thêm.',
    Status: 'Active',
    ProgressLevel: 'Need Support',
    CreatedAt: '2026-02-15',
    UpdatedAt: '2026-05-28',
    ClassId: 'CLS-801'
  },
  { 
    ChildId: 'CHD-004', 
    ParentUserId: 'USR-P4', 
    FullName: 'Hoàng Anh Thư', 
    Age: 10, 
    Gender: 'Female', 
    LearningLevel: 'Bậc 2 - Ghép vần', 
    Note: 'Phát âm tròn chữ nhưng âm lượng tương đối nhỏ. Họng khỏe nhưng lưỡi hơi thụ động về sau.',
    Status: 'Active',
    ProgressLevel: 'Stable',
    CreatedAt: '2026-02-20',
    UpdatedAt: '2026-05-31',
    ClassId: 'CLS-803'
  }
];

export function getStoredChildren(): Child[] {
  const data = localStorage.getItem('godot_children');
  if (!data) {
    localStorage.setItem('godot_children', JSON.stringify(DEFAULT_CHILDREN));
    return DEFAULT_CHILDREN;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_CHILDREN;
  }
}

export function saveStoredChildren(children: Child[]) {
  localStorage.setItem('godot_children', JSON.stringify(children));
}

export default function TeacherParentChildManagement() {
  const [parents, setParents] = useState<MockUser[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE_JOINT' | 'CREATE_CHILD_ONLY'>('LIST');

  // Input states for creating Parent + Child together
  const [pEmail, setPEmail] = useState('');
  const [pFullName, setPFullName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pGender, setPGender] = useState<'Male' | 'Female' | 'Other'>('Female');

  // Input states for Child
  const [cFullName, setCFullName] = useState('');
  const [cAge, setCAge] = useState(8);
  const [cGender, setCGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [cLevel, setCLevel] = useState('Bậc 1 - Phát âm đơn');
  const [cNote, setCNote] = useState('');
  const [cClassId, setCClassId] = useState('CLS-801');

  // Existing parent select for CHILDONLY tab
  const [selectedParentId, setSelectedParentId] = useState('');

  // Alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successJoint, setSuccessJoint] = useState<{ email: string; pass: string; parentName: string; childName: string } | null>(null);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allUsers = getStoredUsers();
    const parentUsers = allUsers.filter(u => u.Role === 'PARENT');
    setParents(parentUsers);
    
    const childList = getStoredChildren();
    setChildren(childList);

    if (parentUsers.length > 0) {
      setSelectedParentId(parentUsers[0].UserId);
    }
  };

  const resetFormFields = () => {
    setPEmail('');
    setPFullName('');
    setPPhone('');
    setCFullName('');
    setCAge(8);
    setCGender('Male');
    setCLevel('Bậc 1 - Phát âm đơn');
    setCNote('');
    setErrorMsg(null);
  };

  const handleCreateJoint = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessJoint(null);

    if (!pEmail.trim() || !pFullName.trim() || !cFullName.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ họ tên phụ huynh, email, và họ tên bé.');
      return;
    }

    const allUsers = getStoredUsers();
    const emailExists = allUsers.some(u => u.Email.toLowerCase() === pEmail.toLowerCase().trim());
    if (emailExists) {
      setErrorMsg('Địa chỉ email của phụ huynh đã tồn tại trên mạng lưới GodotXR.');
      return;
    }

    // Create unique IDs
    const newParentId = 'USR-P' + (allUsers.length + 10);
    const newChildId = 'CHD-' + String(getStoredChildren().length + 101).padStart(3, '0');
    const tempPassword = 'parent123'; // Friendly and easy to evaluate default password

    // Create Parent User Object
    const newParentUser: MockUser = {
      UserId: newParentId,
      RoleId: 'ROL-003',
      Email: pEmail.trim().toLowerCase(),
      Password: tempPassword,
      Role: 'PARENT',
      FullName: pFullName.trim(),
      PhoneNumber: pPhone.trim(),
      Gender: pGender,
      Status: 'Active',
      MustChangePassword: true, // MUST changed password
      CreatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      UpdatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    // Create Child Profile
    const newChild: Child = {
      ChildId: newChildId,
      ParentUserId: newParentId,
      FullName: cFullName.trim(),
      Age: Number(cAge),
      Gender: cGender,
      LearningLevel: cLevel,
      Note: cNote.trim() || 'Hồ sơ được giáo viên tạo mới để đồng hành cùng phụ huynh.',
      Status: 'Active',
      ProgressLevel: 'Stable',
      ClassId: cClassId,
      CreatedAt: new Date().toISOString().slice(0, 10),
      UpdatedAt: new Date().toISOString().slice(0, 10)
    };

    // Save
    const updatedUsers = [...allUsers, newParentUser];
    saveStoredUsers(updatedUsers);

    const currentChildren = getStoredChildren();
    const updatedChildren = [...currentChildren, newChild];
    saveStoredChildren(updatedChildren);

    setSuccessJoint({
      email: newParentUser.Email,
      pass: tempPassword,
      parentName: newParentUser.FullName,
      childName: newChild.FullName
    });

    loadData();
    resetFormFields();
  };

  const handleCreateChildOnly = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedParentId) {
      setErrorMsg('Vui lòng chọn một phụ huynh hiện hữu.');
      return;
    }

    if (!cFullName.trim()) {
      setErrorMsg('Họ tên của trẻ không được để trống.');
      return;
    }

    const newChildId = 'CHD-' + String(getStoredChildren().length + 101).padStart(3, '0');
    
    const newChild: Child = {
      ChildId: newChildId,
      ParentUserId: selectedParentId,
      FullName: cFullName.trim(),
      Age: Number(cAge),
      Gender: cGender,
      LearningLevel: cLevel,
      Note: cNote.trim() || 'Hồ sơ trẻ bổ sung cho phụ huynh hiện hữu.',
      Status: 'Active',
      ProgressLevel: 'Stable',
      ClassId: cClassId,
      CreatedAt: new Date().toISOString().slice(0, 10),
      UpdatedAt: new Date().toISOString().slice(0, 10)
    };

    const currentChildren = getStoredChildren();
    const updatedChildren = [...currentChildren, newChild];
    saveStoredChildren(updatedChildren);

    setToastSuccess(`Tạo hồ sơ trẻ "${newChild.FullName}" thành công!`);
    setTimeout(() => setToastSuccess(null), 3000);

    loadData();
    resetFormFields();
    setActiveTab('LIST');
  };

  const handleDeleteChild = (childId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa hồ sơ trẻ này? Dữ liệu sẽ mất vĩnh viễn khỏi hệ thống.')) {
      const currentChildren = getStoredChildren();
      const left = currentChildren.filter(c => c.ChildId !== childId);
      saveStoredChildren(left);
      
      setToastSuccess('Thao tác xóa hồ sơ bé đã thực thi thành công.');
      setTimeout(() => setToastSuccess(null), 3000);
      loadData();
    }
  };

  // Find Parent User Name
  const parentMap = useMemo(() => {
    const map: Record<string, string> = {};
    parents.forEach(p => {
      map[p.UserId] = p.FullName;
    });
    return map;
  }, [parents]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-300">
      
      {/* 1. Dashboard Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4EACAF]/10 text-[#4EACAF] rounded-full text-xs font-black uppercase tracking-wider">
            <Users className="w-4 h-4" />
            Giám sát sư phạm
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-3">
            Quản lý Phụ huynh & Hồ sơ trẻ
          </h1>
          <p className="text-slate-400 text-sm font-semibold mt-1">
            Thiết lập đầu mối liên hệ cho cha mẹ và mở rộng kế hoạch rèn luyện bằng hồ sơ 3D cho bé.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => { setActiveTab('LIST'); setSuccessJoint(null); setErrorMsg(null); }}
            className={cn(
              "px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer",
              activeTab === 'LIST' ? "bg-[#4EACAF] text-white shadow-md shadow-[#4EACAF]/10" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            )}
          >
            Danh sách quản lý
          </button>
          <button
            onClick={() => { setActiveTab('CREATE_JOINT'); setSuccessJoint(null); setErrorMsg(null); }}
            className={cn(
              "px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer",
              activeTab === 'CREATE_JOINT' ? "bg-[#4EACAF] text-white shadow-md shadow-[#4EACAF]/10" : "bg-teal-50 hover:bg-teal-100 text-[#4EACAF]"
            )}
          >
            <UserPlus className="w-4 h-4" />
            Tạo mới cặp Phụ huynh + Trẻ
          </button>
        </div>
      </div>

      {/* Global Toast Success */}
      {toastSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastSuccess}</span>
        </div>
      )}

      {/* 2. Main Tab Contents */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: LIST / DIRECTORY */}
        {activeTab === 'LIST' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Stat counts top */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-[#4EACAF]/10 text-[#4EACAF] rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{parents.length}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phụ huynh đồng hành</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-[#FF8E8E]/10 text-[#FF8E8E] rounded-2xl">
                  <Baby className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{children.length}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Hồ sơ trẻ đang rèn luyện</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Bổ sung duy chỉ bé</h4>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">Tạo nhanh hồ sơ trẻ cho phụ huynh có sẵn</p>
                  </div>
                </div>
                <button
                  onClick={() => { setActiveTab('CREATE_CHILD_ONLY'); setSuccessJoint(null); setErrorMsg(null); }}
                  className="p-2 bg-indigo-50 hover:bg-slate-100 text-indigo-600 rounded-xl cursor-pointer transition-colors"
                  title="Thêm hồ sơ bé"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left List Pane: Children Profiles (8/12 block) */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Baby className="w-5 h-5 text-[#FF8E8E]" />
                    <h3 className="font-bold text-slate-800 text-lg">Danh sách hồ sơ trẻ ({children.length})</h3>
                  </div>
                </div>

                {children.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Baby className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="font-bold text-sm">Chưa có hồ sơ bé nào.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {children.map(child => (
                      <div 
                        key={child.ChildId}
                        className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-[#FF8E8E]/30 relative flex flex-col justify-between gap-4 transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <img 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${child.ChildId}`} 
                                alt="Child avatar" 
                                className="w-10 h-10 rounded-full border bg-white shadow-xs"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h4 className="font-black text-slate-800 text-sm leading-tight">{child.FullName}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wide">ID: {child.ChildId}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteChild(child.ChildId)}
                              className="text-slate-310 hover:text-rose-600 transition-colors cursor-pointer p-1"
                              title="Xóa hồ sơ bé"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 py-1.5 bg-white border border-slate-100 rounded-lg">
                              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Tuổi</p>
                              <p className="text-xs font-black text-slate-700 mt-0.5">{child.Age} tuổi</p>
                            </div>
                            <div className="p-2 py-1.5 bg-white border border-slate-100 rounded-lg">
                              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Giới tính</p>
                              <p className="text-xs font-black text-slate-700 mt-0.5">{child.Gender === 'Male' ? 'Nam' : 'Nữ'}</p>
                            </div>
                            <div className="p-2 py-1.5 bg-white border border-slate-100 rounded-lg">
                              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide font-mono">Lớp học</p>
                              <p className="text-xs font-black text-slate-700 mt-0.5">{child.ClassId || 'Chưa xếp'}</p>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-[#4EACAF]" /> Cấp độ học tập
                            </p>
                            <p className="text-xs font-bold text-slate-700 leading-normal">{child.LearningLevel}</p>
                          </div>

                          <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100/50 space-y-1">
                            <p className="text-[9px] text-amber-600 font-extrabold uppercase tracking-wide flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Ghi chú chuyên biệt
                            </p>
                            <p className="text-[11px] text-slate-500 font-bold leading-normal italic">{child.Note}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-bold">Phụ huynh nắm quyền:</span>
                          <span className="font-extrabold text-[#4EACAF]">{parentMap[child.ParentUserId] || 'Phụ huynh lạ'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right List Pane: Parent Users directories (4/12 block) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 lg:col-span-4 space-y-6">
                <div className="pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#4EACAF]" />
                    <h3 className="font-bold text-slate-800 text-lg">Danh bạ Phụ huynh ({parents.length})</h3>
                  </div>
                </div>

                {parents.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="font-bold text-xs">Chưa có phụ huynh nào trong mạng lưới.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
                    {parents.map(parent => {
                      const childCount = children.filter(c => c.ParentUserId === parent.UserId).length;
                      return (
                        <div 
                          key={parent.UserId}
                          className="p-4 rounded-2xl bg-[#FFFDF5] border border-slate-100 hover:border-slate-200 transition-all space-y-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${parent.FullName}`} 
                              alt="Parent Avatar" 
                              className="w-9 h-9 rounded-full bg-white border"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h4 className="font-extrabold text-slate-800 leading-snug">{parent.FullName}</h4>
                              <p className="text-[9px] text-[#4EACAF] font-extrabold uppercase mt-0.5">UID: {parent.UserId}</p>
                            </div>
                          </div>

                          <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-100 font-semibold text-slate-500">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-450" /> {parent.Email}</span>
                            </div>
                            {parent.PhoneNumber && (
                              <div className="flex items-center justify-between pt-1 border-t border-slate-50 mt-1">
                                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-450" /> {parent.PhoneNumber}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Trạng thái đăng nhập:</span>
                            {parent.MustChangePassword ? (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 font-black rounded-md">Lần đầu (Chờ đổi pass)</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-black rounded-md">Đã đổi mật khẩu</span>
                            )}
                          </div>

                          <div className="flex justify-between items-center bg-teal-50/40 p-2 rounded-xl text-[11px] font-bold">
                            <span className="text-slate-500">Bé liên kết:</span>
                            <span className="text-[#4EACAF] font-black">{childCount} trẻ</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </motion.div>
        )}

        {/* TAB 2: JOINT CREATOR (PARENT + CHILD) */}
        {activeTab === 'CREATE_JOINT' && (
          <motion.div 
            key="create-joint"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            {/* Form Column - 8 cols */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 lg:col-span-8">
              
              <div className="border-b border-slate-100 pb-5 mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-[#4EACAF]/10 text-[#4EACAF] rounded-xl shrink-0">
                  <UserPlus className="w-5 h-5 hover:translate-y-0.5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Tạo tài khoản Phụ huynh kết hợp Hồ sơ trẻ mới</h3>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Đầu mối rèn luyện toàn vẹn</p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-black leading-snug">
                  {errorMsg}
                </div>
              )}

              {successJoint ? (
                <div className="text-left space-y-6">
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-emerald-800 space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="text-lg font-black">Khởi tạo cặp tài khoản thành công!</h4>
                        <p className="text-xs text-emerald-600 font-bold">Hệ thống đã lưu trữ thông tin của Phụ huynh và Hồ sơ trẻ.</p>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-emerald-100/30 text-xs font-semibold space-y-2.5 text-slate-700">
                      <div>
                        <span className="text-slate-400">Họ tên Phụ huynh:</span> <strong className="text-slate-800 font-black">{successJoint.parentName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Họ tên Trẻ:</span> <strong className="text-indigo-650 font-black">{successJoint.childName}</strong>
                      </div>
                      <div className="pt-2.5 border-t border-slate-100/50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div>
                          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Tài khoản đăng nhập tạm thời</p>
                          <p className="text-sm font-extrabold mt-1">Email: <strong className="text-slate-800 font-black">{successJoint.email}</strong></p>
                        </div>
                        <div className="bg-amber-50 p-2.5 px-4 rounded-xl border border-amber-100">
                          <p className="text-[9px] text-amber-500 font-extrabold uppercase">Mật khẩu tạm thời mặc định</p>
                          <p className="text-sm font-black text-amber-600 tracking-wide mt-0.5">{successJoint.pass}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2 text-amber-700 font-bold text-[11px] leading-relaxed">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>
                        <strong>Lưu ý:</strong> Ở lần đăng nhập đầu tiên, phụ huynh sẽ được yêu cầu đổi sang mật khẩu mới riêng tư trước khi sử dụng đầy đủ hệ thống.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => { setActiveTab('LIST'); setSuccessJoint(null); }}
                      className="flex-1 py-4.5 bg-[#4EACAF] hover:bg-[#3d8c8e] text-white font-bold rounded-2xl text-center text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Trở lại danh sách
                    </button>
                    <button
                      onClick={() => setSuccessJoint(null)}
                      className="flex-1 py-4.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-center text-sm transition-all"
                    >
                      Tiếp tục tạo mới
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateJoint} className="space-y-8 text-xs font-bold text-slate-600">
                  
                  {/* PHASE A: PARENT */}
                  <div className="space-y-4 p-5 rounded-3xl bg-slate-50/50 border border-slate-100">
                    <h4 className="text-[#4EACAF] text-sm font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                      <Users className="w-4.5 h-4.5" />
                      Phần 1: Thông tin tài khoản Phụ huynh
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Email Phụ huynh (Sử dụng đăng nhập)</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input 
                            type="email" 
                            required
                            placeholder="vi-du@email.com"
                            value={pEmail}
                            onChange={(e) => setPEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-gray-700 outline-none focus:border-[#4EACAF]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Họ tên Phụ huynh</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Nguyễn Văn A"
                          value={pFullName}
                          onChange={(e) => setPFullName(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-gray-700 outline-none focus:border-[#4EACAF]"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Số điện thoại liên lạc</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input 
                            type="text" 
                            placeholder="Số di động liên lạc"
                            value={pPhone}
                            onChange={(e) => setPPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-gray-700 outline-none focus:border-[#4EACAF]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Giới tính Phụ huynh</label>
                        <CustomSelect
                          value={pGender}
                          onChange={(val) => setPGender(val as any)}
                          variant="form"
                          options={[
                            { value: 'Female', label: 'Nữ' },
                            { value: 'Male', label: 'Nam' },
                            { value: 'Other', label: 'Khác' }
                          ]}
                        />
                      </div>

                    </div>
                  </div>

                  {/* PHASE B: CHILD */}
                  <div className="space-y-4 p-5 rounded-3xl bg-indigo-50/30 border border-indigo-100/40">
                    <h4 className="text-indigo-650 text-sm font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100/40 pb-2.5">
                      <Baby className="w-4.5 h-4.5 text-[#FF8E8E]" />
                      Phần 2: Hồ sơ rèn luyện của Bé
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Họ và Tên bé</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Nguyễn Tiến Minh"
                          value={cFullName}
                          onChange={(e) => setCFullName(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-gray-700 outline-none focus:border-[#4EACAF]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Tuổi của bé (7 - 11 tuổi)</label>
                        <input 
                          type="number" 
                          required
                          min="3"
                          max="18"
                          value={cAge}
                          onChange={(e) => setCAge(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-gray-700 outline-none focus:border-[#4EACAF]"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Giới tính của bé</label>
                        <CustomSelect
                          value={cGender}
                          onChange={(val) => setCGender(val as any)}
                          variant="form"
                          options={[
                            { value: 'Male', label: 'Nam' },
                            { value: 'Female', label: 'Nữ' },
                            { value: 'Other', label: 'Khác' }
                          ]}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Cấp lớp phân bổ</label>
                        <CustomSelect
                          value={cClassId}
                          onChange={setCClassId}
                          variant="form"
                          options={[
                            { value: 'CLS-801', label: 'Lớp Sóng Âm CLS-801' },
                            { value: 'CLS-802', label: 'Lớp Hơi Thở CLS-802' },
                            { value: 'CLS-803', label: 'Lớp Từ Vựng CLS-803' }
                          ]}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1 font-mono">Bậc/Cấp độ âm pháp ban đầu</label>
                        <CustomSelect
                          value={cLevel}
                          onChange={setCLevel}
                          variant="form"
                          options={[
                            { value: 'Bậc 1 - Phát âm đơn', label: 'Bậc 1 - Phát âm đơn' },
                            { value: 'Bậc 1 - Sửa ngọng S', label: 'Bậc 1 - Sửa ngọng S/X' },
                            { value: 'Bậc 2 - Âm đôi ghép từ', label: 'Bậc 2 - Âm đôi ghép từ' },
                            { value: 'Bậc 2 - Ghép vần', label: 'Bậc 2 - Ghép vần & hỏa hơi' }
                          ]}
                        />
                      </div>

                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Phân tích sư phạm lâm sàng & Dặn dò ban đầu</label>
                      <textarea
                        rows={3}
                        placeholder="Hãy điền các khuyết phụ âm, thói hư hơi của trẻ hoặc đồ chơi ảo tương tác trẻ yêu thích..."
                        value={cNote}
                        onChange={(e) => setCNote(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-gray-700 outline-none focus:border-[#4EACAF] resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3.5">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('LIST'); resetFormFields(); }}
                      className="px-6 py-3.5 border border-slate-205 text-slate-500 hover:text-slate-700 font-black rounded-xl uppercase text-xs tracking-wider cursor-pointer"
                    >
                      Bỏ qua
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-[#4EACAF] hover:bg-[#3d8c8e] text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md active:scale-95 cursor-pointer"
                    >
                      Xác nhận Khởi tạo
                    </button>
                  </div>

                </form>
              )}

            </div>

            {/* Instruction Card Side */}
            <div className="lg:col-span-4 bg-[#FFFDF5] border border-slate-100 rounded-3xl p-6 space-y-6">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-405 fill-current" />
                Nguyên tắc Tạo và Bảo Mật
              </h4>

              <div className="space-y-4 text-xs font-semibold text-slate-500 leading-relaxed list-decimal">
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 bg-teal-50 text-[#4EACAF] font-bold rounded-full flex items-center justify-center shrink-0">1</span>
                  <p>Tạo tài khoản liên hoàn giúp tiết kiệm thời gian đáng kể. Phụ huynh sau khi kích hoạt thành lập kết nối tức khắc sở hữu quyền giám sát quá trình chơi VR của bé.</p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 bg-teal-50 text-[#4EACAF] font-bold rounded-full flex items-center justify-center shrink-0">2</span>
                  <p><strong>Bảo vệ lần đầu:</strong> Phụ huynh mới sẽ nhận khẩu dụ <span className="text-amber-600 font-bold">"parent123"</span>. Khi tới Website, hệ thống sẽ cưỡng chế họ đổi sang mật mã mới rồi mới mở khóa thông tin.</p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 bg-teal-50 text-[#4EACAF] font-bold rounded-full flex items-center justify-center shrink-0">3</span>
                  <p>Hồ sơ trẻ chứa các mốc lâm sàng. Vui lòng ghi dặn dọn cụ thể để gia quyết hợp tính phối hợp tốt hơn.</p>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 3: CREATE CHILD FOR EXISTING PARENT */}
        {activeTab === 'CREATE_CHILD_ONLY' && (
          <motion.div 
            key="child-only"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 border border-slate-100"
          >
            <div className="border-b border-slate-100 pb-5 mb-6 flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl shrink-0">
                <Baby className="w-5 h-5 text-[#FF8E8E]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Bổ sung hồ sơ bé cho Phụ huynh hiện có</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Mở rộng diện rèn luyện gia đình</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-black leading-snug">
                {errorMsg}
              </div>
            )}

            {parents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                <p>Chưa có phụ huynh nào tồn tại để liên kết. Vui lòng sử dụng tính năng "Tạo mới cặp Phụ huynh + Trẻ".</p>
              </div>
            ) : (
              <form onSubmit={handleCreateChildOnly} className="space-y-6 text-xs font-bold text-slate-600">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Chọn Phụ huynh sở chủ</label>
                  <CustomSelect
                    value={selectedParentId}
                    onChange={setSelectedParentId}
                    variant="form"
                    options={parents.map(p => ({
                      value: p.UserId,
                      label: `${p.FullName} (${p.Email})`
                    }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Họ tên Trẻ cần thêm</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Nguyễn Tiến Minh"
                      value={cFullName}
                      onChange={(e) => setCFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FFFDF5] border-2 border-transparent focus:border-[#4EACAF] focus:bg-white rounded-xl font-bold text-gray-700 outline-none text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Tuổi của bé</label>
                    <input 
                      type="number" 
                      required
                      min="3"
                      max="18"
                      value={cAge}
                      onChange={(e) => setCAge(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-[#FFFDF5] border-2 border-transparent focus:border-[#4EACAF] focus:bg-white rounded-xl font-bold text-gray-700 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Giới tính</label>
                    <CustomSelect
                      value={cGender}
                      onChange={(val) => setCGender(val as any)}
                      variant="form"
                      options={[
                        { value: 'Male', label: 'Nam' },
                        { value: 'Female', label: 'Nữ' },
                        { value: 'Other', label: 'Khác' }
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Lớp học rèn luyện</label>
                    <CustomSelect
                      value={cClassId}
                      onChange={setCClassId}
                      variant="form"
                      options={[
                        { value: 'CLS-801', label: 'Lớp Sóng Âm CLS-801' },
                        { value: 'CLS-802', label: 'Lớp Hơi Thở CLS-802' },
                        { value: 'CLS-803', label: 'Lớp Từ Vựng CLS-803' }
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Bậc độ luyện tập</label>
                    <CustomSelect
                      value={cLevel}
                      onChange={setCLevel}
                      variant="form"
                      options={[
                        { value: 'Bậc 1 - Phát âm đơn', label: 'Bậc 1 - Phát âm đơn' },
                        { value: 'Bậc 1 - Sửa ngọng S', label: 'Bậc 1 - Sửa ngọng S/X' },
                        { value: 'Bậc 2 - Âm đôi ghép từ', label: 'Bậc 2 - Âm đôi ghép từ' },
                        { value: 'Bậc 2 - Ghép vần', label: 'Bậc 2 - Ghép vần & hỏa hơi' }
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider ml-1">Phân tích chuyên biệt</label>
                  <textarea
                    rows={4}
                    placeholder="Các thế thế khó thở, âm gió bị dẹt..."
                    value={cNote}
                    onChange={(e) => setCNote(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FFFDF5] border-2 border-transparent focus:border-[#4EACAF] focus:bg-white rounded-xl font-bold text-gray-700 outline-none text-sm transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('LIST'); resetFormFields(); }}
                    className="px-6 py-3.5 border border-slate-205 text-slate-500 hover:text-slate-700 font-black rounded-xl uppercase text-xs tracking-wider cursor-pointer"
                  >
                    Quản lý danh sách
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#4EACAF] hover:bg-[#3d8c8e] text-white font-black rounded-xl uppercase text-xs tracking-wider shadow-md active:scale-95 cursor-pointer"
                  >
                    Xác nhận thêm
                  </button>
                </div>

              </form>
            )}

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
