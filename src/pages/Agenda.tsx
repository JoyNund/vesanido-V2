import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Ticket, ArrowRight } from 'lucide-react';
import { eventsService } from '../services/api';
import type { Event as EventType } from '../types';

export default function AgendaPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventsService.getAll();
      // Ordenar por fecha
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      setEvents(sorted);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d90429] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 tracking-widest text-sm">CARGANDO AGENDA...</p>
        </div>
      </div>
    );
  }

  if (selectedEvent) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedEvent(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-xs tracking-widest">VOLVER</span>
          </button>

          <article className="bg-white border border-[#0f0f0f]">
            {selectedEvent.image && !selectedEvent.image.startsWith('linear-gradient') && (
              <div className="h-64 sm:h-96 overflow-hidden border-b border-[#0f0f0f]">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover filter grayscale"
                />
              </div>
            )}
            {selectedEvent.image?.startsWith('linear-gradient') && (
              <div
                className="h-64 sm:h-96 border-b border-[#0f0f0f]"
                style={{ background: selectedEvent.image }}
              />
            )}

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {selectedEvent.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedEvent.time}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-tight uppercase mb-6">
                {selectedEvent.title}
              </h1>

              {selectedEvent.description && (
                <p className="text-lg text-gray-600 mb-6">{selectedEvent.description}</p>
              )}

              <div
                className="prose prose-lg max-w-none prose-headings:font-display prose-headings:uppercase prose-a:text-[#d90429]"
                dangerouslySetInnerHTML={{ __html: selectedEvent.content }}
              />

              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
                  {selectedEvent.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs tracking-widest uppercase"
                    >
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

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= new Date();
  });

  const pastEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate < new Date();
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-[#0f0f0f] pb-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display tracking-tight uppercase">
            Agenda
          </h1>
          <p className="text-gray-500 font-medium tracking-widest text-sm mt-2">
            PRÓXIMOS RITUALES
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 tracking-widest">NO HAY EVENTOS PROGRAMADOS</p>
          </div>
        ) : (
          <div className="space-y-12">
            {upcomingEvents.length > 0 && (
              <section>
                <h2 className="text-2xl font-display tracking-wide uppercase mb-6 flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#d90429] rounded-full animate-pulse"></span>
                  Próximos Eventos
                </h2>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white border border-[#0f0f0f] p-6 hover:border-[#d90429] transition-colors cursor-pointer group"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="sm:w-32 flex-shrink-0">
                          <div className="text-3xl font-display text-[#d90429]">
                            {event.date.split('/')[0]}
                          </div>
                          <div className="text-sm text-gray-500 uppercase tracking-widest">
                            {event.date.split('/')[1]}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-display tracking-wide uppercase group-hover:text-[#d90429] transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-gray-600 mt-2 line-clamp-1">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#d90429] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {pastEvents.length > 0 && (
              <section>
                <h2 className="text-2xl font-display tracking-wide uppercase mb-6 text-gray-500">
                  Eventos Pasados
                </h2>
                <div className="space-y-4 opacity-60">
                  {pastEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="bg-gray-100 border border-gray-200 p-6 cursor-pointer group"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="sm:w-32 flex-shrink-0">
                          <div className="text-3xl font-display text-gray-400">
                            {event.date.split('/')[0]}
                          </div>
                          <div className="text-sm text-gray-500 uppercase tracking-widest">
                            {event.date.split('/')[1]}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-display tracking-wide uppercase text-gray-600">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </span>
                          </div>
                        </div>

                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
