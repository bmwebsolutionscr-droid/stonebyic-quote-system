'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Material, Quote } from '@/types/supabase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDF from '@/components/QuotePDF';
import toast from 'react-hot-toast';

export default function NewQuotePage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [area, setArea] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [quote, setQuote] = useState<Quote | null>(null);

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

    const material = materials.find(m => m.id === selectedMaterial);
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

    const quoteData = {
      client_name: clientName,
      client_email: clientEmail,
      material_id: selectedMaterial,
      total_area: areaNum,
      total_price: totalPrice,
      status: 'pending',
      notes,
    };

    const { data, error } = await supabase
      .from('quotes')
      .insert([quoteData])
      .select()
      .single();

    if (error) {
      toast.error('Error creating quote');
      return;
    }

    setQuote(data);
    toast.success('Quote created successfully');
  };

  return (
    <div>
      <div style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Create New Quote</h1>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Name</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Client Email</label>
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
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a material</option>
              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name} - ${material.price_per_meter}/m²
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Area (square meters)</label>
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
            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {quote && (
              <>
                <PDFDownloadLink
                  document={<QuotePDF quote={quote} material={materials.find(m => m.id === quote.material_id)!} companyLogoUrl={''} />}
                  fileName={`quote-${quote.id}.pdf`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Download PDF
                </PDFDownloadLink>

                {/* Email button */}
                <a
                  href={(() => {
                    const mat = materials.find(m => m.id === quote.material_id)!;
                    const subject = encodeURIComponent(`Quote from ${mat.name} - ${quote.id}`);
                    const bodyLines = [
                      `Hi ${quote.client_name},`,
                      '',
                      `Please find the quote for ${mat.name}:`,
                      `- Area: ${quote.total_area} m²`,
                      `- Unit price: ${mat.price_per_meter} USD/m²`,
                      `- Total: ${quote.total_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
                      '',
                      `Regards,`,
                      `${'Ric Bermudez'}`,
                      `${'Stone By Ric'}`,
                      `${'MASONRY WITH ACCOUNTABILITY'}`,
                      `${'2032165696'}`,
                      `${'STONEBYRIC.COM'}`,
                    ];

                    const body = encodeURIComponent(bodyLines.join('\n'));
                    return `mailto:${quote.client_email}?subject=${subject}&body=${body}`;
                  })()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Email Client
                </a>
              </>
            )}
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Quote
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}