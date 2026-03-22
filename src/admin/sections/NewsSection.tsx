import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { newsService, uploadService } from '../../services/api';
import type { News } from '../../types';

export default function NewsSection() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    image: '',
    description: '',
    content: '',
    tags: '',
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const openModal = (item?: News) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        date: item.date,
        image: item.image || '',
        description: item.description || '',
        content: item.content || '',
        tags: item.tags?.join(', ') || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        date: new Date().toLocaleDateString('es-ES'),
        image: '',
        description: '',
        content: '',
        tags: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadService.upload(file);
      setFormData({ ...formData, image: result.url });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newsData = {
      title: formData.title,
      date: formData.date,
      image: formData.image,
      description: formData.description,
      content: formData.content,
      tags: formData.tags.split(',').map((t) => t.trim()).filter((t) => t),
    };

    try {
      if (editingItem) {
        await newsService.update(editingItem.id, newsData);
      } else {
        await newsService.create(newsData);
      }
      loadNews();
      closeModal();
    } catch (error) {
      console.error('Failed to save news:', error);
      alert('Error al guardar noticia');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta noticia?')) return;

    try {
      await newsService.delete(id);
      loadNews();
    } catch (error) {
      console.error('Failed to delete news:', error);
      alert('Error al eliminar noticia');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#d90429] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display tracking-wide uppercase">Noticias</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#d90429] text-white rounded-lg hover:bg-[#ff1744] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nueva Noticia</span>
        </button>
      </div>

      <div className="bg-[#1a1a20] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f0f13] border-b border-gray-800">
              <tr>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Título</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium hidden sm:table-cell">Fecha</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium hidden md:table-cell">Tags</th>
                <th className="text-right p-4 text-sm text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {news.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No hay noticias publicadas
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-800 hover:bg-[#0f0f13] transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-500 sm:hidden">{item.date}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-400 hidden sm:table-cell">{item.date}</td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {item.tags?.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(item)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={closeModal} />

          <div className="relative bg-[#1a1a20] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1a1a20] border-b border-gray-800 p-6 flex items-center justify-between">
              <h3 className="text-xl font-display tracking-wide uppercase">
                {editingItem ? 'Editar Noticia' : 'Nueva Noticia'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-800 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  Fecha
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429]"
                  placeholder="DD/MM/YYYY"
                  required
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  Imagen
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429]"
                    placeholder="URL o gradiente"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {uploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                  </button>
                </div>
                {formData.image && (
                  <div className="mt-2 h-32 border border-gray-700 rounded-lg overflow-hidden">
                    {formData.image.startsWith('linear-gradient') ? (
                      <div className="w-full h-full" style={{ background: formData.image }} />
                    ) : (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  Descripción Corta
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429] resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  Contenido (HTML)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429] resize-none font-mono text-sm"
                  rows={8}
                  placeholder="<p>Contenido HTML...</p>"
                  required
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  Tags (separados por coma)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429]"
                  placeholder="musica, rock, post-punk"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#d90429] text-white rounded-lg hover:bg-[#ff1744] transition-colors"
                >
                  {editingItem ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
