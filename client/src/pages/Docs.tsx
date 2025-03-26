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
              The Model Context Protocol (MCP) is designed to be universally compatible with various AI models and client applications, not just limited to a single provider.
            </p>
            <p className="leading-relaxed">
              Multiple client applications support connecting to MCP servers, allowing you to enhance AI capabilities with access to your custom data, tools, and systems. You can use MCP to connect your internal systems and datasets to any compatible AI client.
            </p>
            <p className="leading-relaxed">
              Developers can build and test MCP servers locally, and deploy production MCP servers that can serve entire organizations. The open protocol enables integration with various AI platforms and applications.
            </p>
          </div>
        </div>

        {/* Start Using Section */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Using</h2>
        <p className="text-gray-600 mb-8 max-w-3xl">
          <strong>For end users and AI application users:</strong> If you're looking to enhance your AI experience with custom tools and data sources, explore these MCP-compatible clients.
        </p>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Claude Desktop</h3>
            <p className="text-gray-600 mb-3">
              Connect to MCP servers directly from your Claude Desktop app. Supports both local and remote MCP servers.
            </p>
            <a href="https://modelcontextprotocol.io/clients" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Terminal className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">VS Code Extension</h3>
            <p className="text-gray-600 mb-3">
              Connect directly to MCP servers from your VS Code environment for enhanced coding assistance.
            </p>
            <a href="https://modelcontextprotocol.io/clients" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Github className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">JetBrains IDE Plugin</h3>
            <p className="text-gray-600 mb-3">
              Use MCP servers within JetBrains IDEs like IntelliJ, PyCharm, and others to enhance your development experience.
            </p>
            <a href="https://modelcontextprotocol.io/clients" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </a>
          </div>
        </div>

        {/* Start Building Section */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Building</h2>
        <p className="text-gray-600 mb-8 max-w-3xl">
          <strong>For developers:</strong> Choose the development path that matches your goals - build MCP servers to extend AI capabilities or integrate MCP into your client applications.
        </p>
        
        {/* Server Developers Subsection */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-5">For Server Developers</h3>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Terminal className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Build Custom Servers</h3>
            <p className="text-gray-600 mb-3">
              Create servers that connect your data sources, tools, and APIs to MCP-compatible AI models.
            </p>
            <a href="https://modelcontextprotocol.io/introduction" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Server SDK</h3>
            <p className="text-gray-600 mb-3">
              Use our SDK to implement the MCP specification and build servers that connect to various client applications.
            </p>
            <a href="https://modelcontextprotocol.io/introduction" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Github className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Server Templates</h3>
            <p className="text-gray-600 mb-3">
              Start with pre-built templates for common use cases like document retrieval, database connectivity, and tool use.
            </p>
            <a href="https://modelcontextprotocol.io/introduction" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </a>
          </div>
        </div>
        
        {/* Client Developers Subsection */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-5">For Client Developers</h3>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Client SDK</h3>
            <p className="text-gray-600 mb-3">
              Implement MCP in your AI applications to enable connectivity with a wide range of MCP servers and tools.
            </p>
            <a href="https://modelcontextprotocol.io/introduction" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Terminal className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Integration Guide</h3>
            <p className="text-gray-600 mb-3">
              Learn how to integrate MCP connectivity into your AI-powered applications, platforms, and interfaces.
            </p>
            <a href="https://modelcontextprotocol.io/introduction" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Github className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Contribute</h3>
            <p className="text-gray-600 mb-3">
              Join our open-source community and contribute to improving MCP clients and implementations.
            </p>
            <a href="https://modelcontextprotocol.io/introduction" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </a>
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