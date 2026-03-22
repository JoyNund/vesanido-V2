import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, Music, ShoppingBag, Package, User, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { shopService } from '../services/api';
import type { SavedTrack, Order } from '../types';

export default function PerfilPage() {
  const { user, isAuthenticated, logout, removeTrack } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'tracks' | 'orders' | 'account'>('tracks');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      const data = await shopService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display tracking-tight uppercase mb-2">
            Mi Perfil
          </h1>
          <p className="text-gray-500 tracking-widest text-sm">{user.email}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#0f0f0f] mb-8">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`px-6 py-3 text-sm tracking-widest uppercase transition-colors ${
              activeTab === 'tracks'
                ? 'border-b-2 border-[#d90429] text-[#d90429]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            Tracks Guardados
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 text-sm tracking-widest uppercase transition-colors ${
              activeTab === 'orders'
                ? 'border-b-2 border-[#d90429] text-[#d90429]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4 inline mr-2" />
            Mis Pedidos
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-6 py-3 text-sm tracking-widest uppercase transition-colors ${
              activeTab === 'account'
                ? 'border-b-2 border-[#d90429] text-[#d90429]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Cuenta
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'tracks' && (
          <div>
            {user.savedTracks && user.savedTracks.length > 0 ? (
              <div className="space-y-4">
                {user.savedTracks.map((track) => (
                  <div
                    key={track.id}
                    className="bg-white border border-[#0f0f0f] p-4 flex items-center gap-4"
                  >
                    {track.cover ? (
                      <div className="w-16 h-16 flex-shrink-0">
                        <img
                          src={track.cover}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                        <Music className="w-6 h-6 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display tracking-wide uppercase truncate">
                        {track.title}
                      </h3>
                      <p className="text-sm text-gray-500">{track.artist}</p>
                    </div>

                    <button
                      onClick={() => removeTrack(track.id)}
                      className="p-2 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-gray-500 tracking-widest">NO HAY TRACKS GUARDADOS</p>
                <p className="text-gray-400 text-sm mt-2">
                  Los tracks que guardes con el corazón aparecerán aquí
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-[#0f0f0f] p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-500 tracking-widest">
                          PEDIDO #{order.id.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs tracking-widest uppercase ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-12 h-12 border border-gray-200">
                              {item.product.image && !item.product.image.startsWith('linear-gradient') ? (
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-full h-full"
                                  style={{ background: item.product.image || '#f0f0f0' }}
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-display tracking-wide uppercase">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Cantidad: {item.quantity}
                              </p>
                            </div>
                            <p className="text-[#d90429] font-bold">
                              ${item.product.price * item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-[#0f0f0f] mt-4 pt-4 flex items-center justify-between">
                      <p className="text-sm text-gray-500">{order.shippingAddress}</p>
                      <p className="text-lg font-display uppercase">
                        Total: <span className="text-[#d90429]">${order.total}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-gray-500 tracking-widest">NO HAY PEDIDOS</p>
                <p className="text-gray-400 text-sm mt-2">
                  Tus compras aparecerán aquí
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="max-w-md">
            <div className="bg-white border border-[#0f0f0f] p-6 space-y-6">
              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                  <User className="w-3 h-3 inline mr-1" />
                  Nombre
                </label>
                <p className="text-lg">{user.name}</p>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                  <Mail className="w-3 h-3 inline mr-1" />
                  Email
                </label>
                <p className="text-lg">{user.email}</p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="w-full btn-modern py-3 text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                >
                  CERRAR SESIÓN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
