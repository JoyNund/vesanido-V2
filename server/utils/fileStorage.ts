import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

export async function readData(filename: string): Promise<any> {
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    await fs.access(filePath);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe, retornar array vacío o objeto vacío
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return filename.endsWith('.json') ? [] : {};
    }
    throw error;
  }
}

export async function writeData(filename: string, data: any): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Write data error:', error);
    throw error;
  }
}
