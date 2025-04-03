import { describe, it, expect } from 'vitest';
import { convertToRawReadmeUrl } from '../../src/lib/githubEnrichment';

describe('GitHub URL conversion', () => {
  it('should convert repository root URLs to raw README URLs', () => {
    const input = 'https://github.com/modelcontextprotocol/servers';
    const expected = 'https://raw.githubusercontent.com/modelcontextprotocol/servers/refs/heads/main/README.md';
    expect(convertToRawReadmeUrl(input)).toBe(expected);
  });

  it('should handle repository root URLs with trailing slash', () => {
    const input = 'https://github.com/modelcontextprotocol/servers/';
    const expected = 'https://raw.githubusercontent.com/modelcontextprotocol/servers/refs/heads/main/README.md';
    expect(convertToRawReadmeUrl(input)).toBe(expected);
  });

  it('should convert subfolder URLs to raw README URLs in that subfolder', () => {
    const input = 'https://github.com/modelcontextprotocol/servers/tree/main/src/aws-kb-retrieval-server';
    const expected = 'https://raw.githubusercontent.com/modelcontextprotocol/servers/refs/heads/main/src/aws-kb-retrieval-server/README.md';
    expect(convertToRawReadmeUrl(input)).toBe(expected);
  });

  it('should handle different subfolder paths', () => {
    const input = 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory';
    const expected = 'https://raw.githubusercontent.com/modelcontextprotocol/servers/refs/heads/main/src/memory/README.md';
    expect(convertToRawReadmeUrl(input)).toBe(expected);
  });

  it('should handle deep nesting and different branches', () => {
    const input = 'https://github.com/modelcontextprotocol/servers/tree/development/src/deep/nested/folder';
    const expected = 'https://raw.githubusercontent.com/modelcontextprotocol/servers/refs/heads/development/src/deep/nested/folder/README.md';
    expect(convertToRawReadmeUrl(input)).toBe(expected);
  });

  it('should throw an error for invalid GitHub URLs', () => {
    const input = 'https://github.com/user';
    expect(() => convertToRawReadmeUrl(input)).toThrow('Invalid GitHub URL format');
  });
});