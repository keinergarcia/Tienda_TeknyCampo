import { useState, useEffect, useRef } from 'react';
import { Plus, Edit3, Trash2, Layers, Save, X, Upload, ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImage, deleteImage, getImageUrl } from '@/lib/upload';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Category } from '@/types';

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  display_order: string;
}

const emptyForm: CategoryForm = { name: '', slug: '', description: '', display_order: '0' };

export function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetch = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    setRemoveExistingImage(false);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      display_order: cat.display_order.toString(),
    });
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(cat.image_url);
    setRemoveExistingImage(false);
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let image_url = existingImageUrl;

    if (removeExistingImage) {
      if (existingImageUrl) {
        try {
          const path = existingImageUrl.replace(/.*product-images\//, '');
          await deleteImage(path);
        } catch { /* file may not exist */ }
      }
      image_url = null;
    } else if (imageFile) {
      if (existingImageUrl) {
        try {
          const path = existingImageUrl.replace(/.*product-images\//, '');
          await deleteImage(path);
        } catch { /* file may not exist */ }
      }
      const storagePath = await uploadImage(imageFile, 'categories');
      image_url = getImageUrl(storagePath);
    }

    const payload = {
      name: form.name,
      slug,
      description: form.description || null,
      image_url,
      display_order: parseInt(form.display_order) || 0,
    };

    if (editingId) {
      await supabase.from('categories').update(payload).eq('id', editingId);
    } else {
      await supabase.from('categories').insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setLoading(true);
    await fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta categoria? Los productos asociados quedaran sin categoria.')) return;

    const { data: cat } = await supabase.from('categories').select('image_url').eq('id', id).single();
    if (cat?.image_url) {
      try {
        const path = cat.image_url.replace(/.*product-images\//, '');
        await deleteImage(path);
      } catch { /* file may not exist */ }
    }

    await supabase.from('categories').delete().eq('id', id);
    setCategories(categories.filter((c) => c.id !== id));
  };

  if (loading) return <LoadingSpinner text="Cargando categorias..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl text-gray-900">Categorias</h2>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoria
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-lg mb-6">{editingId ? 'Editar Categoria' : 'Nueva Categoria'}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="Auto-generado" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                <div className="flex items-start gap-4">
                  {(removeExistingImage ? null : imagePreview || existingImageUrl) ? (
                    <div className="relative w-24 h-24 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 group">
                      <img
                        src={imagePreview || existingImageUrl || ''}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {removeExistingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Eliminada</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => { inputRef.current?.click(); }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {existingImageUrl && !imagePreview && !removeExistingImage ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                    </button>
                    {existingImageUrl && !imagePreview && !removeExistingImage && (
                      <button
                        type="button"
                        onClick={() => setRemoveExistingImage(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Imagen
                      </button>
                    )}
                    {removeExistingImage && (
                      <button
                        type="button"
                        onClick={() => setRemoveExistingImage(false)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Restaurar Imagen
                      </button>
                    )}
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                        setRemoveExistingImage(false);
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG o WebP. Se convertira a WebP automaticamente.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className="input-field" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary text-sm">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nombre</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Slug</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Descripcion</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Orden</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{c.description || '-'}</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">{c.display_order}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <Layers className="w-8 h-8 mx-auto mb-2" />
                  No hay categorias
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
