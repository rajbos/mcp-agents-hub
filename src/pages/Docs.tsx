import React from 'react';
import { BookOpen, Terminal, Github } from 'lucide-react';

export function Docs() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-center mb-4">Getting Started with MCP</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto text-center">
            Start building and testing MCP connectors today with our comprehensive documentation and tools.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Availability Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Availability</h2>
          <div className="space-y-4 text-gray-600">
            <p className="leading-relaxed">
              All Claude.ai plans support connecting MCP servers to the Claude Desktop app.
            </p>
            <p className="leading-relaxed">
              Claude for Work customers can begin testing MCP servers locally, connecting Claude to internal systems and datasets. We'll soon provide developer toolkits for deploying remote production MCP servers that can serve your entire Claude for Work organization.
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Start Building</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Install Pre-built Servers</h3>
            <p className="text-gray-600">
              Get started quickly by installing pre-built MCP servers through the Claude Desktop app.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Terminal className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Follow Quickstart Guide</h3>
            <p className="text-gray-600">
              Learn how to build your first MCP server with our comprehensive quickstart guide.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Github className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Contribute</h3>
            <p className="text-gray-600">
              Join our open-source community and contribute to our repositories of connectors and implementations.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our growing community of developers building the future of AI integration with MCP.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="#"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Read Documentation
            </a>
            <a
              href="https://github.com/modelcontextprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}