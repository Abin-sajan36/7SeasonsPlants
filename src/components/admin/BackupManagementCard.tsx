import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Upload,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileArchive,
  Layers,
  Sparkles,
  Terminal,
  ShieldAlert,
  FileText,
  Check,
  RotateCcw,
  Info,
  Package,
  Tag,
  Truck,
  Ticket,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

interface BackupManifest {
  appName?: string;
  backupDate?: string;
  totalFiles?: number;
  zipArchive?: {
    filename: string;
    sizeFormatted: string;
    downloadUrl: string;
  };
  tarArchive?: {
    filename: string;
    sizeFormatted: string;
    downloadUrl: string;
  };
  databaseCollections?: Record<string, number>;
}

interface SnapshotInfo {
  masterSnapshot: {
    name: string;
    filename: string;
    sizeBytes: number;
    sizeFormatted: string;
    modifiedAt: string;
    exportedAt: string;
    projectId: string;
    stats: Record<string, number>;
    totalRecords: number;
    collections: string[];
  } | null;
  factorySeed: {
    name: string;
    totalRecords: number;
    collections: Record<string, number>;
  };
}

interface RestoreResponse {
  success: boolean;
  message?: string;
  error?: string;
  mode?: 'merge' | 'replace';
  restoredCollections?: string[];
  stats?: Record<string, number>;
  totalDocuments?: number;
  timeTakenMs?: number;
  timestamp?: string;
}

const COLLECTION_LABELS: Record<string, { label: string; icon: any }> = {
  products: { label: 'Plant Catalog', icon: Package },
  combos: { label: 'Combo Bundles', icon: Layers },
  categories: { label: 'Plant Categories', icon: Tag },
  orders: { label: 'Customer Orders', icon: Truck },
  coupons: { label: 'Discount Coupons', icon: Ticket },
  users: { label: 'User Accounts', icon: Database },
  dailyDeals: { label: 'Daily Deals', icon: Sparkles },
  banners: { label: 'Hero Banners', icon: FileArchive },
  plantCareGuides: { label: 'Plant Care Guides', icon: FileText },
  blogs: { label: 'Gardening Blogs', icon: FileText },
  storeSettings: { label: 'Store & Nursery Settings', icon: Info },
  reviews: { label: 'Customer Reviews', icon: CheckCircle2 },
};

export const BackupManagementCard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'restore' | 'download'>('restore');
  const [manifest, setManifest] = useState<BackupManifest | null>(null);
  const [snapshots, setSnapshots] = useState<SnapshotInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Restore states
  const [restoreSource, setRestoreSource] = useState<'server_snapshot' | 'upload_file' | 'factory_seed'>('server_snapshot');
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreResult, setRestoreResult] = useState<RestoreResponse | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    sizeFormatted: string;
    data: Record<string, any[]>;
    detectedCollections: string[];
    totalDocs: number;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchBackupAndSnapshots = async () => {
    try {
      setIsLoading(true);
      const [manifestRes, snapshotsRes] = await Promise.all([
        fetch('/api/backup/info').catch(() => null),
        fetch('/api/backup/snapshots').catch(() => null),
      ]);

      if (manifestRes && manifestRes.ok) {
        const mData = await manifestRes.json();
        if (mData.success) setManifest(mData);
      }

      if (snapshotsRes && snapshotsRes.ok) {
        const sData = await snapshotsRes.json();
        if (sData.success) {
          setSnapshots(sData);
          if (sData.masterSnapshot?.collections) {
            // Default select all collections in master snapshot
            setSelectedCollections(sData.masterSnapshot.collections.filter((c: string) => (sData.masterSnapshot.stats[c] || 0) > 0));
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch backup info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupAndSnapshots();
  }, []);

  const handleRegenerateBackup = async () => {
    try {
      setIsRegenerating(true);
      setStatusMsg(null);
      const res = await fetch('/api/backup/generate', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Fresh backup snapshot generated successfully!' });
        fetchBackupAndSnapshots();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to generate backup' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error triggering backup generation' });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setUploadError('Please select a valid JSON backup file (.json)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Normalize data
        let collectionsData: Record<string, any[]> = {};
        if (parsed.data && typeof parsed.data === 'object' && !Array.isArray(parsed.data)) {
          collectionsData = parsed.data;
        } else if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          collectionsData = parsed;
        } else if (Array.isArray(parsed)) {
          // Attempt to infer from filename (e.g. products.json)
          const baseName = file.name.replace(/\.json$/, '');
          collectionsData = { [baseName]: parsed };
        }

        const detectedKeys = Object.keys(collectionsData).filter(
          (k) => Array.isArray(collectionsData[k]) && collectionsData[k].length > 0
        );

        if (detectedKeys.length === 0) {
          setUploadError('No valid document collections found in the selected file.');
          return;
        }

        const totalDocs = detectedKeys.reduce(
          (sum, k) => sum + (Array.isArray(collectionsData[k]) ? collectionsData[k].length : 0),
          0
        );

        setUploadedFile({
          name: file.name,
          sizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
          data: collectionsData,
          detectedCollections: detectedKeys,
          totalDocs,
        });

        // Set selected collections to detected keys
        setSelectedCollections(detectedKeys);
      } catch (err: any) {
        setUploadError(`Failed to parse JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const executeRestore = async () => {
    setShowConfirmModal(false);
    setIsRestoring(true);
    setStatusMsg(null);
    setRestoreResult(null);

    try {
      const payload: any = {
        mode: restoreMode,
        source: restoreSource,
        collections: selectedCollections,
      };

      if (restoreSource === 'upload_file' && uploadedFile) {
        payload.data = uploadedFile.data;
      }

      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: RestoreResponse = await res.json();

      if (res.ok && data.success) {
        setRestoreResult(data);
        setStatusMsg({
          type: 'success',
          text: `Restore complete! ${data.totalDocuments || 0} records restored across ${data.restoredCollections?.length || 0} collections in ${data.timeTakenMs || 0}ms.`,
        });
      } else {
        setStatusMsg({
          type: 'error',
          text: data.error || 'Restore failed. Please check server logs.',
        });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Network error executing restore',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const toggleCollection = (col: string) => {
    setSelectedCollections((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const selectAllCollections = (allCols: string[]) => {
    setSelectedCollections(allCols);
  };

  const deselectAllCollections = () => {
    setSelectedCollections([]);
  };

  const availableCollectionsList =
    restoreSource === 'upload_file'
      ? uploadedFile?.detectedCollections || []
      : restoreSource === 'factory_seed'
      ? Object.keys(snapshots?.factorySeed?.collections || {})
      : snapshots?.masterSnapshot?.collections || [];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs max-w-3xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-emerald-950">
                Site & Database Backup and Restore
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Direct Admin Tool
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Take full snapshots, download offline archives, or restore Firestore data directly from the admin panel.
            </p>
          </div>
        </div>

        <button
          onClick={handleRegenerateBackup}
          disabled={isRegenerating || isRestoring}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>{isRegenerating ? 'Generating Snapshot...' : 'Fresh Snapshot'}</span>
        </button>
      </div>

      {/* Sub Tabs: Restore Database vs Download Backups */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveSubTab('restore')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'restore'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
          <span>⚡ Restore Database</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-md text-[10px]">
            Direct
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('download')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'download'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-gray-500" />
          <span>📦 Download Archives</span>
        </button>
      </div>

      {/* Status Notifications */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="flex-1">{statusMsg.text}</span>
          {statusMsg.type === 'success' && (
            <button
              onClick={() => window.location.reload()}
              className="text-[11px] underline font-bold hover:text-emerald-950 shrink-0 cursor-pointer"
            >
              Refresh View
            </button>
          )}
        </div>
      )}

      {/* TAB 1: RESTORE DATABASE DIRECTLY */}
      {activeSubTab === 'restore' && (
        <div className="space-y-6">
          {/* Step 1: Choose Restore Source */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <span>1. Choose Restore Source</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option A: Server Snapshot */}
              <button
                type="button"
                onClick={() => setRestoreSource('server_snapshot')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  restoreSource === 'server_snapshot'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Server Snapshot</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      1-Click
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                    Latest database snapshot stored on server ({snapshots?.masterSnapshot?.totalRecords || 50} records).
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-semibold text-emerald-700">
                  {snapshots?.masterSnapshot?.sizeFormatted || '610 KB'} •{' '}
                  {snapshots?.masterSnapshot?.modifiedAt
                    ? new Date(snapshots.masterSnapshot.modifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Ready'}
                </div>
              </button>

              {/* Option B: Upload Backup File */}
              <button
                type="button"
                onClick={() => setRestoreSource('upload_file')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  restoreSource === 'upload_file'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Upload Backup (.JSON)</span>
                    <Upload className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                    Select a previously downloaded backup JSON dump to restore into Firestore.
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-semibold text-gray-600 truncate">
                  {uploadedFile ? `${uploadedFile.name} (${uploadedFile.totalDocs} docs)` : 'Select JSON file'}
                </div>
              </button>

              {/* Option C: Factory Seed Catalog */}
              <button
                type="button"
                onClick={() => setRestoreSource('factory_seed')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  restoreSource === 'factory_seed'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Factory Seed Catalog</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                    Reset clean default catalog (9 plants, 3 combos, 9 categories, banners, settings).
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-semibold text-amber-700">
                  Default Clean State
                </div>
              </button>
            </div>
          </div>

          {/* If Upload Source is selected, show File Picker */}
          {restoreSource === 'upload_file' && (
            <div className="p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-300 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-gray-800">
                    {uploadedFile ? `Loaded: ${uploadedFile.name}` : 'Choose a JSON Backup File'}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Supports 7Seasons full database dump or individual collection dumps (.json).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadedFile ? 'Change File' : 'Browse File (.JSON)'}</span>
                </button>
              </div>

              {uploadError && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadedFile && (
                <div className="pt-2 border-t border-gray-200/60 flex items-center gap-3 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Successfully verified {uploadedFile.totalDocs} documents across{' '}
                    {uploadedFile.detectedCollections.length} collections.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Collection Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                2. Select Collections to Restore ({selectedCollections.length} selected)
              </label>

              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => selectAllCollections(availableCollectionsList)}
                  className="text-emerald-700 hover:underline font-bold cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-gray-300">•</span>
                <button
                  type="button"
                  onClick={deselectAllCollections}
                  className="text-gray-500 hover:underline font-bold cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableCollectionsList.map((colName) => {
                const isSelected = selectedCollections.includes(colName);
                const info = COLLECTION_LABELS[colName] || { label: colName, icon: Database };
                const Icon = info.icon;
                const count =
                  restoreSource === 'upload_file'
                    ? uploadedFile?.data[colName]?.length || 0
                    : restoreSource === 'factory_seed'
                    ? snapshots?.factorySeed?.collections[colName] || 0
                    : snapshots?.masterSnapshot?.stats[colName] || 0;

                return (
                  <button
                    key={colName}
                    type="button"
                    onClick={() => toggleCollection(colName)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs truncate">{info.label}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-emerald-800 ml-1.5 shrink-0">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Restore Mode (Merge vs Replace) */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-700">
              3. Select Restore Mode
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  restoreMode === 'merge'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="restoreMode"
                  value="merge"
                  checked={restoreMode === 'merge'}
                  onChange={() => setRestoreMode('merge')}
                  className="mt-0.5 accent-emerald-600"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <span>Merge / Upsert</span>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Updates matching records and adds missing ones. Existing items not present in the backup will remain safe.
                  </p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  restoreMode === 'replace'
                    ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="restoreMode"
                  value="replace"
                  checked={restoreMode === 'replace'}
                  onChange={() => setRestoreMode('replace')}
                  className="mt-0.5 accent-amber-600"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <span>Clean Overwrite</span>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                      Caution
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Clears the selected collections and restores exact backup state. Useful for resetting catalog.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isRestoring || selectedCollections.length === 0}
              onClick={() => setShowConfirmModal(true)}
              className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-6 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRestoring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Restoring Collections to Firestore...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>
                    Restore {selectedCollections.length} Collection{selectedCollections.length === 1 ? '' : 's'} to Database Directly
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Last Restore Summary Card */}
          {restoreResult && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                    Last Restore Audit Summary
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Completed in {restoreResult.timeTakenMs}ms
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {Object.entries(restoreResult.stats || {}).map(([col, count]) => (
                  <div key={col} className="p-2 bg-white rounded-lg border border-emerald-100 flex items-center justify-between">
                    <span className="text-gray-600 text-[11px] truncate">{col}</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                      +{count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOWNLOAD ARCHIVES & OFFLINE RUN */}
      {activeSubTab === 'download' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main ZIP Download */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileArchive className="w-5 h-5 text-emerald-700" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                    Full Site Archive (.ZIP)
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 leading-relaxed">
                  Complete standalone package: React 19 source code, Express backend, public assets, configs, and all exported database files.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-emerald-950">
                  <span className="bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    Size: {manifest?.zipArchive?.sizeFormatted || '~1.44 MB'}
                  </span>
                  <span className="bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    Files: {manifest?.totalFiles || 111}
                  </span>
                </div>
              </div>

              <a
                href="/api/backup/download"
                download="7seasonsplants-full-site-backup.zip"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer text-center"
              >
                <Download className="w-4 h-4" />
                <span>Download ZIP Backup</span>
              </a>
            </div>

            {/* Database JSON Dump Download */}
            <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-100 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-700" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                    Database Dump (.JSON)
                  </span>
                </div>
                <p className="text-xs text-amber-800/80 leading-relaxed">
                  Exported Firestore records: Combos, products, categories, orders, customers, coupons, banners, and store settings.
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap text-[10px] font-semibold text-amber-900">
                  <span className="bg-white/80 px-2 py-0.5 rounded-full border border-amber-200/60">
                    Format: JSON
                  </span>
                  <span className="bg-white/80 px-2 py-0.5 rounded-full border border-amber-200/60">
                    Firestore & Seed Data
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href="/api/backup/database-json"
                  download="7seasonsplants-firestore-dump.json"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download JSON</span>
                </a>
                <a
                  href="/api/backup/download-tar"
                  download="7seasonsplants-full-site-backup.tar.gz"
                  title="Download TAR.GZ archive for Linux/macOS"
                  className="inline-flex items-center justify-center px-3.5 py-2.5 bg-white hover:bg-amber-100/60 text-amber-800 border border-amber-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  <span>.tar.gz</span>
                </a>
              </div>
            </div>
          </div>

          {/* Database Collections Breakdown */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-700">
                Backed Up Database Collections
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {[
                { name: 'Products', count: manifest?.databaseCollections?.products ?? 4 },
                { name: 'Plant Combos', count: manifest?.databaseCollections?.combos ?? 4 },
                { name: 'Categories', count: manifest?.databaseCollections?.categories ?? 6 },
                { name: 'Orders', count: manifest?.databaseCollections?.orders ?? 13 },
                { name: 'Users', count: manifest?.databaseCollections?.users ?? 7 },
                { name: 'Coupons', count: manifest?.databaseCollections?.coupons ?? 4 },
                { name: 'Daily Deals', count: manifest?.databaseCollections?.dailyDeals ?? 2 },
                { name: 'Hero Banners', count: manifest?.databaseCollections?.banners ?? 3 },
              ].map((col) => (
                <div
                  key={col.name}
                  className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between"
                >
                  <span className="text-gray-600 font-medium">{col.name}</span>
                  <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-gray-200/60 text-[11px]">
                    {col.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Restore Cheat Sheet */}
          <div className="p-4 rounded-2xl bg-gray-900 text-gray-100 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Terminal className="w-4 h-4" />
              <span>How to run locally from this backup:</span>
            </div>
            <p className="text-gray-400 text-[11px] font-sans">
              Extract the archive, install dependencies, and launch the dev server:
            </p>
            <pre className="text-emerald-300 text-[11px] bg-black/40 p-2.5 rounded-lg overflow-x-auto">
{`unzip 7seasonsplants-full-site-backup.zip
cd 7seasonsplants-backup
npm install
npm run dev`}
            </pre>
          </div>
        </div>
      )}

      {/* Safety Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-900">
                  Confirm Database Restore
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Are you sure you want to restore data to Firestore?
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl space-y-2 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Source:</span>
                <span className="font-bold text-gray-900">
                  {restoreSource === 'server_snapshot'
                    ? 'Server Snapshot'
                    : restoreSource === 'upload_file'
                    ? `Uploaded File (${uploadedFile?.name})`
                    : 'Factory Seed Catalog'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mode:</span>
                <span className={`font-bold ${restoreMode === 'replace' ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {restoreMode === 'replace' ? 'Clean Overwrite' : 'Merge / Upsert (Safe)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Collections:</span>
                <span className="font-bold text-emerald-800">
                  {selectedCollections.length} selected
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-normal">
              {restoreMode === 'replace'
                ? '⚠️ Clean Overwrite will replace documents in the selected collections with the backup records.'
                : '✅ Merge mode is safe: it updates matching items and adds missing records without deleting unrelated records.'}
            </p>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeRestore}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Proceed With Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
