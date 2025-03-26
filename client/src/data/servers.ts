import { MCPServer } from '../types';

export const mcpServers: MCPServer[] = [];

export async function fetchMCPServers(): Promise<MCPServer[]> {
  try {
    const response = await fetch('/v1/mcp/servers');
    if (!response.ok) {
      throw new Error('Failed to fetch MCP servers');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching MCP servers:', error);
    return [];
  }
}