import { Comment } from '../types';

const STORAGE_KEY = 'vesanico_comments_db';

// Initial fake data to populate the empty state
const INITIAL_DATA: Comment[] = [
  {
    id: '1',
    author: 'Sombra',
    avatarSeed: 'Sombra',
    content: '¡Larga vida al post-punk! Desde Chile escuchando.',
    timestamp: Date.now() - 1000000,
  },
  {
    id: '2',
    author: 'Venen0',
    avatarSeed: 'Venen0',
    content: '¿Alguien sabe cómo se llama este tema? Suena a Joy Division pero más sucio.',
    timestamp: Date.now() - 500000,
  },
  {
    id: '3',
    author: 'Radio Vesánico',
    avatarSeed: 'Admin',
    content: 'Bienvenidos al abismo. Sube el volumen hasta que duelan los dientes.',
    timestamp: Date.now() - 200000,
    isAdmin: true
  }
];

export const getComments = (): Promise<Comment[]> => {
  return new Promise((resolve) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      resolve(INITIAL_DATA);
    } else {
      resolve(JSON.parse(stored));
    }
  });
};

export const postComment = (author: string, content: string): Promise<Comment> => {
  return new Promise((resolve) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author,
      avatarSeed: author + Date.now().toString(),
      content,
      timestamp: Date.now()
    };
    
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = [...stored, newComment];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Simulate network delay
    setTimeout(() => resolve(newComment), 400);
  });
};

export const deleteComment = (id: string): Promise<void> => {
  return new Promise((resolve) => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = stored.filter((c: Comment) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    resolve();
  });
};