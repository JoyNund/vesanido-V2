import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Mic2,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardSection from './sections/DashboardSection';
import NewsSection from './sections/NewsSection';
import EventsSection from './sections/EventsSection';
import PodcastsSection from './sections/PodcastsSection';
import ShopSection from './sections/ShopSection';
import SettingsSection from './sections/SettingsSection';

type Section = 'dashboard' | 'news' | 'events' | 'podcasts' | 'shop' | 'settings';

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin-login');
    }
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'news', label: 'Noticias', icon: <Newspaper className="w-5 h-5" /> },
    { id: 'events', label: 'Eventos', icon: <Calendar className="w-5 h-5" /> },
    { id: 'podcasts', label: 'Podcasts', icon: <Mic2 className="w-5 h-5" /> },
    { id: 'shop', label: 'Tienda', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'settings', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
  ];

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050509] text-white">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#1a1a20] border border-gray-700 rounded-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0f0f13] border-r border-gray-800 transform transition-transform duration-300 z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display text-[#d90429]">VESÁNICO</h1>
              <p className="text-xs text-gray-500 tracking-widest">ADMIN PANEL</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-[#d90429]/10 text-white border-l-3 border-[#d90429]'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'news' && <NewsSection />}
          {activeSection === 'events' && <EventsSection />}
          {activeSection === 'podcasts' && <PodcastsSection />}
          {activeSection === 'shop' && <ShopSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </main>
    </div>
  );
}
