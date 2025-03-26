import React from 'react';
import { Plug, GitBranch, Users, Building, Database, Code, Github, Layers, Globe, Zap } from 'lucide-react';

export function About() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-center mb-4">
            MCP Marketplace Hub
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto text-center">
            The open-source ecosystem for building, discovering, and deploying Model Context Protocol servers and clients for enterprise environments.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* What is MCP Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is the Model Context Protocol?</h2>
          <p className="text-lg text-gray-600 mb-4 leading-relaxed">
            The Model Context Protocol (MCP) is an open standard that enables developers to build secure, two-way connections between their data sources and AI-powered tools. The architecture is straightforward: developers can either expose their data through MCP servers or build AI applications (MCP clients) that connect to these servers.
          </p>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            With MCP, AI systems can maintain context as they move between different tools and datasets, replacing today's fragmented integrations with a more sustainable architecture. Instead of building custom connectors for each data source or AI model, developers can now build against a standard protocol.
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Components of MCP</h3>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="flex flex-col">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-lg">MCP Specification</h4>
                </div>
                <p className="text-gray-600">
                  The open standard protocol definition that enables interoperability between servers and clients
                </p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-lg">MCP Servers</h4>
                </div>
                <p className="text-gray-600">
                  Custom-built connectors that expose data sources, tools, and APIs to AI applications
                </p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <Plug className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-lg">MCP Clients</h4>
                </div>
                <p className="text-gray-600">
                  AI-powered applications that connect to MCP servers to access contextual data and functionality
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why MCP Marketplace?</h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              As the MCP ecosystem expands, organizations need a central hub to manage, discover, and share MCP resources. This marketplace serves as that hub, enabling enterprises to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-lg text-gray-600 space-y-2">
              <li>Discover pre-built MCP servers for common enterprise systems</li>
              <li>Share custom MCP servers developed within their organization</li>
              <li>Learn best practices for building effective MCP connectors</li>
              <li>Deploy the entire marketplace on-premise for security and governance</li>
            </ul>
          </div>
        </div>

        {/* Marketplace Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Enterprise MCP Hub</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            This open-source marketplace allows organizations to deploy their own on-premise MCP hub, creating a central repository for discovering, sharing, and managing MCP servers and clients within their enterprise environment.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Server Building</h3>
              <p className="text-gray-600">
                Learn to create custom MCP servers that connect enterprise data sources to AI models securely and efficiently. Our marketplace provides templates, examples, and best practices to accelerate server development.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Plug className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Client Development</h3>
              <p className="text-gray-600">
                Build AI applications that leverage the MCP protocol to access contextual data across your organization. Connect your apps to any MCP server with standardized interfaces.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tool Discovery</h3>
              <p className="text-gray-600">
                Find pre-built MCP servers for popular enterprise systems like Google Drive, Slack, GitHub, Git, Postgres, Puppeteer and more. Deploy them instantly in your organization.
              </p>
            </div>
          </div>
        </div>

        {/* Showcase Section - New */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Powering Enterprise AI Integration</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Early adopters have already integrated MCP into their systems, while development tools companies are working with MCP to enhance their platforms—enabling AI agents to better retrieve relevant information and produce more functional results with fewer attempts.
          </p>
          
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
            <blockquote className="text-xl text-gray-600 italic mb-4">
              "Open technologies like the Model Context Protocol are the bridges that connect AI to real-world applications, ensuring innovation is accessible, transparent, and rooted in collaboration. We are excited to partner on a protocol and use it to build agentic systems, which remove the burden of the mechanical so people can focus on the creative."
            </blockquote>
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-lg font-semibold">Dhanji R. Prasanna</p>
                <p className="text-gray-500">Chief Technology Officer at Block</p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <Globe className="h-5 w-5 text-blue-600 mr-2" />
                For Organizations
              </h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Deploy on-premise for enhanced security and compliance</li>
                <li>Connect internal tools and data to AI systems</li>
                <li>Build custom connectors for proprietary systems</li>
                <li>Maintain control over AI access to sensitive data</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                For Development Teams
              </h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Enhance development tools with AI context awareness</li>
                <li>Build once, connect to multiple AI clients</li>
                <li>Contribute to open-source MCP ecosystem</li>
                <li>Create specialized connectors for development workflows</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Enterprise Focus */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Enterprise-Ready Deployment</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Deploy this marketplace in your own on-premise environment to create a secure, internal hub for MCP tools and resources. Enable your organization's developers to:
          </p>
          <ul className="list-disc pl-6 mb-6 text-lg text-gray-600 space-y-2">
            <li>Share internally developed MCP servers across teams</li>
            <li>Discover and deploy pre-built connectors for enterprise systems</li>
            <li>Maintain governance and security requirements for AI integrations</li>
            <li>Foster collaboration between data owners and AI application developers</li>
          </ul>
          <div className="flex justify-center mt-8">
            <div className="bg-white rounded-xl p-6 shadow-md inline-flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold">On-Premise Solution</h3>
                <p className="text-gray-600">Fully deployable within your existing infrastructure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">An Open Community</h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            We're committed to building MCP as a collaborative, open-source project and ecosystem. Whether you're an AI tool developer, an enterprise looking to leverage existing data, or an early adopter exploring the frontier, we invite you to build the future of context-aware AI together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/mcp-agents-ai/mcp-marketplace"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Github className="mr-2 h-5 w-5" />
              Join the Community
            </a>
            <a
              href="https://github.com/mcp-agents-ai/mcp-marketplace"
              className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
            >
              Deployment Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}