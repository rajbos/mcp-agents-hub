import { Router } from 'express';
import { refreshCacheIfNeeded } from '../lib/mcpServers.js';

const router = Router();

// GET /servers - returns server data with hubId included
router.get('/servers', async (_req, res) => {
  try {
    const mcpServersCache = await refreshCacheIfNeeded();
    
    // Return full data including hubId
    res.json(mcpServersCache);
    console.log(`v1/hub/servers Served full MCP servers data (including hubId) at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error serving hub MCP servers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;