import { supabase } from './supabase';

const BUCKET = 'product-images';

export function getImageUrl(path: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function convertToWebP(file: File): Promise<Blob> {
  if (file.type === 'image/webp') return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('WebP conversion failed'));
      }, 'image/webp', 0.8);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadImage(
  file: File,
  folder: string
): Promise<string> {
  const webpBlob = await convertToWebP(file);
  const ext = 'webp';
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, webpBlob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) throw error;
  return filePath;
}

export async function deleteImage(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
