import { MCPServer } from '../types';
import { SupportedLanguage } from '../contexts/LanguageContext';

export async function fetchMCPServers(locale?: SupportedLanguage): Promise<MCPServer[]> {
  try {
    // Build URL with locale query parameter if provided
    const url = locale 
      ? `/v1/hub/servers?locale=${locale}`
      : '/v1/hub/servers';
      
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch MCP servers');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching MCP servers:', error);
    return [];
  }
}