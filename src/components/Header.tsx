import React from 'react';
import { Link } from 'react-router-dom';
import { Plug } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Plug className="h-8 w-8 text-blue-600" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">MCP Marketplace</h1>
          </div>
          
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex space-x-8 mr-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">
                Home
              </Link>
              <Link to="/docs" className="text-gray-600 hover:text-gray-900 font-medium">
                Docs
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium">
                About
              </Link>
            </nav>
            <a
              href="https://github.com/modelcontextprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}