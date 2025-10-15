export type Company = {
  owner: string;
  name: string;
  tagline?: string;
  phone?: string;
  website?: string;
  email?: string;
  logoUrl?: string;
};

const company: Company = {
  owner: 'Ric Bermudez',
  name: 'Stone By Ric',
  tagline: 'MASONRY WITH ACCOUNTABILITY',
  phone: '2032165696',
  website: 'STONEBYRIC.COM',
  email: '',
  logoUrl: '',
};

export default company;
