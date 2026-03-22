import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { shopService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types';

export default function TiendaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCart, setShowCart] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
  });
  const [processingOrder, setProcessingOrder] = useState(false);

  const { items, total, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await shopService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/tienda' } });
      return;
    }

    setProcessingOrder(true);
    try {
      const shippingAddress = `${checkoutData.address}, ${checkoutData.city}, ${checkoutData.zipCode}`;
      await shopService.createOrder(items, shippingAddress);
      alert('¡Orden creada exitosamente!');
      setShowCart(false);
      setCheckoutData({ name: '', email: '', address: '', city: '', zipCode: '' });
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Error al crear la orden');
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d90429] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 tracking-widest text-sm">CARGANDO TIENDA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b border-[#0f0f0f] pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display tracking-tight uppercase">
              Tienda
            </h1>
            <p className="text-gray-500 font-medium tracking-widest text-sm mt-2">
              MERCH OFICIAL Y SELLOS INDEPENDIENTES
            </p>
          </div>

          <button
            onClick={() => setShowCart(true)}
            className="relative p-3 border border-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#d90429] text-white text-xs rounded-full flex items-center justify-center">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filtros de Categoría */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs tracking-widest uppercase border transition-colors ${
                selectedCategory === category
                  ? 'bg-[#0f0f0f] text-white border-[#0f0f0f]'
                  : 'border-gray-300 text-gray-600 hover:border-[#0f0f0f]'
              }`}
            >
              {category === 'all' ? 'Todos' : category}
            </button>
          ))}
        </div>

        {/* Productos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-gray-500 tracking-widest">NO HAY PRODUCTOS DISPONIBLES</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card-sharp group">
                <div className="relative overflow-hidden aspect-square border-b border-[#0f0f0f]">
                  {product.image && !product.image.startsWith('linear-gradient') ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: product.image || '#f0f0f0' }}
                    />
                  )}
                  
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm tracking-widest bg-[#d90429] px-3 py-1">
                        AGOTADO
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-display tracking-wide uppercase mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[#d90429] font-bold text-lg">${product.price}</span>
                    <button
                      onClick={() => addItem(product, 1)}
                      disabled={product.stock === 0}
                      className="p-2 border border-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCart(false)}
          />

          {/* Cart Panel */}
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display tracking-wide uppercase">Carrito</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-gray-500 tracking-widest text-sm">CARRITO VACÍO</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-4 text-[#d90429] text-sm tracking-widest hover:underline"
                  >
                    CONTINUAR COMPRANDO
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-4 border-b border-gray-200 pb-4">
                        <div className="w-20 h-20 flex-shrink-0 border border-gray-200">
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
                          <h4 className="text-sm font-display tracking-wide uppercase">
                            {item.product.name}
                          </h4>
                          <p className="text-[#d90429] font-bold text-sm mt-1">
                            ${item.product.price}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="p-1 border border-gray-300 hover:bg-gray-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="p-1 border border-gray-300 hover:bg-gray-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="ml-auto p-1 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t border-[#0f0f0f] pt-4 mb-6">
                    <div className="flex items-center justify-between text-lg font-display uppercase">
                      <span>Total</span>
                      <span className="text-[#d90429]">${total}</span>
                    </div>
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={checkoutData.name}
                        onChange={(e) =>
                          setCheckoutData({ ...checkoutData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#0f0f0f]"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={checkoutData.email}
                        onChange={(e) =>
                          setCheckoutData({ ...checkoutData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#0f0f0f]"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Dirección"
                        value={checkoutData.address}
                        onChange={(e) =>
                          setCheckoutData({ ...checkoutData, address: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#0f0f0f]"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Ciudad"
                        value={checkoutData.city}
                        onChange={(e) =>
                          setCheckoutData({ ...checkoutData, city: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#0f0f0f]"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Código Postal"
                        value={checkoutData.zipCode}
                        onChange={(e) =>
                          setCheckoutData({ ...checkoutData, zipCode: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#0f0f0f]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={processingOrder}
                      className="w-full btn-modern primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      {processingOrder ? 'PROCESANDO...' : 'REALIZAR PEDIDO'}
                    </button>

                    {!isAuthenticated && (
                      <p className="text-xs text-gray-500 text-center">
                        Necesitas iniciar sesión para completar la compra
                      </p>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
