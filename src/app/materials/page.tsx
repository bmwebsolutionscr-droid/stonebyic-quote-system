'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Material } from '@/types/supabase';
import { PlusIcon } from '@heroicons/react/24/outline';
import AddMaterialForm from '@/components/AddMaterialForm';
import MaterialCard from '@/components/MaterialCard';
import toast from 'react-hot-toast';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error loading materials');
      return;
    }

    setMaterials(data || []);
  };

  const handleAddMaterial = async (newMaterial: Omit<Material, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('materials')
      .insert([newMaterial])
      .select()
      .single();

    if (error) {
      toast.error('Error adding material');
      return;
    }

    toast.success('Material added successfully');
    setMaterials([data, ...materials]);
    setIsAddingMaterial(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Materials</h1>
        <button onClick={() => setIsAddingMaterial(true)} style={{ background: 'var(--accent)', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }} className="">
          <PlusIcon className="h-5 w-5" />
          Add Material
        </button>
      </div>

      {isAddingMaterial && (
        <div className="card">
          <AddMaterialForm
            onSubmit={handleAddMaterial}
            onCancel={() => setIsAddingMaterial(false)}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
        {materials.map((material) => (
          <div key={material.id} className="card">
            <MaterialCard
              material={material}
              onUpdate={fetchMaterials}
            />
          </div>
        ))}
      </div>
    </div>
  );
}