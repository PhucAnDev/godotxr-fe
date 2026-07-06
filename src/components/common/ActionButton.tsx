import React from 'react';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Play, 
  ArrowRightLeft, 
  XCircle, 
  TrendingUp,
  Check,
  Plus,
  History
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type ActionButtonType = 
  | 'view' 
  | 'edit' 
  | 'delete' 
  | 'lock' 
  | 'unlock' 
  | 'reset' 
  | 'play' 
  | 'transfer' 
  | 'cancel' 
  | 'trend'
  | 'approve'
  | 'add'
  | 'history';

interface ActionButtonProps {
  type: ActionButtonType;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const typeConfigs: Record<ActionButtonType, {
  icon: React.ComponentType<{ className?: string }>;
  defaultClass: string;
}> = {
  view: {
    icon: Eye,
    defaultClass: 'text-teal-600 hover:bg-teal-50 bg-transparent',
  },
  edit: {
    icon: Edit3,
    defaultClass: 'text-sky-500 hover:bg-sky-50 bg-transparent',
  },
  delete: {
    icon: Trash2,
    defaultClass: 'text-rose-500 hover:bg-rose-50 bg-transparent',
  },
  lock: {
    icon: Lock,
    defaultClass: 'text-rose-500 hover:bg-rose-50 bg-transparent',
  },
  unlock: {
    icon: Unlock,
    defaultClass: 'text-emerald-500 hover:bg-emerald-50 bg-transparent',
  },
  reset: {
    icon: RefreshCw,
    defaultClass: 'text-yellow-500 hover:bg-yellow-50 bg-transparent',
  },
  play: {
    icon: Play,
    defaultClass: 'text-emerald-500 hover:bg-emerald-50 bg-transparent',
  },
  transfer: {
    icon: ArrowRightLeft,
    defaultClass: 'text-indigo-600 hover:bg-indigo-50 bg-transparent',
  },
  cancel: {
    icon: XCircle,
    defaultClass: 'text-rose-500 hover:bg-rose-50 bg-transparent',
  },
  trend: {
    icon: TrendingUp,
    defaultClass: 'text-orange-500 hover:bg-orange-50 bg-transparent',
  },
  approve: {
    icon: Check,
    defaultClass: 'text-white hover:bg-emerald-600 bg-emerald-500 shadow-sm shadow-emerald-500/10',
  },
  add: {
    icon: Plus,
    defaultClass: 'text-orange-500 hover:bg-orange-50 bg-transparent',
  },
  history: {
    icon: History,
    defaultClass: 'text-indigo-600 hover:bg-indigo-50 bg-transparent',
  }
};

export default function ActionButton({
  type,
  onClick,
  title,
  disabled = false,
  className,
  id,
}: ActionButtonProps) {
  const config = typeConfigs[type];
  const IconComponent = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      id={id}
      className={cn(
        'inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent',
        config.defaultClass,
        className
      )}
    >
      <IconComponent className="w-4.5 h-4.5" />
    </button>
  );
}
