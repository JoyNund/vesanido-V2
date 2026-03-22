import { Router, Request, Response } from 'express';
import { readData, writeData } from '../utils/fileStorage';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// ==================== PRODUCTOS ====================

// GET /api/shop/products - Obtener todos los productos
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await readData('products.json');
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// GET /api/shop/products/:id - Obtener producto por ID
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const products = await readData('products.json') as any[];
    const item = products.find(p => p.id === req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// POST /api/shop/products - Crear nuevo producto (admin)
router.post('/products', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const products = await readData('products.json') as any[];
    const newItem = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    products.push(newItem);
    await writeData('products.json', products);

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/shop/products/:id - Actualizar producto (admin)
router.put('/products/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const products = await readData('products.json') as any[];
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products[index] = { ...products[index], ...req.body };
    await writeData('products.json', products);

    res.json(products[index]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/shop/products/:id - Eliminar producto (admin)
router.delete('/products/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const products = await readData('products.json') as any[];
    const filtered = products.filter(p => p.id !== req.params.id);

    if (filtered.length === products.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await writeData('products.json', filtered);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ==================== ÓRDENES ====================

// GET /api/shop/orders/my-orders - Obtener mis órdenes (usuario)
router.get('/orders/my-orders', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await readData('orders.json') as any[];
    const userOrders = orders.filter(o => o.userId === req.userId);
    res.json(userOrders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// GET /api/shop/orders - Obtener todas las órdenes (admin)
router.get('/orders', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await readData('orders.json');
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// POST /api/shop/orders - Crear nueva orden (usuario)
router.post('/orders', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    const products = await readData('products.json') as any[];
    
    // Verificar stock y calcular total
    let total = 0;
    for (const item of items) {
      const product = products.find(p => p.id === item.product.id);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.product.id} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      total += product.price * item.quantity;
    }

    const orders = await readData('orders.json') as any[];
    const newOrder = {
      id: Date.now().toString(),
      userId: req.userId,
      items,
      total,
      status: 'pending' as const,
      shippingAddress,
      createdAt: new Date().toISOString(),
    };

    // Actualizar stock
    for (const item of items) {
      const productIndex = products.findIndex(p => p.id === item.product.id);
      products[productIndex].stock -= item.quantity;
    }
    await writeData('products.json', products);

    orders.push(newOrder);
    await writeData('orders.json', orders);

    // Actualizar usuario
    const users = await readData('users.json') as any[];
    const userIndex = users.findIndex(u => u.id === req.userId);
    if (userIndex !== -1) {
      users[userIndex].orders.push(newOrder.id);
      await writeData('users.json', users);
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /api/shop/orders/:id/status - Actualizar estado de orden (admin)
router.put('/orders/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await readData('orders.json') as any[];
    const index = orders.findIndex(o => o.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { status } = req.body;
    orders[index].status = status;
    await writeData('orders.json', orders);

    res.json(orders[index]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
