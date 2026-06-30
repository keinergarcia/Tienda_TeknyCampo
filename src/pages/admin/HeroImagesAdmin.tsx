import { useState, useEffect, useRef } from 'react';
import { Image, Upload, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { convertToWebP } from '@/lib/upload';

const BUCKET = 'hero-images';

interface HeroImage {
  id: string;
  url: string;
  created_at: string;
}

function getImageUrl(path: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function HeroImagesAdmin() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('hero_images').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setImages(data);
      setLoading(false);
    });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const webpBlob = await convertToWebP(file);
      const fileName = `hero_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, webpBlob, { contentType: 'image/webp', cacheControl: '31536000' });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('hero_images')
        .insert({ url: fileName });

      if (dbError) throw dbError;

      const { data } = await supabase
        .from('hero_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) setImages((prev) => [data, ...prev]);
    } catch (err) {
      console.error('Error al subir imagen:', err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, url: string) => {
    try {
      await supabase.storage.from(BUCKET).remove([url]);
      await supabase.from('hero_images').delete().eq('id', id);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error('Error al eliminar imagen:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Imagenes del Banner Principal</h2>

      <div className="mb-6">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          id="hero-image-upload"
        />
        <label
          htmlFor="hero-image-upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? 'Subiendo...' : 'Agregar Imagen'}
        </label>
        <p className="text-sm text-gray-500 mt-2">Se recomienda 1920x800px max. Se convierte a WebP automaticamente.</p>
      </div>

      {images.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay imagenes de banner. Agrega una para personalizar la pagina principal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="group bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="aspect-[12/5] bg-gray-100 relative">
                <img
                  src={getImageUrl(img.url)}
                  alt="Hero banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <button
                  onClick={() => handleDelete(img.id, img.url)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  aria-label="Eliminar imagen"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
                {images.indexOf(img) === 0 && (
                  <span className="absolute bottom-3 left-3 px-2 py-1 bg-primary-600 text-white text-xs font-bold rounded-md">
                    Activa
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
