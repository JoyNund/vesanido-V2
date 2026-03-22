import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, Mic2, ShoppingBag } from 'lucide-react';
import { newsService, eventsService, podcastsService, shopService } from '../../services/api';

export default function DashboardSection() {
  const [stats, setStats] = useState({
    news: 0,
    events: 0,
    podcasts: 0,
    products: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [news, events, podcasts, products] = await Promise.all([
        newsService.getAll(),
        eventsService.getAll(),
        podcastsService.getAll(),
        shopService.getProducts(),
      ]);

      setStats({
        news: news.length,
        events: events.length,
        podcasts: podcasts.length,
        products: products.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Noticias', value: stats.news, icon: <Newspaper className="w-8 h-8" />, color: 'text-blue-500' },
    { label: 'Eventos', value: stats.events, icon: <Calendar className="w-8 h-8" />, color: 'text-green-500' },
    { label: 'Podcasts', value: stats.podcasts, icon: <Mic2 className="w-8 h-8" />, color: 'text-purple-500' },
    { label: 'Productos', value: stats.products, icon: <ShoppingBag className="w-8 h-8" />, color: 'text-pink-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#d90429] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-display tracking-wide uppercase mb-6">Dashboard</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#1a1a20] border border-gray-800 rounded-xl p-6"
          >
            <div className={`mb-4 ${stat.color}`}>{stat.icon}</div>
            <div className="text-4xl font-display mb-2">{stat.value}</div>
            <div className="text-gray-400 text-sm tracking-widest uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1a20] border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-display tracking-wide uppercase mb-4">Acceso Rápido</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0f0f13] rounded-lg border border-gray-800">
            <h4 className="font-medium mb-2">Gestionar Noticias</h4>
            <p className="text-gray-400 text-sm mb-4">
              Crea, edita o elimina noticias del sitio
            </p>
          </div>
          <div className="p-4 bg-[#0f0f13] rounded-lg border border-gray-800">
            <h4 className="font-medium mb-2">Gestionar Eventos</h4>
            <p className="text-gray-400 text-sm mb-4">
              Administra la agenda de próximos rituales
            </p>
          </div>
          <div className="p-4 bg-[#0f0f13] rounded-lg border border-gray-800">
            <h4 className="font-medium mb-2">Gestionar Podcasts</h4>
            <p className="text-gray-400 text-sm mb-4">
              Añade episodios y series de podcast
            </p>
          </div>
          <div className="p-4 bg-[#0f0f13] rounded-lg border border-gray-800">
            <h4 className="font-medium mb-2">Gestionar Tienda</h4>
            <p className="text-gray-400 text-sm mb-4">
              Administra productos y órdenes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
