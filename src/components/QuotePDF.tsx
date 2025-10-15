import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PDFImage,
} from '@react-pdf/renderer';
import { Quote, Material } from '@/types/supabase';
import company from '@/config/company';

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerRight: {
    textAlign: 'right',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    fontSize: 10,
    color: '#666',
  },
  hero: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 12,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  leftCol: {
    flex: 2,
  },
  rightCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  small: {
    fontSize: 10,
    color: '#555',
  },
  materialImage: {
    width: '100%',
    height: 90,
    objectFit: 'cover',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    alignItems: 'center',
  },
  tableCellLeft: {
    flex: 1,
    fontSize: 11,
  },
  tableCellRight: {
    width: 120,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 12,
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 28,
    right: 28,
    fontSize: 9,
    color: '#777',
    textAlign: 'center',
  },
});

interface QuotePDFProps {
  quote: Quote;
  material: Material;
  companyLogoUrl?: string;
}

const currency = (n: number) => {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export default function QuotePDF({ quote, material, companyLogoUrl }: QuotePDFProps) {
  const formatDate = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {companyLogoUrl ? (
              // PDFImage requires a remote or base64 url
              <PDFImage style={styles.logo} src={companyLogoUrl} />
            ) : (
              <View>
                <Text style={styles.companyName}>{company.name}</Text>
                <Text style={styles.meta}>{company.tagline}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>Quote</Text>
            <Text style={styles.meta}>#{quote.id}</Text>
            <Text style={styles.meta}>{formatDate(quote.created_at)}</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.twoCol as any}>
            <View style={styles.leftCol as any}>
              <Text style={{ fontSize: 18, fontWeight: '700' }}>{quote.client_name}</Text>
              <Text style={styles.small}>{quote.client_email}</Text>
            </View>
            <View style={styles.rightCol as any}>
              <Text style={styles.small}>Status</Text>
              <Text style={{ fontWeight: '700' }}>{quote.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Material</Text>
          <View style={styles.twoCol as any}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700' }}>{material.name}</Text>
              <Text style={styles.small}>{material.description}</Text>
            </View>
            <View style={{ width: 120 }}>
              {material.image_url ? (
                <PDFImage src={material.image_url} style={styles.materialImage} />
              ) : (
                <Text style={styles.small}>No image</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLeft}>Price per m²</Text>
              <Text style={styles.tableCellRight}>{currency(material.price_per_meter)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLeft}>Total Area</Text>
              <Text style={styles.tableCellRight}>{quote.total_area} m²</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLeft}>Notes</Text>
              <Text style={styles.tableCellRight}>{quote.notes || '-'}</Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{currency(quote.total_price)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This quote is valid for 30 days from the date of issue. Terms and conditions apply.\n
          {company.name} — {company.tagline} — {company.phone} — {company.website}
        </Text>
      </Page>
    </Document>
  );
}