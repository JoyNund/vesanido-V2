import { Router, Request, Response } from 'express';
import { readData, writeData } from '../utils/fileStorage';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/news - Obtener todas las noticias
router.get('/', async (req: Request, res: Response) => {
  try {
    const news = await readData('news.json');
    res.json(news);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to get news' });
  }
});

// GET /api/news/:id - Obtener noticia por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const news = await readData('news.json') as any[];
    const item = news.find(n => n.id === req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to get news' });
  }
});

// POST /api/news - Crear nueva noticia (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const news = await readData('news.json') as any[];
    const newItem = {
      ...req.body,
      id: Date.now().toString(),
    };

    news.push(newItem);
    await writeData('news.json', news);

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// PUT /api/news/:id - Actualizar noticia (admin)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const news = await readData('news.json') as any[];
    const index = news.findIndex(n => n.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'News not found' });
    }

    news[index] = { ...news[index], ...req.body };
    await writeData('news.json', news);

    res.json(news[index]);
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Failed to update news' });
  }
});

// DELETE /api/news/:id - Eliminar noticia (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const news = await readData('news.json') as any[];
    const filtered = news.filter(n => n.id !== req.params.id);

    if (filtered.length === news.length) {
      return res.status(404).json({ error: 'News not found' });
    }

    await writeData('news.json', filtered);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

export default router;
