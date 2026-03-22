import { Router, Request, Response } from 'express';
import { readData, writeData } from '../utils/fileStorage';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/config - Obtener configuración
router.get('/', async (req: Request, res: Response) => {
  try {
    const config = await readData('config.json');
    res.json(config);
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Failed to get config' });
  }
});

// POST /api/config - Actualizar configuración (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await writeData('config.json', req.body);
    res.json({ success: true, config: req.body });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

export default router;
