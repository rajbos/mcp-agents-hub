import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">MCP</h3>
            <p className="text-base text-gray-500">
              Building the future of AI integration with open standards and collaborative development.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-base text-gray-500 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-base text-gray-500 hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-base text-gray-500 hover:text-gray-900">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://github.com/mcp-agents-ai/mcp-marketplace" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-gray-900">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                  Examples
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Community</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                  Discord Server
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                  Newsletter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-8">
          <a href="https://github.com/mcp-agents-ai/mcp-marketplace" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
            <Github className="h-6 w-6" />
          </a>
          <a href="https://twitter.com/mcp_agents_ai" className="text-gray-400 hover:text-gray-500">
            <Twitter className="h-6 w-6" />
          </a>
          <a href="https://www.linkedin.com/company/mcp-agents-ai" className="text-gray-400 hover:text-gray-500">
            <Linkedin className="h-6 w-6" />
          </a>
          <a href="mailto:contact@mcpagents.dev" className="text-gray-400 hover:text-gray-500">
            <Mail className="h-6 w-6" />
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-center text-base text-gray-400">
            © 2025 MCP Marketplace. All rights reserved.
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            Made with <Heart className="h-4 w-4 inline text-red-500" /> by the MCP Community
          </p>
        </div>
      </div>
    </footer>
  );
}