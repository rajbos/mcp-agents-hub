export interface MCPServer {
  mcpId: string;
  githubUrl: string;
  name: string;
  author: string;
  description: string;
  codiconIcon: string;
  logoUrl: string;
  category: string;
  tags: string[];
  requiresApiKey: boolean;
  isRecommended: boolean;
  githubStars: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  hubId?: string; // Added hubId field for server details navigation
  Installation_instructions?: string;
  Usage_instructions?: string;
  features?: string[];
  prerequisites?: string[];
  lastEnrichmentTime?: number;
}