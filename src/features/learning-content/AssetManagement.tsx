import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Trash2, Edit, Play, Pause,
  Volume2, Boxes, Upload, X, ChevronLeft, ChevronRight,
  Image as ImageIcon, Music as MusicIcon, FileText
} from 'lucide-react';
import {
  getItemAssets, createItemAsset, updateItemAsset, deleteItemAsset, type ItemAssetResponse
} from '../../services/itemAssetService';

// Declare model-viewer type for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean | string;
        'camera-controls'?: boolean | string;
        'ar'?: boolean | string;
        'shadow-intensity'?: string;
        'environment-image'?: string;
        'exposure'?: string;
        'interaction-prompt'?: string;
      }, HTMLElement>;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean | string;
        'camera-controls'?: boolean | string;
        'ar'?: boolean | string;
        'shadow-intensity'?: string;
        'environment-image'?: string;
        'exposure'?: string;
        'interaction-prompt'?: string;
      }, HTMLElement>;
    }
  }
}

interface FileDropZoneProps {
  id: string;
  accept: string;
  file: File | null;
  existingUrl?: string | null;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  onChange: (file: File | null) => void;
}

function FileDropZone({
  id,
  accept,
  file,
  existingUrl,
  label,
  subLabel,
  icon,
  onChange,
}: FileDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getExistingFileName = (url: string) => {
    try {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      const nameWithoutParams = lastPart.split('?')[0];
      return decodeURIComponent(nameWithoutParams);
    } catch (e) {
      return 'Tệp hiện tại';
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 select-none min-h-[140px]
        ${isDragActive
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99] shadow-inner'
          : file || existingUrl
            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/10 dark:bg-emerald-950/5 hover:border-emerald-400'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
        }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {file ? (
        <div className="w-full flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex-shrink-0 animate-pulse">
              {icon}
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {file.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatBytes(file.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors flex-shrink-0"
            title="Xóa tệp đã chọn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : existingUrl ? (
        <div className="w-full flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex-shrink-0">
              {icon}
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                Giữ tệp cũ (Không đổi)
              </p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {getExistingFileName(existingUrl)}
              </p>
            </div>
          </div>
          <div className="text-[10px] uppercase font-bold text-blue-500 tracking-wider bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded flex-shrink-0">
            Thay thế
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-white dark:bg-slate-950 rounded-xl shadow-sm text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {label}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {subLabel}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssetManagement() {
  const [assets, setAssets] = useState<ItemAssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 8;

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ItemAssetResponse | null>(null);
  const [viewingModelUrl, setViewingModelUrl] = useState<string | null>(null);
  const [viewingModelName, setViewingModelName] = useState<string>('');

  // Form fields
  const [name, setName] = useState('');
  const [answerSentence, setAnswerSentence] = useState('');
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal Drag and Drop state
  const [isDraggingToModal, setIsDraggingToModal] = useState(false);
  const dragCounter = useRef(0);

  // Cache busting version state
  const [assetVersions, setAssetVersions] = useState<Record<number, number>>({});

  const getBustedUrl = (url: string | null, assetId: number) => {
    if (!url) return null;
    const version = assetVersions[assetId] || 0;
    const base = url.startsWith('http')
      ? url
      : `${import.meta.env.VITE_API_BASE_URL || ''}${url}`;
    return version > 0 ? `${base}?v=${version}` : base;
  };

  // Audio state
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const audioPlayersRef = useRef<{ [key: number]: HTMLAudioElement }>({});

  // Load model-viewer script from Google CDN
  useEffect(() => {
    const existingScript = document.getElementById('model-viewer-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'model-viewer-script';
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
      document.body.appendChild(script);
    }
  }, []);

  // Fetch assets
  const fetchAssets = async () => {
    setLoading(true);
    const result = await getItemAssets(page, pageSize);
    if (result.success && result.data) {
      setAssets(result.data.items);
      setTotalPages(result.data.totalPages);
      setTotalCount(result.data.totalCount);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, [page]);

  // Audio player control
  const toggleAudio = (assetId: number, audioUrl: string) => {
    const player = audioPlayersRef.current[assetId];

    // Stop any other playing audio
    if (playingAudioId !== null && playingAudioId !== assetId) {
      const otherPlayer = audioPlayersRef.current[playingAudioId];
      if (otherPlayer) {
        otherPlayer.pause();
        otherPlayer.currentTime = 0;
      }
    }

    if (player) {
      if (playingAudioId === assetId) {
        player.pause();
        setPlayingAudioId(null);
      } else {
        player.play().catch(() => { });
        setPlayingAudioId(assetId);
      }
    } else {
      // Create new audio instance with cache buster
      const fullUrl = getBustedUrl(audioUrl, assetId) || '';

      const newAudio = new Audio(fullUrl);
      newAudio.addEventListener('ended', () => {
        setPlayingAudioId(null);
      });
      audioPlayersRef.current[assetId] = newAudio;
      newAudio.play().catch(() => { });
      setPlayingAudioId(assetId);
    }
  };

  // Cleanup audios on unmount
  useEffect(() => {
    return () => {
      Object.values(audioPlayersRef.current).forEach(p => p.pause());
    };
  }, []);

  // Filter items locally by search term
  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.answerSentence.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Modal global drop handlers
  const handleModalDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingToModal(true);
    }
  };

  const handleModalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingToModal(false);
    }
  };

  const handleModalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleModalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingToModal(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);

      files.forEach((file) => {
        const name = file.name.toLowerCase();
        const type = file.type.toLowerCase();

        if (name.endsWith('.glb') || name.endsWith('.gltf')) {
          setModelFile(file);
        } else if (type.startsWith('image/') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp') || name.endsWith('.gif')) {
          setImageFile(file);
        } else if (type.startsWith('audio/') || name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg') || name.endsWith('.m4a') || name.endsWith('.flac')) {
          setAudioFile(file);
        }
      });
    }
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError('Vui lòng nhập tên vật phẩm.');
      return;
    }
    if (!answerSentence.trim()) {
      setSubmitError('Vui lòng nhập từ khóa/câu phát âm.');
      return;
    }
    if (!editingAsset && !modelFile) {
      setSubmitError('Vui lòng chọn tệp 3D (.glb/.gltf).');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('Name', name.trim());
    formData.append('AnswerSentence', answerSentence.trim());

    if (modelFile) {
      formData.append('ModelFile', modelFile);
    }
    if (imageFile) {
      formData.append('ImageFile', imageFile);
    }
    if (audioFile) {
      formData.append('AudioFile', audioFile);
    }

    console.log("Submitting FormData entries:");
    for (let [key, value] of (formData as any).entries()) {
      if (value instanceof File) {
        console.log(key, `File: name=${value.name}, size=${value.size}, type=${value.type}`);
      } else {
        console.log(key, value);
      }
    }

    let result;
    if (editingAsset) {
      result = await updateItemAsset(editingAsset.id, formData);
    } else {
      result = await createItemAsset(formData);
    }

    setSubmitting(false);

    if (result.success) {
      setIsFormModalOpen(false);

      if (editingAsset) {
        // Clear cached audio player if it exists so next play will load new audio
        if (audioPlayersRef.current[editingAsset.id]) {
          audioPlayersRef.current[editingAsset.id].pause();
          delete audioPlayersRef.current[editingAsset.id];
        }
        // Increment version to force cache busting for all updated assets
        setAssetVersions(prev => ({
          ...prev,
          [editingAsset.id]: (prev[editingAsset.id] || 0) + 1
        }));
      }

      resetForm();
      fetchAssets();
    } else {
      setSubmitError(result.errors.join(', ') || 'Đã xảy ra lỗi khi lưu.');
    }
  };

  // Delete handler
  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vật phẩm này khỏi thư viện?')) {
      try {
        const result = await deleteItemAsset(id);
        if (result.success) {
          fetchAssets();
        } else {
          alert(result.errors.join(', ') || 'Xóa vật phẩm thất bại.');
        }
      } catch (err: any) {
        alert(err.message || 'Xóa vật phẩm thất bại.');
      }
    }
  };

  const openCreateModal = () => {
    setEditingAsset(null);
    resetForm();
    setIsFormModalOpen(true);
  };

  const openEditModal = (asset: ItemAssetResponse) => {
    setEditingAsset(asset);
    setName(asset.name);
    setAnswerSentence(asset.answerSentence);
    setModelFile(null);
    setImageFile(null);
    setAudioFile(null);
    setSubmitError(null);
    setIsFormModalOpen(true);
  };

  const resetForm = () => {
    setName('');
    setAnswerSentence('');
    setModelFile(null);
    setImageFile(null);
    setAudioFile(null);
    setSubmitError(null);
  };

  const openViewer = (asset: ItemAssetResponse) => {
    const fullUrl = getBustedUrl(asset.modelUrl, asset.id) || '';
    setViewingModelUrl(fullUrl);
    setViewingModelName(asset.name);
    setIsViewerModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-24 relative">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-1">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Thư Viện <span className="text-[#4EACAF]">Vật Phẩm 3D</span>
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#4EACAF] hover:bg-[#4EACAF]/90 text-white font-black italic tracking-tight py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4EACAF]/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          Thêm vật phẩm
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 shadow-sm items-center gap-3">
        <Search className="text-slate-400 h-5 w-5 ml-1" />
        <input
          type="text"
          placeholder="Tìm kiếm vật phẩm theo tên hoặc từ khóa phát âm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-none outline-none text-slate-800 dark:text-slate-100 bg-transparent text-base placeholder-slate-400"
        />
      </div>

      {/* Grid of Items */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <Boxes className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Không tìm thấy vật phẩm nào</h3>
          <p className="text-slate-400 mt-1 max-w-sm">
            Thư viện đang trống hoặc không có vật phẩm nào khớp với tìm kiếm của bạn. Hãy nhấn nút "Thêm vật phẩm" để tạo mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => {
            const fullImageUrl = getBustedUrl(asset.imageUrl, asset.id);
            const fullModelUrl = getBustedUrl(asset.modelUrl, asset.id) || '';

            return (
              <div
                key={asset.id}
                className="group flex flex-col h-[410px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                {/* 3D Preview container */}
                <div className="relative w-full h-[60%] bg-slate-50 dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
                  {fullImageUrl ? (
                    <img
                      src={fullImageUrl}
                      alt={asset.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    // Futuristic Live 3D Preview on Card!
                    <div className="absolute inset-0 w-full h-full p-1">
                      <model-viewer
                        src={fullModelUrl}
                        alt={asset.name}
                        shadow-intensity="1"
                        interaction-prompt="none"
                        camera-controls={false}
                        auto-rotate={true}
                        style={{ width: '100%', height: '100%', outline: 'none' }}
                      />
                    </div>
                  )}
                  {/* Actions Float Trigger */}
                  <button
                    onClick={() => openViewer(asset)}
                    className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white font-medium text-xs px-2.5 py-1.5 rounded-lg opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 z-10 cursor-pointer"
                  >
                    Xem 3D
                  </button>
                </div>

                {/* Details Body */}
                <div className="p-3.5 h-[40%] flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug line-clamp-1" title={asset.name}>
                      {asset.name}
                    </h3>

                    {/* Pronunciation Target block */}
                    <div className="mt-1.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 px-2.5 py-1.5 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">
                        Từ khóa đọc chuẩn
                      </div>
                      <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mt-0.5 line-clamp-1" title={asset.answerSentence}>
                        "{asset.answerSentence}"
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex gap-2">
                      {asset.audioUrl && (
                        <button
                          onClick={() => toggleAudio(asset.id, asset.audioUrl!)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${playingAudioId === asset.id
                              ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30 dark:hover:bg-emerald-950/40'
                            }`}
                          title="Nghe phát âm mẫu"
                        >
                          {playingAudioId === asset.id ? (
                            <>
                              <Pause className="h-3.5 w-3.5" />
                              <span>Đang phát</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5" />
                              <span>Nghe phát âm</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEditModal(asset)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                        title="Sửa thông tin"
                      >
                        <Edit className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Xóa vật phẩm"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-xl shadow-sm">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Hiển thị <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredAssets.length}</span> / {totalCount} vật phẩm
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="flex items-center px-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Form Modal (Create & Edit) */}
      {isFormModalOpen && (
        <div
          onDragEnter={handleModalDragEnter}
          onDragOver={handleModalDragOver}
          onDragLeave={handleModalDragLeave}
          onDrop={handleModalDrop}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto"
        >
          {isDraggingToModal && (
            <div className="absolute inset-0 bg-blue-600/90 dark:bg-blue-900/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-200 pointer-events-none">
              <div className="p-6 bg-white/10 rounded-full border border-white/20 animate-pulse mb-4">
                <Upload className="h-12 w-12 text-white" />
              </div>
              <h4 className="text-2xl font-bold">Thả tệp vào đây</h4>
              <p className="text-white/80 text-sm mt-2 text-center max-w-md">
                Tự động phân loại: Mô hình 3D (.glb, .gltf), Ảnh xem trước (Thumbnail), hoặc Tệp âm thanh phát âm mẫu
              </p>
            </div>
          )}
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 relative z-10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex-shrink-0">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {editingAsset ? 'Sửa thông tin vật phẩm 3D' : 'Thêm vật phẩm 3D mới'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    {submitError}
                  </div>
                )}

                {/* Asset Name input */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Tên vật phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Quả Chuối, Khủng Long..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                {/* Target answer sentence input */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Từ khóa / Câu đọc mẫu (cho trẻ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={answerSentence}
                    onChange={(e) => setAnswerSentence(e.target.value)}
                    placeholder="Ví dụ: quả chuối, đây là quả chuối..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                {/* 3D Model file upload */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Mô hình 3D (.glb / .gltf) <span className="text-red-500">{editingAsset ? '' : '*'}</span>
                  </label>
                  <FileDropZone
                    id="modelFile"
                    accept=".glb,.gltf"
                    file={modelFile}
                    existingUrl={editingAsset?.modelUrl}
                    label="Kéo thả tệp 3D vào đây"
                    subLabel="Định dạng hỗ trợ: .glb, .gltf"
                    icon={<Boxes className="h-5 w-5" />}
                    onChange={setModelFile}
                  />
                </div>

                {/* Preview image file upload */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Ảnh xem trước (Thumbnail - Tùy chọn)
                  </label>
                  <FileDropZone
                    id="imageFile"
                    accept="image/*"
                    file={imageFile}
                    existingUrl={editingAsset?.imageUrl}
                    label="Kéo thả hình ảnh vào đây"
                    subLabel="Định dạng hỗ trợ: PNG, JPG, JPEG, WEBP"
                    icon={<ImageIcon className="h-5 w-5" />}
                    onChange={setImageFile}
                  />
                </div>

                {/* Audio file upload */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Âm thanh phát âm mẫu (Audio - Tùy chọn)
                  </label>
                  <FileDropZone
                    id="audioFile"
                    accept="audio/*"
                    file={audioFile}
                    existingUrl={editingAsset?.audioUrl}
                    label="Kéo thả tệp âm thanh vào đây"
                    subLabel="Định dạng hỗ trợ: MP3, WAV, OGG, M4A"
                    icon={<MusicIcon className="h-5 w-5" />}
                    onChange={setAudioFile}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submitting && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {editingAsset ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Model Viewer Modal (Full Interactive Preview) */}
      {isViewerModalOpen && viewingModelUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 w-full max-w-4xl h-[70vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative border border-slate-800">
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-950 border-b border-slate-800 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Boxes className="text-blue-500 h-6 w-6" />
                Mô hình 3D: {viewingModelName}
              </h3>
              <button
                onClick={() => setIsViewerModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* 3D Canvas Body */}
            <div className="flex-1 w-full bg-slate-950 relative">
              <model-viewer
                src={viewingModelUrl}
                alt={viewingModelName}
                shadow-intensity="1.5"
                camera-controls="true"
                auto-rotate="true"
                ar="true"
                style={{ width: '100%', height: '100%', outline: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
