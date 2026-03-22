import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { configService } from '../../services/api';
import type { RadioConfig } from '../../types';

export default function SettingsSection() {
  const [config, setConfig] = useState<RadioConfig>({
    streamUrl: '',
    lyricsApiUrl: 'https://lrclib.net/api/search',
    stationName: 'Radio Vesánico',
    stationDescription: 'Transmisión subversiva - Dark Wave / Post-Punk',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await configService.getConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await configService.updateConfig(config);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
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
      <h2 className="text-3xl font-display tracking-wide uppercase mb-6">Configuración</h2>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div className="bg-[#1a1a20] border border-gray-800 rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-display tracking-wide uppercase mb-4">Stream de Audio</h3>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
              URL del Stream (Icecast/Shoutcast)
            </label>
            <input
              type="text"
              value={config.streamUrl}
              onChange={(e) => setConfig({ ...config, streamUrl: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429] font-mono text-sm"
              placeholder="https://stream.url/radio.mp3"
            />
          </div>
        </div>

        <div className="bg-[#1a1a20] border border-gray-800 rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-display tracking-wide uppercase mb-4">API de Letras</h3>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
              LRCLIB API URL
            </label>
            <input
              type="text"
              value={config.lyricsApiUrl}
              onChange={(e) => setConfig({ ...config, lyricsApiUrl: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429] font-mono text-sm"
              disabled
            />
            <p className="text-xs text-gray-500 mt-2">
              * Por ahora fijo a LRCLIB (gratuito)
            </p>
          </div>
        </div>

        <div className="bg-[#1a1a20] border border-gray-800 rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-display tracking-wide uppercase mb-4">Información de la Estación</h3>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
              Nombre de la Estación
            </label>
            <input
              type="text"
              value={config.stationName}
              onChange={(e) => setConfig({ ...config, stationName: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429]"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
              Descripción
            </label>
            <textarea
              value={config.stationDescription}
              onChange={(e) => setConfig({ ...config, stationDescription: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429] resize-none"
              rows={3}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#d90429] text-white rounded-lg hover:bg-[#ff1744] transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </button>
      </form>
    </div>
  );
}
