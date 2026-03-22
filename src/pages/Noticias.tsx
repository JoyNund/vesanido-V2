import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import { newsService } from '../services/api';
import type { News } from '../types';

export default function NoticiasPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const data = await newsService.getAll();
      setNews(data);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d90429] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 tracking-widest text-sm">CARGANDO NOTICIAS...</p>
        </div>
      </div>
    );
  }

  if (selectedNews) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedNews(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-xs tracking-widest">VOLVER</span>
          </button>

          <article className="bg-white border border-[#0f0f0f]">
            {selectedNews.image && !selectedNews.image.startsWith('linear-gradient') && (
              <div className="h-64 sm:h-96 overflow-hidden border-b border-[#0f0f0f]">
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover filter grayscale"
                />
              </div>
            )}
            {selectedNews.image?.startsWith('linear-gradient') && (
              <div
                className="h-64 sm:h-96 border-b border-[#0f0f0f]"
                style={{ background: selectedNews.image }}
              />
            )}

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {selectedNews.date}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-tight uppercase mb-6">
                {selectedNews.title}
              </h1>

              {selectedNews.description && (
                <p className="text-lg text-gray-600 mb-6">{selectedNews.description}</p>
              )}

              <div
                className="prose prose-lg max-w-none prose-headings:font-display prose-headings:uppercase prose-a:text-[#d90429]"
                dangerouslySetInnerHTML={{ __html: selectedNews.content }}
              />

              {selectedNews.tags && selectedNews.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
                  {selectedNews.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs tracking-widest uppercase"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-[#0f0f0f] pb-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display tracking-tight uppercase">
            Noticias
          </h1>
          <p className="text-gray-500 font-medium tracking-widest text-sm mt-2">
            ACTUALIDAD DEL UNDERGROUND
          </p>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 tracking-widest">NO HAY NOTICIAS DISPONIBLES</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <article
                key={item.id}
                className="card-sharp group cursor-pointer"
                onClick={() => setSelectedNews(item)}
              >
                {item.image && !item.image.startsWith('linear-gradient') && (
                  <div className="relative overflow-hidden aspect-video border-b border-[#0f0f0f]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                )}
                {item.image?.startsWith('linear-gradient') && (
                  <div
                    className="aspect-video border-b border-[#0f0f0f]"
                    style={{ background: item.image }}
                  />
                )}

                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-2">{item.date}</div>
                  <h3 className="text-lg font-display tracking-wide uppercase mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {item.tags?.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#d90429] transition-colors" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
