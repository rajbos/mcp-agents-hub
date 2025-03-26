import React from 'react';
import { Star, Download, ExternalLink } from 'lucide-react';
import { MCPServer } from '../types';

interface ServerCardProps {
  server: MCPServer;
}

export function ServerCard({ server }: ServerCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img src={server.logoUrl} alt={server.name} className="h-12 w-12 rounded-lg" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{server.name}</h3>
              <p className="text-sm text-gray-500">by {server.author}</p>
            </div>
          </div>
          {server.isRecommended && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Recommended
            </span>
          )}
        </div>
        
        <p className="mt-4 text-gray-600 line-clamp-2">{server.description}</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {server.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>{server.githubStars.toLocaleString()}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Download className="h-4 w-4 mr-1" />
              <span>{server.downloadCount.toLocaleString()}</span>
            </div>
          </div>
          
          <a
            href={server.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}