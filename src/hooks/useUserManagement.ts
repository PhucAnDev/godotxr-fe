import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createAccount,
  getUsers,
  updateUser,
  type UserGender,
  type UserResponse,
  type UserRoleEnum,
} from '../services/userService';
import { getRoles, type RoleResponse } from '../services/roleService';

export type { UserResponse } from '../services/userService';

export type ModalType = 'add' | 'edit' | 'detail' | null;

export interface ToastConfig {
  message: string;
  type: 'success' | 'warning';
}

export interface UseUserManagementReturn {
  users: UserResponse[];
  roles: RoleResponse[];
  isLoading: boolean;
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  thisMonthUsers: number;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterRole: string;
  setFilterRole: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filteredUsers: UserResponse[];
  modalType: ModalType;
  selectedUser: UserResponse | null;
  handleOpenAdd: () => void;
  handleOpenEdit: (user: UserResponse) => void;
  handleOpenDetail: (user: UserResponse) => void;
  handleCloseModal: () => void;
  formFullName: string;
  setFormFullName: (value: string) => void;
  formEmail: string;
  setFormEmail: (value: string) => void;
  formPhone: string;
  setFormPhone: (value: string) => void;
  formUsername: string;
  setFormUsername: (value: string) => void;
  formGender: UserGender;
  setFormGender: (value: UserGender) => void;
  formSpecialty: string;
  setFormSpecialty: (value: string) => void;
  formRoleName: UserRoleEnum;
  setFormRoleName: (value: UserRoleEnum) => void;
  formIsActive: boolean;
  setFormIsActive: (value: boolean) => void;
  isSaving: boolean;
  handleSaveUser: (event: FormEvent) => Promise<void>;
  handleToggleLock: (user: UserResponse) => Promise<void>;
  handleResetPassword: (user: UserResponse) => Promise<void>;
  handleRefresh: () => void;
  alertConfig: ToastConfig | null;
  setAlertConfig: (value: ToastConfig | null) => void;
}

function getDefaultSpecialty(role: UserRoleEnum): string {
  switch (role) {
    case 'Teacher':
      return '';
    case 'Parent':
      return 'Phụ huynh hỗ trợ';
    case 'Admin':
      return 'Quản trị hệ thống';
    default:
      return 'Hỗ trợ chung';
  }
}

function usesCreateAccountFlow(role: UserRoleEnum): boolean {
  return role === 'Teacher' || role === 'Parent';
}

function getRoleLabel(role: string): string {
  switch (role.trim().toLowerCase()) {
    case 'admin':
      return 'quản trị viên';
    case 'teacher':
      return 'giáo viên';
    case 'parent':
      return 'phụ huynh';
    default:
      return role;
  }
}

export function useUserManagement(): UseUserManagementReturn {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formGender, setFormGender] = useState<UserGender>('Female');
  const [formSpecialty, setFormSpecialty] = useState(
    getDefaultSpecialty('Parent')
  );
  const [formRoleName, setFormRoleName] = useState<UserRoleEnum>('Parent');
  const [formIsActive, setFormIsActive] = useState(true);

  const [alertConfig, setAlertConfig] = useState<ToastConfig | null>(null);

  const triggerNotification = useCallback(
    (message: string, type: 'success' | 'warning' = 'success') => {
      setAlertConfig({ message, type });
      window.setTimeout(() => setAlertConfig(null), 4000);
    },
    []
  );

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const result = await getUsers(currentPage, pageSize);
    setIsLoading(false);

    if (result.success && result.data) {
      setUsers(result.data.items);
      setTotalCount(result.data.totalCount);
      return;
    }

    triggerNotification(
      result.message || 'Không thể tải danh sách người dùng.',
      'warning'
    );
  }, [currentPage, pageSize, triggerNotification]);

  const fetchRoles = useCallback(async () => {
    const result = await getRoles(1, 100);
    if (result.success && result.data) {
      setRoles(result.data.items);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterStatus]);

  useEffect(() => {
    if (modalType !== 'add') {
      return;
    }

    if (!formSpecialty.trim() && formRoleName !== 'Teacher') {
      setFormSpecialty(getDefaultSpecialty(formRoleName));
    }
  }, [formRoleName, formSpecialty, modalType]);

  const totalUsers = totalCount;
  const activeUsers = users.filter((user) => user.isActive).length;
  const lockedUsers = users.filter((user) => !user.isActive).length;
  const thisMonthUsers = users.filter((user) => {
    const createdAt = new Date(user.createdAt);
    const now = new Date();

    return (
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getFullYear() === now.getFullYear()
    );
  }).length;

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query);

    const matchesRole =
      filterRole === 'ALL' ||
      user.roleName.toLowerCase() === filterRole.toLowerCase();

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'Active' && user.isActive) ||
      (filterStatus === 'Locked' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormUsername('');
    setFormGender('Female');
    setFormRoleName('Parent');
    setFormSpecialty(getDefaultSpecialty('Parent'));
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
    setFormGender((user.gender as UserGender) || 'Other');
    setFormSpecialty(
      user.specialty || getDefaultSpecialty(user.roleName as UserRoleEnum)
    );
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

  const handleSaveUser = async (event: FormEvent) => {
    event.preventDefault();

    if (!formFullName.trim() || !formEmail.trim()) {
      triggerNotification('Vui lòng điền đầy đủ họ tên và email.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      triggerNotification('Email không đúng định dạng.', 'warning');
      return;
    }

    if (!formUsername.trim() && modalType === 'add') {
      triggerNotification('Vui lòng nhập tên đăng nhập.', 'warning');
      return;
    }

    const resolvedSpecialty =
      formSpecialty.trim() || getDefaultSpecialty(formRoleName);

    if (!resolvedSpecialty) {
      triggerNotification('Vui lòng nhập thông tin bổ sung.', 'warning');
      return;
    }

    setIsSaving(true);

    if (modalType === 'add') {
      if (!usesCreateAccountFlow(formRoleName)) {
        triggerNotification(
          'Chức năng này chỉ hỗ trợ tạo tài khoản giáo viên hoặc phụ huynh.',
          'warning'
        );
        setIsSaving(false);
        return;
      }

      const result = await createAccount({
        username: formUsername.trim(),
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        gender: formGender,
        specialty: resolvedSpecialty,
        roleName: formRoleName,
      });

      if (result.success && result.data) {
        triggerNotification(
          result.data.message ||
            `Đã tạo tài khoản ${getRoleLabel(
              result.data.roleName
            )} và gửi email xác minh.`
        );
        handleCloseModal();
        await fetchUsers();
      } else {
        const message =
          result.errors.length > 0 ? result.errors.join(' ') : result.message;
        triggerNotification(message || 'Tạo tài khoản thất bại.', 'warning');
      }
    } else if (modalType === 'edit' && selectedUser) {
      const result = await updateUser(selectedUser.id, {
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        gender: formGender,
        specialty: resolvedSpecialty,
        roleName: formRoleName,
        isActive: formIsActive,
      });

      if (result.success && result.data) {
        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === selectedUser.id ? result.data! : user
          )
        );
        triggerNotification(
          `Cập nhật tài khoản "${result.data.fullName}" thành công.`
        );
        handleCloseModal();
      } else {
        const message =
          result.errors.length > 0 ? result.errors.join(' ') : result.message;
        triggerNotification(
          message || 'Cập nhật tài khoản thất bại.',
          'warning'
        );
      }
    }

    setIsSaving(false);
  };

  const handleToggleLock = async (user: UserResponse) => {
    const nextActive = !user.isActive;

    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        item.id === user.id ? { ...item, isActive: nextActive } : item
      )
    );

    const result = await updateUser(user.id, { isActive: nextActive });

    if (result.success) {
      const message = nextActive
        ? `Đã mở khóa tài khoản "${user.fullName}".`
        : `Đã khóa tài khoản "${user.fullName}".`;
      triggerNotification(message, nextActive ? 'success' : 'warning');
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        item.id === user.id ? { ...item, isActive: user.isActive } : item
      )
    );
    triggerNotification(
      result.message || 'Thao tác thất bại. Vui lòng thử lại.',
      'warning'
    );
  };

  const handleResetPassword = async (user: UserResponse) => {
    triggerNotification(
      `Đã gửi yêu cầu đặt lại mật khẩu cho "${user.fullName}".`
    );
  };

  const handleRefresh = () => {
    void fetchUsers();
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
    formGender,
    setFormGender,
    formSpecialty,
    setFormSpecialty,
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
