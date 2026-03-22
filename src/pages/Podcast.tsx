import React, { useState, useEffect } from 'react';
import { Play, Clock, Headphones, ArrowLeft, Music } from 'lucide-react';
import { podcastsService } from '../services/api';
import type { Podcast, Episode } from '../types';

export default function PodcastPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<string | null>(null);

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

  const handlePodcastClick = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
  };

  const handleBack = () => {
    setSelectedPodcast(null);
    setPlayingEpisode(null);
  };

  const handlePlayEpisode = (episodeId: string, audioUrl: string) => {
    if (playingEpisode === episodeId) {
      setPlayingEpisode(null);
      // Pausar audio
    } else {
      setPlayingEpisode(episodeId);
      // Reproducir audio
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d90429] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 tracking-widest text-sm">CARGANDO PODCASTS...</p>
        </div>
      </div>
    );
  }

  if (selectedPodcast) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs tracking-widest">VOLVER</span>
          </button>

          {/* Header del Podcast */}
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            {selectedPodcast.cover && !selectedPodcast.cover.startsWith('linear-gradient') && (
              <div className="w-full sm:w-48 aspect-square flex-shrink-0">
                <img
                  src={selectedPodcast.cover}
                  alt={selectedPodcast.title}
                  className="w-full h-full object-cover filter grayscale"
                />
              </div>
            )}
            {selectedPodcast.cover?.startsWith('linear-gradient') && (
              <div
                className="w-full sm:w-48 aspect-square flex-shrink-0"
                style={{ background: selectedPodcast.cover }}
              />
            )}

            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-display tracking-tight uppercase mb-4">
                {selectedPodcast.title}
              </h1>
              <p className="text-gray-600 mb-4">{selectedPodcast.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Headphones className="w-4 h-4" />
                  {selectedPodcast.episodes.length} episodios
                </span>
              </div>
            </div>
          </div>

          {/* Lista de Episodios */}
          <div className="bg-white border border-[#0f0f0f]">
            <div className="p-4 border-b border-[#0f0f0f]">
              <h2 className="text-lg font-display tracking-wide uppercase">Episodios</h2>
            </div>

            {selectedPodcast.episodes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="tracking-widest text-sm">NO HAY EPISODIOS DISPONIBLES</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {selectedPodcast.episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      playingEpisode === episode.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => handlePlayEpisode(episode.id, episode.audioUrl)}
                        className="w-10 h-10 rounded-full border border-[#0f0f0f] flex items-center justify-center flex-shrink-0 hover:bg-[#0f0f0f] hover:text-white transition-colors"
                      >
                        {playingEpisode === episode.id ? (
                          <div className="w-3 h-3 bg-current rounded-sm" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display tracking-wide uppercase mb-1">
                          {episode.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{episode.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {episode.duration}
                          </span>
                          <span>
                            {new Date(episode.publishedAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-[#0f0f0f] pb-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display tracking-tight uppercase">
            Podcasts
          </h1>
          <p className="text-gray-500 font-medium tracking-widest text-sm mt-2">
            SERIES DE AUDIO VESÁNICO
          </p>
        </div>

        {podcasts.length === 0 ? (
          <div className="text-center py-24">
            <Music className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-gray-500 tracking-widest">NO HAY PODCASTS DISPONIBLES</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="card-sharp group cursor-pointer"
                onClick={() => handlePodcastClick(podcast)}
              >
                {podcast.cover && !podcast.cover.startsWith('linear-gradient') && (
                  <div className="relative overflow-hidden aspect-square border-b border-[#0f0f0f]">
                    <img
                      src={podcast.cover}
                      alt={podcast.title}
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                )}
                {podcast.cover?.startsWith('linear-gradient') && (
                  <div
                    className="aspect-square border-b border-[#0f0f0f]"
                    style={{ background: podcast.cover }}
                  />
                )}

                <div className="p-4">
                  <h3 className="text-lg font-display tracking-wide uppercase mb-2">
                    {podcast.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {podcast.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Headphones className="w-3 h-3" />
                      {podcast.episodes.length} episodios
                    </span>
                    <Play className="w-4 h-4 group-hover:text-[#d90429] transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
