import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import express from 'express';
import cors from 'cors';
import { Server } from 'http';
import mcpRouter from '../../src/routes/mcp.js';

// Mock the mcpServers and githubEnrichment modules
vi.mock('../../src/lib/mcpServers.js', () => {
  const mockServer = {
    mcpId: 'github.com/modelcontextprotocol/servers/tree/main/src/slack',
    githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
    name: 'Slack',
    author: 'modelcontextprotocol',
    description: 'Enables AI assistants to interact with Slack workspaces',
    codiconIcon: 'comment-discussion',
    logoUrl: 'https://storage.googleapis.com/cline_public_images/slack.png',
    category: 'communication',
    tags: ['slack', 'messaging'],
    requiresApiKey: false,
    isRecommended: true,
    githubStars: 28615,
    createdAt: '2025-02-17T22:23:00.036614Z',
    updatedAt: '2025-02-17T22:23:00.036614Z',
    lastGithubSync: '2025-04-01T03:57:50.288993Z'
  };

  return {
    refreshCacheIfNeeded: vi.fn().mockResolvedValue([mockServer]),
    getCleanedServersData: vi.fn().mockReturnValue([mockServer])
  };
});

vi.mock('../../src/lib/githubEnrichment.js', () => {
  return {
    fetchReadmeContent: vi.fn().mockResolvedValue(
      '# Slack MCP Server\n\nMCP Server for the Slack API, enabling Claude to interact with Slack workspaces.\n\n## Tools\n\n1. slack_list_channels\n   - List public channels in the workspace'
    )
  };
});

describe('MCP API Download Endpoint', () => {
  let server: Server;
  let app: express.Express;
  const PORT = 4000;
  const BASE_URL = `http://localhost:${PORT}/v1/mcp`;

  beforeAll(async () => {
    // Create a test server
    app = express();
    app.use(express.json());
    app.use(cors());
    app.use('/v1/mcp', mcpRouter);

    // Start the server
    return new Promise<void>((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`Test server running on port ${PORT}`);
        resolve();
      });
    });
  });

  afterAll(() => {
    // Close the server after tests
    return new Promise<void>((resolve) => {
      server.close(() => {
        console.log('Test server closed');
        resolve();
      });
    });
  });

  it('should return server data with README content when given a valid mcpId', async () => {
    const response = await axios.post(`${BASE_URL}/download`, {
      mcpId: 'github.com/modelcontextprotocol/servers/tree/main/src/slack'
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('mcpId');
    expect(response.data).toHaveProperty('name', 'Slack');
    expect(response.data).toHaveProperty('readmeContent');
    expect(response.data.readmeContent).toContain('Slack MCP Server');
  });

  it('should return 400 when mcpId is not provided', async () => {
    try {
      await axios.post(`${BASE_URL}/download`, {});
      // If the request succeeds, fail the test
      expect(true).toBe(false); // This should not be reached
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toHaveProperty('error', 'mcpId is required');
    }
  });

  it('should return 404 when server with provided mcpId is not found', async () => {
    try {
      await axios.post(`${BASE_URL}/download`, {
        mcpId: 'invalid-mcp-id'
      });
      // If the request succeeds, fail the test
      expect(true).toBe(false); // This should not be reached
    } catch (error: any) {
      expect(error.response.status).toBe(404);
      expect(error.response.data).toHaveProperty('error', 'Server not found');
    }
  });
});
