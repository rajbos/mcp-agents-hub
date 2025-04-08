import { Router, Request, Response } from 'express';
import { McpServer, refreshCacheIfNeeded, getCleanedServersData } from '../lib/mcpServers.js';
import { fetchReadmeContent } from '../lib/githubEnrichment.js';

const router = Router();

// GET /servers 
router.get('/servers', async (req: Request, res: Response): Promise<void> => {
  try {
    const mcpServersCache = await refreshCacheIfNeeded();
    
    // Return cleaned data without hubId
    const cleanedData = getCleanedServersData(mcpServersCache);
    res.json(cleanedData);
    console.log(`v1/mcp/servers Served cached MCP servers data at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error serving MCP servers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /download - Get server data with README content
router.post('/download', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { mcpId } = req.body;
    if (!mcpId) {
      res.status(400).json({ error: 'mcpId is required' });
      return;
    }

    // Get the latest servers data
    const mcpServersCache = await refreshCacheIfNeeded();
    
    // Find the requested server by mcpId
    const server = mcpServersCache.find(server => server.mcpId === mcpId);
    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    // Get README content if GitHub URL is available
    let readmeContent = '';
    if (server.githubUrl) {
      try {
        readmeContent = await fetchReadmeContent(server.githubUrl);
      } catch (readmeError) {
        console.error(`Error fetching README for ${server.mcpId}:`, readmeError);
        // Continue even if README fetch fails
      }
    }

    // Prepare the response data
    const responseData = {
      ...server,
      readmeContent
    };

    // Return the enriched server data
    res.json(responseData);
    console.log(`v1/mcp/download Served data for ${server.mcpId} at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error serving server download data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;