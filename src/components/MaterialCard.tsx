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

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', material.id);

    if (error) {
      toast.error('Error deleting material');
      return;
    }

    toast.success('Material deleted successfully');
    onUpdate();
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
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <PencilIcon className="h-5 w-5 text-gray-500" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <TrashIcon className="h-5 w-5 text-red-500" />
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