import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, ImageIcon, Package, DollarSign } from 'lucide-react';
import { shopService, uploadService } from '../../services/api';
import type { Product, Order } from '../../types';

type ProductCategory = 'vinilos' | 'cassettes' | 'merch' | 'ropa' | 'accesorios';

export default function ShopSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'vinilos' as ProductCategory,
    image: '',
    description: '',
    stock: '',
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, ordersData] = await Promise.all([
        shopService.getProducts(),
        shopService.getAllOrders(),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item?: Product) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price.toString(),
        category: item.category,
        image: item.image || '',
        description: item.description || '',
        stock: item.stock.toString(),
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        price: '',
        category: 'vinilos',
        image: '',
        description: '',
        stock: '',
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

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image,
      description: formData.description,
      stock: parseInt(formData.stock),
      featured: false,
      createdAt: new Date().toISOString(),
    };

    try {
      if (editingItem) {
        await shopService.updateProduct(editingItem.id, productData);
      } else {
        await shopService.createProduct(productData);
      }
      loadData();
      closeModal();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Error al guardar producto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await shopService.deleteProduct(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Error al eliminar producto');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await shopService.updateOrderStatus(orderId, status);
      loadData();
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Error al actualizar estado');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
      case 'paid':
        return 'bg-blue-900/50 text-blue-400 border-blue-700';
      case 'shipped':
        return 'bg-purple-900/50 text-purple-400 border-purple-700';
      case 'delivered':
        return 'bg-green-900/50 text-green-400 border-green-700';
      case 'cancelled':
        return 'bg-red-900/50 text-red-400 border-red-700';
      default:
        return 'bg-gray-900/50 text-gray-400 border-gray-700';
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
        <h2 className="text-3xl font-display tracking-wide uppercase">Tienda</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#d90429] text-white rounded-lg hover:bg-[#ff1744] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuevo Producto</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 text-sm tracking-widest uppercase transition-colors ${
            activeTab === 'products'
              ? 'border-b-2 border-[#d90429] text-[#d90429]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Productos
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 text-sm tracking-widest uppercase transition-colors ${
            activeTab === 'orders'
              ? 'border-b-2 border-[#d90429] text-[#d90429]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Órdenes
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No hay productos en la tienda
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-[#1a1a20] border border-gray-800 rounded-xl overflow-hidden"
              >
                <div className="aspect-square relative">
                  {product.image && !product.image.startsWith('linear-gradient') ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: product.image || '#1a1a20' }}
                    />
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => openModal(product)}
                      className="p-2 bg-black/50 hover:bg-[#d90429] rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-black/50 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-display tracking-wide uppercase mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#d90429] font-bold text-lg">${product.price}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        product.stock > 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                      }`}
                    >
                      Stock: {product.stock}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 uppercase">{product.category}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay órdenes registradas
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#1a1a20] border border-gray-800 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-display uppercase">Orden #{order.id.slice(-6)}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                    className={`px-3 py-1 rounded text-sm border ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{order.shippingAddress}</span>
                    <span className="font-display text-lg text-[#d90429]">${order.total}</span>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="text-gray-500">${item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={closeModal} />

          <div className="relative bg-[#1a1a20] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1a1a20] border-b border-gray-800 p-6 flex items-center justify-between">
              <h3 className="text-xl font-display tracking-wide uppercase">
                {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                    Precio
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429]"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429]"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429]"
                >
                  <option value="vinilos">Vinilos</option>
                  <option value="cassettes">Cassettes</option>
                  <option value="merch">Merch</option>
                  <option value="ropa">Ropa</option>
                  <option value="accesorios">Accesorios</option>
                </select>
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
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
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
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f0f13] border border-gray-700 rounded-lg focus:outline-none focus:border-[#d90429] resize-none"
                  rows={4}
                  required
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
