'use client';

import { useState, useEffect } from 'react';
import { Quote, Material } from '@/types/supabase';
import { supabase } from '@/lib/supabase-client';
import toast from 'react-hot-toast';

interface EditQuoteFormProps {
  quote: Quote & { materials: Material };
  onCancel: () => void;
  onUpdate: () => void;
}

export default function EditQuoteForm({ quote, onCancel, onUpdate }: EditQuoteFormProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialId, setMaterialId] = useState(quote.material_id);
  const [area, setArea] = useState(quote.total_area.toString());
  const [clientName, setClientName] = useState(quote.client_name);
  const [clientEmail, setClientEmail] = useState(quote.client_email);
  const [notes, setNotes] = useState(quote.notes || '');
  const [status, setStatus] = useState(quote.status);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('name');

    if (error) {
      toast.error('Error loading materials');
      return;
    }

    setMaterials(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const material = materials.find(m => m.id === materialId);
    if (!material) {
      toast.error('Please select a material');
      return;
    }

    const areaNum = parseFloat(area);
    if (isNaN(areaNum) || areaNum <= 0) {
      toast.error('Please enter a valid area');
      return;
    }

    const totalPrice = areaNum * material.price_per_meter;

    const updates = {
      client_name: clientName,
      client_email: clientEmail,
      material_id: materialId,
      total_area: areaNum,
      total_price: totalPrice,
      status,
      notes,
    };

    const { error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', quote.id);

    if (error) {
      toast.error('Error updating quote');
      return;
    }

    toast.success('Quote updated successfully');
    onUpdate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
        <input
          type="text"
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Correo del Cliente</label>
        <input
          type="email"
          required
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Material</label>
        <select
          required
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.name} - ${material.price_per_meter}/m²
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Área (metros cuadrados)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Estado</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Quote['status'])}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="pending">Pendiente</option>
          <option value="sent">Enviada</option>
          <option value="approved">Aprobada</option>
          <option value="rejected">Rechazada</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notas Adicionales</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Detalles adicionales sobre la cotización..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}