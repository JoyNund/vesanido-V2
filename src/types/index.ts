// ==================== TIPOS COMPARTIDOS ====================

// --- USUARIOS ---
export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // Hash en producción
  savedTracks: SavedTrack[];
  orders: string[]; // IDs de órdenes
  createdAt: Date;
}

export interface SavedTrack {
  id: string;
  artist: string;
  title: string;
  cover?: string;
  savedAt: Date;
}

// --- AUTH ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginRequest {
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
  isAdmin?: boolean;
}

// --- NOTICIAS ---
export interface News {
  id: string;
  title: string;
  date: string;
  image: string;
  description: string;
  content: string;
  tags: string[];
}

// --- EVENTOS ---
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  image: string;
  description: string;
  content: string;
  tags: string[];
}

// --- PODCASTS ---
export interface Podcast {
  id: string;
  title: string;
  description: string;
  cover: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  publishedAt: Date;
}

// --- TIENDA ---
export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  image: string;
  images?: string[];
  description: string;
  stock: number;
  featured?: boolean;
  createdAt: Date;
}

export type ProductCategory = 'vinilos' | 'cassettes' | 'merch' | 'ropa' | 'accesorios';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

// --- PLAYER ---
export interface TrackMetadata {
  title: string;
  artist: string;
  album?: string;
  cover?: string;
}

export interface LyricsResponse {
  lyrics: string;
  source: string;
}

// --- CONFIG ---
export interface RadioConfig {
  streamUrl: string;
  lyricsApiUrl: string;
  stationName: string;
  stationDescription: string;
}
