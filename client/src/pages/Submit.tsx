import React, { useState } from 'react';
import { Send, ServerIcon, Database, Globe, Zap, GitMerge, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

export function Submit() {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submittedServer, setSubmittedServer] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a valid GitHub URL');
      return;
    }

    // Check if URL is a GitHub URL
    if (!url.startsWith('https://github.com/')) {
      setError('Please enter a valid GitHub URL. The URL must start with https://github.com/');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Make the actual API call to submit the server
      const response = await fetch('/v1/hub/servers/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubUrl: url }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit server');
      }
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSubmittedServer(data.server);
      setUrl('');
      
      // Reset success message after 8 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setSubmittedServer(null);
      }, 8000);
      
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your server. Please try again.');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-center mb-4">Submit Your MCP Server</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto text-center">
            Contribute to the MCP ecosystem by sharing your MCP server with the community
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Submission Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Your Server to the MCP Hub</h2>
          <p className="text-gray-600 mb-8">
            Simply provide the URL to your MCP server's description endpoint. Our AI system will automatically analyze the content and extract the necessary data to list your server in our directory.
          </p>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub repository URL of your MCP server
                </label>
                <input
                  type="url"
                  id="serverUrl"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/username/your-mcp-server"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
            {submitSuccess && submittedServer && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                <p className="font-medium mb-2">Your server has been successfully submitted!</p>
                <p className="text-sm mb-3">
                  <strong>Name:</strong> {submittedServer.name}<br />
                  <strong>ID:</strong> {submittedServer.hubId}<br />
                  <strong>Description:</strong> {submittedServer.description}
                </p>
                <Link 
                  to={`/server/${submittedServer.hubId}`} 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-md transition-colors duration-200"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Server Details
                </Link>
              </div>
            )}
          </form>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Sharing Your MCP Server</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            By submitting your MCP server to our hub, you become part of a growing ecosystem of AI-powered tools and services that developers can discover and use.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Increase Visibility</h3>
              <p className="text-gray-600">
                Get your MCP server in front of developers and organizations looking for AI solutions. Increase adoption and grow your user base.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <GitMerge className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Join the Ecosystem</h3>
              <p className="text-gray-600">
                Become part of the MCP community, connect with other developers, and contribute to the growth of an open standard for AI tools.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Build Once, Use Everywhere</h3>
              <p className="text-gray-600">
                Create an MCP server once and make it compatible with all MCP clients, expanding your reach across multiple platforms and tools.
              </p>
            </div>
          </div>
        </div>

        {/* What We're Looking For Section */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What Makes a Great MCP Server?</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-blue-100 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <ServerIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Well-Documented</h3>
                <p className="text-gray-600">
                  Your server should have clear documentation that explains what it does, how to use it, and any special features it offers.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-blue-100 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">MCP Compliant</h3>
                <p className="text-gray-600">
                  Ensure your server follows the Model Context Protocol specifications to guarantee compatibility with MCP clients.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-blue-100 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Solves Real Problems</h3>
                <p className="text-gray-600">
                  The best MCP servers address specific use cases, offering unique value to users and enhancing their AI workflow.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            If you're new to creating MCP servers, check out our documentation to learn how to build and deploy your own MCP-compliant server.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="#"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Read the Documentation
            </a>
            <a
              href="https://github.com/modelcontextprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              View GitHub Repository
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}