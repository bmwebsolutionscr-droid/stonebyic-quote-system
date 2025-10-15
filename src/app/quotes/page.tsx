'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Quote, Material } from '@/types/supabase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDF from '@/components/QuotePDF';
import toast from 'react-hot-toast';
import { DocumentTextIcon, EnvelopeIcon, TrashIcon } from '@heroicons/react/24/outline';

interface QuoteWithMaterial extends Quote {
  materials: Material;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteWithMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  // Estado removido ya que no se necesita editar cotizaciones

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          materials (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error loading quotes');
        console.error('Error:', error);
        return;
      }

      setQuotes(data || []);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      toast.error('Error loading quotes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'sent':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = async (quote: QuoteWithMaterial) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quote.id);

      if (error) {
        console.error('Error deleting quote:', error);
        toast.error('Error al eliminar la cotización');
        return;
      }

      toast.success('Cotización eliminada exitosamente');
      fetchQuotes();
    } catch (err) {
      console.error('Error deleting quote:', err);
      toast.error('Error al eliminar la cotización');
    }
  };

  const handleEmailClick = (quote: QuoteWithMaterial) => {
    const subject = encodeURIComponent(`Quote from ${quote.materials.name} - ${quote.id}`);
    const bodyLines = [
      `Hi ${quote.client_name},`,
      '',
      `Please find the quote for ${quote.materials.name}:`,
      `- Area: ${quote.total_area} m²`,
      `- Unit price: ${quote.materials.price_per_meter} USD/m²`,
      `- Total: ${quote.total_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
      '',
      'Regards,',
      'Ric Bermudez',
      'Stone By Ric',
      'MASONRY WITH ACCOUNTABILITY',
      '2032165696',
      'STONEBYRIC.COM',
    ];

    const body = encodeURIComponent(bodyLines.join('\n'));
    window.location.href = `mailto:${quote.client_email}?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
        <a
          href="/quotes/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Nueva Cotización
        </a>
      </div>



      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Encabezado con nombre del cliente y acciones */}
              <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="text-lg font-medium text-gray-900">{quote.client_name}</h3>
                  <p className="text-sm text-gray-500">{quote.client_email}</p>
                </div>
                <div className="flex gap-1">
                  <PDFDownloadLink
                    document={
                      <QuotePDF
                        quote={quote}
                        material={quote.materials}
                        companyLogoUrl={''}
                      />
                    }
                    fileName={`quote-${quote.id}.pdf`}
                    className="p-1.5 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                    title="Descargar PDF"
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                  </PDFDownloadLink>
                  <button
                    onClick={() => handleEmailClick(quote)}
                    className="p-1.5 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                    title="Enviar por correo"
                  >
                    <EnvelopeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(quote)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                    title="Eliminar cotización"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="p-4 space-y-3">
                {/* Estado y fecha */}
                <div className="flex justify-between items-center">
                  <span className={getStatusBadgeClass(quote.status)}>
                    {quote.status === 'pending' ? 'Pendiente' : 
                     quote.status === 'sent' ? 'Enviada' : 
                     quote.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(quote.created_at)}
                  </span>
                </div>

                {/* Material y cálculos */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700">
                    Material: <span className="text-gray-900">{quote.materials.name}</span>
                  </p>
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Área:</span>
                      <span className="font-medium">{quote.total_area} m²</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-600">Precio por m²:</span>
                      <span className="font-medium">${quote.materials.price_per_meter}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-base font-semibold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-indigo-600">
                        ${quote.total_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notas */}
                {quote.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Notas:</h4>
                    <p className="text-sm text-gray-600">{quote.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}