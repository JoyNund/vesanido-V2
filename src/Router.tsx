import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PlayerProvider } from './context/PlayerContext';

// Páginas principales
import App from './App';
import NoticiasPage from './pages/Noticias';
import AgendaPage from './pages/Agenda';
import PodcastPage from './pages/Podcast';
import TiendaPage from './pages/Tienda';
import LoginPage from './pages/Login';
import PerfilPage from './pages/Perfil';
import AdminLoginPage from './pages/AdminLogin';
import AdminPage from './admin/AdminPage';

export default function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <PlayerProvider>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<App />} />
              <Route path="/noticias" element={<NoticiasPage />} />
              <Route path="/agenda" element={<AgendaPage />} />
              <Route path="/podcast" element={<PodcastPage />} />
              <Route path="/tienda" element={<TiendaPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Rutas protegidas de usuario */}
              <Route path="/perfil" element={<PerfilPage />} />
              
              {/* Rutas de admin */}
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </PlayerProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
