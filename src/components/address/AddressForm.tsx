import { useState, type ReactNode } from 'react';
import { Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Address } from '@/types';

interface AddressFormProps {
  address?: Address;
  onSave: () => void;
  onCancel: () => void;
}

export function AddressForm({ address, onSave, onCancel }: AddressFormProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: address?.first_name || '',
    last_name: address?.last_name || '',
    phone: address?.phone || '',
    address: address?.address || '',
    neighborhood: address?.neighborhood || '',
    postal_code: address?.postal_code || '',
    city: address?.city || '',
    department: address?.department || '',
    notes: address?.notes || '',
    is_default: address?.is_default || false,
  });

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const payload = { ...form, user_id: user.id };

    if (address) {
      await supabase.from('addresses').update(payload).eq('id', address.id);
    } else {
      await supabase.from('addresses').insert(payload);
    }

    setSaving(false);
    onSave();
  };

  const inputClass = 'input-field text-sm';
  const labelClass = 'block text-xs font-medium text-gray-700 mb-1';
  const groupClass = 'flex-1';

  const Field = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">
          {address ? 'Editar Direccion' : 'Nueva Direccion'}
        </h3>
        <button type="button" onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className={groupClass}>
            <Field label="Nombres">
              <input value={form.first_name} onChange={(e) => update('first_name', e.target.value)} className={inputClass} placeholder="Primer y segundo nombre" required />
            </Field>
          </div>
          <div className={groupClass}>
            <Field label="Apellidos">
              <input value={form.last_name} onChange={(e) => update('last_name', e.target.value)} className={inputClass} placeholder="Ambos apellidos" required />
            </Field>
          </div>
        </div>

        <div className="flex gap-4">
          <div className={groupClass}>
            <Field label="Telefono / Celular">
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} placeholder="10 digitos" pattern="[0-9]{10}" maxLength={10} required />
            </Field>
          </div>
          <div className={groupClass}>
            <Field label="Codigo Postal">
              <input value={form.postal_code} onChange={(e) => update('postal_code', e.target.value)} className={inputClass} placeholder="000000" pattern="[0-9]{6}" maxLength={6} required />
            </Field>
          </div>
        </div>

        <Field label="Direccion / Nomenclatura">
          <input value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} placeholder="Calle, carrera, numero de casa o apartamento" required />
        </Field>

        <div className="flex gap-4">
          <div className={groupClass}>
            <Field label="Barrio / Sector">
              <input value={form.neighborhood} onChange={(e) => update('neighborhood', e.target.value)} className={inputClass} placeholder="Nombre del barrio" required />
            </Field>
          </div>
          <div className={groupClass}>
            <Field label="Ciudad / Municipio">
              <input value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} placeholder="Municipio principal" required />
            </Field>
          </div>
        </div>

        <Field label="Departamento">
          <input value={form.department} onChange={(e) => update('department', e.target.value)} className={inputClass} placeholder="Estado o region" required />
        </Field>

        <Field label="Indicaciones / Notas">
          <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Ej. Torre 3 Apto 402 (opcional)" />
        </Field>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.is_default} onChange={(e) => update('is_default', e.target.checked)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          Establecer como direccion predeterminada
        </label>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">Cancelar</button>
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Direccion'}
        </button>
      </div>
    </form>
  );
}
