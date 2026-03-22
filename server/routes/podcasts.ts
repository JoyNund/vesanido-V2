import { Router, Request, Response } from 'express';
import { readData, writeData } from '../utils/fileStorage';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/podcasts - Obtener todos los podcasts
router.get('/', async (req: Request, res: Response) => {
  try {
    const podcasts = await readData('podcasts.json');
    res.json(podcasts);
  } catch (error) {
    console.error('Get podcasts error:', error);
    res.status(500).json({ error: 'Failed to get podcasts' });
  }
});

// GET /api/podcasts/:id - Obtener podcast por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const podcasts = await readData('podcasts.json') as any[];
    const item = podcasts.find(p => p.id === req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get podcast error:', error);
    res.status(500).json({ error: 'Failed to get podcast' });
  }
});

// POST /api/podcasts - Crear nuevo podcast (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const podcasts = await readData('podcasts.json') as any[];
    const newItem = {
      ...req.body,
      id: Date.now().toString(),
      episodes: [],
    };

    podcasts.push(newItem);
    await writeData('podcasts.json', podcasts);

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Create podcast error:', error);
    res.status(500).json({ error: 'Failed to create podcast' });
  }
});

// PUT /api/podcasts/:id - Actualizar podcast (admin)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const podcasts = await readData('podcasts.json') as any[];
    const index = podcasts.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    podcasts[index] = { ...podcasts[index], ...req.body };
    await writeData('podcasts.json', podcasts);

    res.json(podcasts[index]);
  } catch (error) {
    console.error('Update podcast error:', error);
    res.status(500).json({ error: 'Failed to update podcast' });
  }
});

// DELETE /api/podcasts/:id - Eliminar podcast (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const podcasts = await readData('podcasts.json') as any[];
    const filtered = podcasts.filter(p => p.id !== req.params.id);

    if (filtered.length === podcasts.length) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    await writeData('podcasts.json', filtered);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete podcast error:', error);
    res.status(500).json({ error: 'Failed to delete podcast' });
  }
});

// POST /api/podcasts/:podcastId/episodes - Agregar episodio (admin)
router.post('/:podcastId/episodes', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const podcasts = await readData('podcasts.json') as any[];
    const index = podcasts.findIndex(p => p.id === req.params.podcastId);

    if (index === -1) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    const newEpisode = {
      ...req.body,
      id: Date.now().toString(),
      podcastId: req.params.podcastId,
      publishedAt: new Date().toISOString(),
    };

    podcasts[index].episodes.push(newEpisode);
    await writeData('podcasts.json', podcasts);

    res.status(201).json(newEpisode);
  } catch (error) {
    console.error('Add episode error:', error);
    res.status(500).json({ error: 'Failed to add episode' });
  }
});

export default router;
