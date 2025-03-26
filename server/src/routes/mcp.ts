import { Router } from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// GET /v1/mcp/servers
router.get('/servers', async (_req, res) => {
  try {
    const filePath = join(__dirname, '..', 'data', 'mcp-servers.json');
    const data = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading MCP servers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;