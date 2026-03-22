import { Router, Request, Response } from 'express';
import { readData, writeData } from '../utils/fileStorage';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/user/profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const users = await readData('users.json') as any[];
    const user = users.find(u => u.id === req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const users = await readData('users.json') as any[];
    const userIndex = users.findIndex(u => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, email } = req.body;
    
    if (email) {
      const existingUser = users.find(u => u.email === email && u.id !== req.userId);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      users[userIndex].email = email;
    }
    
    if (name) {
      users[userIndex].name = name;
    }

    await writeData('users.json', users);

    const { password, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/user/saved-tracks
router.post('/saved-tracks', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const users = await readData('users.json') as any[];
    const userIndex = users.findIndex(u => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { artist, title, cover } = req.body;
    
    const track = {
      id: Date.now().toString(),
      artist,
      title,
      cover,
      savedAt: new Date().toISOString(),
    };

    users[userIndex].savedTracks.push(track);
    await writeData('users.json', users);

    const { password, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Save track error:', error);
    res.status(500).json({ error: 'Failed to save track' });
  }
});

// DELETE /api/user/saved-tracks/:trackId
router.delete('/saved-tracks/:trackId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const users = await readData('users.json') as any[];
    const userIndex = users.findIndex(u => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].savedTracks = users[userIndex].savedTracks.filter(
      (t: any) => t.id !== req.params.trackId
    );

    await writeData('users.json', users);

    const { password, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Remove track error:', error);
    res.status(500).json({ error: 'Failed to remove track' });
  }
});

export default router;
