export interface ProductSummary {
  id: number;
  name: string;
  mainImage: string;
  priceKopecks: number;
}

export interface CatalogProduct extends ProductSummary {
  categoryKey: string;
  stock: number;
  description: string;
  advantages: string;
  characteristics: string;
  gallery: string[];
}

export interface GalleryItem {
  type: 'image' | 'video';
  src: string;
}

export interface CatalogMasterClass {
  id: number;
  title: string;
  description: string;
  age: string;
  duration: string;
  priceKopecks: number | null;
  mainImage: string;
  media: GalleryItem[];
}

export interface CartProduct extends ProductSummary {
  count: number;
}
