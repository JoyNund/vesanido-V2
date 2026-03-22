// ==================== SERVICIO API BASE ====================

import type { User, News, Event, Podcast, Episode, Product, CartItem, Order, OrderStatus, TrackMetadata, LyricsResponse, SavedTrack, RadioConfig } from '../types';

const API_BASE = (import.meta as any).env.VITE_API_URL || '/api';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { requiresAuth = false, requiresAdmin = false, headers = {}, ...restConfig } = config;

  const token = localStorage.getItem('auth_token');
  const adminToken = localStorage.getItem('admin_token');

  if (requiresAuth && !token) {
    throw new Error('No authenticated');
  }

  if (requiresAdmin && !adminToken) {
    throw new Error('No admin access');
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(requiresAuth && { Authorization: `Bearer ${token}` }),
    ...(requiresAdmin && { Authorization: `Bearer ${adminToken}` }),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...restConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== AUTH SERVICE ====================

export const authService = {
  // Login de usuario
  async login(email: string, password: string) {
    const response = await apiRequest<{ token: string; user: Omit<User, 'password'> }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  },

  // Registro de usuario
  async register(email: string, password: string, name: string) {
    const response = await apiRequest<{ token: string; user: Omit<User, 'password'> }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  },

  // Login de admin
  async adminLogin(password: string) {
    const response = await apiRequest<{ token: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    localStorage.setItem('admin_token', response.token);
    return response;
  },

  // Logout
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user');
  },

  // Obtener usuario actual
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  // Verificar si es admin
  isAdmin(): boolean {
    return !!localStorage.getItem('admin_token');
  },

  // Verificar si está logueado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
};

// ==================== NEWS SERVICE ====================

export const newsService = {
  async getAll(): Promise<News[]> {
    return apiRequest<News[]>('/news');
  },

  async getById(id: string): Promise<News> {
    return apiRequest<News>(`/news/${id}`);
  },

  async create(news: Omit<News, 'id'>): Promise<News> {
    return apiRequest<News>('/news', {
      method: 'POST',
      requiresAdmin: true,
      body: JSON.stringify(news),
    });
  },

  async update(id: string, news: Partial<News>): Promise<News> {
    return apiRequest<News>(`/news/${id}`, {
      method: 'PUT',
      requiresAdmin: true,
      body: JSON.stringify(news),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/news/${id}`, {
      method: 'DELETE',
      requiresAdmin: true,
    });
  },
};

// ==================== EVENTS SERVICE ====================

export const eventsService = {
  async getAll(): Promise<Event[]> {
    return apiRequest<Event[]>('/events');
  },

  async getById(id: string): Promise<Event> {
    return apiRequest<Event>(`/events/${id}`);
  },

  async create(event: Omit<Event, 'id'>): Promise<Event> {
    return apiRequest<Event>('/events', {
      method: 'POST',
      requiresAdmin: true,
      body: JSON.stringify(event),
    });
  },

  async update(id: string, event: Partial<Event>): Promise<Event> {
    return apiRequest<Event>(`/events/${id}`, {
      method: 'PUT',
      requiresAdmin: true,
      body: JSON.stringify(event),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/events/${id}`, {
      method: 'DELETE',
      requiresAdmin: true,
    });
  },
};

// ==================== PODCASTS SERVICE ====================

export const podcastsService = {
  async getAll(): Promise<Podcast[]> {
    return apiRequest<Podcast[]>('/podcasts');
  },

  async getById(id: string): Promise<Podcast> {
    return apiRequest<Podcast>(`/podcasts/${id}`);
  },

  async create(podcast: Omit<Podcast, 'id'>): Promise<Podcast> {
    return apiRequest<Podcast>('/podcasts', {
      method: 'POST',
      requiresAdmin: true,
      body: JSON.stringify(podcast),
    });
  },

  async update(id: string, podcast: Partial<Podcast>): Promise<Podcast> {
    return apiRequest<Podcast>(`/podcasts/${id}`, {
      method: 'PUT',
      requiresAdmin: true,
      body: JSON.stringify(podcast),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/podcasts/${id}`, {
      method: 'DELETE',
      requiresAdmin: true,
    });
  },

  // Episodios
  async addEpisode(podcastId: string, episode: Omit<Episode, 'id' | 'podcastId'>): Promise<Episode> {
    return apiRequest<Episode>(`/podcasts/${podcastId}/episodes`, {
      method: 'POST',
      requiresAdmin: true,
      body: JSON.stringify(episode),
    });
  },
};

// ==================== SHOP SERVICE ====================

export const shopService = {
  // Productos
  async getProducts(): Promise<Product[]> {
    return apiRequest<Product[]>('/shop/products');
  },

  async getProductById(id: string): Promise<Product> {
    return apiRequest<Product>(`/shop/products/${id}`);
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return apiRequest<Product>('/shop/products', {
      method: 'POST',
      requiresAdmin: true,
      body: JSON.stringify(product),
    });
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return apiRequest<Product>(`/shop/products/${id}`, {
      method: 'PUT',
      requiresAdmin: true,
      body: JSON.stringify(product),
    });
  },

  async deleteProduct(id: string): Promise<void> {
    return apiRequest<void>(`/shop/products/${id}`, {
      method: 'DELETE',
      requiresAdmin: true,
    });
  },

  // Órdenes
  async createOrder(items: CartItem[], shippingAddress: string): Promise<Order> {
    return apiRequest<Order>('/shop/orders', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ items, shippingAddress }),
    });
  },

  async getMyOrders(): Promise<Order[]> {
    return apiRequest<Order[]>('/shop/orders/my-orders', {
      requiresAuth: true,
    });
  },

  async getAllOrders(): Promise<Order[]> {
    return apiRequest<Order[]>('/shop/orders', {
      requiresAdmin: true,
    });
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return apiRequest<Order>(`/shop/orders/${id}/status`, {
      method: 'PUT',
      requiresAdmin: true,
      body: JSON.stringify({ status }),
    });
  },
};

// ==================== PLAYER SERVICE ====================

export const playerService = {
  async getCurrentTrack(): Promise<TrackMetadata> {
    return apiRequest<TrackMetadata>('/player/metadata');
  },

  async getLyrics(artist: string, title: string): Promise<LyricsResponse> {
    return apiRequest<LyricsResponse>(`/player/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
  },
};

// ==================== USER SERVICE ====================

export const userService = {
  async getProfile(): Promise<User> {
    return apiRequest<User>('/user/profile', {
      requiresAuth: true,
    });
  },

  async updateProfile(data: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    return apiRequest<User>('/user/profile', {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(data),
    });
  },

  // Tracks guardados
  async saveTrack(track: Omit<SavedTrack, 'id' | 'savedAt'>): Promise<User> {
    return apiRequest<User>('/user/saved-tracks', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(track),
    });
  },

  async removeTrack(trackId: string): Promise<User> {
    return apiRequest<User>(`/user/saved-tracks/${trackId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  },

  async getSavedTracks(): Promise<SavedTrack[]> {
    const user = await this.getProfile();
    return user.savedTracks;
  },
};

// ==================== CONFIG SERVICE ====================

export const configService = {
  async getConfig(): Promise<RadioConfig> {
    return apiRequest<RadioConfig>('/config');
  },

  async updateConfig(config: RadioConfig): Promise<RadioConfig> {
    return apiRequest<RadioConfig>('/config', {
      method: 'POST',
      requiresAdmin: true,
      body: JSON.stringify(config),
    });
  },
};

// ==================== UPLOAD SERVICE ====================

export const uploadService = {
  async upload(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },
};
