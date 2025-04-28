import { describe, it, expect, beforeAll } from 'vitest';
import { extractInfoFromReadme, fetchReadmeContent, fetchGithubStars, extractGithubRepoInfo } from '../../src/lib/githubEnrichment';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '..', '..', '.env');

// Force reload environment variables
dotenv.config({ path: envPath });

// Skip tests if OpenAI API key is not available
const runTests = Boolean(process.env.OPENAI_API_KEY);

// Sample GitHub repositories with README files to test
const TEST_REPOS = [
  {
    name: 'AWS Knowledge Base',
    url: 'https://github.com/sammcj/mcp-aws-kb',
    hubId: '0a0cff94-1f03-4d1f-b5cc-a41d464f575e'
  },
  {
    name: 'Hyperbrowser',
    url: 'https://docs.hyperbrowser.ai/guides/model-context-protocol',
    hubId: '0a18e1c1-8c3b-4fd4-b806-b2dc0326d734'
  }
];

// Only run these tests if an OpenAI API key is configured
(runTests ? describe : describe.skip)('OpenAI Integration Tests', () => {
  beforeAll(() => {
    // Ensure we have API credentials
    if (!process.env.OPENAI_API_KEY) {
      console.warn('Skipping OpenAI integration tests: No API key found in .env file');
      return;
    }
    
    console.log('Running OpenAI integration tests with real API calls');
    console.log(`API Base URL: ${process.env.OPENAI_BASE_URL}`);
    console.log(`Model: ${process.env.MODEL_NAME}`);
  });

  it('should fetch real READMEs from GitHub for all test repositories', async () => {
    for (const repo of TEST_REPOS) {
      console.log(`Testing repository: ${repo.name} (${repo.url})`);
      const readmeContent = await fetchReadmeContent(repo.url);
      
      // Log first 100 characters of the README for verification
      console.log(`Fetched README from ${repo.name} (${readmeContent.substring(0, 100)}...)`);
      
      expect(readmeContent).toBeTruthy();
      expect(readmeContent.length).toBeGreaterThan(100);
    }
  }, 20000); // Increased timeout for multiple network requests

  it('should extract information from GitHub READMEs using OpenAI for all test repositories', async () => {
    for (const repo of TEST_REPOS) {
      console.log(`Testing extraction for repository: ${repo.name} (${repo.url})`);
      const readmeContent = await fetchReadmeContent(repo.url);
      
      // Skip if README couldn't be fetched
      if (!readmeContent) {
        console.warn(`Skipping extraction test: Could not fetch README from ${repo.url}`);
        continue;
      }
      
      console.log(`Extracting information from ${repo.name} README using OpenAI...`);
      const extractedInfo = await extractInfoFromReadme(readmeContent);
      
      // Log the extracted information
      console.log(`Extracted information for ${repo.name}:`, JSON.stringify(extractedInfo, null, 2));
      
      // Basic validation of extracted fields
      expect(extractedInfo).toBeTruthy();
      expect(extractedInfo.name).toBeTruthy();
      expect(extractedInfo.description).toBeTruthy();
      
      // Save the extracted results for manual inspection
      const testResultsDir = path.resolve(__dirname, '..', 'results');
      
      try {
        // Create results directory if it doesn't exist
        if (!fs.existsSync(testResultsDir)) {
          fs.mkdirSync(testResultsDir, { recursive: true });
        }
        
        // Save the extracted information
        const resultsPath = path.join(testResultsDir, `${repo.hubId}_test_results.json`);
        fs.writeFileSync(
          resultsPath, 
          JSON.stringify({ 
            repository: repo,
            readmePreview: readmeContent.substring(0, 500) + (readmeContent.length > 500 ? '...' : ''),
            extractedInfo 
          }, null, 2)
        );
        
        console.log(`Test results saved to ${resultsPath}`);
      } catch (error) {
        console.error(`Error saving test results for ${repo.name}:`, error);
      }
    }
  }, 60000); // Increased timeout for multiple AI processing requests

  it('should extract GitHub repository information and fetch star counts', async () => {
    // Test GitHub URLs
    const testUrls = [
      'https://github.com/modelcontextprotocol/servers/',
      'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
      'https://github.com/mcp-agents-ai/mcp-agents-hub'
    ];

    for (const url of testUrls) {
      console.log(`Testing GitHub stars extraction for: ${url}`);
      
      // Test extractGithubRepoInfo function
      const repoInfo = extractGithubRepoInfo(url);
      expect(repoInfo).not.toBeNull();
      
      if (repoInfo) {
        console.log(`Extracted repo info: ${repoInfo.owner}/${repoInfo.repo}`);
        
        // For URLs with path components (like /tree/main/...), the base repo should be extracted
        if (url.includes('/tree/')) {
          // The repo name should not include the path components
          expect(repoInfo.repo).not.toContain('tree');
        }
        
        // Test fetchGithubStars function
        const stars = await fetchGithubStars(url);
        console.log(`Repository ${repoInfo.owner}/${repoInfo.repo} has ${stars} stars`);
        
        // The star count should be a number or null (in case of API errors)
        if (stars !== null) {
          expect(typeof stars).toBe('number');
          expect(stars).toBeGreaterThanOrEqual(0);
        }
        
        // Save the results for manual inspection
        const testResultsDir = path.resolve(__dirname, '..', 'results');
        try {
          // Create results directory if it doesn't exist
          if (!fs.existsSync(testResultsDir)) {
            fs.mkdirSync(testResultsDir, { recursive: true });
          }
          
          // Save the stars information
          const resultsPath = path.join(testResultsDir, `github_stars_${repoInfo.owner}_${repoInfo.repo}.json`);
          fs.writeFileSync(
            resultsPath, 
            JSON.stringify({ 
              url,
              repoInfo,
              stars,
              fetchedAt: new Date().toISOString() 
            }, null, 2)
          );
          
          console.log(`GitHub stars test results saved to ${resultsPath}`);
        } catch (error) {
          console.error(`Error saving GitHub stars test results for ${url}:`, error);
        }
      }
    }
  }, 20000); // Timeout for GitHub API requests

  it('should correctly extract repository information from various GitHub URL formats', () => {
    // Test cases with different URL formats
    const testCases = [
      {
        url: 'https://github.com/modelcontextprotocol/servers',
        expectedOwner: 'modelcontextprotocol',
        expectedRepo: 'servers'
      },
      {
        url: 'https://github.com/modelcontextprotocol/servers/',
        expectedOwner: 'modelcontextprotocol',
        expectedRepo: 'servers'
      },
      {
        url: 'https://github.com/modelcontextprotocol/servers/tree/main',
        expectedOwner: 'modelcontextprotocol',
        expectedRepo: 'servers'
      },
      {
        url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
        expectedOwner: 'modelcontextprotocol',
        expectedRepo: 'servers'
      },
      {
        url: 'https://github.com/mcp-agents-ai/mcp-agents-hub/blob/main/README.md',
        expectedOwner: 'mcp-agents-ai',
        expectedRepo: 'mcp-agents-hub'
      },
      {
        url: 'https://github.com/user/repo/issues/123',
        expectedOwner: 'user',
        expectedRepo: 'repo'
      },
      {
        url: 'https://github.com/user/repo/pull/456',
        expectedOwner: 'user',
        expectedRepo: 'repo'
      }
    ];

    for (const testCase of testCases) {
      console.log(`Testing URL format: ${testCase.url}`);
      const repoInfo = extractGithubRepoInfo(testCase.url);
      
      expect(repoInfo).not.toBeNull();
      if (repoInfo) {
        expect(repoInfo.owner).toBe(testCase.expectedOwner);
        expect(repoInfo.repo).toBe(testCase.expectedRepo);
        console.log(`✓ Correctly extracted ${repoInfo.owner}/${repoInfo.repo}`);
      }
    }

    // Also test invalid URL formats
    const invalidUrls = [
      'https://github.com',
      'https://github.com/',
      'https://gitlab.com/user/repo',
      'https://example.com/github/user/repo',
      'not-a-url'
    ];

    for (const url of invalidUrls) {
      console.log(`Testing invalid URL: ${url}`);
      const repoInfo = extractGithubRepoInfo(url);
      expect(repoInfo).toBeNull();
      console.log(`✓ Correctly returned null for invalid URL`);
    }
  });
});