const API_BASE = "https://garage-backend.onrender.com";

export interface ListingAttribute {
  id: string;
  categoryAttributeId: string;
  value: string;
}

export interface Listing {
  id: string;
  secondaryId: number;
  listingTitle: string;
  listingDescription: string;
  sellingPrice: number;
  itemBrand: string;
  itemAge: number;
  status: string;
  imageUrl?: string;
  listingImages?: { url: string }[];
  ListingAttribute: ListingAttribute[];
  categoryId: string;
  deliveryMethod: string;
  isPickupAvailable: boolean;
  createdAt: string;
}

export interface CategoryAttribute {
  id: string;
  label: string;
  inputType: "NUMBER" | "BOOLEAN" | "TEXT" | "SELECT";
}

export interface Category {
  id: string;
  name: string;
  attributes: CategoryAttribute[];
}

export function extractListingId(url: string): string | null {
  const match = url.match(
    /\/listing\/[^/]*?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
  );
  return match ? match[1] : null;
}

export async function fetchListing(id: string): Promise<Listing> {
  const res = await fetch(`${API_BASE}/listings/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Listing not found (${res.status})`);
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.categories ?? [];
}

export function buildAttributeMap(
  categories: Category[]
): Map<string, CategoryAttribute> {
  const map = new Map<string, CategoryAttribute>();
  for (const cat of categories) {
    for (const attr of cat.attributes) {
      map.set(attr.id, attr);
    }
  }
  return map;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents);
}
