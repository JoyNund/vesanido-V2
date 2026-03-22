import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Music, Disc } from 'lucide-react';
import { podcastsService, uploadService } from '../../services/api';
import type { Podcast, Episode } from '../../types';

export default function PodcastsSection() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover: '',
  });
  const [episodeData, setEpisodeData] = useState({
    title: '',
    description: '',
    audioUrl: '',
    duration: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPodcasts();
  }, []);

  const loadPodcasts = async () => {
    try {
      const data = await podcastsService.getAll();
      setPodcasts(data);
    } catch (error) {
      console.error('Failed to load podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPodcastModal = (podcast?: Podcast) => {
    if (podcast) {
      setEditingPodcast(podcast);
      setFormData({
        title: podcast.title,
        description: podcast.description,
        cover: podcast.cover || '',
      });
    } else {
      setEditingPodcast(null);
      setFormData({
        title: '',
        description: '',
        cover: '',
      });
    }
    setShowModal(true);
  };

  const openEpisodeModal = (podcast: Podcast, episode?: Episode) => {
    setSelectedPodcast(podcast);
    if (episode) {
      setEditingEpisode(episode);
      setEpisodeData({
        title: episode.title,
        description: episode.description,
        audioUrl: episode.audioUrl,
        duration: episode.duration,
      });
    } else {
      setEditingEpisode(null);
      setEpisodeData({
        title: '',
        description: '',
        audioUrl: '',
        duration: '',
      });
    }
    setShowEpisodeModal(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadService.upload(file);
      setFormData({ ...formData, cover: result.url });
    } catch (error) {
      console.error('Failed to upload cover:', error);
      alert('Error al subir portada');
    } finally {
      setUploading(false);
    }
  };

  const handleSavePodcast = async (e: React.FormEvent) => {
    e.preventDefault();

    const podcastData = {
      title: formData.title,
      description: formData.description,
      cover: formData.cover,
      episodes: editingPodcast?.episodes || [],
    };

    try {
      if (editingPodcast) {
        await podcastsService.update(editingPodcast.id, podcastData);
      } else {
        await podcastsService.create(podcastData);
      }
      loadPodcasts();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save podcast:', error);
      alert('Error al guardar podcast');
    }
  };

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPodcast) return;

    const newEpisodeData = {
      title: episodeData.title,
      description: episodeData.description,
      audioUrl: episodeData.audioUrl,
      duration: episodeData.duration,
    };

    try {
      if (editingEpisode) {
        // Actualizar episodio existente (requiere implementación adicional)
        alert('La actualización de episodios requiere implementación adicional');
      } else {
        await podcastsService.addEpisode(selectedPodcast.id, newEpisodeData);
      }
      loadPodcasts();
      setShowEpisodeModal(false);
    } catch (error) {
      console.error('Failed to save episode:', error);
      alert('Error al guardar episodio');
    }
  };

  const handleDeletePodcast = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este podcast?')) return;

    try {
      await podcastsService.delete(id);
      loadPodcasts();
    } catch (error) {
      console.error('Failed to delete podcast:', error);
      alert('Error al eliminar podcast');
    }
  };

  const handleDeleteEpisode = async (podcastId: string, episodeId: string) => {
    if (!confirm('¿Estás seguro de eliminar este episodio?')) return;

    try {
      // Requiere implementación adicional en el backend
      alert('La eliminación de episodios requiere implementación adicional');
    } catch (error) {
      console.error('Failed to delete episode:', error);
      alert('Error al eliminar episodio');
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
        <h2 className="text-3xl font-display tracking-wide uppercase">Podcasts</h2>
        <button
          onClick={() => openPodcastModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#d90429] text-white rounded-lg hover:bg-[#ff1744] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuevo Podcast</span>
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {podcasts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No hay podcasts creados
          </div>
        ) : (
          podcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="bg-[#1a1a20] border border-gray-800 rounded-xl overflow-hidden"
            >
              <div className="aspect-square relative">
                {podcast.cover && !podcast.cover.startsWith('linear-gradient') ? (
                  <img
                    src={podcast.cover}
                    alt={podcast.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: podcast.cover || '#1a1a20' }}
                  >
                    <Music className="w-16 h-16 text-gray-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => openPodcastModal(podcast)}
                    className="p-2 bg-black/50 hover:bg-[#d90429] rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleDeletePodcast(podcast.id)}
                    className="p-2 bg-black/50 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-display tracking-wide uppercase mb-2">{podcast.title}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{podcast.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500">
                    {podcast.episodes.length} episodios
                  </span>
                  <button
                    onClick={() => openEpisodeModal(podcast)}
                    className="text-xs text-[#d90429] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Añadir episodio
                  </button>
                </div>

                {podcast.episodes.length > 0 && (
                  <div className="space-y-2">
                    {podcast.episodes.slice(0, 3).map((episode) => (
                      <div
                        key={episode.id}
                        className="flex items-center justify-between p-2 bg-[#0f0f13] rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{episode.title}</p>
                          <p className="text-xs text-gray-500">{episode.duration}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteEpisode(podcast.id, episode.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Podcast Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowModal(false)} />

          <div className="relative bg-[#1a1a20] border border-gray-800 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-display tracking-wide uppercase">
                {editingPodcast ? 'Editar Podcast' : 'Nuevo Podcast'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePodcast} className="p-6 space-y-4">
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
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429] resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  Portada
                </label>
                <input
                  type="text"
                  value={formData.cover}
                  onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429] mb-2"
                  placeholder="URL o gradiente"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                >
                  <Disc className="w-4 h-4" />
                  {uploading ? 'Subiendo...' : 'Subir portada'}
                </label>
                {formData.cover && (
                  <div className="mt-2 w-32 h-32 border border-gray-700 rounded overflow-hidden">
                    {formData.cover.startsWith('linear-gradient') ? (
                      <div className="w-full h-full" style={{ background: formData.cover }} />
                    ) : (
                      <img src={formData.cover} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#d90429] text-white rounded-lg hover:bg-[#ff1744] transition-colors"
                >
                  {editingPodcast ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Episode Modal */}
      {showEpisodeModal && selectedPodcast && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowEpisodeModal(false)} />

          <div className="relative bg-[#1a1a20] border border-gray-800 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-display tracking-wide uppercase">
                {editingEpisode ? 'Editar Episodio' : 'Nuevo Episodio'}
              </h3>
              <button onClick={() => setShowEpisodeModal(false)} className="p-2 hover:bg-gray-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEpisode} className="p-6 space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={episodeData.title}
                  onChange={(e) => setEpisodeData({ ...episodeData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  Descripción
                </label>
                <textarea
                  value={episodeData.description}
                  onChange={(e) => setEpisodeData({ ...episodeData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429] resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  URL de Audio
                </label>
                <input
                  type="text"
                  value={episodeData.audioUrl}
                  onChange={(e) => setEpisodeData({ ...episodeData, audioUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429]"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  Duración
                </label>
                <input
                  type="text"
                  value={episodeData.duration}
                  onChange={(e) => setEpisodeData({ ...episodeData, duration: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429]"
                  placeholder="45:00"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEpisodeModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#d90429] text-white rounded-lg hover:bg-[#ff1744] transition-colors"
                >
                  {editingEpisode ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
