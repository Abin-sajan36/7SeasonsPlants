import React, { useState, useRef } from 'react';
import { Upload, Plus, Trash2, Star, Link, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';

interface ImageUploadPickerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helpText?: string;
  allowSingle?: boolean;
}

export const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        // Fill white background for transparent pngs converted to jpeg
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  images = [],
  onChange,
  maxImages = 8,
  label = 'Product / Combo Images',
  helpText = 'Upload photos from your computer/device or paste image URLs.',
  allowSingle = false,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const newImagePromises: Promise<string>[] = [];
      const countToProcess = Math.min(files.length, maxImages - images.length);

      for (let i = 0; i < countToProcess; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          newImagePromises.push(compressImageFile(file));
        }
      }

      if (newImagePromises.length === 0) {
        setErrorMsg('Please select valid image files (JPG, PNG, WEBP, etc.)');
        setIsProcessing(false);
        return;
      }

      const processedDataUrls = await Promise.all(newImagePromises);
      if (allowSingle) {
        onChange([processedDataUrls[0]]);
      } else {
        onChange([...images, ...processedDataUrls]);
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

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = urlInput.trim();
    if (!clean) return;

    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:image/')) {
      setErrorMsg('Please enter a valid URL starting with http:// or https://');
      return;
    }

    if (allowSingle) {
      onChange([clean]);
    } else {
      onChange([...images, clean]);
    }
    setUrlInput('');
    setErrorMsg(null);
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-bold text-[#4A3E31] text-xs block">{label}</label>
        <span className="text-[11px] text-[#736758] font-medium">
          {images.length} / {maxImages} uploaded
        </span>
      </div>

      {helpText && <p className="text-[11px] text-[#736758]">{helpText}</p>}

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
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
          isDragging
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
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-11 h-11 rounded-full bg-[#EBF0E6] flex items-center justify-center text-[#7D8F69] shadow-2xs">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#4A3E31]">
              {isProcessing ? 'Processing image files...' : 'Drag & drop photos here, or browse files'}
            </p>
            <p className="text-[10px] text-[#736758] mt-0.5">
              Supports JPEG, PNG, WEBP from your computer, phone, or camera
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || images.length >= maxImages}
            className="mt-1 px-4 py-1.5 bg-[#7D8F69] hover:bg-[#627252] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Select Photos from Device</span>
          </button>
        </div>
      </div>

      {/* URL Input Option */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link className="w-3.5 h-3.5 text-[#736758] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste an image web link (https://...)"
            className="w-full pl-8.5 pr-3 py-2 bg-[#EAE6DB]/40 text-[#4A3E31] text-xs font-semibold rounded-full border border-[#4A3E31]/15 focus:bg-white outline-hidden"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || images.length >= maxImages}
          className="px-4 py-2 bg-[#FAF9F6] text-[#4A3E31] hover:bg-[#EAE6DB] border border-[#4A3E31]/20 rounded-full text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 shrink-0"
        >
          Add URL
        </button>
      </div>

      {/* Gallery Grid Preview */}
      {images.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-[#4A3E31] block">
            Selected Images ({images.length}) - Tap star to set Primary Cover:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
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
                  <span className="absolute top-2 left-2 bg-[#7D8F69] text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    Cover
                  </span>
                )}

                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
