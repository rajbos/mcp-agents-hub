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
      setError(t('submit.error.emptyUrl'));
      return;
    }

    // Check if URL is a GitHub URL
    if (!url.startsWith('https://github.com/')) {
      setError(t('submit.error.invalidUrl'));
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
        throw new Error(data.error || t('submit.error.generic'));
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
      setError(err instanceof Error ? err.message : t('submit.error.generic'));
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-center mb-4">{t('submit.title')}</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto text-center">
            {t('submit.tagline')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Submission Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('submit.formTitle')}</h2>
          <p className="text-gray-600 mb-8">
            {t('submit.formDescription')}
          </p>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('submit.githubUrlLabel')}
                </label>
                <input
                  type="url"
                  id="serverUrl"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('submit.githubUrlPlaceholder')}
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
                      {t('submit.submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      {t('submit.submitButton')}
                    </>
                  )}
                </button>
              </div>
            </div>
            {submitSuccess && submittedServer && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                <p className="font-medium mb-2">{t('submit.success.title')}</p>
                <p className="text-sm mb-3">
                  <strong>{t('submit.success.name')}:</strong> {submittedServer.name}<br />
                  <strong>{t('submit.success.id')}:</strong> {submittedServer.hubId}<br />
                  <strong>{t('submit.success.description')}:</strong> {submittedServer.description}
                </p>
                <Link 
                  to={`/server/${submittedServer.hubId}`} 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-md transition-colors duration-200"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('submit.success.viewDetails')}
                </Link>
              </div>
            )}
          </form>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('submit.benefits.title')}</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {t('submit.benefits.description')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('submit.benefits.visibility.title')}</h3>
              <p className="text-gray-600">
                {t('submit.benefits.visibility.description')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <GitMerge className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('submit.benefits.ecosystem.title')}</h3>
              <p className="text-gray-600">
                {t('submit.benefits.ecosystem.description')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('submit.benefits.buildOnce.title')}</h3>
              <p className="text-gray-600">
                {t('submit.benefits.buildOnce.description')}
              </p>
            </div>
          </div>
        </div>

        {/* What We're Looking For Section */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('submit.requirements.title')}</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-blue-100 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <ServerIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{t('submit.requirements.documented.title')}</h3>
                <p className="text-gray-600">
                  {t('submit.requirements.documented.description')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-blue-100 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{t('submit.requirements.compliant.title')}</h3>
                <p className="text-gray-600">
                  {t('submit.requirements.compliant.description')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-blue-100 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{t('submit.requirements.solutions.title')}</h3>
                <p className="text-gray-600">
                  {t('submit.requirements.solutions.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('submit.cta.title')}</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('submit.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="#"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {t('submit.cta.documentation')}
            </a>
            <a
              href="https://github.com/modelcontextprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {t('submit.cta.github')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}