import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  type RoleResponse,
  type UserRoleEnum,
} from '../services/roleService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModalType = 'add' | 'edit' | 'detail' | null;

export interface ToastConfig {
  message: string;
  type: 'success' | 'warning';
}

export interface UseRoleManagementReturn {
  // ─── Data ──────────────────────────────────────────────────────────────────
  roles: RoleResponse[];
  filteredRoles: RoleResponse[];
  isLoading: boolean;

  // ─── Stats ─────────────────────────────────────────────────────────────────
  totalRoles: number;
  activeRoles: number;
  inactiveRoles: number;

  // ─── Search & filter ───────────────────────────────────────────────────────
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterActive: string;
  setFilterActive: (v: string) => void;

  // ─── Modal ─────────────────────────────────────────────────────────────────
  modalType: ModalType;
  selectedRole: RoleResponse | null;
  handleOpenAdd: () => void;
  handleOpenEdit: (role: RoleResponse) => void;
  handleOpenDetail: (role: RoleResponse) => void;
  handleCloseModal: () => void;

  // ─── Form state ────────────────────────────────────────────────────────────
  formRoleName: UserRoleEnum;
  setFormRoleName: (v: UserRoleEnum) => void;
  formDescription: string;
  setFormDescription: (v: string) => void;
  formIsActive: boolean;
  setFormIsActive: (v: boolean) => void;
  isSaving: boolean;

  // ─── Actions ───────────────────────────────────────────────────────────────
  handleSaveRole: (e: FormEvent) => Promise<void>;
  handleToggleActive: (role: RoleResponse) => Promise<void>;
  handleDelete: (role: RoleResponse) => Promise<void>;

  // ─── Toast ─────────────────────────────────────────────────────────────────
  alertConfig: ToastConfig | null;
  setAlertConfig: (v: ToastConfig | null) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRoleManagement(): UseRoleManagementReturn {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState('ALL');

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);

  const [formRoleName, setFormRoleName] = useState<UserRoleEnum>('Admin');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const [alertConfig, setAlertConfig] = useState<ToastConfig | null>(null);

  // ─── Toast helper ──────────────────────────────────────────────────────────

  const triggerNotification = useCallback(
    (message: string, type: 'success' | 'warning' = 'success') => {
      setAlertConfig({ message, type });
      setTimeout(() => setAlertConfig(null), 4000);
    },
    []
  );

  // ─── Fetch danh sách roles từ BE ───────────────────────────────────────────

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    const result = await getRoles(1, 100);
    setIsLoading(false);

    if (result.success && result.data) {
      setRoles(result.data.items);
    } else {
      triggerNotification(
        result.message || 'Không thể tải danh sách vai trò.',
        'warning'
      );
    }
  }, [triggerNotification]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const totalRoles = roles.length;
  const activeRoles = roles.filter((r) => r.isActive).length;
  const inactiveRoles = roles.filter((r) => !r.isActive).length;

  // ─── Lọc hiển thị ─────────────────────────────────────────────────────────

  const filteredRoles = roles.filter((role) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      role.roleName.toLowerCase().includes(q) ||
      role.description.toLowerCase().includes(q) ||
      String(role.id).includes(q);

    const matchesStatus =
      filterActive === 'ALL' ||
      (filterActive === 'ACTIVE' && role.isActive) ||
      (filterActive === 'INACTIVE' && !role.isActive);

    return matchesSearch && matchesStatus;
  });

  // ─── Modal handlers ────────────────────────────────────────────────────────

  const handleOpenAdd = () => {
    setFormRoleName('Admin');
    setFormDescription('');
    setFormIsActive(true);
    setSelectedRole(null);
    setModalType('add');
  };

  const handleOpenEdit = (role: RoleResponse) => {
    setSelectedRole(role);
    setFormRoleName(role.roleName as UserRoleEnum);
    setFormDescription(role.description);
    setFormIsActive(role.isActive);
    setModalType('edit');
  };

  const handleOpenDetail = (role: RoleResponse) => {
    setSelectedRole(role);
    setModalType('detail');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedRole(null);
  };

  // ─── Save (Create / Update) ────────────────────────────────────────────────

  const handleSaveRole = async (e: FormEvent) => {
    e.preventDefault();

    if (!formDescription.trim()) {
      triggerNotification('Vui lòng điền Mô tả vai trò!', 'warning');
      return;
    }

    setIsSaving(true);

    if (modalType === 'add') {
      // POST /api/role
      const result = await createRole({
        roleName: formRoleName,
        description: formDescription.trim(),
      });

      if (result.success && result.data) {
        setRoles((prev) => [result.data!, ...prev]);
        triggerNotification(`Đã tạo thành công vai trò "${result.data.roleName}"!`);
        handleCloseModal();
      } else {
        const msg =
          result.errors.length > 0 ? result.errors.join(' ') : result.message;
        triggerNotification(msg || 'Tạo vai trò thất bại.', 'warning');
      }
    } else if (modalType === 'edit' && selectedRole) {
      // PUT /api/role/{id}
      const result = await updateRole(selectedRole.id, {
        roleName: formRoleName,
        description: formDescription.trim(),
        isActive: formIsActive,
      });

      if (result.success && result.data) {
        setRoles((prev) =>
          prev.map((r) => (r.id === selectedRole.id ? result.data! : r))
        );
        triggerNotification(
          `Cập nhật vai trò "${result.data.roleName}" thành công!`
        );
        handleCloseModal();
      } else {
        const msg =
          result.errors.length > 0 ? result.errors.join(' ') : result.message;
        triggerNotification(msg || 'Cập nhật vai trò thất bại.', 'warning');
      }
    }

    setIsSaving(false);
  };

  // ─── Toggle active (chỉ gửi trường isActive) ──────────────────────────────

  const handleToggleActive = async (role: RoleResponse) => {
    const nextActive = !role.isActive;

    // Optimistic update: cập nhật UI ngay, rollback nếu lỗi
    setRoles((prev) =>
      prev.map((r) => (r.id === role.id ? { ...r, isActive: nextActive } : r))
    );

    const result = await updateRole(role.id, { isActive: nextActive });

    if (result.success) {
      const msg = nextActive
        ? `Đã kích hoạt vai trò "${role.roleName}"!`
        : `Đã tắt vai trò "${role.roleName}"!`;
      triggerNotification(msg, nextActive ? 'success' : 'warning');
    } else {
      // Rollback nếu BE báo lỗi
      setRoles((prev) =>
        prev.map((r) =>
          r.id === role.id ? { ...r, isActive: role.isActive } : r
        )
      );
      triggerNotification(result.message || 'Thao tác thất bại.', 'warning');
    }
  };

  // ─── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (role: RoleResponse) => {
    const result = await deleteRole(role.id);

    if (result.success) {
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      triggerNotification(`Đã xóa vai trò "${role.roleName}"!`);
    } else {
      triggerNotification(result.message || 'Xóa vai trò thất bại.', 'warning');
    }
  };

  return {
    roles,
    filteredRoles,
    isLoading,
    totalRoles,
    activeRoles,
    inactiveRoles,
    searchQuery,
    setSearchQuery,
    filterActive,
    setFilterActive,
    modalType,
    selectedRole,
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDetail,
    handleCloseModal,
    formRoleName,
    setFormRoleName,
    formDescription,
    setFormDescription,
    formIsActive,
    setFormIsActive,
    isSaving,
    handleSaveRole,
    handleToggleActive,
    handleDelete,
    alertConfig,
    setAlertConfig,
  };
}
