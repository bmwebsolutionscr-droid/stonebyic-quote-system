'use client';

import { useState } from 'react';
import { Material } from '@/types/supabase';
import { supabase } from '@/lib/supabase-client';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface MaterialCardProps {
  material: Material;
  onUpdate: () => void;
}

export default function MaterialCard({ material, onUpdate }: MaterialCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(material.name);
  const [description, setDescription] = useState(material.description);
  const [pricePerMeter, setPricePerMeter] = useState(material.price_per_meter.toString());
  const [imageUrl, setImageUrl] = useState(material.image_url);

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('materials')
      .update({
        name,
        description,
        price_per_meter: parseFloat(pricePerMeter),
        image_url: imageUrl,
      })
      .eq('id', material.id);

    if (error) {
      toast.error('Error updating material');
      return;
    }

    toast.success('Material updated successfully');
    setIsEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }
    if (!material?.id) {
      console.error('Missing material id, cannot delete', material);
      toast.error('Cannot delete: missing material id');
      return;
    }

    // Check for related quotes that reference this material
    try {
      const relatedResp = await supabase
        .from('quotes')
        .select('id', { count: 'exact' })
        .eq('material_id', material.id);

      console.log('Related quotes check response:', relatedResp);

      // Normalize count: supabase-js may return count separately or undefined
      // relatedResp = { data, error, count }
      const anyRelated: any = relatedResp;
      if (anyRelated.error) {
        console.error('Error checking related quotes:', anyRelated.error);
        toast.error('Error checking related quotes');
        return;
      }

      const relatedCount = typeof anyRelated.count === 'number' ? anyRelated.count : (anyRelated.data?.length ?? 0);
      if (relatedCount > 0) {
        console.warn(`Blocked delete: ${relatedCount} quote(s) reference this material`);
        toast.error(`No se puede eliminar: ${relatedCount} cotización(es) usan este material. Elimine o reasigne esas cotizaciones primero.`);
        return;
      }
    } catch (err) {
      console.error('Unhandled exception checking related quotes:', err);
      toast.error('Error checking related quotes');
      return;
    }

    // If no related quotes, proceed with delete
    try {
      const response = await supabase
        .from('materials')
        .delete()
        .eq('id', material.id)
        .select();

      console.log('Supabase delete response:', response);

      const anyResp: any = response;
      if (anyResp.error) {
        console.error('Error deleting material:', anyResp.error);
        toast.error(`Error deleting material: ${anyResp.error.message || JSON.stringify(anyResp.error)}`);
        return;
      }

      if (anyResp.status && anyResp.status >= 400) {
        console.error('Delete returned status', anyResp.status, anyResp);
        toast.error(`Delete failed: status ${anyResp.status}`);
        return;
      }

      toast.success('Material deleted successfully');
      onUpdate();
    } catch (err) {
      console.error('Unhandled exception deleting material:', err);
      toast.error('Error deleting material');
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price per Square Meter ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={pricePerMeter}
              onChange={(e) => setPricePerMeter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {imageUrl && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{name}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Edit material"
            >
              <PencilIcon className="h-5 w-5 text-blue-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-full hover:bg-red-50 transition-colors"
              title="Delete material"
            >
              <TrashIcon className="h-5 w-5 text-red-600" />
            </button>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xl font-semibold text-gray-900">
            ${material.price_per_meter.toFixed(2)}/m²
          </p>
        </div>
      </div>
    </div>
  );
}