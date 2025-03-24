import React, { useState, useMemo } from 'react';
import { SearchBar } from '../components/SearchBar';
import { ServerCard } from '../components/ServerCard';
import { mcpServers } from '../data/servers';
import { Plug, Zap, Link } from 'lucide-react';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return mcpServers.filter((server) => {
      return (
        server.name.toLowerCase().includes(query) ||
        server.author.toLowerCase().includes(query) ||
        server.description.toLowerCase().includes(query) ||
        server.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [searchQuery]);

  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">The Universal Standard for AI Integration</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Think of MCP as USB-C for AI applications - a standardized way to connect AI models with any data source or tool.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/10 backdrop-blur-lg">
              <Plug className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Plug-and-Play Integration</h3>
              <p className="text-blue-100">Connect any AI model to any data source with a standardized, universal interface.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/10 backdrop-blur-lg">
              <Zap className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant Compatibility</h3>
              <p className="text-blue-100">Build once, connect anywhere. MCP ensures your tools work seamlessly with any MCP-enabled service.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/10 backdrop-blur-lg">
              <Link className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Unified Protocol</h3>
              <p className="text-blue-100">One standard protocol for all AI integrations, eliminating the need for custom connectors.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Discover MCP Servers
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Connect your AI-powered tools with secure data sources using the Model Context Protocol.
          </p>
          <div className="mt-8 flex justify-center">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServers.map((server) => (
            <ServerCard key={server.mcpId} server={server} />
          ))}
        </div>
      </main>
    </>
  );
}