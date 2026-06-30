import { useState, useEffect, useRef } from 'react';
import { Plus, Edit3, Trash2, Package, X, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImage, deleteImage } from '@/lib/upload';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ImageUploader, type ImageItem } from '@/components/admin/ImageUploader';
import type { Product, Category, ProductImage } from '@/types';

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  original_price: string;
  category_id: string;
  stock: string;
  is_featured: boolean;
  is_offer: boolean;
}

const emptyForm: ProductForm = {
  name: '', slug: '', description: '', price: '', original_price: '',
  category_id: '', stock: '0', is_featured: false, is_offer: false,
};

export function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const imageItemsRef = useRef(imageItems);
  imageItemsRef.current = imageItems;

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    if (data) setCategories(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setImageItems([]);
    setDeletedImageIds([]);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = async (product: Product) => {
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category_id: product.category_id || '',
      stock: product.stock.toString(),
      is_featured: product.is_featured,
      is_offer: product.is_offer,
    });

    const { data: existingImages } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('display_order');

    setImageItems(
      (existingImages || []).map((img: ProductImage) => ({
        id: img.id,
        url: img.url,
      }))
    );
    setDeletedImageIds([]);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const payload = {
      name: form.name,
      slug,
      description: form.description || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category_id: form.category_id || null,
      stock: parseInt(form.stock) || 0,
      is_featured: form.is_featured,
      is_offer: form.is_offer,
    };

    let productId = editingId;

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId);
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select('id').single();
      if (error) throw error;
      productId = data.id;
    }

    // Delete removed existing images
    if (deletedImageIds.length > 0) {
      const toDelete = await supabase
        .from('product_images')
        .select('url')
        .in('id', deletedImageIds);

      for (const img of toDelete.data || []) {
        try { await deleteImage(img.url); } catch { /* file may not exist in storage */ }
      }
      await supabase.from('product_images').delete().in('id', deletedImageIds);
    }

    // Upload new images and save all image records
    const storageFolder = `products/${productId}`;
    const imageRecords: { product_id: string; url: string; display_order: number }[] = [];

    for (let i = 0; i < imageItems.length; i++) {
      const item = imageItems[i];
      if (item.id) {
        // Existing image - update order
        imageRecords.push({ product_id: productId!, url: item.url!, display_order: i });
      } else if (item.file) {
        // New file - upload
        const path = await uploadImage(item.file, storageFolder);
        imageRecords.push({ product_id: productId!, url: path, display_order: i });
      }
    }

    // Replace all image records
    if (editingId) {
      await supabase.from('product_images').delete().eq('product_id', productId!);
    }
    if (imageRecords.length > 0) {
      await supabase.from('product_images').insert(imageRecords);
    }

    // Update product.image_url to first image
    const firstUrl = imageRecords.length > 0
      ? (await supabase.storage.from('product-images').getPublicUrl(imageRecords[0].url)).data.publicUrl
      : null;
    await supabase.from('products').update({ image_url: firstUrl }).eq('id', productId!);

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setLoading(true);
    await fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este producto? Tambien se eliminaran sus imagenes.')) return;

    const { data: images } = await supabase.from('product_images').select('url').eq('product_id', id);
    for (const img of images || []) {
      try { await deleteImage(img.url); } catch { /* file may not exist in storage */ }
    }
    await supabase.from('product_images').delete().eq('product_id', id);
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter((p) => p.id !== id));
  };

  if (loading) return <LoadingSpinner text="Cargando productos..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl text-gray-900">Productos</h2>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-lg mb-6">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="Auto-generado si se deja vacio" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
                  <option value="">Sin categoria</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Original ($)</label>
                <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="input-field" placeholder="Para mostrar descuento" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
              </div>
              <div className="col-span-2">
                <ImageUploader
                  images={imageItems}
                  onChange={(items) => {
                    const prev = imageItemsRef.current;
                    const removedExisting = prev
                      .filter((old) => old.id && !items.find((n) => n.id === old.id))
                      .map((old) => old.id!);
                    if (removedExisting.length > 0) {
                      setDeletedImageIds((prev) => [...prev, ...removedExisting]);
                    }
                    setImageItems(items);
                  }}
                  max={5}
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded" />
                  <span className="text-sm font-medium text-gray-700">Destacado</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_offer} onChange={(e) => setForm({ ...form, is_offer: e.target.checked })} className="rounded" />
                  <span className="text-sm font-medium text-gray-700">Oferta</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.price} className="btn-primary text-sm">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay productos. Crea el primero.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Producto</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Categoria</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Precio</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Estado</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.category?.name || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold">${p.price.toLocaleString('es-ES')}</span>
                    {p.original_price && <span className="text-xs text-gray-400 line-through ml-1">${p.original_price.toLocaleString('es-ES')}</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1">
                      {p.is_featured && <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">Dest</span>}
                      {p.is_offer && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Oferta</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="Editar">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
