import { useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/lib/upload';

export interface ImageItem {
  id?: string;
  url?: string;
  file?: File;
  path?: string;
  preview?: string;
}

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  max?: number;
}

export function ImageUploader({ images, onChange, max = 5 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const remaining = max - images.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(files).slice(0, remaining);
    const newItems: ImageItem[] = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    onChange([...images, ...newItems]);
  };

  const remove = (index: number) => {
    const item = images[index];
    if (item.preview) URL.revokeObjectURL(item.preview);
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index >= images.length - 1) return;
    const next = [...images];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Imagenes ({images.length}/{max})
      </label>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((item, i) => (
          <div key={item.id || i} className="relative group aspect-square rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
            <img
              src={item.preview || (item.url ? getImageUrl(item.url) : '')}
              alt={`Imagen ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
              <div className="flex flex-col gap-1">
                {i > 0 && (
                  <button type="button" onClick={() => moveUp(i)} className="p-1 bg-white rounded shadow text-xs font-bold text-gray-700 hover:text-primary-600">
                    ↑
                  </button>
                )}
                {i < images.length - 1 && (
                  <button type="button" onClick={() => moveDown(i)} className="p-1 bg-white rounded shadow text-xs font-bold text-gray-700 hover:text-primary-600">
                    ↓
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1.5 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded">
                Principal
              </span>
            )}
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 bg-gray-50 hover:bg-primary-50 transition-colors flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary-500"
          >
            <Upload className="w-5 h-5" />
            <span className="text-[10px] font-medium">Agregar</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {images.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <ImageIcon className="w-4 h-4" />
          Sin imagenes. Selecciona al menos una (PNG, JPG o WebP) y se convertira automaticamente a WebP.
        </div>
      )}
    </div>
  );
}
