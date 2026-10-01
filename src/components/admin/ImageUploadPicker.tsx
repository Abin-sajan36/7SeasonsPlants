import React, { useState, useRef } from 'react';
import { Upload, Plus, Trash2, Star, Link, Image as ImageIcon, Check, AlertCircle, Loader2, Zap } from 'lucide-react';
import { uploadImage, uploadImageWithStats, compressImageFile, formatBytes, ImageCompressionStats } from '../../lib/imageUploader';

export { compressImageFile };

interface ImageUploadPickerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helpText?: string;
  allowSingle?: boolean;
  namePrefix?: string;
  showCompressionNotice?: boolean;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  images = [],
  onChange,
  maxImages = 8,
  label = 'Product / Combo Images',
  helpText = 'Upload photos from your computer/device or paste image URLs.',
  allowSingle = false,
  namePrefix = 'plant-photo',
  showCompressionNotice = true,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('Processing image files...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [compressionNotice, setCompressionNotice] = useState<string | null>(null);
  const [statsMap, setStatsMap] = useState<Record<string, ImageCompressionStats>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (!allowSingle && images.length >= maxImages) {
      setErrorMsg(`Photo limit reached: Maximum ${maxImages} photos allowed per combo/product. Please remove an existing photo first to add another.`);
      return;
    }

    setIsProcessing(true);
    setProcessingStatus(`Auto-compressing ${files.length} photo(s) in real time...`);
    setErrorMsg(null);
    setCompressionNotice(null);

    try {
      const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
      if (validFiles.length === 0) {
        setErrorMsg('Please select valid image files (JPG, PNG, WEBP, etc.)');
        setIsProcessing(false);
        return;
      }

      const availableSlots = allowSingle ? 1 : Math.max(0, maxImages - images.length);
      if (availableSlots <= 0) {
        setErrorMsg(`Photo limit reached: Maximum ${maxImages} photos allowed.`);
        setIsProcessing(false);
        return;
      }

      let filesToProcess = validFiles;
      let skippedCount = 0;
      if (validFiles.length > availableSlots) {
        filesToProcess = validFiles.slice(0, availableSlots);
        skippedCount = validFiles.length - availableSlots;
      }

      const newStats: Record<string, ImageCompressionStats> = {};
      let totalOriginalBytes = 0;
      let totalCompressedBytes = 0;

      const newImagePromises = filesToProcess.map(async (file, idx) => {
        setProcessingStatus(`Auto-compressing photo ${idx + 1} of ${filesToProcess.length}...`);
        const result = await uploadImageWithStats(file, `${namePrefix}-${idx + 1}`);
        if (result.stats && result.url) {
          newStats[result.url] = result.stats;
          totalOriginalBytes += result.stats.originalSize;
          totalCompressedBytes += result.stats.compressedSize;
        }
        return result.url;
      });

      const processedUrls = await Promise.all(newImagePromises);
      const validUrls = processedUrls.filter(Boolean);

      setStatsMap((prev) => ({ ...prev, ...newStats }));

      if (allowSingle) {
        onChange([validUrls[0]]);
      } else {
        onChange([...images, ...validUrls]);
      }

      // Display compression celebration summary
      if (totalOriginalBytes > 0 && totalCompressedBytes > 0) {
        const totalSavedPercent = Math.max(
          0,
          Math.round(((totalOriginalBytes - totalCompressedBytes) / totalOriginalBytes) * 100)
        );
        setCompressionNotice(
          `⚡ Auto-compressed ${validUrls.length} photo(s): ${formatBytes(totalOriginalBytes)} → ${formatBytes(totalCompressedBytes)} (${totalSavedPercent}% size reduction)! Fast loading enabled.`
        );
      }

      if (skippedCount > 0) {
        setErrorMsg(`Added ${validUrls.length} photo(s). ${skippedCount} photo(s) were omitted because the limit is ${maxImages} photos.`);
      }
    } catch (err) {
      console.error('Failed to process uploaded images:', err);
      setErrorMsg('Failed to process image file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = urlInput.trim();
    if (!clean) return;

    if (!allowSingle && images.length >= maxImages) {
      setErrorMsg(`Photo limit reached: Maximum ${maxImages} photos allowed. Remove a photo to add a new URL.`);
      return;
    }

    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:image/') && !clean.startsWith('/uploads/')) {
      setErrorMsg('Please enter a valid URL starting with http:// or https://');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStatus('Validating and optimizing image URL...');
      const result = await uploadImageWithStats(clean, `${namePrefix}-pasted`);
      const hostedUrl = result.url;
      if (result.stats) {
        setStatsMap((prev) => ({ ...prev, [hostedUrl]: result.stats! }));
        setCompressionNotice(
          `⚡ Optimized image: ${formatBytes(result.stats.originalSize)} → ${formatBytes(result.stats.compressedSize)} (${result.stats.savingsPercent}% saved).`
        );
      }
      if (allowSingle) {
        onChange([hostedUrl]);
      } else {
        onChange([...images, hostedUrl]);
      }
      setUrlInput('');
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg('Failed to add image URL.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  const isLimitReached = !allowSingle && images.length >= maxImages;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-bold text-[#4A3E31] text-xs block">{label}</label>
        {isLimitReached ? (
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <Check className="w-3 h-3 text-amber-700" />
            Photo Limit Reached: {images.length}/{maxImages}
          </span>
        ) : (
          <span className="text-[11px] text-[#736758] font-semibold bg-[#FAF9F6] border border-[#4A3E31]/15 px-2.5 py-0.5 rounded-full shadow-2xs">
            {images.length} / {maxImages} uploaded {maxImages - images.length > 0 && `(${maxImages - images.length} slots left)`}
          </span>
        )}
      </div>

      {helpText && <p className="text-[11px] text-[#736758]">{helpText}</p>}

      {/* Auto-Compression Status Tag */}
      {showCompressionNotice && (
        <div className="flex items-center justify-between py-1.5 px-3 bg-emerald-50/80 border border-emerald-200/70 rounded-xl text-emerald-900 text-[11px]">
          <span className="flex items-center gap-1.5 font-semibold">
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/30" />
            <span>Automatic Compression: <strong>Active</strong> (Photos auto-compressed & resized on upload)</span>
          </span>
          <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
            1080px Web Optimized
          </span>
        </div>
      )}

      {/* Compression Results Banner */}
      {compressionNotice && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between gap-2 shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 shrink-0 text-emerald-600 fill-emerald-600/40" />
            <span className="font-medium">{compressionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setCompressionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer ml-auto"
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Box & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isLimitReached && !isProcessing) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (isLimitReached) {
            setErrorMsg(`Photo limit reached: You can add at most ${maxImages} photos.`);
            return;
          }
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
          isLimitReached
            ? 'border-amber-200 bg-amber-50/40 cursor-not-allowed opacity-90'
            : isDragging
            ? 'border-[#7D8F69] bg-[#EBF0E6]/80'
            : 'border-[#4A3E31]/20 bg-[#FAF9F6] hover:bg-[#EAE6DB]/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={!allowSingle}
          className="hidden"
          disabled={isLimitReached || isProcessing}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isLimitReached ? (
          <div className="flex flex-col items-center justify-center gap-2 py-1">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shadow-2xs">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#4A3E31]">
                Maximum Photo Limit Reached ({maxImages} / {maxImages})
              </p>
              <p className="text-[11px] text-[#736758] mt-0.5 max-w-md mx-auto">
                Maximum limit of {maxImages} photos reached. To upload another photo, remove one from the gallery below.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-11 h-11 rounded-full bg-[#EBF0E6] flex items-center justify-center text-[#7D8F69] shadow-2xs">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin text-[#7D8F69]" /> : <Upload className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-bold text-[#4A3E31]">
                {isProcessing ? processingStatus : 'Drag & drop photos here, or browse files'}
              </p>
              <p className="text-[10px] text-[#736758] mt-0.5">
                Supports camera & mobile photos (JPEG, PNG, WEBP) • Auto-compressed on upload
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || isLimitReached}
              className="mt-1 px-4 py-1.5 bg-[#7D8F69] hover:bg-[#627252] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Compressing & Uploading...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Select Photos from Device</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* URL Input Option */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link className="w-3.5 h-3.5 text-[#736758] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={isLimitReached || isProcessing}
            placeholder={
              isLimitReached
                ? `Photo limit of ${maxImages} reached. Remove a photo to add a new URL.`
                : 'Or paste an image web link (https://...)'
            }
            className="w-full pl-8.5 pr-3 py-2 bg-[#EAE6DB]/40 text-[#4A3E31] text-xs font-semibold rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || isLimitReached || isProcessing}
          className="px-4 py-2 bg-[#FAF9F6] text-[#4A3E31] hover:bg-[#EAE6DB] border border-[#4A3E31]/20 rounded-full text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {isProcessing ? 'Optimizing...' : 'Add URL'}
        </button>
      </div>

      {/* Gallery Grid Preview */}
      {images.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#4A3E31] block">
              Selected Images ({images.length}) - Tap star to set Primary Cover:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => {
              const stats = statsMap[img];
              return (
                <div
                  key={idx}
                  className={`relative group rounded-2xl overflow-hidden border-2 bg-white aspect-square flex items-center justify-center transition-all ${
                    idx === 0
                      ? 'border-[#7D8F69] ring-2 ring-[#7D8F69]/30 shadow-xs'
                      : 'border-[#4A3E31]/15 hover:border-[#7D8F69]/60'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Cover Badge */}
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-[#7D8F69] text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 z-10">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Cover
                    </span>
                  )}

                  {/* Compression Stats Badge */}
                  {stats && (
                    <span
                      title={`Original: ${formatBytes(stats.originalSize)} → Compressed: ${formatBytes(stats.compressedSize)} (${stats.savingsPercent}% smaller)`}
                      className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 z-10"
                    >
                      <Zap className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
                      <span>{stats.savingsPercent > 0 ? `-${stats.savingsPercent}%` : 'Optimized'}</span>
                    </span>
                  )}

                  {/* Overlay Action Buttons */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 z-20">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        title="Set as Main Cover Photo"
                        className="p-1.5 bg-white text-[#7D8F69] hover:bg-[#EBF0E6] rounded-full shadow-md transition-all cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove Image"
                      className="p-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-full shadow-md transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
