import React from 'react';
import { Plug, GitBranch, Users } from 'lucide-react';

export function About() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Model Context Protocol
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto text-center leading-relaxed">
            An open standard that enables developers to build secure, two-way connections between their data sources and AI-powered tools.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Architecture Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Simple Yet Powerful Architecture</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            The architecture is straightforward: developers can either expose their data through MCP servers or build AI applications (MCP clients) that connect to these servers.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Plug className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Protocol & SDKs</h3>
              <p className="text-gray-600">
                Comprehensive specification and development kits for seamless integration.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <GitBranch className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Local MCP Support</h3>
              <p className="text-gray-600">
                Built-in support in Claude Desktop apps for local development and testing.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Open-Source Servers</h3>
              <p className="text-gray-600">
                Ready-to-use implementations for popular enterprise systems.
              </p>
            </div>
          </div>
        </div>

        {/* Claude Integration */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Powered by Claude 3.5 Sonnet</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Claude 3.5 Sonnet is adept at quickly building MCP server implementations, making it easy for organizations and individuals to rapidly connect their most important datasets with a range of AI-powered tools. To help developers start exploring, we're sharing pre-built MCP servers for popular enterprise systems like Google Drive, Slack, GitHub, Git, Postgres, and Puppeteer.
          </p>
        </div>

        {/* Community Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">An Open Community</h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            We're committed to building MCP as a collaborative, open-source project and ecosystem, and we're eager to hear your feedback. Whether you're an AI tool developer, an enterprise looking to leverage existing data, or an early adopter exploring the frontier, we invite you to build the future of context-aware AI together.
          </p>
          <a
            href="https://github.com/modelcontextprotocol"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Join the Community
          </a>
        </div>
      </div>
    </div>
  );
}