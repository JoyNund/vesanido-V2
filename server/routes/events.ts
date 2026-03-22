import { Router, Request, Response } from 'express';
import { readData, writeData } from '../utils/fileStorage';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/events - Obtener todos los eventos
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await readData('events.json');
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// GET /api/events/:id - Obtener evento por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const events = await readData('events.json') as any[];
    const item = events.find(e => e.id === req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// POST /api/events - Crear nuevo evento (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const events = await readData('events.json') as any[];
    const newItem = {
      ...req.body,
      id: Date.now().toString(),
    };

    events.push(newItem);
    await writeData('events.json', events);

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Actualizar evento (admin)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const events = await readData('events.json') as any[];
    const index = events.findIndex(e => e.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    events[index] = { ...events[index], ...req.body };
    await writeData('events.json', events);

    res.json(events[index]);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Eliminar evento (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const events = await readData('events.json') as any[];
    const filtered = events.filter(e => e.id !== req.params.id);

    if (filtered.length === events.length) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await writeData('events.json', filtered);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
