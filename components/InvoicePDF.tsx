import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { Listing, Category, CategoryAttribute } from "@/lib/garageApi";
import { buildAttributeMap, formatPrice } from "@/lib/garageApi";

const ORANGE = "#F97316";
const DARK = "#111827";
const GRAY = "#6B7280";
const LIGHT_GRAY = "#F3F4F6";
const BORDER = "#E5E7EB";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 48,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  logoArea: { flexDirection: "column" },
  logoText: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
    letterSpacing: 1,
  },
  logoSubtext: { fontSize: 8, color: GRAY, marginTop: 2 },
  invoiceMeta: { alignItems: "flex-end" },
  invoiceLabel: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    letterSpacing: 0.5,
  },
  invoiceNumber: { fontSize: 9, color: GRAY, marginTop: 3 },
  invoiceDate: { fontSize: 9, color: GRAY, marginTop: 2 },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: ORANGE,
    marginBottom: 20,
  },
  billToRow: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 20,
  },
  billBox: { flex: 1 },
  billTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  billValue: { fontSize: 9, color: DARK },
  billSubValue: { fontSize: 8, color: GRAY, marginTop: 2 },
  heroRow: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 20,
  },
  truckImage: {
    width: 220,
    height: 148,
    objectFit: "cover",
    borderRadius: 6,
    backgroundColor: LIGHT_GRAY,
  },
  truckInfo: { flex: 1, justifyContent: "center" },
  truckTitle: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginBottom: 6,
  },
  truckMeta: { fontSize: 9, color: GRAY, marginBottom: 14 },
  priceBox: {
    backgroundColor: ORANGE,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  priceLabel: { fontSize: 8, color: "#FFFFFF", opacity: 0.85, marginBottom: 2 },
  priceValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
  listingId: { fontSize: 7.5, color: GRAY },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 18,
  },
  descriptionBox: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 12,
  },
  descriptionText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.65,
  },
  attrGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  attrItem: {
    width: "47%",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 5,
  },
  attrLabel: { fontSize: 9, color: GRAY },
  attrValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: DARK },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
  },
  footerLeft: { fontSize: 7.5, color: GRAY },
  footerRight: { fontSize: 7.5, color: GRAY },
  footerBrand: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: ORANGE },
});

function formatAttributeValue(attr: CategoryAttribute, value: string): string {
  if (attr.inputType === "BOOLEAN") return value === "true" ? "Yes" : "No";
  if (attr.inputType === "NUMBER") {
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toLocaleString();
  }
  return value;
}

function toResizedImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url
    .replace("/storage/v1/object/public/", "/storage/v1/render/image/public/")
    .concat("?width=600&quality=70");
}

interface Props {
  listing: Listing;
  categories: Category[];
}

export default function InvoicePDF({ listing, categories }: Props) {
  const attrMap = buildAttributeMap(categories);
  const rawImageUrl = listing.listingImages?.[0]?.url ?? listing.imageUrl ?? null;
  const imageUrl = toResizedImageUrl(rawImageUrl);

  const invoiceNumber = `INV-${listing.secondaryId}`;
  const invoiceDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const resolvedAttrs = listing.ListingAttribute.map((la) => {
    const def = attrMap.get(la.categoryAttributeId);
    if (!def) return null;
    return { label: def.label, value: formatAttributeValue(def, la.value) };
  }).filter(Boolean) as { label: string; value: string }[];

  return (
    <Document
      title={`Invoice — ${listing.listingTitle}`}
      author="Garage"
      subject="Fire Truck Invoice"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.logoArea}>
            <Text style={styles.logoText}>GARAGE</Text>
            <Text style={styles.logoSubtext}>shopgarage.com</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>Date: {invoiceDate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* From / Prepared For */}
        <View style={styles.billToRow}>
          <View style={styles.billBox}>
            <Text style={styles.billTitle}>From</Text>
            <Text style={styles.billValue}>Garage</Text>
            <Text style={styles.billSubValue}>shopgarage.com · (201) 293-7164</Text>
          </View>
          <View style={styles.billBox}>
            <Text style={styles.billTitle}>Prepared For</Text>
            <Text style={styles.billValue}>Fire Department / Buyer</Text>
          </View>
        </View>

        {/* Hero: Image + Title + Price */}
        <View style={styles.heroRow}>
          {imageUrl && <Image src={imageUrl} style={styles.truckImage} />}
          <View style={styles.truckInfo}>
            <Text style={styles.truckTitle}>{listing.listingTitle}</Text>
            <Text style={styles.truckMeta}>
              {listing.itemAge} · {listing.itemBrand} · Listing #{listing.secondaryId}
            </Text>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>ASKING PRICE</Text>
              <Text style={styles.priceValue}>{formatPrice(listing.sellingPrice)}</Text>
            </View>
            <Text style={styles.listingId}>Listing ID: {listing.id}</Text>
          </View>
        </View>

        {/* Specs first — concise, fits well near the image */}
        {resolvedAttrs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.attrGrid}>
              {resolvedAttrs.map((attr, i) => (
                <View key={i} style={styles.attrItem}>
                  <Text style={styles.attrLabel}>{attr.label}</Text>
                  <Text style={styles.attrValue}>{attr.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Full description — no truncation, flows to next page automatically */}
        {listing.listingDescription && (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{listing.listingDescription}</Text>
            </View>
          </>
        )}

        {/* Footer on every page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>
            This invoice is for informational purposes and subject to change.
          </Text>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <Text style={styles.footerRight}>Generated by </Text>
            <Text style={styles.footerBrand}>Garage</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
