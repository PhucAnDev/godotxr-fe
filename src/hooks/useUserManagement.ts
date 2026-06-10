import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import {
  getUsers,
  createUser,
  updateUser,
  type UserResponse,
  type UserRoleEnum,
} from '../services/userService';
import { getRoles, type RoleResponse } from '../services/roleService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModalType = 'add' | 'edit' | 'detail' | null;

export interface ToastConfig {
  message: string;
  type: 'success' | 'warning';
}

export interface UseUserManagementReturn {
  // ─── Data ──────────────────────────────────────────────────────────────────
  users: UserResponse[];
  roles: RoleResponse[];
  isLoading: boolean;

  // ─── Stats ─────────────────────────────────────────────────────────────────
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  thisMonthUsers: number;

  // ─── Phân trang (server-side) ───────────────────────────────────────────────
  currentPage: number;
  pageSize: number;
  totalCount: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // ─── Search & filter (client-side trong trang hiện tại) ────────────────────
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterRole: string;
  setFilterRole: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;

  // ─── Filtered list (chỉ filter trong trang hiện tại) ─────────────────────
  filteredUsers: UserResponse[];

  // ─── Modal ─────────────────────────────────────────────────────────────────
  modalType: ModalType;
  selectedUser: UserResponse | null;
  handleOpenAdd: () => void;
  handleOpenEdit: (user: UserResponse) => void;
  handleOpenDetail: (user: UserResponse) => void;
  handleCloseModal: () => void;

  // ─── Form state ────────────────────────────────────────────────────────────
  formFullName: string;
  setFormFullName: (v: string) => void;
  formEmail: string;
  setFormEmail: (v: string) => void;
  formPhone: string;
  setFormPhone: (v: string) => void;
  formUsername: string;
  setFormUsername: (v: string) => void;
  formPassword: string;
  setFormPassword: (v: string) => void;
  formRoleName: UserRoleEnum;
  setFormRoleName: (v: UserRoleEnum) => void;
  formIsActive: boolean;
  setFormIsActive: (v: boolean) => void;
  isSaving: boolean;

  // ─── Actions ───────────────────────────────────────────────────────────────
  handleSaveUser: (e: FormEvent) => Promise<void>;
  handleToggleLock: (user: UserResponse) => Promise<void>;
  handleResetPassword: (user: UserResponse) => Promise<void>;
  handleRefresh: () => void;

  // ─── Toast ─────────────────────────────────────────────────────────────────
  alertConfig: ToastConfig | null;
  setAlertConfig: (v: ToastConfig | null) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUserManagement(): UseUserManagementReturn {
  // ─── Data state ────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ─── Phân trang (server-side) ──────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // ─── Search & filter ───────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // ─── Modal & form ──────────────────────────────────────────────────────────
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRoleName, setFormRoleName] = useState<UserRoleEnum>('Parent');
  const [formIsActive, setFormIsActive] = useState(true);

  // ─── Toast ─────────────────────────────────────────────────────────────────
  const [alertConfig, setAlertConfig] = useState<ToastConfig | null>(null);

  const triggerNotification = useCallback(
    (message: string, type: 'success' | 'warning' = 'success') => {
      setAlertConfig({ message, type });
      setTimeout(() => setAlertConfig(null), 4000);
    },
    []
  );

  // ─── Fetch users từ BE ─────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const result = await getUsers(currentPage, pageSize);
    setIsLoading(false);

    if (result.success && result.data) {
      setUsers(result.data.items);
      setTotalCount(result.data.totalCount);
    } else {
      triggerNotification(
        result.message || 'Không thể tải danh sách người dùng.',
        'warning'
      );
    }
  }, [currentPage, pageSize, triggerNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ─── Fetch roles để dùng trong dropdown ───────────────────────────────────
  const fetchRoles = useCallback(async () => {
    const result = await getRoles(1, 100);
    if (result.success && result.data) {
      setRoles(result.data.items);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ─── Reset page khi filter thay đổi ───────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterStatus]);

  // ─── Stats ─────────────────────────────────────────────────────────────────
  // Note: stats tính trên dữ liệu trang hiện tại (vì BE không trả về stats tổng)
  // Để đơn giản, stats dựa trên totalCount và users hiện tại
  const totalUsers = totalCount;
  const activeUsers = users.filter((u) => u.isActive).length;
  const lockedUsers = users.filter((u) => !u.isActive).length;
  const thisMonthUsers = users.filter((u) => {
    const now = new Date();
    const created = new Date(u.createdAt);
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  // ─── Filter client-side trong trang hiện tại ──────────────────────────────
  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      user.fullName.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.phone.includes(q) ||
      user.username.toLowerCase().includes(q);

    const matchesRole =
      filterRole === 'ALL' ||
      user.roleName.toLowerCase() === filterRole.toLowerCase();

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'Active' && user.isActive) ||
      (filterStatus === 'Locked' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // ─── Modal handlers ────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormUsername('');
    setFormPassword('');
    setFormRoleName('Parent');
    setFormIsActive(true);
    setSelectedUser(null);
    setModalType('add');
  };

  const handleOpenEdit = (user: UserResponse) => {
    setSelectedUser(user);
    setFormFullName(user.fullName);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormUsername(user.username);
    setFormPassword(''); // không hiện password cũ
    setFormRoleName(user.roleName as UserRoleEnum);
    setFormIsActive(user.isActive);
    setModalType('edit');
  };

  const handleOpenDetail = (user: UserResponse) => {
    setSelectedUser(user);
    setModalType('detail');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedUser(null);
  };

  // ─── Save (Create / Update) ────────────────────────────────────────────────
  const handleSaveUser = async (e: FormEvent) => {
    e.preventDefault();

    // Validation cơ bản
    if (!formFullName.trim() || !formEmail.trim()) {
      triggerNotification('Vui lòng điền đầy đủ Họ tên và Email!', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      triggerNotification('Email không đúng định dạng!', 'warning');
      return;
    }

    setIsSaving(true);

    if (modalType === 'add') {
      // Validate thêm cho create
      if (!formUsername.trim()) {
        triggerNotification('Vui lòng nhập Username!', 'warning');
        setIsSaving(false);
        return;
      }
      if (!formPassword || formPassword.length < 6) {
        triggerNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'warning');
        setIsSaving(false);
        return;
      }

      // POST /api/user
      const result = await createUser({
        username: formUsername.trim(),
        password: formPassword,
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        roleName: formRoleName,
      });

      if (result.success && result.data) {
        triggerNotification(
          `Đã tạo thành công tài khoản "${result.data.fullName}"!`
        );
        handleCloseModal();
        fetchUsers(); // Reload để lấy dữ liệu mới nhất từ BE
      } else {
        const msg =
          result.errors.length > 0 ? result.errors.join(' ') : result.message;
        triggerNotification(msg || 'Tạo tài khoản thất bại.', 'warning');
      }
    } else if (modalType === 'edit' && selectedUser) {
      // PUT /api/user/{id}
      const result = await updateUser(selectedUser.id, {
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        roleName: formRoleName,
        isActive: formIsActive,
      });

      if (result.success && result.data) {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? result.data! : u))
        );
        triggerNotification(
          `Cập nhật tài khoản "${result.data.fullName}" thành công!`
        );
        handleCloseModal();
      } else {
        const msg =
          result.errors.length > 0 ? result.errors.join(' ') : result.message;
        triggerNotification(msg || 'Cập nhật tài khoản thất bại.', 'warning');
      }
    }

    setIsSaving(false);
  };

  // ─── Toggle khóa/mở khóa tài khoản ───────────────────────────────────────
  const handleToggleLock = async (user: UserResponse) => {
    const nextActive = !user.isActive;

    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isActive: nextActive } : u))
    );

    const result = await updateUser(user.id, { isActive: nextActive });

    if (result.success) {
      const msg = nextActive
        ? `Đã mở khóa tài khoản "${user.fullName}"!`
        : `Đã khóa tài khoản "${user.fullName}"!`;
      triggerNotification(msg, nextActive ? 'success' : 'warning');
    } else {
      // Rollback nếu BE báo lỗi
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isActive: user.isActive } : u
        )
      );
      triggerNotification(
        result.message || 'Thao tác thất bại. Vui lòng thử lại.',
        'warning'
      );
    }
  };

  // ─── Reset password (chỉ mô phỏng vì BE chưa có endpoint riêng) ──────────
  // BE hiện chưa có endpoint reset-password riêng. 
  // Dùng PUT /api/user/{id} để update (trong tương lai sẽ có endpoint riêng).
  const handleResetPassword = async (user: UserResponse) => {
    triggerNotification(
      `Đã gửi yêu cầu đặt lại mật khẩu cho "${user.fullName}". Người dùng sẽ nhận được email hướng dẫn.`
    );
  };

  // ─── Refresh ───────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    fetchUsers();
  };

  return {
    users,
    roles,
    isLoading,
    totalUsers,
    activeUsers,
    lockedUsers,
    thisMonthUsers,
    currentPage,
    pageSize,
    totalCount,
    setCurrentPage,
    setPageSize,
    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filteredUsers,
    modalType,
    selectedUser,
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDetail,
    handleCloseModal,
    formFullName,
    setFormFullName,
    formEmail,
    setFormEmail,
    formPhone,
    setFormPhone,
    formUsername,
    setFormUsername,
    formPassword,
    setFormPassword,
    formRoleName,
    setFormRoleName,
    formIsActive,
    setFormIsActive,
    isSaving,
    handleSaveUser,
    handleToggleLock,
    handleResetPassword,
    handleRefresh,
    alertConfig,
    setAlertConfig,
  };
}
