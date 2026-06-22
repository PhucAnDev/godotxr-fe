import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createAccount,
  createUser,
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
  formPassword: string;
  setFormPassword: (value: string) => void;
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
      return 'Parent Support';
    case 'Admin':
      return 'System Administration';
    default:
      return 'General Support';
  }
}

function usesCreateAccountFlow(role: UserRoleEnum): boolean {
  return role === 'Teacher' || role === 'Parent';
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
  const [formPassword, setFormPassword] = useState('');
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
      setTimeout(() => setAlertConfig(null), 4000);
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
      result.message || 'Khong the tai danh sach nguoi dung.',
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
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterStatus]);

  useEffect(() => {
    if (modalType !== 'add') {
      return;
    }

    if (usesCreateAccountFlow(formRoleName) && formPassword.length < 6) {
      setFormPassword('invite1');
    }

    if (formRoleName === 'Admin' && formPassword === 'invite1') {
      setFormPassword('');
    }

    if (!formSpecialty.trim() && formRoleName !== 'Teacher') {
      setFormSpecialty(getDefaultSpecialty(formRoleName));
    }
  }, [formPassword, formRoleName, formSpecialty, modalType]);

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
    setFormPassword('');
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
    setFormPassword('');
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
      triggerNotification('Vui long dien day du ho ten va email!', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      triggerNotification('Email khong dung dinh dang!', 'warning');
      return;
    }

    if (!formUsername.trim() && modalType === 'add') {
      triggerNotification('Vui long nhap username!', 'warning');
      return;
    }

    const resolvedSpecialty =
      formSpecialty.trim() || getDefaultSpecialty(formRoleName);

    if (!resolvedSpecialty) {
      triggerNotification('Vui long nhap thong tin bo sung!', 'warning');
      return;
    }

    if (modalType === 'add' && formRoleName === 'Admin') {
      if (!formPassword || formPassword.length < 6) {
        triggerNotification('Mat khau phai co it nhat 6 ky tu!', 'warning');
        return;
      }
    }

    setIsSaving(true);

    if (modalType === 'add') {
      if (usesCreateAccountFlow(formRoleName)) {
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
              `Da tao tai khoan ${result.data.roleName} va gui email xac minh.`
          );
          handleCloseModal();
          await fetchUsers();
        } else {
          const message =
            result.errors.length > 0 ? result.errors.join(' ') : result.message;
          triggerNotification(message || 'Tao tai khoan that bai.', 'warning');
        }
      } else {
        const result = await createUser({
          username: formUsername.trim(),
          password: formPassword,
          fullName: formFullName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim() || undefined,
          gender: formGender,
          specialty: resolvedSpecialty,
          roleName: formRoleName,
        });

        if (result.success && result.data) {
          triggerNotification(
            `Da tao thanh cong tai khoan "${result.data.fullName}"!`
          );
          handleCloseModal();
          await fetchUsers();
        } else {
          const message =
            result.errors.length > 0 ? result.errors.join(' ') : result.message;
          triggerNotification(message || 'Tao tai khoan that bai.', 'warning');
        }
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
          `Cap nhat tai khoan "${result.data.fullName}" thanh cong!`
        );
        handleCloseModal();
      } else {
        const message =
          result.errors.length > 0 ? result.errors.join(' ') : result.message;
        triggerNotification(
          message || 'Cap nhat tai khoan that bai.',
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
        ? `Da mo khoa tai khoan "${user.fullName}"!`
        : `Da khoa tai khoan "${user.fullName}"!`;
      triggerNotification(message, nextActive ? 'success' : 'warning');
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        item.id === user.id ? { ...item, isActive: user.isActive } : item
      )
    );
    triggerNotification(
      result.message || 'Thao tac that bai. Vui long thu lai.',
      'warning'
    );
  };

  const handleResetPassword = async (user: UserResponse) => {
    triggerNotification(
      `Da gui yeu cau dat lai mat khau cho "${user.fullName}".`
    );
  };

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
