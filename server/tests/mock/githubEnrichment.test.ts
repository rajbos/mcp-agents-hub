import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractInfoFromReadme } from '../../src/lib/githubEnrichment';
import OpenAI from 'openai';

// Mock the OpenAI module
vi.mock('openai', () => {
  const OpenAIMock = vi.fn();
  OpenAIMock.prototype.chat = {
    completions: {
      create: vi.fn()
    }
  };
  return { default: OpenAIMock };
});

// Mock the config module
vi.mock('../../src/lib/config', () => ({
  config: {
    openai: {
      apiKey: 'test-api-key',
      baseURL: 'https://test-api-url.com',
      modelName: 'test-model',
      apiKeyIsValid: true
    },
    cache: {
      ttl: 3600000
    }
  }
}));

describe('extractInfoFromReadme', () => {
  const mockOpenAIInstance = new OpenAI() as any;
  const mockCreateCompletion = mockOpenAIInstance.chat.completions.create;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should extract information from README content successfully', async () => {
    // Sample README markdown content for testing
    const sampleReadme = `
# Sample MCP Server

This is a sample MCP server that demonstrates how to integrate with the Model Context Protocol.

## Features

- Feature 1: Real-time data processing
- Feature 2: Cross-platform compatibility
- Feature 3: Low latency responses

## Installation

To install this server, run:

\`\`\`bash
npm install sample-mcp-server
\`\`\`

## Usage

Here's how to use the server:

\`\`\`typescript
import { MCPServer } from 'sample-mcp-server';

const server = new MCPServer();
await server.start();
console.log('Server is running!');
\`\`\`

## Prerequisites

- Node.js v18 or higher
- OpenAI API key
`;

    // Mock the OpenAI response
    const mockResponseData = {
      choices: [
        {
          message: {
            content: `{
              "name": "Sample MCP Server",
              "description": "This is a sample MCP server that demonstrates how to integrate with the Model Context Protocol.",
              "Installation_instructions": "To install this server, run: npm install sample-mcp-server",
              "Usage_instructions": "Import the MCPServer class, create an instance, and call the start method.",
              "features": [
                "Real-time data processing",
                "Cross-platform compatibility",
                "Low latency responses"
              ],
              "prerequisites": [
                "Node.js v18 or higher",
                "OpenAI API key"
              ]
            }`
          }
        }
      ]
    };

    // Configure the mock to return our sample response
    mockCreateCompletion.mockResolvedValueOnce(mockResponseData);

    // Call the function with our sample README content
    const result = await extractInfoFromReadme(sampleReadme);

    // Verify that the OpenAI API was called with the expected parameters
    expect(mockCreateCompletion).toHaveBeenCalledTimes(1);
    expect(mockCreateCompletion).toHaveBeenCalledWith({
      messages: [
        { role: 'system', content: 'You are a helpful assistant that extracts structured information from README files.' },
        { role: 'user', content: expect.stringContaining('please use the README.md content to extra the following infomration in a json format') }
      ],
      model: 'test-model'
    });

    // Assert the expected output matches what we got from the function
    expect(result).toEqual({
      name: 'Sample MCP Server',
      description: 'This is a sample MCP server that demonstrates how to integrate with the Model Context Protocol.',
      Installation_instructions: 'To install this server, run: npm install sample-mcp-server',
      Usage_instructions: 'Import the MCPServer class, create an instance, and call the start method.',
      features: [
        'Real-time data processing',
        'Cross-platform compatibility',
        'Low latency responses'
      ],
      prerequisites: [
        'Node.js v18 or higher',
        'OpenAI API key'
      ]
    });
  });

  it('should handle empty README content gracefully', async () => {
    const result = await extractInfoFromReadme('');

    expect(mockCreateCompletion).not.toHaveBeenCalled();
    expect(result).toEqual({
      name: '',
      description: '',
      Installation_instructions: '',
      Usage_instructions: '',
      features: [],
      prerequisites: []
    });
  });

  it('should handle OpenAI API errors gracefully', async () => {
    const sampleReadme = '# Sample README\n\nThis is a test.';
    
    // Simulate an API error
    mockCreateCompletion.mockRejectedValueOnce(new Error('API Error'));

    const result = await extractInfoFromReadme(sampleReadme);

    expect(mockCreateCompletion).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      name: '',
      description: '',
      Installation_instructions: '',
      Usage_instructions: '',
      features: [],
      prerequisites: []
    });
  });

  it('should handle malformed JSON responses from OpenAI', async () => {
    const sampleReadme = '# Sample README\n\nThis is a test.';
    
    // Mock a malformed JSON response
    const mockBadResponseData = {
      choices: [
        {
          message: {
            content: 'This is not JSON'
          }
        }
      ]
    };

    mockCreateCompletion.mockResolvedValueOnce(mockBadResponseData);

    const result = await extractInfoFromReadme(sampleReadme);

    expect(mockCreateCompletion).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      name: '',
      description: '',
      Installation_instructions: '',
      Usage_instructions: '',
      features: [],
      prerequisites: []
    });
  });
});