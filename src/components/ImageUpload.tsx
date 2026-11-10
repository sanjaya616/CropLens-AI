import React, { useRef, useState } from 'react';
import { Upload, X, AlertCircle, Info, Image } from 'lucide-react';
import { validateImageFile } from '../utils/validation';

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
}

interface ImageUploadProps {
  files: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  onOpenGuide: () => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  files,
  onChange,
  onOpenGuide,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFiles = (incomingFiles: FileList | File[]) => {
    setValidationError(null);
    const newFileList = Array.from(incomingFiles);

    if (files.length + newFileList.length > 3) {
      setValidationError('Maximum 3 tea leaf photographs allowed per assessment.');
      return;
    }

    const validItems: UploadedFileItem[] = [];

    for (const file of newFileList) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid image file.');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      validItems.push({
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        name: file.name,
        size: file.size,
        previewUrl,
      });
    }

    onChange([...files, ...validItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (id: string) => {
    const target = files.find((i) => i.id === id);
    if (target?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(target.previewUrl);
    }
    onChange(files.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    files.forEach((i) => {
      if (i.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(i.previewUrl);
      }
    });
    onChange([]);
    setValidationError(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
          dragOver
            ? 'border-emerald-600 bg-emerald-50/50'
            : 'border-stone-300 hover:border-emerald-500 bg-stone-50/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold text-stone-900">
              Upload Real Tea Leaf Photograph(s)
            </div>
            <p className="text-xs text-stone-600">
              Drag and drop tea leaf photos here, or <span className="text-emerald-700 font-semibold underline">browse files</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-stone-500">
            <span>1 to 3 photographs</span>
            <span aria-hidden="true">·</span>
            <span>JPG, PNG, or WebP</span>
            <span aria-hidden="true">·</span>
            <span>Max 5 MB each</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenGuide();
            }}
            className="text-xs text-emerald-800 hover:text-emerald-950 underline font-medium flex items-center gap-1 pt-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>View Leaf Photography Guide</span>
          </button>
        </div>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Selected Images Previews */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span>Selected Photographs ({files.length} of 3)</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {files.map((item, idx) => (
              <div
                key={item.id}
                className="relative group rounded-xl overflow-hidden border border-stone-200 bg-white shadow-xs"
              >
                <div className="aspect-4/3 w-full bg-stone-100 relative">
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-2.5 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <div className="font-medium text-stone-800 truncate">{item.name}</div>
                    <div className="text-[10px] text-stone-500">{(item.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-1 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                    aria-label={`Remove photo ${idx + 1}`}
                  >
                    <X className="w-4 h-4" />
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
