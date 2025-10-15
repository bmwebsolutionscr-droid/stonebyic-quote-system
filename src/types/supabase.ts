export type Material = {
  id: string;
  name: string;
  description: string;
  price_per_meter: number;
  image_url: string;
  created_at: string;
}

export type Quote = {
  id: string;
  client_name: string;
  client_email: string;
  total_area: number;
  material_id: string;
  total_price: number;
  status: 'pending' | 'sent' | 'approved' | 'rejected';
  created_at: string;
  notes?: string;
}