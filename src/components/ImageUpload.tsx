import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Camera, AlertCircle, Sparkles, Check, Info } from 'lucide-react';
import { validateImageFile } from '../utils/validation';
import { DATASET_EVALUATION_SAMPLES } from '../constants/conditions';
import { DatasetSample } from '../types';

export interface UploadedImageItem {
  id: string;
  file?: File;
  name: string;
  size: number;
  mimeType: string;
  base64Data: string;
  previewUrl: string;
  isSample?: boolean;
}

interface ImageUploadProps {
  images: UploadedImageItem[];
  onChange: (images: UploadedImageItem[]) => void;
  onOpenGuide: () => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  onOpenGuide,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFiles = async (fileList: FileList | File[]) => {
    setValidationError(null);
    const files = Array.from(fileList);

    if (images.length + files.length > 3) {
      setValidationError('Maximum 3 tea leaf photographs allowed per assessment.');
      return;
    }

    const newItems: UploadedImageItem[] = [];

    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid image file.');
        return;
      }

      try {
        const base64Data = await readFileAsBase64(file);
        const previewUrl = URL.createObjectURL(file);
        newItems.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          file,
          name: file.name,
          size: file.size,
          mimeType: file.type || 'image/jpeg',
          base64Data,
          previewUrl,
        });
      } catch (err) {
        console.error('Failed to read image:', err);
        setValidationError('Failed to read image data.');
      }
    }

    onChange([...images, ...newItems]);
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
    const target = images.find((i) => i.id === id);
    if (target?.previewUrl && target.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(target.previewUrl);
    }
    onChange(images.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    images.forEach((i) => {
      if (i.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(i.previewUrl);
      }
    });
    onChange([]);
    setValidationError(null);
  };

  // Pre-load an evaluation dataset sample photograph for instant 1-click test
  const handleSelectSample = async (sample: DatasetSample) => {
    setValidationError(null);
    if (images.length >= 3) {
      setValidationError('Maximum 3 photographs allowed. Remove one to add this sample.');
      return;
    }

    try {
      // Fetch the sample image and convert to base64
      const response = await fetch(sample.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const fullDataUrl = reader.result as string;
        const base64Data = fullDataUrl.split(',')[1];
        const newItem: UploadedImageItem = {
          id: `smp-${Date.now()}-${sample.id}`,
          name: `${sample.groundTruthLabel.toLowerCase()}_sample.jpg`,
          size: blob.size,
          mimeType: blob.type || 'image/jpeg',
          base64Data,
          previewUrl: sample.imageUrl,
          isSample: true,
        };
        onChange([...images, newItem]);
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn('Failed to fetch evaluation sample image:', err);
      // Fallback
      setValidationError('Could not load sample image remotely. Please choose local file.');
    }
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
              Upload Tea Leaf Photograph
            </div>
            <p className="text-xs text-stone-700">
              Drag and drop photograph here, or <span className="text-emerald-700 font-medium">browse files</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-stone-700">
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
            className="text-xs text-emerald-800 hover:text-emerald-950 underline font-medium flex items-center gap-1 pt-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Read Leaf Photography Guide</span>
          </button>
        </div>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Selected Images Previews */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span>Attached Photographs ({images.length} / 3)</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="relative group rounded-xl overflow-hidden border border-stone-200 bg-white shadow-xs"
              >
                <div className="aspect-4/3 w-full bg-stone-100 relative">
                  <img
                    src={img.previewUrl}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  {img.isSample && (
                    <span className="absolute bottom-2 left-2 bg-stone-900/80 text-white text-[10px] px-2 py-0.5 rounded font-medium backdrop-blur-xs">
                      Dataset Sample
                    </span>
                  )}
                </div>

                <div className="p-2.5 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <div className="font-medium text-stone-800 truncate">{img.name}</div>
                    <div className="text-[10px] text-stone-500">{(img.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(img.id)}
                    className="p-1 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    aria-label={`Remove image ${idx + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instant Dataset Evaluation Test Samples */}
      <div className="pt-2 border-t border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Quick Test: Evaluation Dataset Samples (Mendeley SL Tea Leaf v5)</span>
          </div>
          <span className="text-[11px] text-stone-500">Click to attach</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {DATASET_EVALUATION_SAMPLES.map((sample) => {
            const isAttached = images.some((i) => i.name.includes(sample.groundTruthLabel.toLowerCase()));
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                disabled={disabled || images.length >= 3}
                className={`text-left p-2 rounded-xl border transition-all flex flex-col justify-between ${
                  isAttached
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-stone-200 hover:border-emerald-400 bg-white'
                } ${images.length >= 3 && !isAttached ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-stone-100 mb-1.5 relative">
                  <img
                    src={sample.imageUrl}
                    alt={sample.commonName}
                    className="w-full h-full object-cover"
                  />
                  {isAttached && (
                    <div className="absolute top-1 right-1 bg-emerald-700 text-white rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-stone-900 line-clamp-1">
                    {sample.commonName.split('(')[0]}
                  </div>
                  <div className="text-[10px] text-stone-500 capitalize">{sample.category}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
